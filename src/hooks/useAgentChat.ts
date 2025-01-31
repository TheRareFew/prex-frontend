import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  type: 'prompt' | 'response';
  content: string;
  created_at: string;
  notes?: Note[];
}

interface Note {
  id: string;
  note: string;
  created_at: string;
  created_by: string;
}

interface Conversation {
  id: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export const useAgentChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      try {
        const { data: conversationsData, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .order('updated_at', { ascending: false });

        if (conversationsError) throw conversationsError;

        const fullConversations = await Promise.all(
          conversationsData.map(async (conv) => {
            // Fetch prompts for this conversation
            const { data: promptsData, error: promptsError } = await supabase
              .from('manager_prompts')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: true });

            if (promptsError) throw promptsError;

            // Fetch responses and notes for each prompt
            const messages = await Promise.all(
              promptsData.map(async (prompt) => {
                const { data: responseData, error: responseError } = await supabase
                  .from('manager_responses')
                  .select('*, response_notes(*)')
                  .eq('prompt_id', prompt.id)
                  .single();

                if (responseError && responseError.code !== 'PGRST116') throw responseError;

                const messages: Message[] = [
                  {
                    id: prompt.id,
                    type: 'prompt',
                    content: prompt.prompt,
                    created_at: prompt.created_at,
                  },
                ];

                if (responseData) {
                  messages.push({
                    id: responseData.id,
                    type: 'response',
                    content: responseData.response,
                    created_at: responseData.created_at,
                    notes: responseData.response_notes,
                  });
                }

                return messages;
              })
            );

            return {
              ...conv,
              messages: messages.flat(),
            } as Conversation;
          })
        );

        setConversations(fullConversations);
        if (fullConversations.length > 0 && !currentConversation) {
          setCurrentConversation(fullConversations[0]);
        }
      } catch (err: any) {
        console.error('Error fetching conversations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();

    // Subscribe to changes
    const conversationsSubscription = supabase
      .channel('agent-chat-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
      }, async (payload) => {
        // Only fetch if new conversation created or current one updated
        if (payload.eventType === 'INSERT' || 
            (payload.eventType === 'UPDATE' && currentConversation?.id === payload.new.id)) {
          fetchConversations();
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'manager_responses',
      }, async (payload) => {
        // When new response comes in, update the current conversation
        if (payload.eventType === 'INSERT') {
          const { data: responseData, error: responseError } = await supabase
            .from('manager_responses')
            .select('*, response_notes(*)')
            .eq('id', payload.new.id)
            .single();

          if (responseError) {
            console.error('Error fetching new response:', responseError);
            return;
          }

          // Find the prompt this response belongs to
          const { data: promptData } = await supabase
            .from('manager_prompts')
            .select('conversation_id, id, prompt, created_at')
            .eq('id', responseData.prompt_id)
            .single();

          if (!promptData) return;

          // Only update if response belongs to current conversation
          if (currentConversation && promptData.conversation_id === currentConversation.id) {
            const promptMessage: Message = {
              id: promptData.id,
              type: 'prompt',
              content: promptData.prompt,
              created_at: promptData.created_at
            };

            const responseMessage: Message = {
              id: responseData.id,
              type: 'response',
              content: responseData.response,
              created_at: responseData.created_at,
              notes: responseData.response_notes || [],
            };

            // Check if we already have these messages
            const hasPrompt = currentConversation.messages.some(m => m.id === promptData.id);
            const hasResponse = currentConversation.messages.some(m => m.id === responseData.id);

            let updatedMessages = [...currentConversation.messages];
            
            if (!hasPrompt) {
              updatedMessages.push(promptMessage);
            }
            if (!hasResponse) {
              updatedMessages.push(responseMessage);
            }

            // Sort messages by created_at
            updatedMessages.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );

            const updatedConversation = {
              ...currentConversation,
              messages: updatedMessages,
            };

            setCurrentConversation(updatedConversation);
            setConversations(prevConversations => prevConversations.map(c => 
              c.id === updatedConversation.id ? updatedConversation : c
            ));
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user, currentConversation?.id]);

  // Create new conversation
  const createConversation = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{ user_id: user!.id }])
        .select()
        .single();

      if (error) throw error;

      const newConversation: Conversation = {
        ...data,
        messages: [],
      };

      setConversations([newConversation, ...conversations]);
      setCurrentConversation(newConversation);
      return newConversation;
    } catch (err: any) {
      console.error('Error creating conversation:', err);
      setError(err.message);
      return null;
    }
  };

  // Send message
  const sendMessage = async (message: string, conversationId?: string) => {
    try {
      let activeConversation = currentConversation;
      
      // If no active conversation or a different conversation specified, create/set one
      if (!activeConversation || (conversationId && conversationId !== activeConversation.id)) {
        if (conversationId) {
          activeConversation = conversations.find(c => c.id === conversationId) || null;
        }
        if (!activeConversation) {
          activeConversation = await createConversation();
          if (!activeConversation) throw new Error('Failed to create conversation');
        }
      }

      // Create prompt
      const { data: promptData, error: promptError } = await supabase
        .from('manager_prompts')
        .insert([{
          conversation_id: activeConversation.id,
          prompt: message,
        }])
        .select()
        .single();

      if (promptError) throw promptError;

      // Update local state
      const updatedConversation = {
        ...activeConversation,
        messages: [
          ...activeConversation.messages,
          {
            id: promptData.id,
            type: 'prompt' as const,
            content: message,
            created_at: promptData.created_at,
          },
        ],
      };

      setCurrentConversation(updatedConversation);
      setConversations(conversations.map(c => 
        c.id === updatedConversation.id ? updatedConversation : c
      ));

      return promptData;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message);
      return null;
    }
  };

  // Add note to response
  const addNote = async (responseId: string, note: string) => {
    try {
      const { data, error } = await supabase
        .from('response_notes')
        .insert([{
          response_id: responseId,
          created_by: user!.id,
          note,
        }])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      if (currentConversation) {
        const updatedMessages = currentConversation.messages.map(msg => {
          if (msg.type === 'response' && msg.id === responseId) {
            return {
              ...msg,
              notes: [...(msg.notes || []), data],
            };
          }
          return msg;
        });

        const updatedConversation = {
          ...currentConversation,
          messages: updatedMessages,
        };

        setCurrentConversation(updatedConversation);
        setConversations(conversations.map(c => 
          c.id === updatedConversation.id ? updatedConversation : c
        ));
      }

      return data;
    } catch (err: any) {
      console.error('Error adding note:', err);
      setError(err.message);
      return null;
    }
  };

  return {
    conversations,
    currentConversation,
    setCurrentConversation,
    loading,
    error,
    createConversation,
    sendMessage,
    addNote,
  };
}; 
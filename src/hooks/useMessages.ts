import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Message {
  id: string;
  ticket_id: string;
  message: string;
  created_at: string;
  created_by: string;
}

export const useMessages = (ticketId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fetch messages for a ticket
  const fetchMessages = async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (supabaseError) throw supabaseError;

      console.log('Fetched messages:', data);
      setMessages(data || []);
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching messages:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Send a new message
  const sendMessage = async (message: string) => {
    if (!ticketId || !message.trim()) return null;

    try {
      setError(null);

      console.log('Sending message:', message, 'for ticket:', ticketId);
      const { data, error: supabaseError } = await supabase
        .from('messages')
        .insert([
          {
            ticket_id: ticketId,
            message: message.trim(),
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      console.log('Sent message:', data);
      // Update local state immediately for better UX
      setMessages(current => [...current, data]);
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error sending message:', error);
      setError(error.message);
      return null;
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!ticketId) {
      setMessages([]);
      return;
    }

    console.log('Setting up message subscription for ticket:', ticketId);

    // Initial fetch
    fetchMessages();

    // Create and subscribe to the channel
    const channel = supabase.channel('messages');

    channel
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          console.log('Received new message:', payload);
          const newMessage = payload.new as Message;
          // Only add if not from the current user (since we add those immediately)
          if (newMessage.created_by !== user?.id) {
            setMessages((current) => [...current, newMessage]);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Message subscription status:`, status);
      });

    return () => {
      console.log('Cleaning up message subscription for ticket:', ticketId);
      supabase.removeChannel(channel);
    };
  }, [ticketId, user?.id]);

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}; 
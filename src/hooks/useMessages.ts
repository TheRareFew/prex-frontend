import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useTickets } from './useTickets';
import { message_sender_type } from '../types/database';

export interface Message {
  id: string;
  ticket_id: string;
  message: string;
  created_at: string;
  created_by: string;
  is_system_message?: boolean;
  sender_type: message_sender_type;
}

export const useMessages = (ticketId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { updateTicketTimestamp } = useTickets();

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
  const sendMessage = async (message: string, isSystemMessage: boolean = false) => {
    if (!ticketId || !message.trim()) return null;

    try {
      setError(null);

      // First check if the user is an employee
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('id', user?.id)
        .single();

      if (employeeError && employeeError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw employeeError;
      }

      const senderType: message_sender_type = employeeData ? 'employee' : 'customer';

      console.log('Sending message:', message, 'for ticket:', ticketId);
      const { data, error: supabaseError } = await supabase
        .from('messages')
        .insert([
          {
            ticket_id: ticketId,
            message: message.trim(),
            created_by: user?.id,
            is_system_message: isSystemMessage,
            sender_type: senderType
          },
        ])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Update ticket timestamp
      await updateTicketTimestamp(ticketId);

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

  // Send a system message
  const sendSystemMessage = async (message: string) => {
    return sendMessage(message, true);
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
    sendSystemMessage,
  };
}; 
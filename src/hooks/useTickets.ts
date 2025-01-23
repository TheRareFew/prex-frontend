import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { TicketStatus, TicketPriority, TicketCategory } from '../types/enums';

export interface Ticket {
  id: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  created_by: string;
  assigned_to: string | null;
  name: string;
}

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .select('*')
        .order('updated_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      console.log('Fetched tickets:', data);
      setTickets(data || []);
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching tickets:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (category: TicketCategory) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Creating ticket with category:', category, 'user:', user?.id);

      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .insert([
          {
            status: TicketStatus.FRESH,
            category,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      console.log('Created ticket:', data);
      // Update local state immediately for better UX
      setTickets(current => [data, ...current]);
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error creating ticket:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Updating ticket status:', ticketId, status);

      const updateData = {
        status,
        ...(status === TicketStatus.CLOSED ? { resolved: true } : {})
      };

      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      console.log('Updated ticket status:', data);
      // Update local state immediately for better UX
      setTickets(current =>
        current.map(ticket =>
          ticket.id === ticketId ? { ...ticket, ...updateData } : ticket
        )
      );
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating ticket status:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTicketPriority = async (ticketId: string, priority: TicketPriority) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Updating ticket priority:', ticketId, priority);

      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .update({ priority })
        .eq('id', ticketId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      console.log('Updated ticket priority:', data);
      // Update local state immediately for better UX
      setTickets(current =>
        current.map(ticket =>
          ticket.id === ticketId ? { ...ticket, priority } : ticket
        )
      );
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating ticket priority:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTicketCategory = async (ticketId: string, category: TicketCategory) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Updating ticket category:', ticketId, category);

      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .update({ category })
        .eq('id', ticketId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      console.log('Updated ticket category:', data);
      // Update local state immediately for better UX
      setTickets(current =>
        current.map(ticket =>
          ticket.id === ticketId ? { ...ticket, category } : ticket
        )
      );
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating ticket category:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const assignTicket = async (ticketId: string, agentId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Assigning ticket:', ticketId, 'to agent:', agentId);

      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .update({ assigned_to: agentId })
        .eq('id', ticketId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      console.log('Assigned ticket:', data);
      // Update local state immediately for better UX
      setTickets(current =>
        current.map(ticket =>
          ticket.id === ticketId ? { ...ticket, assigned_to: agentId } : ticket
        )
      );
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error assigning ticket:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTicket = async (ticketId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Deleting ticket:', ticketId);

      // First delete associated messages
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('ticket_id', ticketId);

      if (messagesError) throw messagesError;

      // Then delete the ticket
      const { error: ticketError } = await supabase
        .from('tickets')
        .delete()
        .eq('id', ticketId);

      if (ticketError) throw ticketError;

      console.log('Successfully deleted ticket and messages:', ticketId);
      // Update local state immediately for better UX
      setTickets(current => current.filter(ticket => ticket.id !== ticketId));
      return true;
    } catch (err) {
      const error = err as Error;
      console.error('Error deleting ticket:', error);
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTicketTimestamp = async (ticketId: string) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', ticketId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Update local state
      setTickets(current =>
        current.map(ticket =>
          ticket.id === ticketId ? { ...ticket, updated_at: data.updated_at } : ticket
        )
      );

      return data;
    } catch (err) {
      console.error('Error updating ticket timestamp:', err);
      return null;
    }
  };

  const updateTicketTitle = async (ticketId: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Updating ticket name:', ticketId, name);

      const { data, error: supabaseError } = await supabase
        .from('tickets')
        .update({ name })
        .eq('id', ticketId)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      console.log('Updated ticket name:', data);
      // Update local state immediately for better UX
      setTickets(current =>
        current.map(ticket =>
          ticket.id === ticketId ? { ...ticket, name } : ticket
        )
      );
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error updating ticket name:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up ticket subscription');
    
    // Initial fetch
    fetchTickets();

    // Create and subscribe to the channel
    const channel = supabase.channel('tickets');
    
    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
        },
        (payload) => {
          console.log('Received ticket change:', payload);
          
          if (payload.eventType === 'INSERT' && payload.new.created_by !== user?.id) {
            // Only add new tickets from other users
            setTickets(current => [payload.new as Ticket, ...current]);
          } else if (payload.eventType === 'UPDATE') {
            setTickets(current =>
              current.map(ticket =>
                ticket.id === payload.new.id ? { ...ticket, ...payload.new } : ticket
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setTickets(current =>
              current.filter(ticket => ticket.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Ticket subscription status:', status);
      });

    return () => {
      console.log('Cleaning up ticket subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    createTicket,
    updateTicketStatus,
    updateTicketPriority,
    updateTicketCategory,
    assignTicket,
    deleteTicket,
    updateTicketTimestamp,
    updateTicketTitle,
  };
}; 
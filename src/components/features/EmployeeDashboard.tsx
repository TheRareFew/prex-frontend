import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useMessages } from '../../hooks/useMessages';

export const EmployeeDashboard: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  
  const {
    tickets,
    loading: ticketsLoading,
    error: ticketsError,
    updateTicketStatus,
    deleteTicket,
  } = useTickets();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
  } = useMessages(selectedTicket);

  const handleSendResponse = async () => {
    if (!selectedTicket || !response.trim()) return;
    
    const sent = await sendMessage(response);
    if (sent) {
      setResponse('');
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    await updateTicketStatus(ticketId, newStatus);
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      const success = await deleteTicket(ticketId);
      if (success && selectedTicket === ticketId) {
        setSelectedTicket(null); // Clear selection if the deleted ticket was selected
      }
    }
  };

  if (ticketsError || messagesError) {
    return (
      <div className="text-red-600 p-4">
        Error: {ticketsError || messagesError}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-4rem)]">
      {/* Ticket List Panel */}
      <div className="col-span-3 bg-white p-4 rounded-lg shadow overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Tickets in Order of Priority</h2>
        {ticketsLoading ? (
          <div>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-gray-500">No tickets available</div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className={`p-3 rounded-md cursor-pointer ${
                  selectedTicket === ticket.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="font-medium">Ticket #{ticket.id.slice(0, 8)}</div>
                <div className="text-sm text-gray-500">Status: {ticket.status}</div>
                <div className="text-sm text-gray-500">Category: {ticket.category}</div>
                <div className="mt-2 space-x-2">
                  {ticket.status === 'new' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(ticket.id, 'in_progress');
                      }}
                      className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTicket(ticket.id);
                    }}
                    className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Response Editor Panel */}
      <div className="col-span-5 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Response Editor</h2>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="w-full h-[calc(100%-8rem)] p-2 border rounded-md resize-none"
          placeholder="Type your response here..."
          disabled={!selectedTicket}
        />
        <button
          onClick={handleSendResponse}
          disabled={!selectedTicket || !response.trim()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400"
        >
          Send
        </button>
      </div>

      {/* Conversation History Panel */}
      <div className="col-span-4 bg-white p-4 rounded-lg shadow overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Conversation History</h2>
        {!selectedTicket ? (
          <div className="text-gray-500">Select a ticket to view conversation</div>
        ) : messagesLoading ? (
          <div>Loading messages...</div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="p-3 bg-gray-50 rounded-md">
                <div className="font-medium">User #{message.created_by.slice(0, 8)}</div>
                <div className="text-sm">{message.message}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 
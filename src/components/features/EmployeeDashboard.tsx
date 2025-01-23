import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../context/AuthContext';
import { TicketStatus, TicketPriority } from '../../types/enums';

export const EmployeeDashboard: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  
  const {
    tickets,
    loading: ticketsLoading,
    error: ticketsError,
    updateTicketStatus,
  } = useTickets();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
  } = useMessages(selectedTicket);

  const { user } = useAuth();

  const handleSendResponse = async () => {
    if (!selectedTicket || !response.trim()) return;
    
    const sent = await sendMessage(response);
    if (sent) {
      setResponse('');
    }
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: TicketStatus) => {
    await updateTicketStatus(ticketId, newStatus);
  };

  if (ticketsError || messagesError) {
    return (
      <div className="text-red-600 p-4">
        Error: {ticketsError || messagesError}
      </div>
    );
  }

  const assignedTickets = tickets
    .filter((ticket) => 
      ticket.assigned_to === user?.id && 
      (ticket.status === TicketStatus.FRESH || ticket.status === TicketStatus.IN_PROGRESS)
    )
    .sort((a, b) => {
      // First sort by priority (critical -> high -> medium -> low)
      const priorityOrder = {
        [TicketPriority.CRITICAL]: 0,
        [TicketPriority.HIGH]: 1,
        [TicketPriority.MEDIUM]: 2,
        [TicketPriority.LOW]: 3,
      };
      
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      // If same priority, sort by oldest updated_at first
      if (priorityDiff === 0) {
        return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
      }
      
      return priorityDiff;
    });

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-7rem)]">
      {/* Ticket List Panel */}
      <div className="col-span-3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">My Assigned Tickets</h2>
        {ticketsLoading ? (
          <div className="dark:text-gray-300">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">No tickets available</div>
        ) : (
          <div className="overflow-y-auto h-[calc(100vh-12rem)] pr-2">
            <div className="space-y-4">
              {assignedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket.id)}
                  className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${
                    selectedTicket === ticket.id ? 'border border-blue-200 dark:border-blue-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium dark:text-white">Ticket #{ticket.id.slice(0, 8)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Status: {ticket.status}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Category: {ticket.category}</div>
                      <div className={`text-sm ${
                        ticket.priority === 'critical' ? 'text-red-600 dark:text-red-400 font-medium' :
                        ticket.priority === 'high' ? 'text-orange-600 dark:text-orange-400' :
                        ticket.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        Priority: {ticket.priority}
                      </div>
                      <div className="mt-2 space-x-2">
                        {ticket.status === TicketStatus.FRESH && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                          >
                            Start Working
                          </button>
                        )}
                        {ticket.status === TicketStatus.IN_PROGRESS && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(ticket.id, TicketStatus.CLOSED);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                          >
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Response Editor Panel */}
      <div className="col-span-5 bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col overflow-hidden">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Response Editor</h2>
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          className="flex-1 w-full p-2 border rounded-md resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
          placeholder="Type your response here..."
          disabled={!selectedTicket}
        />
        <button
          onClick={handleSendResponse}
          disabled={!selectedTicket || !response.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Send
        </button>
      </div>

      {/* Conversation History Panel */}
      <div className="col-span-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-hidden">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Conversation History</h2>
        <div className="overflow-y-auto h-[calc(100vh-12rem)] pr-2">
          {!selectedTicket ? (
            <div className="text-gray-500 dark:text-gray-400">Select a ticket to view conversation</div>
          ) : messagesLoading ? (
            <div className="dark:text-gray-300">Loading messages...</div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <div className="font-medium dark:text-white">User #{message.created_by.slice(0, 8)}</div>
                  <div className="text-sm dark:text-gray-300">{message.message}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(message.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 
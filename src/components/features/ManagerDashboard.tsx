import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useUserRole } from '../../hooks/useUserRole';
import { useAuth } from '../../context/AuthContext';
import { useEmployees } from '../../hooks/useEmployees';
import { useMessages } from '../../hooks/useMessages';
import { TicketStatus, TicketPriority, TicketCategory } from '../../types/enums';

export const ManagerDashboard: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [ticketName, setTicketName] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const { userRole, isManager } = useAuth();
  const { department } = useUserRole();
  
  const {
    tickets,
    loading: ticketsLoading,
    error: ticketsError,
    updateTicketStatus,
    updateTicketPriority,
    updateTicketCategory,
    assignTicket,
    updateTicketTitle,
  } = useTickets();

  const {
    employees,
    loading: employeesLoading,
    error: employeesError,
  } = useEmployees(department);

  const {
    messages,
    loading: messagesLoading,
    sendSystemMessage,
  } = useMessages(selectedTicket);

  // Reset local state when selected ticket changes
  React.useEffect(() => {
    if (selectedTicket) {
      const ticket = tickets.find(t => t.id === selectedTicket);
      if (ticket) {
        setSelectedCategory(ticket.category as TicketCategory);
        setSelectedPriority(ticket.priority as TicketPriority);
        setSelectedEmployeeId(ticket.assigned_to);
        setTicketName(ticket.name || '');
      }
    } else {
      setSelectedCategory(null);
      setSelectedPriority(null);
      setSelectedEmployeeId(null);
      setTicketName('');
    }
  }, [selectedTicket, tickets]);

  // Filter unassigned tickets and sort by creation time
  const unassignedTickets = tickets
    .filter(ticket => !ticket.assigned_to)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const handleSaveChanges = async () => {
    if (!selectedTicket) return;

    const ticket = tickets.find(t => t.id === selectedTicket);
    if (!ticket) return;

    // Only update if values have changed
    if (ticketName !== ticket.name) {
      await updateTicketTitle(selectedTicket, ticketName);
    }

    if (selectedCategory !== ticket.category) {
      await updateTicketCategory(selectedTicket, selectedCategory as TicketCategory);
    }
    
    if (selectedPriority !== ticket.priority) {
      await updateTicketPriority(selectedTicket, selectedPriority as TicketPriority);
    }
    
    if (selectedEmployeeId !== ticket.assigned_to) {
      const success = await assignTicket(selectedTicket, selectedEmployeeId as string);
      if (success) {
        const assignedEmployee = employees.find(e => e.id === selectedEmployeeId);
        if (assignedEmployee) {
          await sendSystemMessage(
            `Ticket has been assigned to ${assignedEmployee.full_name} from ${assignedEmployee.department} department.`
          );
        }
        await updateTicketStatus(selectedTicket, TicketStatus.IN_PROGRESS);
      }
    }
  };

  if (!isManager) {
    return (
      <div className="p-4 text-red-600">
        Access denied. Manager privileges required.
      </div>
    );
  }

  if (ticketsLoading || employeesLoading || messagesLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (ticketsError || employeesError) {
    return (
      <div className="p-4 text-red-600">
        Error: {ticketsError || employeesError}
      </div>
    );
  }

  const selectedTicketData = selectedTicket
    ? tickets.find((t) => t.id === selectedTicket)
    : null;

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Left Sidebar - Unassigned Tickets */}
      <div className="w-1/4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Unassigned Tickets</h2>
        <div className="space-y-2">
          {unassignedTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket.id)}
              className={`p-3 rounded-md cursor-pointer ${
                selectedTicket === ticket.id
                  ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="font-medium dark:text-white">Ticket #{ticket.id.slice(0, 8)}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Created: {new Date(ticket.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4">
        {selectedTicketData ? (
          <>
            {/* Ticket Details */}
            <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-col h-full">
              {/* Ticket Name */}
              <input
                type="text"
                value={ticketName}
                onChange={(e) => setTicketName(e.target.value)}
                placeholder="Enter Ticket Title"
                className="w-full p-2 mb-4 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />

              {/* Message History */}
              <div className="flex-1 overflow-y-auto border dark:border-gray-700 rounded-md p-4 mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message History (Initial Inquiry at Top)</h3>
                <div className="space-y-3">
                  {messages && messages.length > 0 ? (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.is_system_message 
                            ? 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600' 
                            : message.created_by === selectedTicketData?.created_by
                            ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500'
                            : 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                            {message.is_system_message 
                              ? 'System Message'
                              : message.created_by === selectedTicketData?.created_by
                              ? 'Customer'
                              : 'Agent'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(message.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No messages in this ticket yet
                    </div>
                  )}
                </div>
              </div>

              {/* Category, Priority, and Selected Employee */}
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <select
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={selectedCategory || ''}
                      onChange={(e) => setSelectedCategory(e.target.value as TicketCategory)}
                    >
                      {Object.values(TicketCategory).map((category) => (
                        <option key={category} value={category}>
                          {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      value={selectedPriority || ''}
                      onChange={(e) => setSelectedPriority(e.target.value as TicketPriority)}
                    >
                      {Object.values(TicketPriority).map((priority) => (
                        <option key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Employee Display */}
                <div className="p-3 border rounded-md dark:border-gray-600">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Employee</h3>
                  {selectedEmployee ? (
                    <div className="text-sm text-gray-800 dark:text-gray-200">
                      {selectedEmployee.full_name} ({selectedEmployee.department})
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No employee selected
                    </div>
                  )}
                </div>

                {/* Save Changes Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSaveChanges}
                    className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>

            {/* Employee List */}
            <div className="w-1/3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Employees</h2>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div
                    key={employee.id}
                    onClick={() => setSelectedEmployeeId(employee.id)}
                    className={`p-4 rounded-md cursor-pointer transition-colors duration-200 ${
                      selectedEmployeeId === employee.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500'
                        : employee.department.toLowerCase() === selectedCategory?.toLowerCase()
                        ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium dark:text-white">{employee.full_name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">{employee.department}</div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Current tickets: {employee.unresolved_tickets}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Description of role: {employee.permissions} in {employee.department}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a ticket to view details
          </div>
        )}
      </div>
    </div>
  );
}; 
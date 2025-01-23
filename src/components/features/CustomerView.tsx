import React, { useState, useEffect, useRef } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../context/AuthContext';
import { TicketCategory, TicketStatus } from '../../types/enums';
import { RichTextEditor } from '../common/RichTextEditor/RichTextEditor';
import { RichTextDisplay } from '../common/RichTextDisplay/RichTextDisplay';

interface CategoryOption {
  category: TicketCategory;
  label: string;
  description: string;
}

const CATEGORIES: CategoryOption[] = [
  {
    category: TicketCategory.GENERAL,
    label: 'General Inquiry',
    description: 'General questions about our services',
  },
  {
    category: TicketCategory.BILLING,
    label: 'Billing',
    description: 'Questions about billing, payments, or subscriptions',
  },
  {
    category: TicketCategory.TECHNICAL,
    label: 'Technical Support',
    description: 'Technical issues or product-related problems',
  },
  {
    category: TicketCategory.FEEDBACK,
    label: 'Feedback',
    description: 'Provide feedback or suggestions',
  },
  {
    category: TicketCategory.ACCOUNT,
    label: 'Account',
    description: 'Account-related questions or issues',
  },
  {
    category: TicketCategory.FEATURE_REQUEST,
    label: 'Feature Request',
    description: 'Request new features or improvements',
  },
  {
    category: TicketCategory.OTHER,
    label: 'Other',
    description: 'Other inquiries not covered by other categories',
  },
];

export const CustomerView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const { user } = useAuth();

  const {
    tickets,
    loading: ticketLoading,
    error: ticketError,
    createTicket,
  } = useTickets();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
  } = useMessages(activeTicket);

  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Filter tickets to only show the current user's tickets
  const userTickets = tickets.filter(ticket => ticket.created_by === user?.id);

  // Dummy data for now - will be replaced with Supabase queries later
  const faqs = [
    { id: 1, question: 'How do I reset my password?', answer: 'You can reset your password through the login page.' },
    { id: 2, question: 'How do I contact support?', answer: 'Click the chat button in the bottom right corner.' },
  ];

  const topArticles = [
    { id: 1, title: 'Getting Started Guide', views: 1200 },
    { id: 2, title: 'Common Issues & Solutions', views: 800 },
  ];

  const handleStartChat = () => {
    // Check for existing tickets and get the most recently updated one
    if (userTickets.length > 0) {
      // Sort tickets by updated_at date (newest first) and get the first one
      const mostRecentTicket = userTickets.sort(
        (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )[0];
      
      setActiveTicket(mostRecentTicket.id);
      setShowChat(true);
    } else {
      setShowCategorySelect(true);
    }
  };

  const handleCategorySelect = (category: TicketCategory) => {
    setSelectedCategory(category);
    setShowCategorySelect(false);
    setShowChat(true);
  };

  // Handle message sending after ticket is created
  useEffect(() => {
    const sendPendingMessage = async () => {
      if (pendingMessage && activeTicket) {
        try {
          console.log('Sending pending message:', pendingMessage);
          const sent = await sendMessage(pendingMessage);
          if (sent) {
            setNewMessage('');
            setPendingMessage(null);
          }
        } catch (error) {
          console.error('Error sending pending message:', error);
          setPendingMessage(null);
        }
      }
    };

    if (pendingMessage && activeTicket) {
      sendPendingMessage();
    }
  }, [activeTicket, pendingMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageText = newMessage.trim();
    
    try {
      // If we already have an active ticket, send message directly
      if (activeTicket) {
        const sent = await sendMessage(messageText);
        if (sent) {
          setNewMessage('');
        }
        return;
      }

      // If no active ticket, we need a category selected first
      if (!selectedCategory) {
        console.error('No category selected for new ticket');
        return;
      }

      // Create new ticket
      const newTicket = await createTicket(selectedCategory);
      if (!newTicket) {
        throw new Error('Failed to create ticket');
      }
      
      // Set the pending message and active ticket
      // The useEffect will handle sending the message
      setPendingMessage(messageText);
      setActiveTicket(newTicket.id);
    } catch (error) {
      console.error('Error in message flow:', error);
    }
  };

  // Add scroll to bottom effect when messages change
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (ticketError || messagesError) {
    return (
      <div className="text-red-600 p-4">
        Error: {ticketError || messagesError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search the knowledge base..."
          className="w-full p-3 border rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* FAQs Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b dark:border-gray-700 pb-4">
                <h3 className="font-medium mb-2 dark:text-white">{faq.question}</h3>
                <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Top Articles</h2>
          <div className="space-y-4">
            {topArticles.map((article) => (
              <div key={article.id} className="border-b dark:border-gray-700 pb-4">
                <h3 className="font-medium dark:text-white">{article.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{article.views} views</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Button */}
      <button
        onClick={() => setShowHistory(true)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gray-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700 disabled:bg-gray-300 dark:disabled:bg-gray-800"
      >
        <span className="text-2xl">📋</span>
      </button>

      {/* Ticket History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold dark:text-white">Your Ticket History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            {ticketLoading ? (
              <div className="text-center text-gray-500 dark:text-gray-400">Loading tickets...</div>
            ) : userTickets.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">No tickets found</div>
            ) : (
              <div className="space-y-4">
                {userTickets
                  .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                  .map((ticket) => {
                    const ticketMessages = messages.filter(m => m.ticket_id === ticket.id);
                    return (
                      <div
                        key={ticket.id}
                        className={`p-4 border dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          activeTicket === ticket.id ? 'border-blue-500 dark:border-blue-400' : ''
                        }`}
                        onClick={() => {
                          setActiveTicket(ticket.id);
                          setShowChat(true);
                          setShowHistory(false);
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <span className="font-medium dark:text-white">
                              {CATEGORIES.find(c => c.category === ticket.category)?.label || ticket.category}
                            </span>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Created: {new Date(ticket.created_at).toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Last updated: {new Date(ticket.updated_at).toLocaleString()}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ticket.status === TicketStatus.CLOSED
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                        {ticketMessages.length > 0 && (
                          <div className="mt-3 space-y-3">
                            {ticketMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`p-3 rounded-md ${
                                  message.is_system_message
                                    ? 'bg-gray-100 dark:bg-gray-700/50 text-center italic'
                                    : message.created_by === user?.id
                                    ? 'bg-blue-50 dark:bg-blue-900/20 ml-8'
                                    : 'bg-gray-50 dark:bg-gray-700/50 mr-8'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <RichTextDisplay
                                  content={message.message}
                                  className="text-sm dark:text-white"
                                />
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {new Date(message.created_at).toLocaleString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={handleStartChat}
        disabled={ticketLoading}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800"
      >
        <span className="text-2xl">💬</span>
      </button>

      {/* Category Selection Modal */}
      {showCategorySelect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">
              What can we help you with?
            </h3>
            <div className="space-y-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => handleCategorySelect(cat.category)}
                  className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border dark:border-gray-700 transition-colors dark:text-white"
                >
                  <div className="font-medium">{cat.label}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {cat.description}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCategorySelect(false)}
              className="mt-4 w-full p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700">
          <div className="p-4 border-b dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold dark:text-white">Customer Support</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activeTicket 
                    ? `Ticket: ${CATEGORIES.find(c => c.category === userTickets.find(t => t.id === activeTicket)?.category)?.label || 'Unknown'}`
                    : `Category: ${CATEGORIES.find(c => c.category === selectedCategory)?.label || 'Not selected'}`
                  }
                </p>
              </div>
              <div className="flex items-center gap-2">
                {activeTicket && (
                  <button
                    onClick={() => {
                      setActiveTicket(null);
                      setSelectedCategory(null);
                      setShowCategorySelect(true);
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    New Ticket
                  </button>
                )}
                <button onClick={() => {
                  setShowChat(false);
                  if (!activeTicket) {
                    setSelectedCategory(null);
                  }
                }} className="text-gray-500 dark:text-gray-400">
                  ✕
                </button>
              </div>
            </div>
          </div>
          <div ref={messageContainerRef} className="h-[400px] overflow-y-auto p-4">
            {messagesLoading ? (
              <div className="text-center text-gray-500 dark:text-gray-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400">
                {activeTicket ? 'No messages yet' : 'Start a conversation with our support team'}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-md ${
                      message.is_system_message
                        ? 'bg-gray-100 dark:bg-gray-700 text-center italic'
                        : message.created_by === user?.id
                        ? 'bg-blue-50 dark:bg-blue-900/30 ml-8'
                        : 'bg-gray-50 dark:bg-gray-700 mr-8'
                    }`}
                  >
                    <RichTextDisplay
                      content={message.message}
                      className="text-sm dark:text-white"
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(message.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t dark:border-gray-700">
            <div className="space-y-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                placeholder={activeTicket || selectedCategory ? "Type your message..." : "Please select a category first"}
                disabled={!activeTicket && !selectedCategory}
                className="w-full p-2 border dark:border-gray-700 rounded dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSendMessage}
                disabled={!activeTicket && !selectedCategory || !newMessage.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-gray-400 dark:disabled:bg-gray-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
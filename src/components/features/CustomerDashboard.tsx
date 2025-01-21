import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useMessages } from '../../hooks/useMessages';
import { useAuth } from '../../context/AuthContext';

export const CustomerDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const { user } = useAuth();

  const {
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

  // Dummy data for now - will be replaced with Supabase queries later
  const faqs = [
    { id: 1, question: 'How do I reset my password?', answer: 'You can reset your password through the login page.' },
    { id: 2, question: 'How do I contact support?', answer: 'Click the chat button in the bottom right corner.' },
  ];

  const topArticles = [
    { id: 1, title: 'Getting Started Guide', views: 1200 },
    { id: 2, title: 'Common Issues & Solutions', views: 800 },
  ];

  const handleStartChat = async () => {
    if (!activeTicket) {
      const newTicket = await createTicket('general');
      if (newTicket) {
        setActiveTicket(newTicket.id);
      }
    }
    setShowChat(true);
  };

  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newMessage.trim() && activeTicket) {
      const sent = await sendMessage(newMessage);
      if (sent) {
        setNewMessage('');
      }
    }
  };

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
          className="w-full p-3 border rounded-lg shadow-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* FAQs Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">FAQs</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border-b pb-4">
                <h3 className="font-medium mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Articles Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top Articles</h2>
          <div className="space-y-4">
            {topArticles.map((article) => (
              <div key={article.id} className="border-b pb-4">
                <h3 className="font-medium">{article.title}</h3>
                <p className="text-sm text-gray-500">{article.views} views</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Button */}
      <button
        onClick={handleStartChat}
        disabled={ticketLoading}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 disabled:bg-blue-300"
      >
        <span className="text-2xl">💬</span>
      </button>

      {/* Chat Window */}
      {showChat && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-xl border">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Customer Support</h3>
              <button onClick={() => setShowChat(false)} className="text-gray-500">
                ✕
              </button>
            </div>
          </div>
          <div className="h-[400px] overflow-y-auto p-4">
            {messagesLoading ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500">
                Start a conversation with our support team
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-3 rounded-md ${
                      message.created_by === user?.id
                        ? 'bg-blue-50 ml-8'
                        : 'bg-gray-50 mr-8'
                    }`}
                  >
                    <div className="text-sm">{message.message}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(message.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-4 border-t">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleSendMessage}
              placeholder="Type your message..."
              className="w-full p-2 border rounded"
              disabled={!activeTicket}
            />
          </div>
        </div>
      )}
    </div>
  );
}; 
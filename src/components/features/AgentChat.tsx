import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAgentChat } from '../../hooks/useAgentChat';
import { PaperAirplaneIcon, PlusIcon } from '@heroicons/react/24/outline';

export const AgentChat: React.FC = () => {
  const { isManager } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    loading,
    error,
    createConversation,
    sendMessage,
    addNote,
  } = useAgentChat();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  if (!isManager) {
    return (
      <div className="p-4 text-red-600 dark:text-red-400">
        Access denied. Manager privileges required.
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleNewChat = async () => {
    await createConversation();
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-100 dark:bg-gray-900">
      <div className="h-full w-full flex bg-white dark:bg-gray-800">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* New Chat Button */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-center">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 p-2 bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>
          
          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-2 text-center text-gray-500 dark:text-gray-400">Loading conversations...</div>
            ) : error ? (
              <div className="p-2 text-center text-red-500">{error}</div>
            ) : conversations.length === 0 ? (
              <div className="p-2 text-center text-gray-500 dark:text-gray-400">No conversations yet</div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setCurrentConversation(conversation)}
                  className={`w-full text-left p-2 text-gray-900 dark:text-white ${
                    currentConversation?.id === conversation.id
                      ? 'bg-violet-50/50 dark:bg-violet-900/5'
                      : 'bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-50/50 dark:hover:bg-violet-900/5'
                  }`}
                >
                  <div className="truncate text-sm">
                    {conversation.messages[0]?.content.substring(0, 30) || 'New Conversation'}
                    {conversation.messages[0]?.content.length > 30 ? '...' : ''}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(conversation.created_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white p-4">
              {currentConversation 
                ? `Chat ${new Date(currentConversation.created_at).toLocaleDateString()}`
                : 'Select or start a new chat'}
            </h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-900">
            {!currentConversation ? (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a conversation or start a new chat
              </div>
            ) : currentConversation.messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                No messages yet. Start the conversation!
              </div>
            ) : (
              currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-2 ${
                    message.type === 'prompt'
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-blue-50 dark:bg-gray-700'
                  } rounded-lg p-2 shadow`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      message.type === 'prompt' ? 'bg-blue-500' : 'bg-green-500'
                    }`}>
                      {message.type === 'prompt' ? 'U' : 'A'}
                    </div>
                    <div className="flex-1">
                      <div className="prose dark:prose-invert max-w-none text-gray-900 dark:text-white">
                        {message.content}
                      </div>
                      {message.notes && message.notes.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.notes.map((note) => (
                            <div
                              key={note.id}
                              className="text-sm bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded"
                            >
                              <div className="font-medium text-yellow-800 dark:text-yellow-300">
                                Note:
                              </div>
                              <div className="text-yellow-700 dark:text-yellow-200">
                                {note.note}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(message.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-colors"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 
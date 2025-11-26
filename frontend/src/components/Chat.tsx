import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { chatService } from '../services/chatService';
import { ChatMessage } from '../types/chat.model';
import { marked } from 'marked';
import './Chat.css';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const ecoTips = [
    'How can I reduce my carbon footprint?',
    'Give me tips for zero waste shopping',
    'What are sustainable alternatives to plastic?',
    'How can I save energy at home?',
    'Tell me about composting at home',
  ];

  useEffect(() => {
    // Welcome message
    addMessage(
      "Hello! I'm your EcoWise AI assistant. How can I help you with your sustainability journey today?",
      'ai'
    );

    // Load chat history
    if (user?._id) {
      loadChatHistory();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      setLoading(true);
      const history = await chatService.getChatHistory();
      if (history && history.length > 0) {
        setMessages((prev) => [...prev, ...history]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  };

  const addMessage = (content: string, role: 'user' | 'ai') => {
    const newMessage: ChatMessage = {
      content,
      role,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = message;
    addMessage(userMessage, 'user');
    setMessage('');

    setLoading(true);
    try {
      const response = await chatService.sendMessage(userMessage);
      addMessage(response.message, 'ai');
    } catch (error: any) {
      console.error('Error sending message:', error);
      addMessage(
        'Sorry, I encountered an error processing your request. Please try again later.',
        'ai'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectQuickTip = (tip: string) => {
    setMessage(tip);
  };

  const clearChat = () => {
    setMessages([]);
    chatService.clearChatHistory();
    addMessage(
      'Chat cleared. How else can I help you with your sustainability journey?',
      'ai'
    );
  };

  const formatTime = (timestamp: Date | string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (content: string) => {
    try {
      return { __html: marked(content) };
    } catch (error) {
      return { __html: content };
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>
          <i className="fas fa-robot"></i> EcoWise AI Assistant
        </h1>
        <p>Ask me anything about sustainable living, eco-tips, or your environmental impact</p>
        <button onClick={clearChat} className="btn btn-sm btn-outline-secondary">
          <i className="fas fa-trash"></i> Clear Chat
        </button>
      </div>

      <div className="chat-messages" ref={chatMessagesRef}>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-content">
              <div className="message-sender">
                {msg.role === 'ai' ? (
                  <i className="fas fa-robot"></i>
                ) : (
                  <i className="fas fa-user"></i>
                )}
                <span>{msg.role === 'user' ? user?.name || 'You' : 'EcoWise AI'}</span>
                <span className="timestamp">{formatTime(msg.timestamp)}</span>
              </div>
              <div
                className="message-text"
                dangerouslySetInnerHTML={renderMessage(msg.content)}
              ></div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-typing">
            <div className="dot-flashing"></div>
            <span>EcoWise AI is thinking...</span>
          </div>
        )}
      </div>

      {ecoTips.length > 0 && (
        <div className="quick-suggestions">
          <div className="suggestion-label">Quick suggestions:</div>
          <div className="suggestions-list">
            {ecoTips.map((tip, index) => (
              <button
                key={index}
                className="suggestion-button"
                onClick={() => selectQuickTip(tip)}
              >
                {tip}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your question here..."
          disabled={loading}
          className="form-control"
        />
        <button type="submit" className="btn btn-primary submit-btn" disabled={loading || !message.trim()}>
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
    </div>
  );
};

export default Chat;


// frontend/src/pages/ChatInterface.tsx
import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import './ChatInterface.css';
import { globalWorkflowConfig } from './StackBuilder';

interface ChatInterfaceProps {
  workflowId: string;
  onBack: () => void;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ workflowId, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check if workflow is configured
    if (!globalWorkflowConfig) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Please configure your workflow first in the Stack Builder!',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare the request body with workflow configuration
      const requestBody = {
        question: inputMessage,
        api_key: globalWorkflowConfig.apiKey,
        model: globalWorkflowConfig.model,
        custom_prompt: globalWorkflowConfig.customPrompt
      };

      console.log('Sending request with config:', requestBody);

      const response = await fetch('http://localhost:8000/workflow/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Received response:', result);
        
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: result.final_answer,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorData = await response.json();
        console.error('Chat API Error:', errorData);
        throw new Error(errorData.detail || errorData.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-interface">
      <header className="chat-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          Back to Builder
        </button>
        <h1>GenAI Stack Chat</h1>
        <p>Start a conversation to test your stack</p>
      </header>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Send a message to start chatting</p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.isUser ? 'user-message' : 'ai-message'}`}>
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="chat-input-container">
        <div className="chat-input">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message"
            disabled={isLoading}
          />
          <button 
            onClick={sendMessage} 
            disabled={isLoading || !inputMessage.trim()}
            className="send-button"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
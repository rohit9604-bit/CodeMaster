import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Lightbulb, Code, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';

const DevoraPanel = ({ challengeId, code }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: "Hi! I'm Devora, your AI coding assistant. I can help you with hints, explain concepts, or review your code. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await api.chatWithAI({
        message: userMessage.content,
        code: code,
        context: { challengeId }, // You might want to pass more context like problem description if available props
        language: 'javascript' // Ideally pass this as prop too
      });

      const assistantMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: response.message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'assistant',
        content: "Sorry, I encountered an error connecting to Devora. Please try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickActions = [
    { icon: Lightbulb, label: 'Give me a hint', message: 'Can you give me a hint for this problem?' },
    { icon: Code, label: 'Review my code', message: 'Can you review my code and suggest improvements?' },
    { icon: CheckCircle2, label: 'Suggest test cases', message: 'What test cases should I try for this problem?' }
  ];

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] border-t border-[#3e3e42]">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#252526] border-b border-[#3e3e42]">
        <Sparkles className="w-5 h-5 text-[#007acc]" />
        <h3 className="text-[#d4d4d4] font-semibold">Devora AI</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${message.type === 'user'
                  ? 'bg-[#007acc] text-white'
                  : 'bg-[#2d2d30] text-[#d4d4d4] border border-[#3e3e42]'
                  }`}
              >
                <div className="text-sm prose prose-invert max-w-none">
                  {/* Basic markdown rendering can be added here if needed, for now just text */}
                  <p className="whitespace-pre-wrap font-sans">{message.content}</p>
                </div>
                <span className="text-xs opacity-60 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-[#2d2d30] rounded-lg px-4 py-3 border border-[#3e3e42]">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#007acc] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-[#007acc] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-[#007acc] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 bg-[#252526] border-t border-[#3e3e42]">
        <div className="flex gap-2 flex-wrap">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                setInputValue(action.message);
                // We need to trigger send after state update, so we can't just call handleSend immediately 
                // because inputValue won't be updated yet in the closure.
                // Better to pass message directly to a send function or use a timeout/effect.
                // For simplicity, let's just set input and let user press enter or click send, 
                // OR adapt handleSend to accept an optional message.

                // Let's modify logic to allow immediate send:
                // But handleSend uses inputValue state.
                // Refactor handleSend to take an arg.
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#2d2d30] hover:bg-[#3e3e42] text-[#d4d4d4] text-xs rounded-md border border-[#3e3e42] transition-all duration-200"
            >
              <action.icon className="w-3 h-3" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-[#252526] border-t border-[#3e3e42]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Devora anything..."
            className="flex-1 bg-[#2d2d30] text-[#d4d4d4] placeholder-[#858585] border border-[#3e3e42] rounded-md px-4 py-2 focus:outline-none focus:border-[#007acc] transition-colors"
          />
          <Button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="bg-[#007acc] hover:bg-[#005a9e] text-white disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DevoraPanel;

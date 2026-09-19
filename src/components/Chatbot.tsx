import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAppContext } from '../store/AppContext';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

// [UI COMPONENT] Chatbot - Renders the Chatbot view
export function Chatbot() {
  const { visaPlans } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const systemPrompt = useMemo(() => {
    const activePlans = visaPlans.filter(p => p.status === 'active');
    const plansInfo = activePlans.map(p => `- ${p.name} (${p.destinationCountry}): ${p.description}`).join('\n');

    return `You are a helpful, professional, and very concise visa consultant for Perennials Visa.
Your goal is to guide users through the visa application process and answer related questions.
Keep responses extremely short, max 1-2 sentences.

IMPORTANT RULES:
1. We currently offer the following visas:
${plansInfo || 'None currently.'}
2. If the user asks about a visa we provide, give a short summary of our service/the visa and encourage them to apply through us. NEVER tell them to apply at a consulate or embassy for these visas.
3. If the user asks about a visa we do NOT provide, you MUST politely say that "we don't provide it right now."`;
  }, [visaPlans]);

  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial', role: 'assistant', content: 'Hello! I am the Perennials Visa assistant. How can I help you with your visa application today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const sendMessageToAI = async (message: string, history: Message[]): Promise<string> => {
    const fullHistory = [
      { role: 'system', content: systemPrompt },
      ...history.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await /* [API CALL] /api/chat */ fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: fullHistory
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to connect to the AI service.');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const replyContent = await sendMessageToAI(userMessage.content, newHistory);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: replyContent }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: error.message || "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>

      <motion.button
        className={cn(
          "fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-transform hover:scale-110",
          isOpen ? "bg-[#FCFBF8] border border-[#D9CFBE] text-[#7A7369]" : "bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D] text-[#0A0A31]"
        )}
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[90vw] max-w-[380px] h-[500px] max-h-[70vh] bg-[#F0EEE9] border border-[#E6DFD5] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >

            <div className="bg-[#FCFBF8] border-b border-[#E6DFD5] p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D] flex items-center justify-center text-[#0A0A31]">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[#3E3A35] font-medium text-sm">Visa Assistant</h3>
                <p className="text-[#7A7369]/60 text-xs">Every Question, Answered in one place</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.filter(m => m.role !== 'system').map(msg => (
                <div key={msg.id} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.role === 'user'
                      ? "bg-gradient-to-r from-[#E2B87C] to-[#8C8D8D] text-[#0A0A31] rounded-br-sm"
                      : "bg-[#FCFBF8] text-[#3E3A35] border border-[#CACACB]/5 rounded-bl-sm"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#FCFBF8] border border-[#CACACB]/5 rounded-2xl rounded-bl-sm px-4 py-3">
                    <Loader2 className="w-4 h-4 text-[#E2B87C] animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-[#FCFBF8] border-t border-[#E6DFD5]">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full bg-[#FCFBF8] text-[#3E3A35] rounded-full pl-4 pr-12 py-3 text-sm outline-none border border-[#E6DFD5] focus:border-[#E2B87C]/50 transition-colors placeholder:text-[#7A7369]/40"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-full bg-[#E2B87C] text-[#0A0A31] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

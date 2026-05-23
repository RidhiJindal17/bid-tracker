import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  CornerDownLeft, 
  BrainCircuit,
  Zap
} from 'lucide-react';
import api from '../../api/axios';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am **Antigravity AI**, your virtual project intelligence copilot. Ask me anything about active proposals, delayed deadlines, team workload distribution, or select one of the suggested reports below!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const suggestedPrompts = [
    { text: "What tasks are delayed?", icon: "🚨" },
    { text: "Generate standup report", icon: "📋" },
    { text: "Project health summary", icon: "🔮" }
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Parse markdown into HTML elements safely inline
  const parseInlineStyles = (text) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <strong key={i} className="text-blue-600 dark:text-blue-400 font-extrabold">
            {part}
          </strong>
        );
      }
      return part;
    });
  };

  const parseTextToJSX = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('-') || line.startsWith('*')) {
        const cleanLine = line.replace(/^[-\*\s]+/, '');
        return (
          <div key={index} className="flex items-start gap-1.5 my-1 pl-1">
            <span className="text-blue-500 font-bold">•</span>
            <span>{parseInlineStyles(cleanLine)}</span>
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-1.5" />;
      }
      return (
        <p key={index} className="my-1.5 leading-relaxed">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  const handleSendMessage = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date()
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: prompt });
      if (res.data.success) {
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: res.data.reply,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('AI chat failed:', err);
      const errMsg = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "My apologies. I encountered an error checking portfolio records. Please ensure your Express `GEMINI_API_KEY` is fully configured inside your backend `.env` variables to enable context-aware AI interactions.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="w-[360px] sm:w-[400px] h-[520px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070b1e]/95 backdrop-blur-2xl shadow-2xl flex flex-col mb-4 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-violet-500/10 border-b border-slate-200 dark:border-slate-850 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <BrainCircuit className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    Antigravity AI
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Dynamic Portfolio Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-450 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    {isBot && (
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-blue-500 dark:text-blue-400 shrink-0">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 text-xs leading-relaxed ${
                        isBot
                          ? 'bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 text-slate-750 dark:text-slate-200 rounded-tl-sm'
                          : 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                      }`}
                    >
                      {isBot ? parseTextToJSX(msg.text) : msg.text}
                    </div>
                    {!isBot && (
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 shrink-0">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing/Thinking Loader Indicator */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 justify-start"
                >
                  <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-blue-500 dark:text-blue-400 shrink-0">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 rounded-2xl rounded-tl-sm p-3.5 flex items-center gap-1.5 shrink-0">
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts / Input Footers */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-850 space-y-3 shrink-0">
              {messages.length <= 2 && !loading && (
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((p) => (
                    <button
                      key={p.text}
                      onClick={() => handleSendMessage(p.text)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-slate-650 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/30 dark:hover:bg-slate-850/80 hover:text-slate-850 dark:hover:text-slate-200 transition-all cursor-pointer"
                    >
                      <span>{p.icon}</span>
                      <span>{p.text}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input Field */}
              <div className="relative flex items-center gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask copilot about active bids..."
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-800 dark:text-white p-3 pr-10 text-xs focus:outline-none focus:border-blue-500/50 resize-none h-[40px] max-h-[80px] overflow-y-auto"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loading || !input.trim()}
                  className="absolute right-2 p-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white cursor-pointer disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-800/80 transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Glowing Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 border border-blue-400/20 hover:border-blue-400/50 cursor-pointer relative"
      >
        <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-md -z-10 animate-pulse" />
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <Sparkles className="h-3.5 w-3.5 text-yellow-350 absolute -top-1.5 -right-1.5 animate-pulse" />
          </div>
        )}
      </motion.button>
    </div>
  );
};

export default AIChatbot;

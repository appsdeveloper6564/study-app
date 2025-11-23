import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, Bot, User, MicOff, RotateCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { generateAIChatResponse } from '../services/geminiService';
import AdBanner from '../components/AdBanner';

const AIChat: React.FC = () => {
  const { chats, createChat, getChatMessages, sendChatMessage } = useStore();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Speech Recog
  const recognition = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setInput(prev => prev + " " + text);
        setIsListening(false);
      };
      recognition.current.onerror = () => setIsListening(false);
      recognition.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (chats.length > 0) {
        setCurrentSessionId(chats[0].id);
        setMessages(await getChatMessages(chats[0].id));
      } else {
        const id = await createChat("New Study Session");
        setCurrentSessionId(id);
      }
    };
    init();
  }, [chats.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentSessionId) return;
    
    const userText = input;
    setInput('');
    setLoading(true);

    // 1. Optimistic update
    const tempUserMsg = { id: 'temp', role: 'user', text: userText, timestamp: Date.now() };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
        await sendChatMessage(currentSessionId, userText, 'user');
        
        // 2. Get AI Response
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        const aiText = await generateAIChatResponse(history, userText);
        
        await sendChatMessage(currentSessionId, aiText || "I couldn't generate a response.", 'model');
        
        // 3. Refresh
        setMessages(await getChatMessages(currentSessionId));
        
        // Speak output
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(aiText || "");
            window.speechSynthesis.speak(utterance);
        }

    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      recognition.current?.stop();
    } else {
      setIsListening(true);
      recognition.current?.start();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-3xl mx-auto">
      {/* Ad: 320x50 Mobile */}
      <div className="p-2 flex justify-center bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <AdBanner 
          atOptions={{
            key: 'cc195540a99560ecf2fec170f25610ae',
            format: 'iframe',
            height: 50,
            width: 320,
            params: {}
          }}
          className="my-0"
        />
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-primary-600 text-white'}`}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200' : 'bg-blue-50 dark:bg-blue-900/20 text-slate-800 dark:text-slate-200'}`}>
               {msg.text}
            </div>
          </div>
        ))}
        {loading && (
            <div className="flex gap-4">
                 <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center"><Bot size={18} className="text-white"/></div>
                 <div className="flex items-center gap-1 h-10">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                 </div>
            </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="relative flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-2">
          <button 
            onClick={toggleMic}
            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
             {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <input
            className="flex-1 bg-transparent border-none focus:ring-0 dark:text-white"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 bg-primary-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-700"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UITheme } from '../types';
import { ICONS, THEMES } from '../constants';

interface ChatConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  theme: UITheme;
}

export const ChatConsole: React.FC<ChatConsoleProps> = ({ messages, onSendMessage, isLoading, theme }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const themeStyles = THEMES[theme];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className={`flex flex-col h-full border ${themeStyles.border} bg-slate-950/80 backdrop-blur-md rounded-lg overflow-hidden relative shadow-2xl transition-colors duration-500`}>
      {/* Console Header */}
      <div className={`flex items-center justify-between px-4 py-2 border-b ${themeStyles.border} bg-slate-900/40`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${themeStyles.primary.replace('text-', 'bg-')} animate-pulse`} />
          <span className={`font-orbitron text-[10px] tracking-[0.2em] ${themeStyles.primary}`}>COMMS_LINK: ACTIVE</span>
        </div>
        <div className="flex gap-4">
           <div className="text-[9px] text-slate-500 uppercase font-mono">ENCRYPT_V8.4</div>
           <div className={`text-[9px] ${themeStyles.primary} font-orbitron`}>ZETA_CORE_ONLINE</div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-[fadeIn_0.3s_ease-out]`}
          >
            <div className={`
              max-w-[90%] p-3 rounded-lg text-sm leading-relaxed relative group
              ${msg.role === 'user' 
                ? `${themeStyles.bg} border ${themeStyles.border} ${themeStyles.primary.replace('text-', 'text-opacity-90 text-')}` 
                : msg.role === 'assistant'
                ? 'bg-slate-900/60 border border-slate-700/50 text-slate-300'
                : 'bg-red-900/20 border border-red-900/50 text-red-400 italic font-bold'
              }
            `}>
              {msg.role === 'assistant' && (
                <div className={`text-[9px] uppercase tracking-widest ${themeStyles.primary} mb-1 font-orbitron flex items-center gap-2`}>
                   <ICONS.Activity /> COMMANDER ZETA
                </div>
              )}
              {msg.role === 'user' && (
                <div className={`text-[9px] uppercase tracking-widest ${themeStyles.primary} mb-1 font-orbitron text-right`}>
                  CAPTAIN
                </div>
              )}
              {msg.content}
              <div className="text-[8px] text-slate-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start">
            <div className="bg-slate-900/60 border border-slate-700/50 p-3 rounded-lg text-cyan-400">
              <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 ${themeStyles.primary.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                <div className={`w-1.5 h-1.5 ${themeStyles.primary.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                <div className={`w-1.5 h-1.5 ${themeStyles.primary.replace('text-', 'bg-')} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className={`p-4 bg-slate-900/40 border-t ${themeStyles.border}`}>
        <div className={`flex items-center gap-2 bg-slate-950/50 border ${themeStyles.border} rounded-md px-3 py-2 group focus-within:border-${themeStyles.accent}-400 transition-all`}>
          <span className={`font-bold transition-colors ${themeStyles.primary}`}>&gt;</span>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Awaiting command..."
            className="flex-1 bg-transparent border-none outline-none text-slate-200 placeholder-slate-700 text-sm"
          />
          <button 
            type="submit"
            disabled={isLoading}
            className={`transition-colors p-1 ${themeStyles.primary} hover:brightness-125`}
          >
            <ICONS.Terminal />
          </button>
        </div>
      </form>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

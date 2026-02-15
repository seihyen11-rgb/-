
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ProteinLog, ChatMessage } from '../types';
import { analyzeFoodImage, processChatMessage } from '../services/geminiService';
// Fix: Added ClipboardDocumentListIcon to the imports
import { 
  PhotoIcon, 
  PaperAirplaneIcon,
  ClockIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/solid';

interface DailyViewProps {
  logs: ProteinLog[];
  messages: ChatMessage[];
  onAddLog: (log: Omit<ProteinLog, 'id'>) => string;
  onUpdateLog: (id: string, updates: Partial<ProteinLog>) => void;
  onDeleteLog: (id: string) => void;
  onAddMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ logs, messages, onAddLog, onUpdateLog, onDeleteLog, onAddMessage }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, logs]);

  const today = new Date().setHours(0, 0, 0, 0);
  
  const todayLogs = useMemo(() => {
    return logs.filter(log => new Date(log.timestamp).setHours(0, 0, 0, 0) === today);
  }, [logs, today]);

  const todayMessages = useMemo(() => {
    return messages.filter(msg => new Date(msg.timestamp).setHours(0, 0, 0, 0) === today);
  }, [messages, today]);

  const totalProteinToday = todayLogs.reduce((sum, log) => sum + log.proteinAmount, 0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const result = await analyzeFoodImage(base64String);
        const logId = onAddLog({
          foodName: result.foodName,
          proteinAmount: result.proteinAmount,
          timestamp: Date.now(),
          imageUrl: reader.result as string
        });
        onAddMessage({ role: 'ai', logId });
      } catch (error) {
        console.error("AI Analysis failed", error);
        onAddMessage({ role: 'ai', text: "이미지 분석에 실패했습니다. 다시 시도해주세요." });
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userInput = chatInput;
    setChatInput('');
    onAddMessage({ role: 'user', text: userInput });
    setChatLoading(true);

    const historyString = todayLogs.map(l => `[${l.id}] ${l.foodName}: ${l.proteinAmount}g`).join(', ');

    try {
      const result = await processChatMessage(userInput, historyString);
      
      if (result.action === 'ADD') {
        const logId = onAddLog({
          foodName: result.foodName,
          proteinAmount: result.proteinAmount,
          timestamp: Date.now()
        });
        onAddMessage({ role: 'ai', text: result.responseMessage, logId });
      } else if (result.action === 'UPDATE' && result.targetId) {
        onUpdateLog(result.targetId, {
          foodName: result.foodName,
          proteinAmount: result.proteinAmount
        });
        onAddMessage({ role: 'ai', text: result.responseMessage });
      } else if (result.action === 'DELETE' && result.targetId) {
        onDeleteLog(result.targetId);
        onAddMessage({ role: 'ai', text: result.responseMessage });
      } else {
        onAddMessage({ role: 'ai', text: result.responseMessage });
      }
    } catch (error) {
      console.error("Chat processing failed", error);
      onAddMessage({ role: 'ai', text: "요청을 처리하는 중 오류가 발생했습니다." });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Summary Header */}
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">오늘 총량</p>
              <h2 className="text-3xl font-bold">
                {totalProteinToday}<span className="text-lg font-normal ml-1">g</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-indigo-100 opacity-80">
                {new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
              </p>
              <div className="flex items-center gap-1 justify-end mt-1">
                <ClockIcon className="w-3 h-3" />
                <span className="text-[10px] uppercase font-bold tracking-tighter">Live Tracker</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {todayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 opacity-60">
            <ClipboardDocumentListIcon className="w-12 h-12" />
            <p className="text-sm">오늘의 식사를 기록해보세요!</p>
          </div>
        ) : (
          todayMessages.map((msg) => {
            const isAI = msg.role === 'ai';
            const log = msg.logId ? logs.find(l => l.id === msg.logId) : null;

            return (
              <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end animate-in slide-in-from-right-2 duration-300'}`}>
                <div className={`max-w-[85%] flex flex-col gap-1 ${isAI ? 'items-start' : 'items-end'}`}>
                  {msg.text && (
                    <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isAI 
                        ? 'bg-white border border-slate-200 text-slate-800 rounded-bl-none' 
                        : 'bg-indigo-600 text-white rounded-br-none'
                    }`}>
                      {msg.text}
                    </div>
                  )}
                  
                  {log && (
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md w-64 animate-in fade-in zoom-in-95 duration-300">
                      {log.imageUrl && (
                        <img src={log.imageUrl} alt={log.foodName} className="w-full h-32 object-cover border-b border-slate-100" />
                      )}
                      <div className="p-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800 text-sm truncate flex-1 mr-2">{log.foodName}</h4>
                          <span className="text-indigo-600 font-bold text-sm whitespace-nowrap">{log.proteinAmount}g</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(log.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <span className="text-[10px] text-slate-400 px-1">
                    {new Date(msg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Footer */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col gap-2">
          <form onSubmit={handleChatSubmit} className="relative flex gap-2">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-slate-100 text-slate-600 p-3 rounded-2xl hover:bg-slate-200 transition-colors"
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <PhotoIcon className="w-6 h-6" />
              )}
            </button>
            <div className="relative flex-1">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="음식 입력 또는 수정 요청..."
                className="w-full bg-slate-100 border-none rounded-2xl py-3 px-4 pr-12 focus:ring-2 focus:ring-indigo-500 text-sm transition-all"
                disabled={chatLoading}
              />
              <button 
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 p-1 disabled:opacity-30"
              >
                {chatLoading ? (
                  <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <PaperAirplaneIcon className="w-6 h-6" />
                )}
              </button>
            </div>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment"
              hidden 
              ref={fileInputRef} 
              onChange={handleImageUpload}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default DailyView;

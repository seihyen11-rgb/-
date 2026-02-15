import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ProteinLog, ChatMessage } from './types';
import { analyzeFoodImage, processChatMessage } from './geminiService';
import { 
  PhotoIcon, 
  PaperAirplaneIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  CameraIcon
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, logs]);

  const today = new Date().setHours(0, 0, 0, 0);
  const todayLogs = useMemo(() => logs.filter(log => new Date(log.timestamp).setHours(0, 0, 0, 0) === today), [logs, today]);
  const todayMessages = useMemo(() => messages.filter(msg => new Date(msg.timestamp).setHours(0, 0, 0, 0) === today), [messages, today]);
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
        const logId = onAddLog({ foodName: result.foodName, proteinAmount: result.proteinAmount, timestamp: Date.now(), imageUrl: reader.result as string });
        onAddMessage({ role: 'ai', logId });
      } catch (error) {
        onAddMessage({ role: 'ai', text: "분석 실패" });
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
    const historyString = todayLogs.map(l => `${l.foodName}: ${l.proteinAmount}g`).join(', ');
    try {
      const result = await processChatMessage(userInput, historyString);
      if (result.action === 'ADD') {
        const logId = onAddLog({ foodName: result.foodName, proteinAmount: result.proteinAmount, timestamp: Date.now() });
        onAddMessage({ role: 'ai', text: result.responseMessage, logId });
      } else {
        onAddMessage({ role: 'ai', text: result.responseMessage });
      }
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white border-b">
        <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-xs opacity-80 uppercase">오늘 총량</p>
          <h2 className="text-3xl font-bold">{totalProteinToday}g</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40">
        {todayMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'ai' ? 'bg-white border' : 'bg-indigo-600 text-white'}`}>
              {msg.text}
              {msg.logId && logs.find(l => l.id === msg.logId) && (
                <div className="mt-2 font-bold border-t pt-1">
                  {logs.find(l => l.id === msg.logId)?.foodName} (+{logs.find(l => l.id === msg.logId)?.proteinAmount}g)
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="absolute bottom-0 w-full p-4 bg-white border-t">
        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <button type="button" onClick={() => cameraInputRef.current?.click()} className="bg-slate-100 p-3 rounded-2xl"><CameraIcon className="w-6 h-6 text-slate-600" /></button>
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="bg-slate-100 p-3 rounded-2xl"><PhotoIcon className="w-6 h-6 text-slate-600" /></button>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-slate-100 rounded-2xl px-4 text-sm outline-none" placeholder="입력..." />
          <button type="submit" className="text-indigo-600 p-2"><PaperAirplaneIcon className="w-6 h-6" /></button>
          <input type="file" accept="image/*" capture="environment" hidden ref={cameraInputRef} onChange={handleImageUpload} />
          <input type="file" accept="image/*" hidden ref={galleryInputRef} onChange={handleImageUpload} />
        </form>
      </div>
    </div>
  );
};

export default DailyView;

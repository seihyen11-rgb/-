import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ProteinLog, ChatMessage } from './types'; // 경로 수정
import { analyzeFoodImage, processChatMessage } from './geminiService'; // 경로 수정
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
        onAddMessage({ role: 'ai', text: "이미지 분석에 실패했습니다." });
      } finally {
        setIsAnalyzing(false);
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
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
        const logId = onAddLog({ foodName: result.foodName, proteinAmount: result.proteinAmount, timestamp: Date.now() });
        onAddMessage({ role: 'ai', text: result.responseMessage, logId });
      } else if (result.action === 'UPDATE' && result.targetId) {
        onUpdateLog(result.targetId, { foodName: result.foodName, proteinAmount: result.proteinAmount });
        onAddMessage({ role: 'ai', text: result.responseMessage });
      } else {
        onAddMessage({ role: 'ai', text: result.responseMessage });
      }
    } catch (error) {
      onAddMessage({ role: 'ai', text: "오류가 발생했습니다." });
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 bg-white border-b border-slate-200">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-indigo-100 text-xs font-medium uppercase tracking-wider">오늘 총량</p>
          <h2 className="text-3xl font-bold">{totalProteinToday}<span className="text-lg font-normal ml-1">g</span></h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40">
        {todayMessages.map((msg) => {
          const isAI = msg.role === 'ai';
          const log = msg.logId ? logs.find(l => l.id === msg.logId) : null;
          return (
            <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] flex flex-col gap-1 ${isAI ? 'items-start' : 'items-end'}`}>
                {msg.text && (
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isAI ? 'bg-white border text-slate-800' : 'bg-indigo-600 text-white'}`}>
                    {msg.text}
                  </div>
                )}
                {log && (
                  <div className="bg-white border rounded-2xl overflow-hidden shadow-md w-64">
                    {log.imageUrl && <img src={log.imageUrl} alt={log.foodName} className="w-full h-32 object-cover" />}
                    <div className="p-3 flex justify-between items-center">
                      <h4 className="font-bold text-slate-800 text-sm">{log.foodName}</h4>
                      <span className="text-indigo-600 font-bold text-sm">{log.proteinAmount}g</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t">
        <form onSubmit={handleChatSubmit} className="flex gap-2">
          <button type="button" onClick={() => cameraInputRef.current?.click()} className="bg-slate-100 p-3 rounded-2xl"><CameraIcon className="w-6 h-6 text-slate-600" /></button>
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="bg-slate-100 p-3 rounded-2xl"><PhotoIcon className="w-6 h-6 text-slate-600" /></button>
          <div className="relative flex-1">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} className="w-full bg-slate-100 rounded-2xl py-3 px-4 text-sm outline-none" placeholder="식사 입력..." />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 p-1"><PaperAirplaneIcon className="w-6 h-6

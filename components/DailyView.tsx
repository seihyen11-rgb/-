import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ProteinLog, ChatMessage } from './types'; 
import { analyzeFoodImage, processChatMessage } from './geminiService'; 
import { PhotoIcon, PaperAirplaneIcon, CameraIcon } from '@heroicons/react/24/solid';

const DailyView: React.FC<any> = ({ logs, messages, onAddLog, onAddMessage }) => {
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const todayLogs = useMemo(() => logs.filter((l:any) => new Date(l.timestamp).toDateString() === new Date().toDateString()), [logs]);
  const totalProtein = todayLogs.reduce((s:number, l:any) => s + l.proteinAmount, 0);

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setChatLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await analyzeFoodImage((reader.result as string).split(',')[1]);
        const logId = onAddLog({ foodName: res.foodName, proteinAmount: res.proteinAmount, timestamp: Date.now(), imageUrl: reader.result as string });
        onAddMessage({ role: 'ai', logId });
      } catch (err) { onAddMessage({ role: 'ai', text: "분석 실패" }); }
      finally { setChatLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    const input = chatInput;
    setChatInput('');
    onAddMessage({ role: 'user', text: input });
    setChatLoading(true);
    try {
      const res = await processChatMessage(input, JSON.stringify(todayLogs));
      if (res.action === 'ADD') onAddLog({ foodName: res.foodName, proteinAmount: res.proteinAmount, timestamp: Date.now() });
      onAddMessage({ role: 'ai', text: res.responseMessage });
    } finally { setChatLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4 bg-white border-b">
        <div className="bg-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <p className="text-xs opacity-80 uppercase font-bold tracking-wider">오늘 단백질</p>
          <h2 className="text-4xl font-black italic">{totalProtein}g</h2>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-40">
        {messages.map((msg:any) => (
          <div key={msg.id} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'ai' ? 'bg-white border text-slate-800' : 'bg-indigo-600 text-white'}`}>
              {msg.text || (msg.logId && "식사 기록을 분석했습니다.")}
              {msg.logId && <div className="mt-2 text-xs font-bold border-t pt-1">✅ 기록 완료</div>}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="absolute bottom-0 w-full p-4 bg-white border-t">
        <form onSubmit={handleChat} className="flex gap-2 items-center">
          <button type="button" onClick={() => cameraInputRef.current?.click()} className="p-3 bg-slate-100 rounded-2xl"><CameraIcon className="w-6 h-6 text-slate-600" /></button>
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="p-3 bg-slate-100 rounded-2xl"><PhotoIcon className="w-6 h-6 text-slate-600" /></button>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-sm outline-none" placeholder="식사 입력..." />
          <button type="submit" className="text-indigo-600 font-bold ml-2">전송</button>
          <input type="file" accept="image/*" capture="environment" hidden ref={cameraInputRef} onChange={handleImage} />
          <input type="file" accept="image/*" hidden ref={galleryInputRef} onChange={handleImage} />
        </form>
      </div>
    </div>
  );
};

export default DailyView;

import React, { useState, useRef } from 'react';
import { processChatMessage, analyzeFoodImage } from './services/geminiService';

export default function App() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);

  const addLog = (n: string, p: number) => {
    setLogs(prev => [...prev, { id: Date.now(), n, p, t: new Date().toLocaleTimeString() }]);
  };

  const handleImg = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await analyzeFoodImage((reader.result as string).split(',')[1]);
        addLog(res.foodName, res.proteinAmount);
      } catch { alert("분석 실패"); } finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleChat = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await processChatMessage(input, JSON.stringify(logs));
      if (res.action === 'ADD') addLog(res.foodName, res.proteinAmount);
      setInput('');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center">
      <div className="w-full max-w-md bg-indigo-600 rounded-2xl p-6 text-white shadow-lg mb-4">
        <p className="text-sm opacity-80">오늘 단백질</p>
        <h2 className="text-4xl font-bold">{logs.reduce((s, l) => s + l.p, 0)}g</h2>
      </div>
      <div className="w-full max-w-md flex-1 overflow-y-auto space-y-2 mb-20">
        {logs.map(l => (
          <div key={l.id} className="bg-white p-3 rounded-xl shadow-sm flex justify-between">
            <span>{l.n}</span><span className="font-bold text-indigo-600">{l.p}g</span>
          </div>
        ))}
      </div>
      <footer className="fixed bottom-0 w-full max-w-md bg-white p-4 border-t flex gap-2">
        <input type="file" accept="image/*" capture="environment" ref={camRef} onChange={handleImg} className="hidden" />
        <input type="file" accept="image/*" ref={galRef} onChange={handleImg} className="hidden" />
        <button onClick={() => camRef.current?.click()} className="p-3 bg-gray-100 rounded-xl text-xl">📷</button>
        <button onClick={() => galRef.current?.click()} className="p-3 bg-gray-100 rounded-xl text-xl">🖼️</button>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleChat()} className="flex-1 bg-gray-100 rounded-xl px-4 outline-none" placeholder="식사 입력..." />
        <button onClick={handleChat} className="text-indigo-600 font-bold">전송</button>
      </footer>
    </div>
  );
}

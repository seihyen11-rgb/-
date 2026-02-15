import React, { useState, useRef } from 'react';
import { processChatMessage, analyzeFoodImage } from './services/geminiService';

export default function App() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);

  const totalProtein = logs.reduce((sum, log) => sum + log.proteinAmount, 0);

  const addLog = (foodName: string, proteinAmount: number) => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      foodName,
      proteinAmount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const res = await analyzeFoodImage(base64);
        addLog(res.foodName, res.proteinAmount);
      } catch (err) { alert("분석 실패"); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleChat = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const res = await processChatMessage(input, JSON.stringify(logs));
      if (res.action === 'ADD') addLog(res.foodName, res.proteinAmount);
      setInput('');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center font-sans">
      <header className="w-full max-w-md bg-white p-4 flex justify-between items-center border-b">
        <h1 className="text-xl font-black text-indigo-600">📋 Protein AI</h1>
      </header>

      <main className="w-full max-w-md p-4 flex-1 overflow-y-auto pb-32">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl mb-6">
          <p className="text-sm opacity-80">오늘 총량</p>
          <h2 className="text-5xl font-black">{totalProtein}g</h2>
        </div>

        <div className="space-y-3">
          {logs.map(log => (
            <div key={log.id} className="flex flex-col items-end">
              <div className="bg-white border border-indigo-100 px-4 py-2 rounded-2xl rounded-tr-none shadow-sm text-sm font-bold text-indigo-900">
                {log.foodName} | {log.proteinAmount}g
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full max-w-md bg-white p-4 border-t flex gap-2 items-center">
        <input type="file" accept="image/*" capture="environment" ref={camRef} onChange={handleImage} className="hidden" />
        <input type="file" accept="image/*" ref={galRef} onChange={handleImage} className="hidden" />
        <button onClick={() => camRef.current?.click()} className="w-12 h-12 bg-gray-100 rounded-2xl text-xl">📷</button>
        <button onClick={() => galRef.current?.click()} className="w-12 h-12 bg-gray-100 rounded-2xl text-xl">🖼️</button>
        <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4">
          <input 
            value={input} onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleChat()}
            placeholder="식사 입력..." className="flex-1 bg-transparent py-3 outline-none text-sm"
          />
          <button onClick={handleChat} className="ml-2 text-indigo-600 font-bold">{loading ? "..." : "↑"}</button>
        </div>
      </footer>
    </div>
  );
}

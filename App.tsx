import React, { useState, useRef } from 'react';
import { processChatMessage, analyzeFoodImage } from './services/geminiService';

export default function App() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);

  const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);

  const addLog = (name: string, protein: number) => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      name,
      protein,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await analyzeFoodImage((reader.result as string).split(',')[1]);
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
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center font-sans">
      {/* 상단 로고 */}
      <header className="w-full max-w-md p-6 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📋</span>
          <h1 className="text-xl font-bold text-indigo-900">Protein AI</h1>
        </div>
      </header>

      {/* 보라색 메인 카드 */}
      <main className="w-full max-w-md p-4 flex-1">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <p className="text-indigo-100 text-sm font-medium mb-1">오늘 총량</p>
          <h2 className="text-6xl font-bold italic">{totalProtein}<span className="text-2xl not-italic ml-1 opacity-80">g</span></h2>
        </div>

        {/* 채팅 로그 */}
        <div className="space-y-4 pb-40">
          {logs.map(log => (
            <div key={log.id} className="flex flex-col items-end animate-in slide-in-from-right-2">
              <div className="bg-white border border-slate-200 px-5 py-3 rounded-2xl rounded-tr-none shadow-sm text-slate-800 font-semibold">
                {log.name} {log.protein}g
              </div>
              <span className="text-[10px] text-slate-400 mt-1 mr-1">{log.time}</span>
            </div>
          ))}
        </div>
      </main>

      {/* 세련된 하단 푸터 */}
      <footer className="fixed bottom-0 w-full max-w-md p-6 bg-transparent">
        <div className="bg-white rounded-[24px] p-2 shadow-2xl flex items-center gap-2 border border-slate-100">
          <input type="file" accept="image/*" capture="environment" ref={camRef} onChange={handleImage} className="hidden" />
          <input type="file" accept="image/*" ref={galRef} onChange={handleImage} className="hidden" />
          
          <button onClick={() => camRef.current?.click()} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl hover:bg-slate-200 transition-all">📷</button>
          <button onClick={() => galRef.current?.click()} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl hover:bg-slate-200 transition-all">🖼️</button>
          
          <div className="flex-1 flex items-center px-2">
            <input 
              value={input} onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleChat()}
              placeholder="음식 입력 또는 수정 요청..." 
              className="w-full bg-transparent py-3 outline-none text-sm text-slate-600"
            />
            <button onClick={handleChat} className="ml-2 text-indigo-500 hover:scale-110 transition-transform">
              <svg className="w-7 h-7 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

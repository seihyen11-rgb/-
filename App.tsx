import React, { useState, useEffect, useRef } from 'react';
// 💡 주의: geminiService.ts 파일도 루트(App.tsx 바로 옆)에 있어야 합니다.
import { processChatMessage, analyzeFoodImage } from './geminiService';

// 타입 정의 (파일 분리 대신 상단에 배치)
interface ProteinLog {
  id: string;
  foodName: string;
  proteinAmount: number;
  timestamp: number;
  imageUrl?: string;
}

const App: React.FC = () => {
  const [logs, setLogs] = useState<ProteinLog[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  // 로컬 스토리지 저장/불러오기
  useEffect(() => {
    const saved = localStorage.getItem('protein_logs');
    if (saved) setLogs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('protein_logs', JSON.stringify(logs));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const totalProteinToday = logs
    .filter(log => new Date(log.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, log) => sum + log.proteinAmount, 0);

  const addLog = (name: string, amount: number, img?: string) => {
    const newLog: ProteinLog = {
      id: crypto.randomUUID(),
      foodName: name,
      proteinAmount: amount,
      timestamp: Date.now(),
      imageUrl: img
    };
    setLogs(prev => [...prev, newLog]);
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
        addLog(res.foodName, res.proteinAmount, reader.result as string);
      } catch (err) { alert("분석 실패"); }
      finally { setLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const history = logs.map(l => `${l.foodName}:${l.proteinAmount}g`).join(', ');
      const res = await processChatMessage(input, history);
      if (res.action === 'ADD') addLog(res.foodName, res.proteinAmount);
      setInput('');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative">
      {/* 헤더 */}
      <header className="bg-white border-b p-4 sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600">📋 Protein AI</h1>
      </header>

      {/* 메인 영역 */}
      <main className="flex-1 overflow-y-auto p-4 pb-40">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white shadow-lg mb-6">
          <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">오늘 총량</p>
          <h2 className="text-5xl font-extrabold italic">{totalProteinToday}g</h2>
        </div>

        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="flex flex-col items-end animate-in fade-in slide-in-from-right-2">
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm w-full">
                {log.imageUrl && <img src={log.imageUrl} className="w-full h-32 object-cover" />}
                <div className="p-3 flex justify-between items-center">
                  <span className="font-bold text-slate-800">{log.foodName}</span>
                  <span className="text-indigo-600 font-black">{log.proteinAmount}g</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* 푸터 입력창 */}
      <footer className="fixed bottom-0 w-full max-w-md bg-white border-t p-4 shadow-[0_-4px_15px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2">
          <input type="file" accept="image/*" capture="environment" ref={cameraRef} onChange={handleImage} className="hidden" />
          <input type="file" accept="image/*" ref={galleryRef} onChange={handleImage} className="hidden" />
          <button onClick={() => cameraRef.current?.click()} className="p-3 bg-slate-100 rounded-2xl text-xl">📷</button>
          <button onClick={() => galleryRef.current?.click()} className="p-3 bg-slate-100 rounded-2xl text-xl">🖼️</button>
          
          <form onSubmit={handleChat} className="flex-1 flex bg-slate-100 rounded-2xl px-4 items-center">
            <input 
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="음식 입력..." className="flex-1 bg-transparent py-3 outline-none text-sm"
            />
            <button type="submit" className="text-indigo-600 font-bold ml-2">{loading ? "..." : "↑"}</button>
          </form>
        </div>
      </footer>
    </div>
  );
};

export default App;

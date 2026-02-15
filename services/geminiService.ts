import React, { useState, useRef } from 'react';
import { processChatMessage, analyzeFoodImage } from './services/geminiService';

interface Log {
  id: number;
  name: string;
  protein: number;
  time: string;
}

function App() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const totalProtein = logs.reduce((sum, log) => sum + log.protein, 0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = (reader.result as string).split(',')[1];
      try {
        const result = await analyzeFoodImage(base64Data);
        addLog(result.foodName, result.proteinAmount);
      } catch (err) {
        alert("이미지 분석 실패");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addLog = (name: string, protein: number) => {
    const newLog = {
      id: Date.now(),
      name,
      protein,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setLogs(prev => [...prev, newLog]);
  };

  const handleChat = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await processChatMessage(input, JSON.stringify(logs));
      if (result.action === 'ADD') {
        addLog(result.foodName, result.proteinAmount);
      }
      setInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* 상단 헤더 */}
      <header className="w-full max-w-md bg-white p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-sm">📋</div>
          <h1 className="text-xl font-extrabold text-gray-800">Protein AI</h1>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button className="p-2 bg-white rounded-lg shadow-sm">📄</button>
          <button className="p-2 text-gray-400">📊</button>
        </div>
      </header>

      {/* 대시보드 */}
      <main className="w-full max-w-md p-4 flex-1 overflow-y-auto pb-32">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
          <p className="text-sm opacity-80 mb-1">오늘 총량</p>
          <div className="flex items-baseline gap-1">
            <h2 className="text-5xl font-black">{totalProtein}</h2>
            <span className="text-xl font-medium">g</span>
          </div>
          <div className="absolute top-6 right-6 text-right text-[10px] font-bold tracking-widest">
            <p className="opacity-70">2월 16일</p>
            <p className="mt-1">● LIVE TRACKER</p>
          </div>
        </div>

        {/* 로그 리스트 */}
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-sm">오늘의 식사를 기록해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col items-end animate-in fade-in slide-in-from-right-4">
                <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-lg text-sm font-medium">
                  {log.name} {log.protein}g
                </div>
                <span className="text-[10px] text-gray-400 mt-1 mr-1">{log.time}</span>
              </div>
            ))}
          </div>
        )}
        {loading && <div className="text-center text-xs text-gray-400 mt-4 animate-pulse">AI 분석 중...</div>}
      </main>

      {/* 하단 입력창 (디자인 완성) */}
      <footer className="fixed bottom-0 w-full max-w-md bg-white p-4 border-t flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageUpload} className="hidden" />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          
          <button onClick={() => cameraInputRef.current?.click()} className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl hover:bg-gray-200 transition-colors">📷</button>
          <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl hover:bg-gray-200 transition-colors">🖼️</button>
          
          <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4 py-1">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
onKeyPress={(e) => e.key === 'Enter' && handleChat()}
              placeholder="음식 입력 또는 수정 요청..."
              className="flex-1 bg-transparent py-3 outline-none text-sm text-gray-700"
            />
            <button onClick={handleChat} disabled={loading} className="ml-2 text-indigo-600 disabled:opacity-30">
              <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

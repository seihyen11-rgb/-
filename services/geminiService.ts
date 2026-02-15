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
        alert("분석 실패");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const addLog = (name: string, protein: number) => {
    setLogs(prev => [...prev, {
      id: Date.now(),
      name,
      protein,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  const handleChat = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const result = await processChatMessage(input, JSON.stringify(logs));
      if (result.action === 'ADD') addLog(result.foodName, result.proteinAmount);
      setInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <header className="w-full max-w-md bg-white p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-600">📋 Protein AI</div>
      </header>

      <main className="w-full max-w-md p-4 flex-1 overflow-y-auto pb-32">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl mb-6">
          <p className="text-sm opacity-80">오늘 총량</p>
          <h2 className="text-5xl font-black">{totalProtein}g</h2>
        </div>

        <div className="space-y-4">
          {logs.map(log => (
            <div key={log.id} className="flex flex-col items-end">
              <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-lg text-sm">
                {log.name} {log.protein}g
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{log.time}</span>
            </div>
          ))}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full max-w-md bg-white p-4 border-t">
        <div className="flex gap-2 items-center">
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageUpload} className="hidden" />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
          
          <button onClick={() => cameraInputRef.current?.click()} className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl">📷</button>
          <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl">🖼️</button>
          
          <div className="flex-1 bg-gray-100 rounded-2xl flex items-center px-4">
            <input 
              type="text" value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChat()}
              placeholder="식사 입력..."
              className="flex-1 bg-transparent py-3 outline-none text-sm"
            />
            <button onClick={handleChat} disabled={loading} className="ml-2 text-indigo-600 font-bold">전송</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

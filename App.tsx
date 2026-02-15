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
      <header className="w-full max-w-md bg-white p-4 flex justify-between items-center border-b">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-xl text-white">📋</div>
          <h1 className="text-xl font-extrabold text-gray-800">Protein AI</h1>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button className="p-2 bg-white rounded-lg shadow-sm">📄</button>
          <button className="p-2 text-gray-400">📊</button>
        </div>
      </header>

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

        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-sm">오늘의 식사를 기록해보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col items-end">
                <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-lg text-sm font-medium">
                  {log.name} {log.protein}g
                </div>
                <span className="text-[10px] text-gray-400 mt-1 mr-1">{log.time}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 w-full max-w-md bg-white p-4 border-t flex flex-col gap-3">
        <div className="flex gap-2 items-center">
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleImageUpload} className="hidden" />
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

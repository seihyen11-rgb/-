import React, { useState, useEffect } from 'react';
import { ProteinLog, ViewMode, ChatMessage } from './types'; 
import DailyView from './DailyView'; // 경로 수정: ./components/ 제거
import WeeklyChart from './WeeklyChart'; // 경로 수정: ./components/ 제거
import { 
  ChartBarIcon, 
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [logs, setLogs] = useState<ProteinLog[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DAILY);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const savedLogs = localStorage.getItem('protein_logs');
    const savedMessages = localStorage.getItem('protein_messages');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedMessages) setMessages(JSON.parse(savedMessages));
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem('protein_logs', JSON.stringify(logs));
      localStorage.setItem('protein_messages', JSON.stringify(messages));
    }
  }, [logs, messages, isInitializing]);

  const addLog = (newLog: Omit<ProteinLog, 'id'>): string => {
    const id = crypto.randomUUID();
    setLogs(prev => [...prev, { ...newLog, id }]);
    return id;
  };

  const updateLog = (id: string, updates: Partial<ProteinLog>) => {
    setLogs(prev => prev.map(log => log.id === id ? { ...log, ...updates } : log));
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
    setMessages(prev => prev.filter(msg => msg.logId !== id));
  };

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: crypto.randomUUID(), timestamp: Date.now() }]);
  };

  if (isInitializing) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-xl ring-1 ring-slate-200">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <span className="bg-indigo-600 text-white p-1 rounded-lg">
            <ClipboardDocumentListIcon className="w-5 h-5" />
          </span>
          Protein AI
        </h1>
        <div className="flex bg-slate-100 p-1 rounded-xl font-medium text-sm">
          <button
            onClick={() => setViewMode(ViewMode.DAILY)}
            className={`px-4 py-2 rounded-lg transition-all ${viewMode === ViewMode.DAILY ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            기록
          </button>
          <button
            onClick={() => setViewMode(ViewMode.WEEKLY)}
            className={`px-4 py-2 rounded-lg transition-all ${viewMode === ViewMode.WEEKLY ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
          >
            통계
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative flex flex-col">
        {viewMode === ViewMode.DAILY ? (
          <DailyView 
            logs={logs} messages={messages}
            onAddLog={addLog} onUpdateLog={updateLog}
            onDeleteLog={deleteLog} onAddMessage={addMessage}
          />
        ) : (
          <div className="overflow-y-auto h-full">
            <WeeklyChart logs={logs} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;

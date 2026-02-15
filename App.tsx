import React, { useState } from 'react';
import { processChatMessage } from './services/geminiService';

function App() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const historyStr = JSON.stringify(logs);
      const result = await processChatMessage(input, historyStr);
      
      // AI 답변에 따라 로그 업데이트
      if (result.action === 'ADD') {
        setLogs([...logs, { id: Date.now(), name: result.foodName, protein: result.proteinAmount }]);
      }
      alert(result.responseMessage);
      setInput('');
    } catch (err) {
      alert("에러가 발생했습니다. 콘솔을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  const totalProtein = logs.reduce((sum, item) => sum + item.protein, 0);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Protein AI Tracker</h1>
      <div className="bg-indigo-600 text-white p-6 rounded-2xl mb-4">
        <p>오늘 총량</p>
        <h2 className="text-4xl font-bold">{totalProtein} g</h2>
      </div>
      <div className="space-y-2 mb-4">
        {logs.map(log => (
          <div key={log.id} className="p-3 bg-white shadow rounded-lg flex justify-between">
            <span>{log.name}</span>
            <span className="font-bold">{log.protein}g</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="계란 2개 먹었어"
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="bg-indigo-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "..." : "전송"}
        </button>
      </div>
    </div>
  );
}

export default App;

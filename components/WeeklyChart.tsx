import React, { useMemo } from 'react';
import { ProteinLog } from './types'; // 경로 수정
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface WeeklyChartProps {
  logs: ProteinLog[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ logs }) => {
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      const dateStr = date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
      
      const dayProtein = logs
        .filter(log => log.timestamp >= dayStart && log.timestamp <= dayEnd)
        .reduce((sum, log) => sum + log.proteinAmount, 0);
        
      data.push({
        name: dateStr,
        protein: dayProtein,
        isToday: i === 0
      });
    }
    return data;
  }, [logs]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-3xl border shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">주간 단백질 섭취량</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis hide />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'}} />
              <Bar dataKey="protein" radius={[6, 6, 0, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isToday ? '#4f46e5' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase mb-1">일주일 총량</p>
          <p className="text-2xl font-bold">{chartData.reduce((sum, d) => sum + d.protein, 0)}g</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase mb-1">일일 평균</p>
          <p className="text-2xl font-bold text-indigo-600">{Math.round(chartData.reduce((sum, d) => sum + d.protein, 0) / 7)}g</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyChart;

import React, { useMemo } from 'react';
import { ProteinLog } from './types'; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WeeklyChart: React.FC<{logs: ProteinLog[]}> = ({ logs }) => {
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayProtein = logs
        .filter(l => new Date(l.timestamp).toDateString() === date.toDateString())
        .reduce((s, l) => s + l.proteinAmount, 0);
      data.push({ name: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }), protein: dayProtein, isToday: i === 0 });
    }
    return data;
  }, [logs]);

  return (
    <div className="p-6 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip />
          <Bar dataKey="protein" radius={[6, 6, 0, 0]}>
            {chartData.map((e, i) => <Cell key={i} fill={e.isToday ? '#4f46e5' : '#e2e8f0'} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyChart;

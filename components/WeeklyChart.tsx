import React, { useMemo } from 'react';
import { ProteinLog } from './types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface WeeklyChartProps { logs: ProteinLog[]; }

const WeeklyChart: React.FC<WeeklyChartProps> = ({ logs }) => {
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
      const dayProtein = logs.filter(l => l.timestamp >= dayStart && l.timestamp <= dayEnd).reduce((s, l) => s + l.proteinAmount, 0);
      data.push({ name: date.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }), protein: dayProtein, isToday: i === 0 });
    }
    return data;
  }, [logs]);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-6 rounded-3xl border shadow-sm h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="protein" radius={[6, 6, 0, 0]}>
              {chartData.map((e, i) => <Cell key={i} fill={e.isToday ? '#4f46e5' : '#e2e8f0'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyChart;

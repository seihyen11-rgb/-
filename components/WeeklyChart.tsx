
import React, { useMemo } from 'react';
import { ProteinLog } from '../types';
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
    
    // Last 7 days including today
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

  const maxProtein = Math.max(...chartData.map(d => d.protein), 50);

  return (
    <div className="p-6 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h3 className="text-slate-800 font-bold text-lg mb-6">최근 7일 단백질 통계</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                domain={[0, Math.ceil(maxProtein * 1.2)]}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  fontWeight: 'bold',
                  padding: '12px'
                }}
              />
              <Bar 
                dataKey="protein" 
                radius={[8, 8, 0, 0]}
                barSize={32}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isToday ? '#4f46e5' : '#e2e8f0'} 
                    className="transition-all duration-300"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">일주일 총량</p>
          <p className="text-2xl font-bold text-slate-800">
            {chartData.reduce((sum, d) => sum + d.protein, 0)}<span className="text-sm font-normal ml-1">g</span>
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">일일 평균</p>
          <p className="text-2xl font-bold text-indigo-600">
            {Math.round(chartData.reduce((sum, d) => sum + d.protein, 0) / 7)}<span className="text-sm font-normal ml-1">g</span>
          </p>
        </div>
      </div>

      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
        <h4 className="font-bold text-indigo-900 mb-2">Protein Tip!</h4>
        <p className="text-indigo-700 text-sm leading-relaxed">
          근성장을 위해서는 체중(kg)당 약 1.6g~2.2g의 단백질 섭취가 권장됩니다. 
          꾸준한 기록은 더 나은 결과로 이어집니다!
        </p>
      </div>
    </div>
  );
};

export default WeeklyChart;

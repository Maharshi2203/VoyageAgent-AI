import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  total: number;
  spent: number;
  currency: string;
}

const BudgetGauge: React.FC<Props> = ({ total, spent, currency }) => {
  const percentage = Math.min(Math.round((spent / total) * 100), 100);
  const data = [
    { name: 'Allocated', value: spent },
    { name: 'Reserve', value: Math.max(0, total - spent) },
  ];

  // Helper to determine active color based on current computed variables
  const getGlowColor = () => {
    return percentage > 100 ? '#F87171' : 'var(--brand-primary)';
  };

  return (
    <div className="bg-space-card rounded-[2.5rem] p-10 shadow-2xl border border-space-border flex flex-col items-center relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-space-main">
        <div 
          className={`h-full transition-all duration-1000 ${percentage > 100 ? 'bg-red-500' : 'bg-brand-glow'}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <h3 className="text-typo-secondary font-black text-[11px] uppercase tracking-[0.4em] mb-10 text-center">Protocol Efficiency</h3>
      
      <div className="h-56 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={75}
              outerRadius={95}
              paddingAngle={10}
              dataKey="value"
              startAngle={225}
              endAngle={-45}
              stroke="none"
            >
              <Cell fill={getGlowColor()} cornerRadius={12} />
              <Cell fill="var(--space-secondary)" cornerRadius={12} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
          <span className={`text-5xl font-black tracking-tighter leading-none transition-colors duration-300 ${percentage > 100 ? 'text-red-500' : 'text-typo-primary'}`}>
            {percentage}<span className="text-lg align-top mt-2">%</span>
          </span>
          <span className="text-[10px] font-black text-brand-glow/60 uppercase tracking-[0.3em] mt-2">Utilization</span>
        </div>
      </div>

      <div className="mt-10 flex justify-between w-full border-t border-space-border pt-8">
        <div className="flex flex-col">
          <span className="text-typo-muted text-[10px] font-black uppercase tracking-widest">Utilized</span>
          <span className="font-black text-typo-primary text-xl">₹{spent.toLocaleString()}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-typo-muted text-[10px] font-black uppercase tracking-widest">Cap Limit</span>
          <span className="font-black text-typo-primary text-xl">₹{total.toLocaleString()}</span>
        </div>
      </div>

      {spent > total && (
        <div className="mt-8 w-full bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-black uppercase tracking-widest p-4 rounded-2xl flex items-center justify-center gap-3 animate-bounce shadow-lg">
          Warning: Threshold Violation
        </div>
      )}
    </div>
  );
};

export default BudgetGauge;
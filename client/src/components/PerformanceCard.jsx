import React from 'react';
import { Activity, Target, ShieldAlert, Award } from 'lucide-react';

export default function PerformanceCard({ metrics }) {
  const { totalPasses = 0, totalShots = 0, totalFouls = 0, totalGoals = 0, telemetry = [] } = metrics;
  
  const totalEvents = totalPasses + totalShots + totalFouls + totalGoals;
  
  // Calculate relative metrics for dashboard display
  const getPercentage = (val) => {
    if (totalEvents === 0) return 0;
    return Math.round((val / totalEvents) * 100);
  };

  // Calculate dynamic sport efficiency indicator (random mock rating combined with data)
  const calculateEfficiency = () => {
    if (totalEvents === 0) return 0;
    // Goal gives high weight, shots moderate, fouls lower rating
    const baseVal = (totalGoals * 40) + (totalShots * 10) + (totalPasses * 2) - (totalFouls * 5);
    const maxScore = Math.max(30, Math.min(100, Math.round(50 + baseVal)));
    return maxScore;
  };

  const efficiencyScore = calculateEfficiency();

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl space-y-6">
      <div>
        <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-1">
          Análise de Performance
        </h2>
        <p className="text-[11px] text-neutral-500 font-mono">Processamento de telemetria tática avançada</p>
      </div>

      {/* Efficiency circular meter */}
      <div className="flex items-center justify-between bg-neutral-950 p-4 rounded-lg border border-neutral-800/60">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block">Score de Eficiência</span>
          <span className="text-sm font-mono font-bold text-white block">
            {efficiencyScore > 75 ? 'Excelente' : efficiencyScore > 45 ? 'Moderado' : 'Abaixo do esperado'}
          </span>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-neutral-800"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-emerald-400 transition-all duration-500 ease-out"
              strokeDasharray={`${efficiencyScore}, 100`}
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="absolute text-[13px] font-mono font-black text-white">{efficiencyScore}%</span>
        </div>
      </div>

      {/* Visual metric progress indicators */}
      <div className="space-y-4">
        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Distribuição Tática</span>
        
        <div className="space-y-3">
          {/* Passes */}
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Activity size={12} className="text-emerald-400" /> PASSES
              </span>
              <span className="text-white font-bold">{totalPasses} ({getPercentage(totalPasses)}%)</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/40">
              <div 
                className="h-full bg-emerald-400 rounded-full transition-all duration-300" 
                style={{ width: `${getPercentage(totalPasses)}%` }} 
              />
            </div>
          </div>

          {/* Shots */}
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Target size={12} className="text-blue-400" /> FINALIZAÇÕES
              </span>
              <span className="text-white font-bold">{totalShots} ({getPercentage(totalShots)}%)</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/40">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300" 
                style={{ width: `${getPercentage(totalShots)}%` }} 
              />
            </div>
          </div>

          {/* Fouls */}
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <ShieldAlert size={12} className="text-amber-400" /> FALTAS
              </span>
              <span className="text-white font-bold">{totalFouls} ({getPercentage(totalFouls)}%)</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/40">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-300" 
                style={{ width: `${getPercentage(totalFouls)}%` }} 
              />
            </div>
          </div>

          {/* Goals */}
          <div>
            <div className="flex justify-between text-[11px] font-mono mb-1">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <Award size={12} className="text-rose-400" /> GOLS
              </span>
              <span className="text-white font-bold">{totalGoals} ({getPercentage(totalGoals)}%)</span>
            </div>
            <div className="w-full h-1.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/40">
              <div 
                className="h-full bg-rose-500 rounded-full transition-all duration-300" 
                style={{ width: `${getPercentage(totalGoals)}%` }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';

export default function Field2D({ onLogEvent, events = [] }) {
  const [selectedType, setSelectedType] = useState('PASS');

  const handleClickField = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    const y = ((e.clientY - bounds.top) / bounds.height) * 100;

    onLogEvent({
      type: selectedType,
      posX: parseFloat(x.toFixed(2)),
      posY: parseFloat(y.toFixed(2)),
      minute: Math.min(90, Math.max(1, Math.floor(Math.random() * 90) + 1)) // Simulate realistic minute between 1-90
    });
  };

  const getMarkerColor = (type) => {
    switch (type) {
      case 'PASS':
        return 'bg-emerald-500 border-emerald-300 shadow-emerald-500/50';
      case 'SHOT':
        return 'bg-blue-500 border-blue-300 shadow-blue-500/50';
      case 'FOUL':
        return 'bg-amber-500 border-amber-300 shadow-amber-500/50';
      case 'GOAL':
        return 'bg-rose-500 border-rose-300 shadow-rose-500/50 animate-pulse';
      default:
        return 'bg-neutral-500 border-neutral-300';
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col items-center shadow-xl">
      {/* Event Selectors */}
      <div className="flex space-x-2 mb-6 w-full justify-center">
        {['PASS', 'SHOT', 'FOUL', 'GOAL'].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest transition-all duration-200 transform active:scale-95 ${
              selectedType === t 
                ? 'bg-emerald-400 text-black shadow-lg shadow-emerald-400/20 scale-105' 
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Soccer Field Canvas */}
      <div 
        onClick={handleClickField}
        className="relative w-full aspect-[105/68] bg-gradient-to-br from-emerald-950 to-green-900/90 border-2 border-neutral-700/60 rounded-xl cursor-crosshair overflow-hidden group shadow-inner"
      >
        {/* Pitch markings */}
        {/* Outer boundary padding */}
        <div className="absolute inset-4 border border-white/20 pointer-events-none" />
        
        {/* Halfway line */}
        <div className="absolute top-4 bottom-4 left-1/2 w-px bg-white/20 -translate-x-1/2 pointer-events-none" />
        
        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 w-[22%] aspect-square border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        {/* Center spot */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        {/* Penalty Area Left */}
        <div className="absolute top-[20%] left-4 bottom-[20%] w-[15%] border-r border-t border-b border-white/20 pointer-events-none" />
        {/* Goal Area Left */}
        <div className="absolute top-[36%] left-4 bottom-[36%] w-[5%] border-r border-t border-b border-white/20 pointer-events-none" />
        {/* Penalty Spot Left */}
        <div className="absolute top-1/2 left-[12%] w-1.5 h-1.5 bg-white/30 rounded-full -translate-y-1/2 pointer-events-none" />

        {/* Penalty Area Right */}
        <div className="absolute top-[20%] right-4 bottom-[20%] w-[15%] border-l border-t border-b border-white/20 pointer-events-none" />
        {/* Goal Area Right */}
        <div className="absolute top-[36%] right-4 bottom-[36%] w-[5%] border-l border-t border-b border-white/20 pointer-events-none" />
        {/* Penalty Spot Right */}
        <div className="absolute top-1/2 right-[12%] w-1.5 h-1.5 bg-white/30 rounded-full -translate-y-1/2 pointer-events-none" />

        {/* Corner Arcs */}
        <div className="absolute top-4 left-4 w-4 h-4 border-r border-b border-white/20 rounded-br-full pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-4 h-4 border-r border-t border-white/20 rounded-tr-full pointer-events-none" />
        <div className="absolute top-4 right-4 w-4 h-4 border-l border-b border-white/20 rounded-bl-full pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-4 h-4 border-l border-t border-white/20 rounded-tl-full pointer-events-none" />

        {/* Shading / Grass stripes pattern */}
        <div className="absolute inset-0 flex pointer-events-none opacity-10">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} 
            />
          ))}
        </div>

        {/* Dynamic Telemetry Markers */}
        {events.map((ev, index) => (
          <div
            key={index}
            style={{ left: `${ev.posX}%`, top: `${ev.posY}%` }}
            className={`absolute w-3.5 h-3.5 -ml-1.75 -mt-1.75 border-2 rounded-full shadow-md flex items-center justify-center transition-all duration-300 hover:scale-150 z-10 group/marker ${getMarkerColor(ev.type)}`}
          >
            {/* Pulsing glow ring */}
            <span className={`absolute -inset-1 rounded-full border border-white/30 animate-ping opacity-75 pointer-events-none ${ev.type === 'GOAL' ? 'block' : 'hidden'}`} />
            
            {/* Tooltip */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/90 border border-neutral-700 text-white text-[9px] font-mono rounded px-2 py-1 whitespace-nowrap opacity-0 pointer-events-none group-hover/marker:opacity-100 transition-opacity duration-150 z-20 shadow-xl">
              <span className="font-bold">{ev.type}</span> - {ev.minute}' <br/>
              <span>X: {ev.posX}% | Y: {ev.posY}%</span>
            </div>
          </div>
        ))}

        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10 pointer-events-none" />
      </div>
      <span className="text-neutral-500 text-[10px] font-mono mt-3 uppercase tracking-wider text-center">
        Clique no campo para computar a coordenada exata de telemetria
      </span>
    </div>
  );
}

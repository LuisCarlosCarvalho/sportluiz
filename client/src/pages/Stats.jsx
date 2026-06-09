import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, Target, Shield, Award, Users, 
  Trash2, Download, AlertCircle, RefreshCw, BarChart2 
} from 'lucide-react';

export default function Stats() {
  const [sport, setSport] = useState('futsal'); // futsal (court), football (field)
  const [selectedGameId, setSelectedGameId] = useState('');
  const [games, setGames] = useState([]);
  const [squad, setSquad] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedAction, setSelectedAction] = useState('PASS'); // PASS, SHOT, FOUL, GOAL, INTERCEPTION
  const [events, setEvents] = useState([]);
  
  // Stopwatch state
  const [time, setTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Load games and agents from Callups database
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_callups_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGames(parsed.games || []);
        if (parsed.games?.length > 0) {
          setSelectedGameId(parsed.games[0].id);
        }
        setSquad(parsed.agents?.filter(a => a.category === 'Jogador') || []);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Load events for selected game
  useEffect(() => {
    if (selectedGameId) {
      const savedEvents = localStorage.getItem(`sportluiz_events_${selectedGameId}`);
      if (savedEvents) {
        try {
          setEvents(JSON.parse(savedEvents));
        } catch (e) {
          console.error(e);
        }
      } else {
        setEvents([]);
      }
    }
  }, [selectedGameId]);

  // Save events to local storage
  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    if (selectedGameId) {
      localStorage.setItem(`sportluiz_events_${selectedGameId}`, JSON.stringify(newEvents));
    }
  };

  // Stopwatch controls
  const handleStartPause = () => {
    if (isRunning) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    setIsRunning(!isRunning);
  };

  const handleResetTime = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tagging events on court click
  const handleCourtClick = (e) => {
    if (!selectedGameId) {
      alert("Por favor, selecione um jogo primeiro.");
      return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const player = squad.find(p => p.id === selectedPlayerId);

    const newEvent = {
      id: Date.now().toString(),
      type: selectedAction,
      posX: parseFloat(x.toFixed(1)),
      posY: parseFloat(y.toFixed(1)),
      minute: Math.floor(time / 60) || 1,
      seconds: time % 60,
      playerId: selectedPlayerId || 'unknown',
      playerName: player ? player.name : 'Jogador Não Identificado',
      playerNumber: player ? player.number : ''
    };

    saveEvents([...events, newEvent]);
  };

  const handleDeleteEvent = (id) => {
    saveEvents(events.filter(ev => ev.id !== id));
  };

  const handleExportCSV = () => {
    if (events.length === 0) return;
    const headers = ['Minuto', 'Segundo', 'Tipo Acao', 'X (%)', 'Y (%)', 'Jogador', 'Numero'];
    const rows = events.map(e => [
      e.minute,
      e.seconds,
      e.type,
      e.posX,
      e.posY,
      e.playerName,
      e.playerNumber
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sportluiz_stats_game_${selectedGameId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Action configs
  const actionsList = [
    { type: 'PASS', label: 'Passe', color: 'bg-emerald-500 border-emerald-400' },
    { type: 'SHOT', label: 'Finalização', color: 'bg-blue-500 border-blue-400' },
    { type: 'FOUL', label: 'Falta', color: 'bg-amber-500 border-amber-400' },
    { type: 'GOAL', label: 'GOLO', color: 'bg-rose-500 border-rose-400' },
    { type: 'INTERCEPTION', label: 'Desarme', color: 'bg-purple-500 border-purple-400' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase flex items-center gap-2">
            <BarChart2 className="text-emerald-400" /> Registo de Ações & Telemetria
          </h1>
          <p className="text-neutral-500 text-xs mt-1">Mapeamento dinâmico de coordenadas (X, Y) de jogadas e exportação em tempo real</p>
        </div>

        {/* Sport switcher */}
        <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-900">
          <button 
            onClick={() => setSport('futsal')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
              sport === 'futsal' ? 'bg-neutral-900 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Futsal (Quadra)
          </button>
          <button 
            onClick={() => setSport('football')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
              sport === 'football' ? 'bg-neutral-900 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Futebol (Campo)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Match & Action Selection */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Game Selection */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
            <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Selecionar Jogo Ativo</label>
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none transition-all"
            >
              <option value="">Selecione um jogo...</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  vs {g.round || 'Jogo'} ({g.date})
                </option>
              ))}
            </select>
          </div>

          {/* Stopwatch widget */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-center space-y-4">
            <h3 className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Tempo de Jogo</h3>
            <div className="text-4xl font-mono font-bold text-white tracking-widest bg-neutral-950 py-3 rounded-lg border border-neutral-950">
              {formatTime(time)}
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={handleStartPause}
                className={`p-2.5 rounded-lg border text-black transition-all cursor-pointer ${
                  isRunning 
                    ? 'bg-amber-400 border-amber-500 hover:bg-amber-300' 
                    : 'bg-emerald-500 border-emerald-600 hover:bg-emerald-400'
                }`}
              >
                {isRunning ? <Pause size={15} /> : <Play size={15} />}
              </button>
              <button
                onClick={handleResetTime}
                className="p-2.5 rounded-lg border border-neutral-800 bg-neutral-950 hover:bg-neutral-900 text-neutral-400 transition-all cursor-pointer"
              >
                <RotateCcw size={15} />
              </button>
            </div>
          </div>

          {/* Player list Selection */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
            <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-bold">Atleta Executor</label>
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              <button
                onClick={() => setSelectedPlayerId('')}
                className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all ${
                  selectedPlayerId === ''
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                    : 'bg-neutral-950/40 border-neutral-900 text-neutral-400 hover:bg-neutral-950'
                }`}
              >
                👤 Não Identificado / Coletivo
              </button>
              {squad.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => setSelectedPlayerId(pl.id)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs font-mono transition-all flex justify-between items-center ${
                    selectedPlayerId === pl.id
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                      : 'bg-neutral-950/40 border-neutral-900 text-neutral-400 hover:bg-neutral-950'
                  }`}
                >
                  <span>{pl.emoji} {pl.name}</span>
                  <span className="font-bold text-[10px] text-neutral-500">#{pl.number}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Court/Field Canvas mapping */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action tags toggle */}
          <div className="flex bg-neutral-950 p-1.5 rounded-xl border border-neutral-900 gap-1.5">
            {actionsList.map((act) => (
              <button
                key={act.type}
                onClick={() => setSelectedAction(act.type)}
                className={`flex-1 py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                  selectedAction === act.type
                    ? `${act.color} text-black font-extrabold`
                    : 'bg-neutral-900/60 border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>

          {/* Interactive pitch container */}
          <div 
            onClick={handleCourtClick}
            className={`w-full aspect-[5/3] relative rounded-2xl border-2 border-neutral-800 cursor-crosshair overflow-hidden shadow-2xl select-none transition-all duration-300 ${
              sport === 'futsal' 
                ? 'bg-blue-950/40 hover:border-blue-500/20' 
                : 'bg-emerald-950/20 hover:border-emerald-500/20'
            }`}
          >
            {/* Visual court markings */}
            <div className="absolute inset-0 border-[3px] border-white/20 m-3 flex items-center justify-center pointer-events-none">
              {/* Center line */}
              <div className="h-full w-[2px] bg-white/20 absolute left-1/2 -translate-x-1/2"></div>
              {/* Center circle */}
              <div className="w-1/5 aspect-square border-2 border-white/20 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              
              {/* Goal Area Left */}
              <div className={`h-1/2 w-[12%] border-t-2 border-r-2 border-b-2 border-white/20 absolute left-0 top-1/4 ${
                sport === 'futsal' ? 'rounded-r-full' : ''
              }`}></div>
              
              {/* Goal Area Right */}
              <div className={`h-1/2 w-[12%] border-t-2 border-l-2 border-b-2 border-white/20 absolute right-0 top-1/4 ${
                sport === 'futsal' ? 'rounded-l-full' : ''
              }`}></div>
            </div>

            {/* Coordinates tag hint */}
            <div className="absolute top-4 left-4 bg-black/60 border border-neutral-800 text-[9px] font-mono px-2.5 py-1 rounded text-neutral-400 pointer-events-none">
              Ação Ativa: <span className="text-white font-bold">{selectedAction}</span>
            </div>

            {/* Plotted Events Markers */}
            {events.map((ev) => (
              <div 
                key={ev.id}
                style={{ left: `${ev.posX}%`, top: `${ev.posY}%` }}
                className={`absolute w-3.5 h-3.5 -ml-1.5 -mt-1.5 rounded-full flex items-center justify-center text-[7px] font-bold text-white border border-white/80 shadow-md group transition-all duration-300 ${
                  ev.type === 'GOAL' ? 'bg-rose-500 scale-125 z-10 animate-bounce' :
                  ev.type === 'PASS' ? 'bg-emerald-500' :
                  ev.type === 'SHOT' ? 'bg-blue-500' :
                  ev.type === 'FOUL' ? 'bg-amber-500' : 'bg-purple-500'
                }`}
                title={`${ev.type} - #${ev.playerNumber} ${ev.playerName} (${ev.minute}')`}
              >
                {ev.playerNumber || ev.type.slice(0, 1)}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Event Stream logs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between h-[450px]">
            <div className="space-y-4 flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Feed de Eventos</h3>
                <button 
                  onClick={handleExportCSV}
                  disabled={events.length === 0}
                  className="text-neutral-500 hover:text-emerald-400 disabled:text-neutral-800 transition-colors p-1"
                  title="Exportar CSV"
                >
                  <Download size={15} />
                </button>
              </div>

              {/* Event Logs list */}
              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-[10px] font-mono text-neutral-600 flex flex-col items-center">
                    <AlertCircle size={20} className="mb-1.5 text-neutral-700" />
                    Clique na quadra para<br />registrar a primeira ação.
                  </div>
                ) : (
                  events.slice().reverse().map((ev) => (
                    <div key={ev.id} className="flex justify-between items-center bg-neutral-950 p-2.5 rounded border border-neutral-850 text-[10px] font-mono">
                      <div>
                        <span className={`font-bold ${
                          ev.type === 'GOAL' ? 'text-rose-400' :
                          ev.type === 'PASS' ? 'text-emerald-400' :
                          ev.type === 'SHOT' ? 'text-blue-400' :
                          ev.type === 'FOUL' ? 'text-amber-400' : 'text-purple-400'
                        }`}>
                          [{ev.type}]
                        </span>
                        <span className="text-white font-bold ml-1.5">{ev.playerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-500">{ev.minute}'</span>
                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="text-neutral-700 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Short Stats Summary */}
            <div className="border-t border-neutral-800/60 pt-4 mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono text-neutral-400">
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-850">
                <div className="font-bold text-emerald-400">{events.filter(e => e.type === 'PASS').length}</div>
                <div className="text-[8px] text-neutral-600 uppercase">Passes</div>
              </div>
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-850">
                <div className="font-bold text-blue-400">{events.filter(e => e.type === 'SHOT').length}</div>
                <div className="text-[8px] text-neutral-600 uppercase">Chutes</div>
              </div>
              <div className="bg-neutral-950 p-1.5 rounded border border-neutral-850">
                <div className="font-bold text-rose-400">{events.filter(e => e.type === 'GOAL').length}</div>
                <div className="text-[8px] text-neutral-600 uppercase">Golos</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

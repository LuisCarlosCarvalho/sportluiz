import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, AlertTriangle, Users, Award, 
  Volume2, Settings, Plus, Minus, Trophy, PlusSquare 
} from 'lucide-react';

export default function Scoreboard() {
  const [teamName, setTeamName] = useState('SPORTLUIZ');
  const [opponentName, setOpponentName] = useState('ADVERSÁRIO');
  
  // Game states
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [homeFouls, setHomeFouls] = useState(0);
  const [awayFouls, setAwayFouls] = useState(0);
  const [period, setPeriod] = useState(1); // 1st half, 2nd half, OT
  
  // Timer states (futsal defaults: 20 minutes countdown)
  const [time, setTime] = useState(20 * 60); // 1200 seconds
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Timeouts and cards
  const [homeTimeouts, setHomeTimeouts] = useState(1);
  const [awayTimeouts, setAwayTimeouts] = useState(1);

  // Goal loggers and roster
  const [squad, setSquad] = useState([]);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [scoringTeam, setScoringTeam] = useState('home');
  const [timeline, setTimeline] = useState([]);

  // Load roster
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_callups_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSquad(parsed.agents?.filter(a => a.category === 'Jogador') || []);
        if (parsed.teamName) setTeamName(parsed.teamName.split(' ')[0].toUpperCase());
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Timer countdown hook
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prev => {
          if (prev <= 1) {
            triggerBuzzerSound();
            setIsRunning(false);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Premium Web Audio API Buzzer synth
  const triggerBuzzerSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); // low buzz
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      console.warn("Buzzer audio could not play due to browser user-gesture restrictions.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGoal = (team) => {
    setScoringTeam(team);
    setShowGoalModal(true);
    triggerBuzzerSound();
  };

  const logGoal = (playerId, playerName) => {
    const elapsed = 20 * 60 - time;
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    
    if (scoringTeam === 'home') {
      setHomeScore(prev => prev + 1);
      setTimeline(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          type: 'GOLO', 
          team: teamName, 
          detail: playerName ? `${playerName} (Golo)` : 'Golo', 
          time: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` 
        }
      ]);
    } else {
      setAwayScore(prev => prev + 1);
      setTimeline(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          type: 'GOLO', 
          team: opponentName, 
          detail: 'Golo Adversário', 
          time: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}` 
        }
      ]);
    }
    setShowGoalModal(false);
  };

  const handleFoul = (team, direction) => {
    if (team === 'home') {
      const newVal = Math.max(0, homeFouls + direction);
      setHomeFouls(newVal);
      if (newVal === 5) alert("⚠️ ATENÇÃO: Limite de Faltas Acumuladas atingido (5 faltas)!");
    } else {
      const newVal = Math.max(0, awayFouls + direction);
      setAwayFouls(newVal);
      if (newVal === 5) alert("⚠️ ATENÇÃO: Limite de Faltas Acumuladas do adversário atingido!");
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-neutral-900 pb-5 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase flex items-center gap-2">
            <Volume2 className="text-emerald-400" /> Placar Eletrônico de Futsal
          </h1>
          <p className="text-neutral-500 text-xs mt-1">Painel digital interativo com controle de faltas e cronômetro retroativo</p>
        </div>
        <button 
          onClick={triggerBuzzerSound}
          className="p-2 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 rounded-lg text-neutral-300 transition-all cursor-pointer"
          title="Testar Sirene/Buzzer"
        >
          🚨
        </button>
      </div>

      {/* SCOREBOARD CORE DISPLAY */}
      <div className="bg-neutral-950 border border-neutral-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        {/* Glow Top Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>

        {/* Top bar: Period and Team Names */}
        <div className="grid grid-cols-3 items-center text-center">
          {/* Home Team */}
          <div className="text-left">
            <input 
              type="text" 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value.toUpperCase())}
              className="bg-transparent border-b border-transparent hover:border-neutral-800 text-lg md:text-2xl font-black font-mono tracking-wide text-white focus:outline-none focus:border-emerald-500/50 uppercase"
            />
            <span className="text-[10px] font-mono text-neutral-500 block uppercase mt-1">CASA</span>
          </div>

          {/* Period */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest">PERÍODO</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setPeriod(p => Math.max(1, p - 1))} className="text-neutral-600 hover:text-white text-xs font-bold font-mono">«</button>
              <span className="text-xl font-black font-mono text-amber-500">{period}</span>
              <button onClick={() => setPeriod(p => p + 1)} className="text-neutral-600 hover:text-white text-xs font-bold font-mono">»</button>
            </div>
          </div>

          {/* Away Team */}
          <div className="text-right">
            <input 
              type="text" 
              value={opponentName} 
              onChange={(e) => setOpponentName(e.target.value.toUpperCase())}
              className="bg-transparent border-b border-transparent hover:border-neutral-800 text-lg md:text-2xl font-black font-mono tracking-wide text-white focus:outline-none focus:border-emerald-500/50 uppercase text-right"
            />
            <span className="text-[10px] font-mono text-neutral-500 block uppercase mt-1">VISITANTE</span>
          </div>
        </div>

        {/* Center Row: Scores and Digital Timer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Home Score */}
          <div className="flex flex-col items-center space-y-3">
            <div className="text-7xl md:text-8xl font-black font-mono text-rose-500 tracking-wider bg-black/40 border border-neutral-900 px-8 py-4 rounded-2xl w-full text-center shadow-inner select-none">
              {homeScore}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleGoal('home')} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer">
                + GOLO
              </button>
              <button onClick={() => setHomeScore(s => Math.max(0, s - 1))} className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer">
                -
              </button>
            </div>
          </div>

          {/* Digital Clock */}
          <div className="flex flex-col items-center space-y-4">
            {/* Clock Numbers */}
            <div className="text-5xl md:text-6xl font-mono font-black text-amber-400 tracking-widest bg-neutral-900/60 border border-neutral-850 px-6 py-4 rounded-2xl text-center shadow-inner relative w-full">
              {formatTime(time)}
              {/* Flashing Dots indicator */}
              <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-red-500'}`}></div>
            </div>
            
            {/* Clock Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setIsRunning(!isRunning)} 
                className={`flex items-center gap-1 px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  isRunning 
                    ? 'bg-amber-400 text-black hover:bg-amber-300' 
                    : 'bg-emerald-500 text-black hover:bg-emerald-400'
                }`}
              >
                {isRunning ? <Pause size={13} /> : <Play size={13} />} {isRunning ? 'PAUSAR' : 'INICIAR'}
              </button>
              
              <button 
                onClick={() => { setTime(20 * 60); setIsRunning(false); }} 
                className="flex items-center gap-1 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border border-neutral-850 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
              >
                <RotateCcw size={13} /> 20:00
              </button>
            </div>
          </div>

          {/* Away Score */}
          <div className="flex flex-col items-center space-y-3">
            <div className="text-7xl md:text-8xl font-black font-mono text-rose-500 tracking-wider bg-black/40 border border-neutral-900 px-8 py-4 rounded-2xl w-full text-center shadow-inner select-none">
              {awayScore}
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleGoal('away')} className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer">
                + GOLO
              </button>
              <button onClick={() => setAwayScore(s => Math.max(0, s - 1))} className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer">
                -
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Panel: Accumulated Fouls, Timeouts, and cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t border-neutral-900/60 text-center">
          
          {/* Home Fouls */}
          <div className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl flex flex-col items-center space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Faltas Casa</span>
            <div className={`text-3xl font-black font-mono ${homeFouls >= 5 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
              {homeFouls}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => handleFoul('home', 1)} className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 p-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer">+</button>
              <button onClick={() => handleFoul('home', -1)} className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 p-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer">-</button>
            </div>
          </div>

          {/* Home Timeouts */}
          <div className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl flex flex-col items-center space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Timeout Casa</span>
            <div className="text-xl font-black font-mono text-white">{homeTimeouts}</div>
            <div className="flex gap-1.5">
              <button onClick={() => setHomeTimeouts(t => Math.max(0, t - 1))} className="bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer">Pedir</button>
              <button onClick={() => setHomeTimeouts(1)} className="bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 px-2 py-1 rounded text-xs font-mono font-bold cursor-pointer">Reset</button>
            </div>
          </div>

          {/* Away Timeouts */}
          <div className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl flex flex-col items-center space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Timeout Visitante</span>
            <div className="text-xl font-black font-mono text-white">{awayTimeouts}</div>
            <div className="flex gap-1.5">
              <button onClick={() => setAwayTimeouts(t => Math.max(0, t - 1))} className="bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer">Pedir</button>
              <button onClick={() => setAwayTimeouts(1)} className="bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 px-2 py-1 rounded text-xs font-mono font-bold cursor-pointer">Reset</button>
            </div>
          </div>

          {/* Away Fouls */}
          <div className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl flex flex-col items-center space-y-2">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider font-bold">Faltas Vis.</span>
            <div className={`text-3xl font-black font-mono ${awayFouls >= 5 ? 'text-red-500 animate-pulse' : 'text-amber-500'}`}>
              {awayFouls}
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => handleFoul('away', 1)} className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 p-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer">+</button>
              <button onClick={() => handleFoul('away', -1)} className="bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 p-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer">-</button>
            </div>
          </div>

        </div>

      </div>

      {/* MATCH EVENTS LOG / TIMELINE */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Linha do Tempo da Partida</h2>
        
        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
          {timeline.length === 0 ? (
            <p className="text-[11px] text-neutral-600 font-mono py-4 text-center">Nenhum evento registrado.</p>
          ) : (
            timeline.slice().reverse().map((ev) => (
              <div key={ev.id} className="flex justify-between items-center bg-neutral-950 px-4 py-2.5 rounded border border-neutral-850 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-bold">{ev.time}</span>
                  <span className="font-bold text-rose-400">[{ev.type}]</span>
                  <span className="text-white">{ev.team}: {ev.detail}</span>
                </div>
                <button
                  onClick={() => setTimeline(prev => prev.filter(item => item.id !== ev.id))}
                  className="text-neutral-700 hover:text-red-400"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CHOOSE GOALSCORER MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider text-center">GOLO ASSINALADO! ⚽</h3>
            <p className="text-neutral-500 text-xs text-center">Quem marcou o gol para o time?</p>
            
            <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
              <button
                onClick={() => logGoal('', '')}
                className="w-full bg-neutral-950 hover:bg-neutral-850 p-2.5 rounded-lg border border-neutral-850 text-xs font-mono font-bold text-white text-left"
              >
                👤 Jogada Coletiva / Autogol
              </button>
              {scoringTeam === 'home' && squad.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => logGoal(pl.id, pl.name)}
                  className="w-full bg-neutral-950 hover:bg-neutral-850 p-2.5 rounded-lg border border-neutral-850 text-xs font-mono text-white text-left flex justify-between"
                >
                  <span>{pl.emoji} {pl.name}</span>
                  <span className="text-neutral-500 font-bold">#{pl.number}</span>
                </button>
              ))}
              {scoringTeam === 'away' && (
                <button
                  onClick={() => logGoal('away_player', 'Jogador Adversário')}
                  className="w-full bg-neutral-950 hover:bg-neutral-850 p-2.5 rounded-lg border border-neutral-850 text-xs font-mono text-white text-left"
                >
                  👤 Atleta do Visitante
                </button>
              )}
            </div>

            <button
              onClick={() => setShowGoalModal(false)}
              className="w-full bg-neutral-950 hover:bg-neutral-800 text-neutral-400 text-xs font-mono font-bold py-2 rounded-lg border border-neutral-850 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

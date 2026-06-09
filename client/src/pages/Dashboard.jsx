import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, RefreshCw, Trophy, Users, Calendar, AlertCircle } from 'lucide-react';
import Field2D from '../components/Field2D';
import PerformanceCard from '../components/PerformanceCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [newOpponent, setNewOpponent] = useState('');
  const [metrics, setMetrics] = useState({ totalPasses: 0, totalShots: 0, totalFouls: 0, totalGoals: 0, telemetry: [] });
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const currentTier = user?.subscriptionTier || 'FREE';

  useEffect(() => {
    // If not logged in, redirect to login page (which is handled in App.jsx routing)
    if (!token) {
      navigate('/login');
      return;
    }
    fetchMatches();
  }, [token]);

  // Read Stripe callback params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout_success') === 'true') {
      setSuccessMessage('Upgrade de plano realizado com sucesso! Suas permissões foram atualizadas.');
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/matches', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Não foi possível carregar as partidas.');
      const data = await response.json();
      setMatches(data);
      if (data.length > 0 && !currentMatch) {
        selectMatch(data[0]);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectMatch = async (match) => {
    setCurrentMatch(match);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/matches/${match.id}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar telemetria da partida.');
      const data = await response.json();
      setMetrics({
        totalPasses: data.totalPasses,
        totalShots: data.totalShots,
        totalFouls: data.totalFouls,
        totalGoals: data.totalGoals,
        telemetry: data.telemetry
      });
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    if (!newOpponent.trim()) return;

    setErrorMessage(null);
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ opponent: newOpponent })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao criar partida.');
      
      setNewOpponent('');
      setMatches((prev) => [data, ...prev]);
      selectMatch(data);
    } catch (err) {
      setErrorMessage(err.message);
    }
  };

  const handleRegisterEvent = async (eventData) => {
    if (!currentMatch) {
      setErrorMessage('Crie ou selecione uma partida primeiro para registrar eventos.');
      return;
    }
    setErrorMessage(null);

    // Save previous metrics for rollback
    const previousMetrics = { ...metrics };

    // Optimistic UI update: instantaneous local feedback (<100ms)
    setMetrics((prev) => ({
      ...prev,
      totalPasses: eventData.type === 'PASS' ? prev.totalPasses + 1 : prev.totalPasses,
      totalShots: eventData.type === 'SHOT' ? prev.totalShots + 1 : prev.totalShots,
      totalFouls: eventData.type === 'FOUL' ? prev.totalFouls + 1 : prev.totalFouls,
      totalGoals: eventData.type === 'GOAL' ? prev.totalGoals + 1 : prev.totalGoals,
      telemetry: [...prev.telemetry, eventData],
    }));

    // Async synchronization with Postgres server
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...eventData, matchId: currentMatch.id })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro na comunicação com o servidor.');
      }
      
      // Update with correct ID from database
      setMetrics((prev) => {
        const updated = [...prev.telemetry];
        // Replace last element with database response
        updated[updated.length - 1] = data;
        return { ...prev, telemetry: updated };
      });
    } catch (err) {
      setErrorMessage(err.message);
      // Rollback optimistic update
      setMetrics(previousMetrics);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 p-6 md:p-8 font-sans selection:bg-emerald-400 selection:text-black">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-xl font-black font-mono tracking-tighter text-white">
            SPORTLUIZ // PERFORMANCE LAB
          </h1>
          <p className="text-neutral-500 text-xs mt-1">Coleta Avançada de Eventos Táticos em Tempo Real</p>
        </div>
        
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-neutral-900 border border-neutral-800 text-neutral-400 px-3 py-1.5 rounded-lg">
              USER: <span className="text-white">{user?.email}</span>
            </span>
            <button
              onClick={() => navigate('/plans')}
              className={`text-[10px] font-mono font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider transition-all ${
                currentTier === 'FREE' 
                  ? 'bg-neutral-900 border-neutral-800 text-emerald-400 hover:border-emerald-500/50 hover:bg-neutral-800'
                  : 'bg-emerald-950 border-emerald-900 text-emerald-300 font-extrabold hover:bg-emerald-900'
              }`}
            >
              PLANO: {currentTier}
            </button>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="p-2 border border-neutral-800 bg-neutral-900/60 hover:bg-red-950/40 hover:text-red-400 hover:border-red-950 rounded-lg transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Success banner */}
      {successMessage && (
        <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-xs font-mono p-4 rounded-lg mb-6 flex items-start gap-2">
          <span>✔️</span> <div>{successMessage}</div>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-red-950/40 border border-red-900 text-red-400 text-xs font-mono p-4 rounded-lg mb-6 flex items-start gap-2 animate-pulse-slow">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <div>{errorMessage}</div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Matches lists */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Create Match Form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Trophy size={14} className="text-emerald-400" /> Nova Partida
            </h2>
            <form onSubmit={handleCreateMatch} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Nome do Oponente..."
                  value={newOpponent}
                  onChange={(e) => setNewOpponent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-neutral-600 focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
              >
                <Plus size={14} /> CRIAR JOGO
              </button>
            </form>
          </div>

          {/* Game Selection List */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Users size={14} className="text-emerald-400" /> Partidas Recentes
              </h2>
              <button onClick={fetchMatches} title="Recarregar" className="text-neutral-500 hover:text-white transition-colors">
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {matches.length === 0 ? (
                <p className="text-[11px] text-neutral-600 font-mono py-4 text-center">Nenhuma partida registrada.</p>
              ) : (
                matches.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => selectMatch(m)}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-mono flex flex-col gap-1 transition-all ${
                      currentMatch?.id === m.id
                        ? 'bg-neutral-950 border-emerald-500/50 text-white shadow-md'
                        : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-400 hover:bg-neutral-950 hover:text-neutral-200'
                    }`}
                  >
                    <span className="font-bold uppercase tracking-wider text-white truncate">VS {m.opponent}</span>
                    <span className="text-[10px] text-neutral-600 flex items-center gap-1">
                      <Calendar size={10} /> {new Date(m.date).toLocaleDateString('pt-BR')}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Center Canvas */}
        <div className="lg:col-span-2">
          {currentMatch ? (
            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-850 px-5 py-3 rounded-xl flex justify-between items-center">
                <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  Partida Ativa: <span className="text-white text-sm">vs {currentMatch.opponent}</span>
                </span>
                <span className="text-[10px] font-mono text-neutral-500">
                  ID: {currentMatch.id.slice(0, 8)}...
                </span>
              </div>
              <Field2D onLogEvent={handleRegisterEvent} events={metrics.telemetry} />
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center h-full flex flex-col justify-center items-center shadow-xl">
              <Trophy size={48} className="text-neutral-700 mb-4 animate-pulse-slow" />
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider mb-2">Nenhuma Partida Selecionada</h3>
              <p className="text-neutral-500 text-xs max-w-sm">
                Utilize o painel lateral para criar um novo confronto ou selecionar uma partida existente para iniciar o monitoramento.
              </p>
            </div>
          )}
        </div>

        {/* Right column: Analytics and stream */}
        <div className="lg:col-span-1 space-y-6">
          
          <PerformanceCard metrics={metrics} />

          {/* Telemetry Stream */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-3">
              Live Telemetry Stream
            </h2>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {metrics.telemetry.length === 0 ? (
                <div className="text-center py-6 text-[11px] font-mono text-neutral-600">
                  Aguardando eventos...
                </div>
              ) : (
                metrics.telemetry.slice().reverse().map((ev, index) => (
                  <div key={index} className="flex justify-between items-center text-[11px] font-mono py-1.5 border-b border-neutral-800/40">
                    <span className={
                      ev.type === 'GOAL' ? 'text-rose-400 font-bold' : 
                      ev.type === 'PASS' ? 'text-emerald-400' :
                      ev.type === 'SHOT' ? 'text-blue-400' : 'text-amber-400'
                    }>
                      [{ev.type}]
                    </span>
                    <span className="text-neutral-500">X: {ev.posX}% | Y: {ev.posY}%</span>
                    <span className="text-neutral-400 text-[10px]">{ev.minute}'</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

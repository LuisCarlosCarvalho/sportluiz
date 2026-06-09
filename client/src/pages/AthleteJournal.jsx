import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Settings, Trophy, Award, Calendar, 
  Activity, BarChart2, Download, Printer, User, Info, 
  Trash2, Plus, FileText, CheckCircle2 
} from 'lucide-react';

export default function AthleteJournal() {
  const [activeTab, setActiveTab] = useState('estatisticas');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  
  // Shared state with Callups.jsx and Stats.jsx
  const [data, setData] = useState({
    teamName: '',
    agents: [
      { id: '1', name: 'Luís Carvalho', number: '10', category: 'Jogador', position: 'Ala', emoji: '🏃' },
      { id: '2', name: 'Rodrigo Silva', number: '1', category: 'Jogador', position: 'Goleiro', emoji: '🧤' },
      { id: '3', name: 'Carlos Sousa', number: '5', category: 'Jogador', position: 'Fixo', emoji: '🏃' },
      { id: '4', name: 'Felipe Costa', number: '9', category: 'Jogador', position: 'Pivô', emoji: '🏃' }
    ],
    competitions: ['Liga Nacional 2026', 'Taça de Portugal 2026'],
    opponents: [
      { id: '1', name: 'Benfica Futsal', emoji: '🦅' },
      { id: '2', name: 'Sporting CP', emoji: '🦁' }
    ],
    games: [
      { id: '1', opponentId: '1', competition: 'Liga Nacional 2026', date: '2026-06-15', pavilion: 'Arena Principal', homeAway: 'Casa', round: '1ª Jornada' }
    ],
    categories: [
      {
        id: 'cat-1',
        name: 'Ataque',
        actions: [
          { id: 'act-1', name: 'Passe Certo', type: 'PASS' },
          { id: 'act-2', name: 'Passe Errado', type: 'PASS_FAIL' },
          { id: 'act-3', name: 'Remate Enquadrado', type: 'SHOT' },
          { id: 'act-4', name: 'Remate para Fora', type: 'SHOT_FAIL' },
          { id: 'act-5', name: 'Golo', type: 'GOAL' }
        ]
      },
      {
        id: 'cat-2',
        name: 'Defesa',
        actions: [
          { id: 'act-6', name: 'Desarme', type: 'INTERCEPTION' },
          { id: 'act-7', name: 'Falta Cometida', type: 'FOUL' }
        ]
      }
    ]
  });

  // Filters state for Statistics
  const [filterGameId, setFilterGameId] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [filterActionId, setFilterActionId] = useState('all');

  // Load database
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_callups_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed);
        const players = parsed.agents?.filter(a => a.category === 'Jogador') || [];
        if (players.length > 0) {
          setSelectedPlayerId(players[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveChange = (newData) => {
    setData(newData);
    localStorage.setItem('sportluiz_callups_db', JSON.stringify(newData));
  };

  const selectedPlayer = data.agents.find(p => p.id === selectedPlayerId);

  // Retrieve all events for selected athlete
  const getAllPlayerEvents = () => {
    if (!selectedPlayerId) return [];
    let playerEvents = [];

    // Search all game telemetry keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('sportluiz_events_')) {
        const gameId = key.replace('sportluiz_events_', '');
        try {
          const gameEvents = JSON.parse(localStorage.getItem(key)) || [];
          gameEvents.forEach(ev => {
            if (ev.playerId === selectedPlayerId) {
              playerEvents.push({ ...ev, gameId });
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    return playerEvents;
  };

  const allPlayerEvents = getAllPlayerEvents();

  // Apply filters to events
  const getFilteredEvents = () => {
    return allPlayerEvents.filter(ev => {
      // Game filter
      if (filterGameId !== 'all' && ev.gameId !== filterGameId) return false;
      
      // Period/Half filter (1st Half is minutes 1-20, 2nd Half is 21-40)
      if (filterPeriod !== 'all') {
        if (filterPeriod === '1part' && ev.minute > 20) return false;
        if (filterPeriod === '2part' && (ev.minute <= 20 || ev.minute > 40)) return false;
        if (filterPeriod === 'prol' && ev.minute <= 40) return false;
      }

      // Category filter
      if (filterCategoryId !== 'all') {
        const category = data.categories.find(c => c.id === filterCategoryId);
        const hasAction = category?.actions.some(a => a.name === ev.actionName);
        if (!hasAction) return false;
      }

      // Action filter
      if (filterActionId !== 'all') {
        // Find action name
        let targetActionName = '';
        data.categories.forEach(c => {
          const act = c.actions.find(a => a.id === filterActionId);
          if (act) targetActionName = act.name;
        });
        if (ev.actionName !== targetActionName) return false;
      }

      return true;
    });
  };

  const filteredEvents = getFilteredEvents();

  // Find actions for selected category filter
  const selectedCategory = data.categories.find(c => c.id === filterCategoryId);
  const actionsForSelectedCategory = selectedCategory ? selectedCategory.actions : [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* Selector and Instruction Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase flex items-center gap-2">
            <BookOpen className="text-emerald-400" /> Diário do Atleta
          </h1>
          <p className="text-neutral-500 text-xs mt-1">Selecione o jogador no dropdown à direita para analisar o seu histórico e notas de rendimento</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 font-bold">Selecionar Atleta:</span>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          >
            {data.agents.filter(a => a.category === 'Jogador').map((p) => (
              <option key={p.id} value={p.id}>{p.emoji} #{p.number} - {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* CORE CONTAINER CARD (MATCHING THE PRINT LAYOUT) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
        
        {/* Top Header Row: Name, Jersey Number and Athlete ID */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-950 pb-5">
          <div className="flex items-center gap-3 flex-1 w-full">
            <span className="w-12 h-12 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xl flex-shrink-0">
              {selectedPlayer?.emoji || '👤'}
            </span>
            <div className="flex-grow">
              <input 
                type="text" 
                placeholder="Nome do atleta"
                disabled
                value={selectedPlayer ? selectedPlayer.name : ''}
                className="bg-transparent text-lg font-bold font-mono text-white w-full border-none focus:outline-none"
              />
            </div>
          </div>

          {/* Number and ID inputs */}
          <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-end">
            <div className="space-y-1 text-center">
              <label className="text-[10px] font-mono text-neutral-500 block">Nº</label>
              <div className="w-14 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white font-bold select-none h-9 flex items-center justify-center">
                {selectedPlayer ? selectedPlayer.number : '-'}
              </div>
            </div>
            <div className="space-y-1 text-center">
              <label className="text-[10px] font-mono text-neutral-500 block">ID Atleta</label>
              <div className="w-24 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-[10px] font-mono text-neutral-400 select-none h-9 flex items-center justify-center truncate">
                {selectedPlayer ? selectedPlayer.id.slice(0, 8) : '-'}
              </div>
            </div>
          </div>
        </div>

        {/* TABS BAR (FROM THE PRINT) */}
        <div className="flex border-b border-neutral-800 overflow-x-auto custom-scrollbar">
          {[
            { id: 'configuracao', label: 'Configuração', icon: Settings },
            { id: 'competicoes', label: 'Competições', icon: Trophy },
            { id: 'adversarios', label: 'Adversários', icon: Award },
            { id: 'jogos', label: 'Jogos', icon: Calendar },
            { id: 'analise', label: 'Análise', icon: Activity },
            { id: 'estatisticas', label: 'Estatísticas', icon: BarChart2 }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-5 text-xs font-mono font-bold border-b-2 transition-all flex-shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isActive 
                    ? 'border-emerald-500 text-emerald-400 font-black' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- ESTATÍSTICAS TAB (MATCHING THE PRINT FILTER AND GRID!) --- */}
        {activeTab === 'estatisticas' && (
          <div className="space-y-6">
            
            {/* Filters Row: Jogo, Parte, Categoria, Ação + Baixar PDF */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end text-left">
              
              {/* Jogo Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Jogo</label>
                <select
                  value={filterGameId}
                  onChange={(e) => setFilterGameId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todos os jogos</option>
                  {data.games.map(g => (
                    <option key={g.id} value={g.id}>vs {data.opponents.find(o => o.id === g.opponentId)?.name} ({g.date})</option>
                  ))}
                </select>
              </div>

              {/* Parte Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Parte</label>
                <select
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todas as partes</option>
                  <option value="1part">1ª Parte</option>
                  <option value="2part">2ª Parte</option>
                  <option value="prol">Prolongamento</option>
                </select>
              </div>

              {/* Categoria Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Categoria</label>
                <select
                  value={filterCategoryId}
                  onChange={(e) => {
                    setFilterCategoryId(e.target.value);
                    setFilterActionId('all'); // reset action
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">Todas as categorias</option>
                  {data.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Ação Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Ação</label>
                <select
                  value={filterActionId}
                  onChange={(e) => setFilterActionId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">
                    {filterCategoryId === 'all' ? 'Seleciona categoria primeiro' : 'Todas as ações'}
                  </option>
                  {actionsForSelectedCategory.map(act => (
                    <option key={act.id} value={act.id}>{act.name}</option>
                  ))}
                </select>
              </div>

              {/* Baixar PDF Button */}
              <button 
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-2.5 text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <Printer size={14} /> Baixar PDF
              </button>
            </div>

            {/* Total Counter Display (FROM THE PRINT) */}
            <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 text-center flex flex-col items-center justify-center select-none shadow-inner">
              <div className="text-4xl font-mono font-black text-amber-500">
                {filteredEvents.length}
              </div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold tracking-wider mt-1">
                Total
              </span>
            </div>

            {/* Grid display: Sem dados. or lists of matched events */}
            <div className="bg-neutral-950/40 border border-neutral-900/60 rounded-xl p-6 min-h-[120px] flex flex-col justify-center">
              {filteredEvents.length === 0 ? (
                <p className="text-center text-xs font-mono text-neutral-500">
                  Sem dados.
                </p>
              ) : (
                <div className="space-y-2 text-left">
                  {filteredEvents.map(ev => {
                    const game = data.games.find(g => g.id === ev.gameId);
                    const opponent = data.opponents.find(o => o.id === game?.opponentId);
                    return (
                      <div key={ev.id} className="bg-neutral-950 border border-neutral-850 px-4 py-3 rounded-lg text-xs font-mono flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="font-bold text-white uppercase">
                            vs {opponent?.name} ({game?.date})
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            Ação: <span className="text-emerald-400 font-bold">{ev.actionName}</span> • Pos: (X: {ev.posX}%, Y: {ev.posY}%)
                          </div>
                        </div>
                        <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded text-neutral-400 font-bold">
                          {ev.minute}'
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- CONFIGURAÇÃO TAB --- */}
        {activeTab === 'configuracao' && (
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left space-y-4">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Informação do Atleta</h2>
            
            {selectedPlayer ? (
              <div className="space-y-4 max-w-md">
                <div>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase block">Função / Posição Tática</span>
                  <div className="text-white text-xs font-mono font-bold mt-1 bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    {selectedPlayer.position}
                  </div>
                </div>

                <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-850 text-xs font-mono text-neutral-400 space-y-2">
                  <div className="flex justify-between"><span>Categoria de Agente:</span> <span className="text-white">{selectedPlayer.category}</span></div>
                  <div className="flex justify-between"><span>Ícone Padrão:</span> <span className="text-emerald-400 font-bold">{selectedPlayer.emoji}</span></div>
                </div>
              </div>
            ) : (
              <span className="text-xs font-mono text-neutral-500">Nenhum jogador selecionado.</span>
            )}
          </div>
        )}

        {/* --- COMPETIÇÕES TAB --- */}
        {activeTab === 'competicoes' && (
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Competições da Temporada</h2>
            <div className="space-y-2">
              {data.competitions.map((comp) => (
                <div key={comp} className="bg-neutral-900 px-4 py-2.5 rounded border border-neutral-800 text-xs font-mono">
                  🏆 {comp}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ADVERSÁRIOS TAB --- */}
        {activeTab === 'adversarios' && (
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Rivais do Clube</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.opponents.map((o) => (
                <div key={o.id} className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 flex items-center gap-2">
                  <span>{o.emoji}</span> <span className="font-mono text-xs text-white font-bold">{o.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- JOGOS TAB --- */}
        {activeTab === 'jogos' && (
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Calendário de Jogos</h2>
            <div className="space-y-2">
              {data.games.map((g) => {
                const opp = data.opponents.find(o => o.id === g.opponentId);
                return (
                  <div key={g.id} className="bg-neutral-900 p-3 rounded border border-neutral-800 text-xs font-mono flex justify-between">
                    <div>
                      <span className="font-bold text-white">vs {opp?.emoji} {opp?.name}</span>
                      <span className="text-[10px] text-neutral-500 block mt-0.5">{g.competition} • {g.pavilion}</span>
                    </div>
                    <span className="text-neutral-400 self-center">{g.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- ANÁLISE TAB --- */}
        {activeTab === 'analise' && (
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Log Analítico do Atleta</h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
              {allPlayerEvents.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-xs font-mono">Sem dados registrados.</div>
              ) : (
                allPlayerEvents.map((ev) => {
                  const game = data.games.find(g => g.id === ev.gameId);
                  const opponent = data.opponents.find(o => o.id === game?.opponentId);
                  return (
                    <div key={ev.id} className="bg-neutral-900 p-3 rounded border border-neutral-800 text-xs font-mono flex justify-between">
                      <div>
                        <span className="text-emerald-400 font-bold">[{ev.actionName}]</span>
                        <span className="text-neutral-500 ml-1.5">vs {opponent?.name} ({game?.date})</span>
                      </div>
                      <span className="text-neutral-400">{ev.minute}'</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, Settings, Users, Trophy, Award, Calendar, 
  FileText, Play, CheckCircle2, Trash2, Plus, Download, 
  Upload, Image, Pause, RotateCcw, AlertCircle, Info, Printer
} from 'lucide-react';

export default function Stats() {
  const [activeTab, setActiveTab] = useState('configuracao');
  const [sport, setSport] = useState('futsal'); // futsal (court), football (field)
  
  // Shared state with Callups.jsx using same localStorage key
  const [data, setData] = useState({
    teamName: '',
    teamLogo: '',
    pavilions: [],
    agents: [
      { id: '1', name: 'Luís Carvalho', number: '10', category: 'Jogador', position: 'Ala', emoji: '🏃' },
      { id: '2', name: 'Rodrigo Silva', number: '1', category: 'Jogador', position: 'Goleiro', emoji: '🧤' },
      { id: '3', name: 'Carlos Sousa', number: '5', category: 'Jogador', position: 'Fixo', emoji: '🏃' },
      { id: '4', name: 'Felipe Costa', number: '9', category: 'Jogador', position: 'Pivô', emoji: '🏃' },
      { id: '5', name: 'Prof. Oliveira', number: '', category: 'Comissão Técnica', position: 'Treinador', emoji: '👔' }
    ],
    competitions: ['Liga Nacional 2026', 'Taça de Portugal 2026'],
    opponents: [
      { id: '1', name: 'Benfica Futsal', emoji: '🦅' },
      { id: '2', name: 'Sporting CP', emoji: '🦁' }
    ],
    games: [
      { id: '1', opponentId: '1', competition: 'Liga Nacional 2026', date: '2026-06-15', pavilion: 'Arena Principal', homeAway: 'Casa', round: '1ª Jornada' }
    ],
    callups: [
      { id: '1', gameId: '1', goalkeepers: ['2'], players: ['1', '3', '4'], staff: ['5'], captain: '1', viceCaptain: '3' }
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

  // Active game telemetry
  const [selectedGameId, setSelectedGameId] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [selectedActionId, setSelectedActionId] = useState('act-1');
  const [events, setEvents] = useState([]);

  // Stopwatch state
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Load database
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_callups_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure categories exist in parsed DB
        if (!parsed.categories) {
          parsed.categories = data.categories;
        }
        setData(parsed);
        if (parsed.games?.length > 0) {
          setSelectedGameId(parsed.games[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Initialize with default template if empty
      localStorage.setItem('sportluiz_callups_db', JSON.stringify(data));
      if (data.games?.length > 0) {
        setSelectedGameId(data.games[0].id);
      }
    }
  }, []);

  // Load game events
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

  const saveChange = (newData) => {
    setData(newData);
    localStorage.setItem('sportluiz_callups_db', JSON.stringify(newData));
  };

  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    if (selectedGameId) {
      localStorage.setItem(`sportluiz_events_${selectedGameId}`, JSON.stringify(newEvents));
    }
  };

  // Logo file upload handler
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveChange({ ...data, teamLogo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Category and Action creation
  const [showAddCategoryInput, setShowAddCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [showAddActionInput, setShowAddActionInput] = useState(''); // holds categoryId
  const [newActionName, setNewActionName] = useState('');
  const [newActionType, setNewActionType] = useState('PASS');

  // Pavilhões creation
  const [showAddPavilionInput, setShowAddPavilionInput] = useState(false);
  const [newPavilion, setNewPavilion] = useState('');

  // Agents CRUD
  const [newAgent, setNewAgent] = useState({ name: '', number: '', category: 'Jogador', position: 'Ala', emoji: '🏃' });
  
  // Competitions CRUD
  const [newCompetition, setNewCompetition] = useState('');
  // Opponents CRUD
  const [newOpponent, setNewOpponent] = useState({ name: '', emoji: '🛡️' });
  // Games CRUD
  const [newGame, setNewGame] = useState({ opponentId: '', competition: '', date: '', pavilion: '', homeAway: 'Casa', round: '' });

  // Callup mapping
  const [callupGameId, setCallupGameId] = useState('');
  const [activeCallup, setActiveCallup] = useState({ goalkeepers: [], players: [], staff: [], captain: '', viceCaptain: '' });

  useEffect(() => {
    if (callupGameId) {
      const existing = data.callups.find(c => c.gameId === callupGameId);
      if (existing) {
        setActiveCallup({
          goalkeepers: existing.goalkeepers || [],
          players: existing.players || [],
          staff: existing.staff || [],
          captain: existing.captain || '',
          viceCaptain: existing.viceCaptain || ''
        });
      } else {
        setActiveCallup({ goalkeepers: [], players: [], staff: [], captain: '', viceCaptain: '' });
      }
    }
  }, [callupGameId, data.callups]);

  // Stopwatch countdown/countup
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Plotting event on court click
  const handleCourtClick = (e) => {
    if (!selectedGameId) {
      alert("Por favor, selecione um jogo na aba 'Análise' antes de marcar ações.");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const player = data.agents.find(p => p.id === selectedPlayerId);
    
    // Find active action name
    let activeActionName = 'Ação';
    let activeActionType = 'PASS';
    data.categories.forEach(cat => {
      const act = cat.actions.find(a => a.id === selectedActionId);
      if (act) {
        activeActionName = act.name;
        activeActionType = act.type;
      }
    });

    const newEvent = {
      id: Date.now().toString(),
      type: activeActionType,
      actionName: activeActionName,
      posX: parseFloat(x.toFixed(1)),
      posY: parseFloat(y.toFixed(1)),
      minute: Math.floor(time / 60) || 1,
      seconds: time % 60,
      playerId: selectedPlayerId || 'unknown',
      playerName: player ? player.name : 'Jogador Coletivo',
      playerNumber: player ? player.number : ''
    };

    saveEvents([...events, newEvent]);
  };

  const handleExportCSV = () => {
    if (events.length === 0) return;
    const headers = ['Minuto', 'Segundo', 'Acao', 'X (%)', 'Y (%)', 'Jogador', 'Numero'];
    const rows = events.map(e => [
      e.minute,
      e.seconds,
      e.actionName,
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

  const getActionStats = (playerId) => {
    const stats = { PASS: 0, SHOT: 0, GOAL: 0, INTERCEPTION: 0, FOUL: 0 };
    events.forEach(ev => {
      if (ev.playerId === playerId) {
        if (stats[ev.type] !== undefined) stats[ev.type] += 1;
      }
    });
    return stats;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* GUIDANCE HEADER (FROM THE PRINT) */}
      <div className="text-left space-y-2">
        <h1 className="text-2xl font-black font-sans text-white">Registo de Ações</h1>
        <p className="text-neutral-400 text-xs font-mono max-w-4xl leading-relaxed">
          Ferramenta gratuita de registo de ações de futsal. Define categorias e ações personalizadas, regista eventos individuais ou coletivos em tempo real com cronómetro, associa ações a atletas, marca localizações no campo e consulta estatísticas detalhadas.
        </p>
      </div>

      {/* CORE CONTAINER CARD */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
        
        {/* Logo and Club Name Header */}
        <div className="flex items-center gap-4 border-b border-neutral-900 pb-5">
          <label className="w-16 h-16 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-emerald-500/50 flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden flex-shrink-0 relative">
            {data.teamLogo ? (
              <img src={data.teamLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Image size={24} className="text-neutral-600" />
            )}
            <input type="file" onChange={handleLogoUpload} className="hidden" accept="image/*" />
          </label>
          <div className="flex-1">
            <input 
              type="text" 
              placeholder="Nome do clube" 
              value={data.teamName} 
              onChange={(e) => saveChange({ ...data, teamName: e.target.value })}
              className="bg-transparent border-b border-neutral-800 hover:border-neutral-700 text-xl font-bold font-mono tracking-wide text-white focus:outline-none focus:border-emerald-500/50 w-full md:w-80 pb-1"
            />
          </div>
        </div>

        {/* TABS BAR (MATCHING THE PRINT TABS) */}
        <div className="flex border-b border-neutral-800 overflow-x-auto custom-scrollbar">
          {[
            { id: 'configuracao', label: 'Configuração', icon: Settings },
            { id: 'atletas', label: 'Atletas', icon: Users },
            { id: 'competicoes', label: 'Competições', icon: Trophy },
            { id: 'adversarios', label: 'Adversários', icon: Award },
            { id: 'jogos', label: 'Jogos', icon: Calendar },
            { id: 'convocatorias', label: 'Convocatórias', icon: FileText },
            { id: 'analise', label: 'Análise', icon: Play },
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

        {/* --- CONFIGURAÇÃO TAB (FROM THE PRINT) --- */}
        {activeTab === 'configuracao' && (
          <div className="space-y-6">
            
            {/* 1. CATEGORIES CONFIG */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowAddCategoryInput(!showAddCategoryInput)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2.5 text-xs font-mono font-bold transition-all cursor-pointer shadow"
                >
                  + Nova Categoria
                </button>
                <span className="text-xs font-mono text-neutral-400 font-extrabold uppercase tracking-wider">
                  Configuração
                </span>
              </div>

              {/* Inline Add Category */}
              {showAddCategoryInput && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCategoryName.trim()) return;
                  const newCat = { id: `cat-${Date.now()}`, name: newCategoryName.trim(), actions: [] };
                  saveChange({ ...data, categories: [...data.categories, newCat] });
                  setNewCategoryName('');
                  setShowAddCategoryInput(false);
                }} className="flex gap-2 max-w-sm bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                  <input
                    type="text"
                    required
                    placeholder="Nome da categoria..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button type="submit" className="bg-emerald-500 text-black px-3 rounded-lg text-xs font-mono font-bold">+ ADD</button>
                </form>
              )}

              {/* Categories & Actions List Box */}
              <div className="bg-neutral-950/40 border border-neutral-900/60 rounded-xl p-5 min-h-[100px] flex flex-col justify-center">
                {data.categories.length === 0 ? (
                  <p className="text-center text-xs font-mono text-neutral-500 py-4">Sem categorias.</p>
                ) : (
                  <div className="space-y-4 text-left">
                    {data.categories.map((cat) => (
                      <div key={cat.id} className="bg-neutral-950/80 border border-neutral-900 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                          <span className="font-mono text-xs font-bold text-emerald-400 uppercase">📁 {cat.name}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowAddActionInput(showAddActionInput === cat.id ? '' : cat.id)}
                              className="text-[10px] font-mono text-neutral-400 hover:text-white px-2 py-0.5 rounded border border-neutral-800"
                            >
                              + Adicionar Ação
                            </button>
                            <button
                              onClick={() => saveChange({ ...data, categories: data.categories.filter(c => c.id !== cat.id) })}
                              className="text-neutral-500 hover:text-red-400"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Inline Add Action */}
                        {showAddActionInput === cat.id && (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!newActionName.trim()) return;
                            const newActObj = { id: `act-${Date.now()}`, name: newActionName.trim(), type: newActionType };
                            const updatedCats = data.categories.map(c => {
                              if (c.id === cat.id) {
                                return { ...c, actions: [...c.actions, newActObj] };
                              }
                              return c;
                            });
                            saveChange({ ...data, categories: updatedCats });
                            setNewActionName('');
                            setShowAddActionInput('');
                          }} className="flex flex-wrap gap-2 bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                            <input
                              type="text"
                              required
                              placeholder="Nome da ação..."
                              value={newActionName}
                              onChange={(e) => setNewActionName(e.target.value)}
                              className="flex-1 min-w-[150px] bg-neutral-950 border border-neutral-850 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none"
                            />
                            <select
                              value={newActionType}
                              onChange={(e) => setNewActionType(e.target.value)}
                              className="bg-neutral-950 border border-neutral-850 rounded px-2 py-1 text-xs font-mono text-white"
                            >
                              <option value="PASS">Passe</option>
                              <option value="SHOT">Finalização</option>
                              <option value="GOAL">Golo</option>
                              <option value="INTERCEPTION">Desarme</option>
                              <option value="FOUL">Falta</option>
                            </select>
                            <button type="submit" className="bg-emerald-500 text-black px-3 py-1 rounded text-xs font-mono font-bold">Adicionar</button>
                          </form>
                        )}

                        {/* Actions buttons display */}
                        <div className="flex flex-wrap gap-1.5">
                          {cat.actions.length === 0 ? (
                            <span className="text-[10px] font-mono text-neutral-600">Nenhuma ação cadastrada nesta categoria.</span>
                          ) : (
                            cat.actions.map((act) => (
                              <div key={act.id} className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-[10px] font-mono text-neutral-300">
                                <span>{act.name} ({act.type})</span>
                                <button
                                  onClick={() => {
                                    const updatedCats = data.categories.map(c => {
                                      if (c.id === cat.id) {
                                        return { ...c, actions: c.actions.filter(a => a.id !== act.id) };
                                      }
                                      return c;
                                    });
                                    saveChange({ ...data, categories: updatedCats });
                                  }}
                                  className="text-neutral-500 hover:text-red-400"
                                >
                                  ×
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. PAVILIONS CONFIG */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowAddPavilionInput(!showAddPavilionInput)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg px-4 py-2.5 text-xs font-mono font-bold transition-all cursor-pointer shadow"
                >
                  + Novo Pavilhão
                </button>
                <span className="text-xs font-mono text-neutral-400 font-extrabold uppercase tracking-wider">
                  Pavilhões
                </span>
              </div>

              {/* Inline Add Pavilion */}
              {showAddPavilionInput && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newPavilion.trim()) return;
                  saveChange({ ...data, pavilions: [...data.pavilions, newPavilion.trim()] });
                  setNewPavilion('');
                  setShowAddPavilionInput(false);
                }} className="flex gap-2 max-w-sm bg-neutral-950 p-3 rounded-xl border border-neutral-855">
                  <input
                    type="text"
                    required
                    placeholder="Nome do pavilhão..."
                    value={newPavilion}
                    onChange={(e) => setNewPavilion(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none"
                  />
                  <button type="submit" className="bg-emerald-500 text-black px-3 rounded-lg text-xs font-mono font-bold">+ ADD</button>
                </form>
              )}

              {/* Pavilions List Area */}
              <div className="bg-neutral-950/40 border border-neutral-900/60 rounded-xl p-5 min-h-[100px] flex flex-col justify-center">
                {data.pavilions.length === 0 ? (
                  <p className="text-center text-xs font-mono text-neutral-500 py-4">Ainda não há pavilhões. Adiciona o primeiro.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
                    {data.pavilions.map((p) => (
                      <div key={p} className="flex justify-between items-center bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-850 text-xs font-mono">
                        <span>🏟️ {p}</span>
                        <button
                          onClick={() => saveChange({ ...data, pavilions: data.pavilions.filter(pav => pav !== p) })}
                          className="text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- ATLETAS TAB --- */}
        {activeTab === 'atletas' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newAgent.name) return;
                const newAg = { ...newAgent, id: Date.now().toString() };
                saveChange({ ...data, agents: [...data.agents, newAg] });
                setNewAgent({ name: '', number: '', category: 'Jogador', position: 'Ala', emoji: '🏃' });
              }} className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Novo Atleta</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 block mb-1">Manto</label>
                      <input
                        type="text"
                        value={newAgent.number}
                        onChange={(e) => setNewAgent({ ...newAgent, number: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 block mb-1">Emoji / Ícone</label>
                      <input
                        type="text"
                        value={newAgent.emoji}
                        onChange={(e) => setNewAgent({ ...newAgent, emoji: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 block mb-1">Posição / Função</label>
                    <select
                      value={newAgent.position}
                      onChange={(e) => setNewAgent({ ...newAgent, position: e.target.value, emoji: e.target.value === 'Goleiro' ? '🧤' : '🏃' })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    >
                      <option value="Goleiro">Goleiro / Guarda-Redes</option>
                      <option value="Fixo">Fixo</option>
                      <option value="Ala">Ala</option>
                      <option value="Pivô">Pivô</option>
                      <option value="Universal">Universal</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all">
                  Cadastrar Atleta
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Atletas Atuais</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {data.agents.filter(a => a.category === 'Jogador').map((ag) => (
                    <div key={ag.id} className="flex justify-between items-center bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                      <div className="flex items-center gap-3">
                        <span className="text-lg bg-neutral-950 w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-850">{ag.emoji}</span>
                        <div className="font-mono text-xs">
                          <div className="font-bold text-white">#{ag.number} - {ag.name}</div>
                          <div className="text-[10px] text-neutral-500 uppercase mt-0.5">{ag.position}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => saveChange({ ...data, agents: data.agents.filter(a => a.id !== ag.id) })}
                        className="text-neutral-600 hover:text-red-400 p-1.5 rounded hover:bg-neutral-950"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- COMPETIÇÕES TAB --- */}
        {activeTab === 'competicoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newCompetition.trim()) return;
                saveChange({ ...data, competitions: [...data.competitions, newCompetition.trim()] });
                setNewCompetition('');
              }} className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Nova Competição</h2>
                <input
                  type="text"
                  required
                  placeholder="Ex: Liga Nacional Futsal"
                  value={newCompetition}
                  onChange={(e) => setNewCompetition(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all">
                  Cadastrar Competição
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Competições Cadastradas</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {data.competitions.map((comp) => (
                    <div key={comp} className="flex justify-between items-center bg-neutral-900 px-4 py-3 rounded-lg border border-neutral-800 text-xs font-mono">
                      <span>🏆 {comp}</span>
                      <button
                        onClick={() => saveChange({ ...data, competitions: data.competitions.filter(c => c !== comp) })}
                        className="text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- ADVERSÁRIOS TAB --- */}
        {activeTab === 'adversarios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newOpponent.name) return;
                const nOpp = { ...newOpponent, id: Date.now().toString() };
                saveChange({ ...data, opponents: [...data.opponents, nOpp] });
                setNewOpponent({ name: '', emoji: '🛡️' });
              }} className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Novo Adversário</h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Clube Rival</label>
                    <input
                      type="text"
                      required
                      value={newOpponent.name}
                      onChange={(e) => setNewOpponent({ ...newOpponent, name: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Emoji / Escudo</label>
                    <input
                      type="text"
                      value={newOpponent.emoji}
                      onChange={(e) => setNewOpponent({ ...newOpponent, emoji: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all">
                  Cadastrar Rival
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Adversários Cadastrados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {data.opponents.map((o) => (
                    <div key={o.id} className="flex justify-between items-center bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                      <div className="flex items-center gap-3">
                        <span className="text-lg bg-neutral-950 w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-850">{o.emoji}</span>
                        <span className="font-mono text-xs text-white font-bold">{o.name}</span>
                      </div>
                      <button
                        onClick={() => saveChange({ ...data, opponents: data.opponents.filter(opp => opp.id !== o.id) })}
                        className="text-neutral-600 hover:text-red-400 p-1.5 rounded hover:bg-neutral-950"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- JOGOS TAB --- */}
        {activeTab === 'jogos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newGame.opponentId || !newGame.date) return;
                const nGame = { ...newGame, id: Date.now().toString() };
                saveChange({ ...data, games: [...data.games, nGame] });
                setNewGame({ opponentId: '', competition: data.competitions[0] || '', date: '', pavilion: data.pavilions[0] || '', homeAway: 'Casa', round: '' });
              }} className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Novo Jogo</h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 block mb-1">Rival</label>
                    <select
                      required
                      value={newGame.opponentId}
                      onChange={(e) => setNewGame({ ...newGame, opponentId: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {data.opponents.map(o => <option key={o.id} value={o.id}>{o.emoji} {o.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 block mb-1">Competição</label>
                    <select
                      value={newGame.competition}
                      onChange={(e) => setNewGame({ ...newGame, competition: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {data.competitions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 block mb-1">Rodada</label>
                      <input
                        type="text"
                        placeholder="Ex: 1ª Jornada"
                        value={newGame.round}
                        onChange={(e) => setNewGame({ ...newGame, round: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 block mb-1">Data</label>
                      <input
                        type="date"
                        required
                        value={newGame.date}
                        onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 block mb-1">Pavilhão</label>
                      <select
                        value={newGame.pavillion}
                        onChange={(e) => setNewGame({ ...newGame, pavilion: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      >
                        {data.pavilions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 block mb-1">Localização</label>
                      <select
                        value={newGame.homeAway}
                        onChange={(e) => setNewGame({ ...newGame, homeAway: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      >
                        <option value="Casa">Casa</option>
                        <option value="Fora">Fora</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all">
                  Criar Jogo
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Jogos Agendados</h2>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {data.games.map((g) => {
                    const opp = data.opponents.find(o => o.id === g.opponentId);
                    return (
                      <div key={g.id} className="flex justify-between items-center bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                        <div className="font-mono text-xs text-left space-y-1">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="text-[10px] bg-neutral-950 border border-neutral-850 px-1.5 py-0.5 rounded text-neutral-400 font-bold uppercase tracking-wider">{g.homeAway}</span>
                            vs {opp?.emoji} {opp?.name}
                          </div>
                          <div className="text-[10px] text-neutral-500">{g.competition} • {g.round || 'Sem rodada'}</div>
                          <div className="text-[10px] text-neutral-500">{g.date} no {g.pavilion}</div>
                        </div>
                        <button
                          onClick={() => {
                            saveChange({ 
                              ...data, 
                              games: data.games.filter(game => game.id !== g.id),
                              callups: data.callups.filter(c => c.gameId !== g.id)
                            });
                          }}
                          className="text-neutral-600 hover:text-red-400 p-1.5 rounded hover:bg-neutral-950 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CONVOCATÓRIAS TAB --- */}
        {activeTab === 'convocatorias' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Selecionar Jogo</h2>
                <select
                  value={callupGameId}
                  onChange={(e) => setCallupGameId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
                >
                  <option value="">Selecione uma partida...</option>
                  {data.games.map((g) => {
                    const opp = data.opponents.find(o => o.id === g.opponentId);
                    return (
                      <option key={g.id} value={g.id}>
                        {g.round || 'Jogo'} - vs {opp?.emoji} {opp?.name} ({g.date})
                      </option>
                    );
                  })}
                </select>

                {callupGameId && (
                  <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-lg space-y-2 text-xs font-mono text-neutral-400">
                    {(() => {
                      const g = data.games.find(x => x.id === callupGameId);
                      return (
                        <>
                          <div className="flex justify-between"><span className="text-neutral-600">Competição:</span> <span className="text-white">{g?.competition}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-600">Pavilhão:</span> <span className="text-white">{g?.pavilion}</span></div>
                          <div className="flex justify-between"><span className="text-neutral-600">Localização:</span> <span className="text-emerald-400 font-bold">{g?.homeAway}</span></div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {!callupGameId ? (
                <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-12 text-center h-48 flex items-center justify-center">
                  <span className="text-xs font-mono text-neutral-500">Selecione um jogo no painel lateral.</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-950 border border-neutral-855 rounded-xl p-5 space-y-4">
                    <h3 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider">Selecionar Atletas</h3>
                    
                    <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1.5 font-bold">Guarda-Redes</span>
                        <div className="space-y-1.5">
                          {data.agents.filter(a => a.category === 'Jogador' && a.position === 'Goleiro').map(ag => {
                            const isSelected = activeCallup.goalkeepers.includes(ag.id);
                            return (
                              <label key={ag.id} className="flex items-center gap-2 bg-neutral-900 p-2 rounded-lg border border-neutral-800 cursor-pointer text-xs font-mono">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    let gks = [...activeCallup.goalkeepers];
                                    if (isSelected) gks = gks.filter(id => id !== ag.id);
                                    else gks.push(ag.id);
                                    setActiveCallup({ ...activeCallup, goalkeepers: gks });
                                  }}
                                  className="accent-emerald-500"
                                />
                                <span>{ag.emoji} #{ag.number} - {ag.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1.5 font-bold">Linha</span>
                        <div className="space-y-1.5">
                          {data.agents.filter(a => a.category === 'Jogador' && a.position !== 'Goleiro').map(ag => {
                            const isSelected = activeCallup.players.includes(ag.id);
                            return (
                              <label key={ag.id} className="flex items-center gap-2 bg-neutral-900 p-2 rounded-lg border border-neutral-800 cursor-pointer text-xs font-mono">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {
                                    let pls = [...activeCallup.players];
                                    if (isSelected) pls = pls.filter(id => id !== ag.id);
                                    else pls.push(ag.id);
                                    setActiveCallup({ ...activeCallup, players: pls });
                                  }}
                                  className="accent-emerald-500"
                                />
                                <span>{ag.emoji} #{ag.number} - {ag.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 flex flex-col justify-between">
                    <button 
                      onClick={() => {
                        const existingIndex = data.callups.findIndex(c => c.gameId === callupGameId);
                        let updatedCallups = [...data.callups];
                        const newCallupObj = { id: callupGameId, gameId: callupGameId, ...activeCallup };

                        if (existingIndex > -1) {
                          updatedCallups[existingIndex] = newCallupObj;
                        } else {
                          updatedCallups.push(newCallupObj);
                        }
                        saveChange({ ...data, callups: updatedCallups });
                        alert('Convocatória salva!');
                      }}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-3 rounded-lg transition-all"
                    >
                      SALVAR CONVOCATÓRIA
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ANÁLISE TAB (THE 2D COURT EVENT LOGGING SYSTEM!) --- */}
        {activeTab === 'analise' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Tagging selectors */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Select active game */}
              <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl space-y-3 text-left">
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold">Jogo em Análise</label>
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-2.5 py-2 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="">Selecione um jogo...</option>
                  {data.games.map(g => (
                    <option key={g.id} value={g.id}>vs {data.opponents.find(o => o.id === g.opponentId)?.name} ({g.date})</option>
                  ))}
                </select>
              </div>

              {/* Stopwatch controls */}
              <div className="bg-neutral-950 border border-neutral-850 p-4 rounded-xl space-y-4 text-center">
                <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold block">Tempo de Jogo</span>
                <div className="text-3xl font-mono font-bold text-white tracking-widest bg-neutral-900 py-2.5 rounded-lg">
                  {formatTime(time)}
                </div>
                <div className="flex justify-center gap-2">
                  <button 
                    onClick={() => setIsRunning(!isRunning)} 
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold cursor-pointer ${
                      isRunning ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-black'
                    }`}
                  >
                    {isRunning ? 'Pausar' : 'Iniciar'}
                  </button>
                  <button 
                    onClick={() => { setTime(0); setIsRunning(false); }}
                    className="px-2 py-1.5 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded text-xs font-mono font-bold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Select player */}
              <div className="bg-neutral-950 border border-neutral-855 p-4 rounded-xl space-y-3 text-left">
                <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block font-bold">Atleta Executor</label>
                <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => setSelectedPlayerId('')}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-all ${
                      selectedPlayerId === '' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    👥 Jogada Coletiva / Autogolo
                  </button>
                  {data.agents.filter(a => a.category === 'Jogador').map(pl => (
                    <button
                      key={pl.id}
                      onClick={() => setSelectedPlayerId(pl.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs font-mono transition-all flex justify-between ${
                        selectedPlayerId === pl.id ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <span>{pl.emoji} {pl.name}</span>
                      <span className="opacity-60">#{pl.number}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* 2D Court display */}
            <div className="lg:col-span-2 space-y-4 text-left">
              {/* Sport layout select */}
              <div className="flex gap-2">
                <button onClick={() => setSport('futsal')} className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-all ${sport === 'futsal' ? 'bg-neutral-950 border-neutral-800 text-emerald-400 font-bold' : 'text-neutral-600'}`}>Futsal (Quadra)</button>
                <button onClick={() => setSport('football')} className={`px-2.5 py-1 text-[10px] font-mono rounded border transition-all ${sport === 'football' ? 'bg-neutral-950 border-neutral-800 text-emerald-400 font-bold' : 'text-neutral-600'}`}>Futebol (Campo)</button>
              </div>

              {/* Court visual element mapping */}
              <div 
                onClick={handleCourtClick}
                className={`w-full aspect-[5/3] relative rounded-2xl border-2 border-neutral-800 cursor-crosshair overflow-hidden select-none ${
                  sport === 'futsal' ? 'bg-blue-950/20' : 'bg-emerald-950/15'
                }`}
              >
                {/* Markings */}
                <div className="absolute inset-0 border-[3px] border-white/20 m-3 flex items-center justify-center pointer-events-none">
                  <div className="h-full w-[2px] bg-white/20 absolute left-1/2"></div>
                  <div className="w-1/5 aspect-square border-2 border-white/20 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                  <div className={`h-1/2 w-[12%] border-t-2 border-r-2 border-b-2 border-white/20 absolute left-0 top-1/4 ${sport === 'futsal' ? 'rounded-r-full' : ''}`}></div>
                  <div className={`h-1/2 w-[12%] border-t-2 border-l-2 border-b-2 border-white/20 absolute right-0 top-1/4 ${sport === 'futsal' ? 'rounded-l-full' : ''}`}></div>
                </div>

                {/* Plotted action markers */}
                {events.map(ev => (
                  <div 
                    key={ev.id}
                    style={{ left: `${ev.posX}%`, top: `${ev.posY}%` }}
                    className={`absolute w-3.5 h-3.5 -ml-1.7 -mt-1.7 rounded-full border border-white/80 shadow text-[7px] font-bold text-white flex items-center justify-center ${
                      ev.type === 'GOAL' ? 'bg-rose-500 scale-110 z-10' :
                      ev.type === 'PASS' ? 'bg-emerald-500' :
                      ev.type === 'SHOT' ? 'bg-blue-500' :
                      ev.type === 'FOUL' ? 'bg-amber-500' : 'bg-purple-500'
                    }`}
                    title={`${ev.actionName} - ${ev.playerName}`}
                  >
                    {ev.playerNumber || ev.type.slice(0, 1)}
                  </div>
                ))}
              </div>

              {/* Action buttons selection mapping based on categories configurations */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-neutral-500 uppercase font-bold">Ações Customizadas</span>
                <div className="flex flex-wrap gap-2">
                  {data.categories.flatMap(c => c.actions).map(act => (
                    <button
                      key={act.id}
                      onClick={() => setSelectedActionId(act.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        selectedActionId === act.id
                          ? 'bg-emerald-500 text-black font-extrabold border-emerald-600'
                          : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {act.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Event feed stream */}
            <div className="lg:col-span-1 space-y-4 text-left">
              <div className="bg-neutral-950 border border-neutral-855 p-4 rounded-xl flex flex-col justify-between h-[380px]">
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  <div className="flex justify-between items-center border-b border-neutral-900 pb-2">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Live Stream</span>
                    <button onClick={handleExportCSV} disabled={events.length === 0} className="text-neutral-500 hover:text-emerald-400 disabled:text-neutral-850 transition-colors">
                      <Download size={14} />
                    </button>
                  </div>

                  <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                    {events.slice().reverse().map(ev => (
                      <div key={ev.id} className="flex justify-between items-center bg-neutral-900 p-2 rounded border border-neutral-800 text-[10px] font-mono">
                        <div>
                          <span className="text-emerald-400 font-bold">[{ev.actionName}]</span>
                          <span className="text-white font-bold ml-1.5">{ev.playerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-500">{ev.minute}'</span>
                          <button onClick={() => saveEvents(events.filter(x => x.id !== ev.id))} className="text-neutral-600 hover:text-red-400">
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- ESTATÍSTICAS TAB --- */}
        {activeTab === 'estatisticas' && (
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 text-left">
            <h2 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-widest mb-4">Métricas de Ação dos Atletas</h2>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left font-mono text-xs select-none">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase font-bold">
                    <th className="py-2.5">Agente</th>
                    <th className="py-2.5 text-center">Passes</th>
                    <th className="py-2.5 text-center">Chutes</th>
                    <th className="py-2.5 text-center">Golos</th>
                    <th className="py-2.5 text-center">Desarmes</th>
                    <th className="py-2.5 text-center">Faltas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-neutral-300">
                  {data.agents.filter(a => a.category === 'Jogador').map((ag) => {
                    const stats = getActionStats(ag.id);
                    return (
                      <tr key={ag.id} className="hover:bg-neutral-900/40">
                        <td className="py-3 font-bold text-white flex items-center gap-2">
                          <span>{ag.emoji}</span> <span>{ag.name}</span>
                        </td>
                        <td className="py-3 text-center text-white">{stats.PASS}</td>
                        <td className="py-3 text-center text-white">{stats.SHOT}</td>
                        <td className="py-3 text-center text-emerald-400 font-extrabold">{stats.GOAL}</td>
                        <td className="py-3 text-center text-white">{stats.INTERCEPTION}</td>
                        <td className="py-3 text-center text-rose-400 font-bold">{stats.FOUL}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

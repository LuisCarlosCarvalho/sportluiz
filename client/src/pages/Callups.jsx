import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Trophy, Settings, Plus, Trash2, 
  Download, Upload, Printer, Award, Info, FileText, 
  CheckCircle2, Image, BarChart2 
} from 'lucide-react';

export default function Callups() {
  const [activeTab, setActiveTab] = useState('configuracoes');
  
  // Main data state
  const [data, setData] = useState({
    teamName: '',
    teamLogo: '', // Base64 logo
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
    ]
  });

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_callups_db');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar dados do localStorage', e);
      }
    }
  }, []);

  // Save to local storage
  const saveChange = (newData) => {
    setData(newData);
    localStorage.setItem('sportluiz_callups_db', JSON.stringify(newData));
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

  // --- CRUD HELPERS ---
  const [newAgent, setNewAgent] = useState({ name: '', number: '', category: 'Jogador', position: 'Ala', emoji: '🏃' });
  const [newPavilion, setNewPavilion] = useState('');
  const [showAddPavilionInput, setShowAddPavilionInput] = useState(false);

  const [newCompetition, setNewCompetition] = useState('');
  const [newOpponent, setNewOpponent] = useState({ name: '', emoji: '🛡️' });
  const [newGame, setNewGame] = useState({ opponentId: '', competition: '', date: '', pavilion: '', homeAway: 'Casa', round: '' });

  // Callup state
  const [selectedGameId, setSelectedGameId] = useState(data.games[0]?.id || '');
  const [activeCallup, setActiveCallup] = useState({
    goalkeepers: [],
    players: [],
    staff: [],
    captain: '',
    viceCaptain: ''
  });

  useEffect(() => {
    if (selectedGameId) {
      const existing = data.callups.find(c => c.gameId === selectedGameId);
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
  }, [selectedGameId, data.callups]);

  const handleSaveCallup = () => {
    const existingIndex = data.callups.findIndex(c => c.gameId === selectedGameId);
    let updatedCallups = [...data.callups];
    const newCallupObj = { id: selectedGameId, gameId: selectedGameId, ...activeCallup };

    if (existingIndex > -1) {
      updatedCallups[existingIndex] = newCallupObj;
    } else {
      updatedCallups.push(newCallupObj);
    }
    saveChange({ ...data, callups: updatedCallups });
    alert('Convocatória salva com sucesso!');
  };

  // Calculate stats: count of callups for each player
  const calculatePlayerStats = (playerId) => {
    return data.callups.filter(c => 
      c.goalkeepers.includes(playerId) || c.players.includes(playerId)
    ).length;
  };

  // Import / Export JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sportluiz_callups_backup.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        saveChange(parsed);
        alert("Dados importados com sucesso!");
      } catch (err) {
        alert("Erro ao ler arquivo JSON de importação.");
      }
    };
  };

  const activeGame = data.games.find(g => g.id === selectedGameId);
  const activeOpponent = data.opponents.find(o => o.id === activeGame?.opponentId);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* JSON Import/Export Bar */}
      <div className="flex justify-end gap-2 text-xs font-mono">
        <button 
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono rounded-lg transition-all text-neutral-300"
        >
          <Download size={13} /> Exportar Backup
        </button>
        <label className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono rounded-lg transition-all text-neutral-300 cursor-pointer">
          <Upload size={13} /> Importar Backup
          <input type="file" onChange={handleImportJSON} className="hidden" accept=".json" />
        </label>
      </div>

      {/* TEAM PROFILE PANEL (FROM THE PRINT) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 shadow-xl">
        
        {/* Logo and Team Name Input */}
        <div className="flex items-center gap-4">
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
              placeholder="Nome da equipa" 
              value={data.teamName} 
              onChange={(e) => saveChange({ ...data, teamName: e.target.value })}
              className="bg-transparent border-b border-neutral-800 hover:border-neutral-700 text-xl font-bold font-mono tracking-wide text-white focus:outline-none focus:border-emerald-500/50 w-full md:w-80 pb-1"
            />
          </div>
        </div>

        {/* TABS BAR (MATCHING THE PRINT TABS) */}
        <div className="flex border-b border-neutral-800 overflow-x-auto custom-scrollbar">
          {[
            { id: 'configuracoes', label: 'Configurações', icon: Settings },
            { id: 'agentes', label: 'Agentes', icon: Users },
            { id: 'competicoes', label: 'Competições', icon: Trophy },
            { id: 'adversarios', label: 'Adversários', icon: Award },
            { id: 'jogos', label: 'Jogos', icon: Calendar },
            { id: 'convocatorias', label: 'Convocatórias', icon: FileText },
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

        {/* TAB CORE CONTENTS */}

        {/* --- CONFIGURAÇÕES TAB (MATCHING THE PRINT LAYOUT) --- */}
        {activeTab === 'configuracoes' && (
          <div className="space-y-4">
            
            {/* Top Bar inside Configurations: Add button and Label */}
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

            {/* Inline add pavilion form */}
            {showAddPavilionInput && (
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newPavilion.trim()) return;
                saveChange({ ...data, pavilions: [...data.pavilions, newPavilion.trim()] });
                setNewPavilion('');
                setShowAddPavilionInput(false);
              }} className="flex gap-2 max-w-sm bg-neutral-950 p-3 rounded-xl border border-neutral-850">
                <input
                  type="text"
                  required
                  placeholder="Nome do pavilhão..."
                  value={newPavilion}
                  onChange={(e) => setNewPavilion(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
                <button type="submit" className="bg-emerald-500 text-black px-3 rounded-lg text-xs font-mono font-bold">+ ADD</button>
              </form>
            )}

            {/* Pavilions List Area */}
            <div className="bg-neutral-950/40 border border-neutral-900/60 rounded-xl p-6 min-h-[120px] flex flex-col justify-center">
              {data.pavilions.length === 0 ? (
                <p className="text-center text-xs font-mono text-neutral-500">
                  Ainda não há pavilhões. Adiciona o primeiro.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.pavilions.map((p) => (
                    <div key={p} className="flex justify-between items-center bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-850 text-xs font-mono">
                      <span>🏟️ {p}</span>
                      <button
                        onClick={() => saveChange({ ...data, pavilions: data.pavilions.filter(pav => pav !== p) })}
                        className="text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- AGENTES TAB --- */}
        {activeTab === 'agentes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Agent form */}
            <div className="lg:col-span-1">
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newAgent.name) return;
                const newAg = { ...newAgent, id: Date.now().toString() };
                saveChange({ ...data, agents: [...data.agents, newAg] });
                setNewAgent({ name: '', number: '', category: 'Jogador', position: 'Ala', emoji: '🏃' });
              }} className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Plus size={14} className="text-emerald-400" /> Novo Agente
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={newAgent.name}
                      onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Número</label>
                      <input
                        type="text"
                        value={newAgent.number}
                        onChange={(e) => setNewAgent({ ...newAgent, number: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Emoji / Ícone</label>
                      <input
                        type="text"
                        value={newAgent.emoji}
                        onChange={(e) => setNewAgent({ ...newAgent, emoji: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Categoria</label>
                    <select
                      value={newAgent.category}
                      onChange={(e) => setNewAgent({ ...newAgent, category: e.target.value, position: e.target.value === 'Comissão Técnica' ? 'Treinador' : 'Ala' })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Jogador">Jogador</option>
                      <option value="Comissão Técnica">Comissão Técnica</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Posição / Função</label>
                    {newAgent.category === 'Jogador' ? (
                      <select
                        value={newAgent.position}
                        onChange={(e) => setNewAgent({ ...newAgent, position: e.target.value, emoji: e.target.value === 'Goleiro' ? '🧤' : '🏃' })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Goleiro">Goleiro / Guarda-Redes</option>
                        <option value="Fixo">Fixo</option>
                        <option value="Ala">Ala</option>
                        <option value="Pivô">Pivô</option>
                        <option value="Universal">Universal</option>
                      </select>
                    ) : (
                      <select
                        value={newAgent.position}
                        onChange={(e) => setNewAgent({ ...newAgent, position: e.target.value, emoji: '👔' })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      >
                        <option value="Treinador">Treinador</option>
                        <option value="Treinador Adjunto">Treinador Adjunto</option>
                        <option value="Prep. Físico">Prep. Físico</option>
                        <option value="Fisioterapeuta">Fisioterapeuta</option>
                        <option value="Diretor">Diretor</option>
                      </select>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
                >
                  CADASTRAR AGENTE
                </button>
              </form>
            </div>

            {/* List of squad members */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Elenco Cadastrado</h2>

                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                  {data.agents.map((ag) => (
                    <div key={ag.id} className="flex justify-between items-center bg-neutral-900 p-3 rounded-lg border border-neutral-800">
                      <div className="flex items-center gap-3">
                        <span className="text-lg bg-neutral-950 w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-850">{ag.emoji}</span>
                        <div className="font-mono text-xs text-left">
                          <div className="font-bold text-white">
                            {ag.number && <span className="text-emerald-400 mr-1.5">#{ag.number}</span>}
                            {ag.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 uppercase mt-0.5">{ag.category} - {ag.position}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          saveChange({ ...data, agents: data.agents.filter(a => a.id !== ag.id) });
                        }}
                        className="text-neutral-600 hover:text-red-400 p-1.5 rounded hover:bg-neutral-950 transition-all"
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
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5">
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
              }} className="bg-neutral-950 border border-neutral-855 rounded-xl p-5 space-y-4">
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
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Rival</label>
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
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Competição</label>
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
                      <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Rodada</label>
                      <input
                        type="text"
                        placeholder="Ex: 1ª Jornada"
                        value={newGame.round}
                        onChange={(e) => setNewGame({ ...newGame, round: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Data</label>
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
                      <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Pavilhão</label>
                      <select
                        value={newGame.pavillion}
                        onChange={(e) => setNewGame({ ...newGame, pavilion: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      >
                        {data.pavilions.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Localização</label>
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
                  Criar Confronto
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4 text-left">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Selecionar Jogo</h2>
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
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

                {activeGame && (
                  <div className="bg-neutral-900 border border-neutral-850 p-4 rounded-lg space-y-2 text-xs font-mono text-neutral-400">
                    <div className="flex justify-between"><span className="text-neutral-600">Competição:</span> <span className="text-white">{activeGame.competition}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-600">Pavilhão:</span> <span className="text-white">{activeGame.pavilion}</span></div>
                    <div className="flex justify-between"><span className="text-neutral-600">Localização:</span> <span className="text-emerald-400">{activeGame.homeAway}</span></div>
                  </div>
                )}
              </div>

              {activeGame && (
                <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4 text-left">
                  <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Capitães</h2>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 block mb-1">Capitão (C)</label>
                      <select
                        value={activeCallup.captain}
                        onChange={(e) => setActiveCallup({ ...activeCallup, captain: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      >
                        <option value="">Selecione...</option>
                        {[...activeCallup.goalkeepers, ...activeCallup.players].map(id => {
                          const ag = data.agents.find(a => a.id === id);
                          return <option key={id} value={id}>#{ag?.number} {ag?.name}</option>;
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 block mb-1">Vice-Capitão (V)</label>
                      <select
                        value={activeCallup.viceCaptain}
                        onChange={(e) => setActiveCallup({ ...activeCallup, viceCaptain: e.target.value })}
                        className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                      >
                        <option value="">Selecione...</option>
                        {[...activeCallup.goalkeepers, ...activeCallup.players].map(id => {
                          const ag = data.agents.find(a => a.id === id);
                          return <option key={id} value={id}>#{ag?.number} {ag?.name}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSaveCallup}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
                  >
                    SALVAR CONVOCATÓRIA
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-6">
              {!activeGame ? (
                <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-12 text-center flex flex-col items-center justify-center h-48">
                  <Info size={32} className="text-neutral-700 mb-2" />
                  <h3 className="text-sm font-bold text-white font-mono uppercase">Nenhum jogo selecionado</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Selectors list */}
                  <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 space-y-4 text-left">
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
                                <span>{ag.emoji} #{ag.number} - {ag.name} ({ag.position})</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PDF Paper preview */}
                  <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider">Pré-visualização</h3>
                        <button onClick={() => window.print()} className="text-neutral-500 hover:text-white p-1 rounded hover:bg-neutral-900">
                          <Printer size={15} />
                        </button>
                      </div>

                      <div id="printable-convocation" className="bg-white text-black p-4 rounded-lg font-sans border border-neutral-200 text-left space-y-3">
                        <div className="text-center border-b pb-2">
                          <div className="font-bold flex items-center justify-center gap-1">
                            {data.teamLogo && <img src={data.teamLogo} alt="Logo" className="w-5 h-5 object-cover rounded" />}
                            <span className="font-mono text-sm uppercase font-black">{data.teamName || 'Equipa'}</span>
                          </div>
                          <div className="text-[9px] text-neutral-500 uppercase tracking-wider">Convocatória Oficial</div>
                        </div>

                        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                          <div><span className="font-bold">Rival:</span> vs {activeOpponent?.name}</div>
                          <div><span className="font-bold">Competição:</span> {activeGame.competition}</div>
                          <div><span className="font-bold">Local:</span> {activeGame.pavilion}</div>
                          <div><span className="font-bold">Data:</span> {activeGame.date}</div>
                        </div>

                        <div className="border-t pt-2 space-y-2 text-[11px] font-mono">
                          <div>
                            <span className="font-bold uppercase text-[9px] text-neutral-600 block">Guarda-Redes</span>
                            {activeCallup.goalkeepers.map(id => {
                              const ag = data.agents.find(a => a.id === id);
                              return (
                                <div key={id} className="flex justify-between">
                                  <span>#{ag?.number} - {ag?.name}</span>
                                  {activeCallup.captain === id && <span className="font-bold text-[8px] bg-neutral-200 px-1 rounded">(C)</span>}
                                </div>
                              );
                            })}
                          </div>

                          <div>
                            <span className="font-bold uppercase text-[9px] text-neutral-600 block">Jogadores</span>
                            {activeCallup.players.map(id => {
                              const ag = data.agents.find(a => a.id === id);
                              return (
                                <div key={id} className="flex justify-between">
                                  <span>#{ag?.number} - {ag?.name} ({ag?.position})</span>
                                  <div className="flex gap-1">
                                    {activeCallup.captain === id && <span className="font-bold text-[8px] bg-neutral-200 px-1 rounded">(C)</span>}
                                    {activeCallup.viceCaptain === id && <span className="font-bold text-[8px] bg-neutral-200 px-1 rounded">(V)</span>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => window.print()} className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 font-bold font-mono text-xs py-2 rounded-lg border border-neutral-800 transition-all flex items-center justify-center gap-1.5 mt-4">
                      <Printer size={14} /> IMPRIMIR PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- ESTATÍSTICAS TAB (NEW!) --- */}
        {activeTab === 'estatisticas' && (
          <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-5">
            <h2 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              📊 Estatísticas de Convocação
            </h2>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left font-mono text-xs select-none">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase font-bold">
                    <th className="py-2.5">Agente</th>
                    <th className="py-2.5">Número</th>
                    <th className="py-2.5">Categoria</th>
                    <th className="py-2.5">Posição / Função</th>
                    <th className="py-2.5 text-center">Jogos Convocados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-neutral-300">
                  {data.agents.map((ag) => {
                    const callupsCount = calculatePlayerStats(ag.id);
                    return (
                      <tr key={ag.id} className="hover:bg-neutral-900/40">
                        <td className="py-3 font-bold text-white flex items-center gap-2">
                          <span>{ag.emoji}</span> <span>{ag.name}</span>
                        </td>
                        <td className="py-3 text-emerald-400 font-bold">{ag.number || '-'}</td>
                        <td className="py-3 text-neutral-400">{ag.category}</td>
                        <td className="py-3 text-neutral-400">{ag.position}</td>
                        <td className="py-3 text-center text-white font-extrabold">{callupsCount}</td>
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

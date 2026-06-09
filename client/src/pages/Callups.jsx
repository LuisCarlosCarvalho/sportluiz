import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Trophy, ShieldAlert, Settings, Plus, Trash2, 
  Download, Upload, Printer, Award, Info, FileText, CheckCircle2 
} from 'lucide-react';

export default function Callups() {
  const [activeTab, setActiveTab] = useState('convocatorias');
  const [data, setData] = useState({
    teamName: 'SportLuiz Futsal Club',
    teamEmoji: '⚽',
    pavilions: ['Arena Principal', 'Pavilhão Municipal', 'Quadra Norte'],
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

  // --- CRUD HELPERS ---
  const [newAgent, setNewAgent] = useState({ name: '', number: '', category: 'Jogador', position: 'Ala', emoji: '🏃' });
  const [newPavilion, setNewPavilion] = useState('');
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
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{data.teamEmoji}</span>
            <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase">
              {data.teamName} // Convocatórias
            </h1>
          </div>
          <p className="text-neutral-500 text-xs mt-1">Gestão de elenco, jogos e folhas de convocação prontas para PDF/Impressão</p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono rounded-lg transition-all text-neutral-300"
          >
            <Download size={13} /> Exportar
          </button>
          <label className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono rounded-lg transition-all text-neutral-300 cursor-pointer">
            <Upload size={13} /> Importar
            <input type="file" onChange={handleImportJSON} className="hidden" accept=".json" />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-900 overflow-x-auto custom-scrollbar">
        {[
          { id: 'convocatorias', label: 'Convocatórias', icon: FileText },
          { id: 'agentes', label: 'Elenco / Staff', icon: Users },
          { id: 'jogos', label: 'Jogos', icon: Calendar },
          { id: 'adversarios', label: 'Adversários', icon: Trophy },
          { id: 'config', label: 'Configuração', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-mono font-bold rounded-lg transition-all flex-shrink-0 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-neutral-900 text-emerald-400 border border-neutral-800/80 shadow-md' 
                  : 'text-neutral-400 hover:text-neutral-200 border border-transparent'
              }`}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* --- CONVOCATÓRIAS --- */}
      {activeTab === 'convocatorias' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Callup configurations panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar size={14} className="text-emerald-400" /> Selecionar Jogo
              </h2>
              
              <select
                value={selectedGameId}
                onChange={(e) => setSelectedGameId(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
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
                <div className="bg-neutral-950 border border-neutral-900/60 p-4 rounded-lg space-y-2 text-xs font-mono text-neutral-400">
                  <div className="flex justify-between"><span className="text-neutral-600">Competição:</span> <span className="text-white">{activeGame.competition}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-600">Local/Pavilhão:</span> <span className="text-white">{activeGame.pavilion}</span></div>
                  <div className="flex justify-between"><span className="text-neutral-600">Localização:</span> <span className="text-emerald-400">{activeGame.homeAway}</span></div>
                </div>
              )}
            </div>

            {activeGame && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Award size={14} className="text-emerald-400" /> Capitães
                </h2>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Capitão (C)</label>
                    <select
                      value={activeCallup.captain}
                      onChange={(e) => setActiveCallup({ ...activeCallup, captain: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Selecione...</option>
                      {[...activeCallup.goalkeepers, ...activeCallup.players].map(id => {
                        const ag = data.agents.find(a => a.id === id);
                        return <option key={id} value={id}>#{ag?.number} {ag?.name}</option>;
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">Vice-Capitão (V)</label>
                    <select
                      value={activeCallup.viceCaptain}
                      onChange={(e) => setActiveCallup({ ...activeCallup, viceCaptain: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
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
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={14} /> SALVAR CONVOCATÓRIA
                </button>
              </div>
            )}
          </div>

          {/* Selector and Sheet PDF Rendering */}
          <div className="lg:col-span-2 space-y-6">
            {!activeGame ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <Info size={32} className="text-neutral-700 mb-2" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">Nenhum jogo selecionado</h3>
                <p className="text-neutral-500 text-xs mt-1">Crie jogos na aba "Jogos" ou selecione um acima para iniciar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Squad Checklist selectors */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider">Selecionar Jogadores</h3>
                  
                  <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                    {/* Goalkeepers */}
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1.5 font-bold">Guarda-Redes / Goleiros</span>
                      <div className="space-y-1.5">
                        {data.agents.filter(a => a.category === 'Jogador' && a.position === 'Goleiro').map(ag => {
                          const isSelected = activeCallup.goalkeepers.includes(ag.id);
                          return (
                            <label key={ag.id} className="flex items-center gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 cursor-pointer text-xs font-mono hover:border-emerald-500/30">
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

                    {/* Field Players */}
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1.5 font-bold">Jogadores de Linha</span>
                      <div className="space-y-1.5">
                        {data.agents.filter(a => a.category === 'Jogador' && a.position !== 'Goleiro').map(ag => {
                          const isSelected = activeCallup.players.includes(ag.id);
                          return (
                            <label key={ag.id} className="flex items-center gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 cursor-pointer text-xs font-mono hover:border-emerald-500/30">
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

                    {/* Staff */}
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider block mb-1.5 font-bold">Comissão Técnica / Staff</span>
                      <div className="space-y-1.5">
                        {data.agents.filter(a => a.category === 'Comissão Técnica').map(ag => {
                          const isSelected = activeCallup.staff.includes(ag.id);
                          return (
                            <label key={ag.id} className="flex items-center gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 cursor-pointer text-xs font-mono hover:border-emerald-500/30">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  let stf = [...activeCallup.staff];
                                  if (isSelected) stf = stf.filter(id => id !== ag.id);
                                  else stf.push(ag.id);
                                  setActiveCallup({ ...activeCallup, staff: stf });
                                }}
                                className="accent-emerald-500"
                              />
                              <span>{ag.emoji} {ag.name} ({ag.position})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PDF Print preview card */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider">Folha de Convocação</h3>
                      <button 
                        onClick={() => window.print()}
                        className="text-neutral-500 hover:text-white p-1 rounded hover:bg-neutral-950"
                        title="Imprimir / Exportar PDF"
                      >
                        <Printer size={16} />
                      </button>
                    </div>

                    {/* Print Preview Container */}
                    <div id="printable-convocation" className="bg-white text-black p-6 rounded-lg font-sans border border-neutral-200 print:border-none print:shadow-none space-y-4 print:p-0">
                      <style>{`
                        @media print {
                          body * { visibility: hidden; }
                          #printable-convocation, #printable-convocation * { visibility: visible; }
                          #printable-convocation { position: absolute; left: 0; top: 0; width: 100%; }
                        }
                      `}</style>
                      
                      <div className="text-center border-b pb-3">
                        <div className="text-2xl font-bold flex items-center justify-center gap-1">
                          {data.teamEmoji} <span className="font-mono text-lg uppercase font-black">{data.teamName}</span>
                        </div>
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider mt-0.5">Folha Oficial de Convocação</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className="font-bold">Partida:</span> vs {activeOpponent?.name}</div>
                        <div><span className="font-bold">Competição:</span> {activeGame.competition}</div>
                        <div><span className="font-bold">Pavilhão:</span> {activeGame.pavilion}</div>
                        <div><span className="font-bold">Data:</span> {activeGame.date} ({activeGame.homeAway})</div>
                      </div>

                      <div className="border-t pt-3 space-y-3">
                        {/* GRs */}
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 border-b pb-0.5 mb-1 font-mono">Guarda-Redes (GR)</h4>
                          <ul className="text-xs font-mono space-y-0.5">
                            {activeCallup.goalkeepers.map(id => {
                              const ag = data.agents.find(a => a.id === id);
                              return (
                                <li key={id} className="flex justify-between">
                                  <span>#{ag?.number} - {ag?.name}</span>
                                  {activeCallup.captain === id && <span className="font-bold text-[10px] bg-neutral-100 px-1 rounded">C</span>}
                                  {activeCallup.viceCaptain === id && <span className="font-bold text-[10px] bg-neutral-100 px-1 rounded">V</span>}
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Players */}
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 border-b pb-0.5 mb-1 font-mono">Jogadores de Linha</h4>
                          <ul className="text-xs font-mono space-y-0.5">
                            {activeCallup.players.map(id => {
                              const ag = data.agents.find(a => a.id === id);
                              return (
                                <li key={id} className="flex justify-between">
                                  <span>#{ag?.number} - {ag?.name} ({ag?.position})</span>
                                  <div className="flex gap-1">
                                    {activeCallup.captain === id && <span className="font-bold text-[10px] bg-neutral-200 px-1 rounded">(C)</span>}
                                    {activeCallup.viceCaptain === id && <span className="font-bold text-[10px] bg-neutral-200 px-1 rounded">(V)</span>}
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Staff */}
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 border-b pb-0.5 mb-1 font-mono">Comissão Técnica</h4>
                          <ul className="text-xs font-mono space-y-0.5">
                            {activeCallup.staff.map(id => {
                              const ag = data.agents.find(a => a.id === id);
                              return <li key={id}>• {ag?.name} ({ag?.position})</li>;
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => window.print()}
                    className="w-full bg-neutral-950 hover:bg-neutral-800 text-neutral-300 font-bold font-mono text-xs py-2 rounded-lg border border-neutral-800 transition-all flex items-center justify-center gap-1.5 mt-4"
                  >
                    <Printer size={14} /> GERAR E IMPRIMIR PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- AGENTES / ELENCO --- */}
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
            }} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Plus size={14} className="text-emerald-400" /> Novo Agente / Atleta
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Número do Manto</label>
                    <input
                      type="text"
                      value={newAgent.number}
                      onChange={(e) => setNewAgent({ ...newAgent, number: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Emoji / Ícone</label>
                    <input
                      type="text"
                      value={newAgent.emoji}
                      onChange={(e) => setNewAgent({ ...newAgent, emoji: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Categoria</label>
                  <select
                    value={newAgent.category}
                    onChange={(e) => setNewAgent({ ...newAgent, category: e.target.value, position: e.target.value === 'Comissão Técnica' ? 'Treinador' : 'Ala' })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
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
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
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
                ADICIONAR AO ELENCO
              </button>
            </form>
          </div>

          {/* List of squad members */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                <span>Elenco Atual ({data.agents.length} Agentes)</span>
              </h2>

              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                {data.agents.map((ag) => (
                  <div key={ag.id} className="flex justify-between items-center bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                    <div className="flex items-center gap-3">
                      <span className="text-lg bg-neutral-900 w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-800">{ag.emoji}</span>
                      <div className="font-mono text-xs">
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
                      className="text-neutral-600 hover:text-red-400 p-1.5 rounded hover:bg-neutral-900 transition-all"
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

      {/* --- JOGOS / PARTIDAS --- */}
      {activeTab === 'jogos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create game form */}
          <div className="lg:col-span-1">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newGame.opponentId || !newGame.date) return;
              const nGame = { ...newGame, id: Date.now().toString() };
              saveChange({ ...data, games: [...data.games, nGame] });
              setNewGame({ opponentId: '', competition: data.competitions[0] || '', date: '', pavilion: data.pavilions[0] || '', homeAway: 'Casa', round: '' });
            }} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Plus size={14} className="text-emerald-400" /> Novo Jogo / Confronto
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Adversário</label>
                  <select
                    required
                    value={newGame.opponentId}
                    onChange={(e) => setNewGame({ ...newGame, opponentId: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Selecione...</option>
                    {data.opponents.map((o) => (
                      <option key={o.id} value={o.id}>{o.emoji} {o.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Competição</label>
                  <select
                    value={newGame.competition}
                    onChange={(e) => setNewGame({ ...newGame, competition: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Selecione...</option>
                    {data.competitions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Jornada / Rodada</label>
                    <input
                      type="text"
                      placeholder="Ex: 1ª Jornada"
                      value={newGame.round}
                      onChange={(e) => setNewGame({ ...newGame, round: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Data</label>
                    <input
                      type="date"
                      required
                      value={newGame.date}
                      onChange={(e) => setNewGame({ ...newGame, date: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Pavilhão / Local</label>
                    <select
                      value={newGame.pavillion}
                      onChange={(e) => setNewGame({ ...newGame, pavilion: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    >
                      {data.pavilions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Localização</label>
                    <select
                      value={newGame.homeAway}
                      onChange={(e) => setNewGame({ ...newGame, homeAway: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none"
                    >
                      <option value="Casa">Casa</option>
                      <option value="Fora">Fora</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
              >
                CRIAR JOGO
              </button>
            </form>
          </div>

          {/* List of games */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Jogos Registrados</h2>

              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                {data.games.map((g) => {
                  const opp = data.opponents.find(o => o.id === g.opponentId);
                  return (
                    <div key={g.id} className="flex justify-between items-center bg-neutral-950 p-4 rounded-lg border border-neutral-850">
                      <div className="font-mono text-xs space-y-1">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="text-[10px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-bold uppercase tracking-wider">{g.homeAway}</span>
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
                        className="text-neutral-600 hover:text-red-400 p-1.5 rounded hover:bg-neutral-900 transition-all"
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

      {/* --- ADVERSÁRIOS --- */}
      {activeTab === 'adversarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Opponent Form */}
          <div className="lg:col-span-1">
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newOpponent.name) return;
              const nOpp = { ...newOpponent, id: Date.now().toString() };
              saveChange({ ...data, opponents: [...data.opponents, nOpp] });
              setNewOpponent({ name: '', emoji: '🛡️' });
            }} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Plus size={14} className="text-emerald-400" /> Novo Adversário
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Nome do Clube</label>
                  <input
                    type="text"
                    required
                    value={newOpponent.name}
                    onChange={(e) => setNewOpponent({ ...newOpponent, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Emoji / Escudo</label>
                  <input
                    type="text"
                    value={newOpponent.emoji}
                    onChange={(e) => setNewOpponent({ ...newOpponent, emoji: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
              >
                CRIAR CLUBE ADVERSÁRIO
              </button>
            </form>
          </div>

          {/* List of opponents */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Clubes Adversários</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                {data.opponents.map((o) => (
                  <div key={o.id} className="flex justify-between items-center bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                    <div className="flex items-center gap-3">
                      <span className="text-lg bg-neutral-900 w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-850">{o.emoji}</span>
                      <span className="font-mono text-xs text-white font-bold">{o.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        saveChange({ ...data, opponents: data.opponents.filter(opp => opp.id !== o.id) });
                      }}
                      className="text-neutral-600 hover:text-red-400 p-1.5 rounded hover:bg-neutral-900 transition-all"
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

      {/* --- CONFIGURAÇÃO --- */}
      {activeTab === 'config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main settings */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <Settings size={14} className="text-emerald-400" /> Configuração do Clube / Time
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Nome do Meu Time</label>
                <input
                  type="text"
                  value={data.teamName}
                  onChange={(e) => saveChange({ ...data, teamName: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Escudo / Emoji do Time</label>
                <input
                  type="text"
                  value={data.teamEmoji}
                  onChange={(e) => saveChange({ ...data, teamEmoji: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Pavilion (Venue) manager */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-emerald-400" /> Locais / Pavilhões
            </h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newPavilion) return;
              saveChange({ ...data, pavilions: [...data.pavilions, newPavilion] });
              setNewPavilion('');
            }} className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Arena da FSL"
                value={newPavilion}
                onChange={(e) => setNewPavilion(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
              <button 
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 rounded-lg font-bold font-mono text-xs"
              >
                + ADD
              </button>
            </form>

            <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
              {data.pavilions.map((p) => (
                <div key={p} className="flex justify-between items-center bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-850 text-xs font-mono">
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
          </div>
        </div>
      )}

    </div>
  );
}

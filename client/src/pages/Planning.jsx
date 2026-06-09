import React, { useState, useEffect } from 'react';
import { 
  Calendar, Check, X, AlertCircle, Clock, Save, 
  BarChart, List, Plus, Trash2, ShieldAlert, Award 
} from 'lucide-react';

export default function Planning() {
  const [activeTab, setActiveTab] = useState('calendario');
  const [squad, setSquad] = useState([]);
  const [trainings, setTrainings] = useState([
    {
      id: 't1',
      date: '2026-06-10',
      time: '19:00',
      duration: 90,
      title: 'Treino Técnico-Tático',
      category: 'Tático',
      intensity: 'Média',
      attendance: {
        '1': 'Presente',
        '2': 'Presente',
        '3': 'Lesionado',
        '4': 'Ausente'
      }
    }
  ]);

  // Load squad roster
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_callups_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSquad(parsed.agents?.filter(a => a.category === 'Jogador') || []);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Load trainings database
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_trainings_db');
    if (saved) {
      try {
        setTrainings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveTrainings = (newTrainings) => {
    setTrainings(newTrainings);
    localStorage.setItem('sportluiz_trainings_db', JSON.stringify(newTrainings));
  };

  // CRUD new training
  const [newTraining, setNewTraining] = useState({
    date: '',
    time: '',
    duration: 90,
    title: '',
    category: 'Tático',
    intensity: 'Média'
  });

  const handleCreateTraining = (e) => {
    e.preventDefault();
    if (!newTraining.title || !newTraining.date) return;
    
    // Initialize empty attendance mapping for the squad
    const initialAttendance = {};
    squad.forEach(pl => {
      initialAttendance[pl.id] = 'Presente'; // default
    });

    const newTObj = {
      id: Date.now().toString(),
      ...newTraining,
      attendance: initialAttendance
    };

    saveTrainings([newTObj, ...trainings]);
    setNewTraining({ date: '', time: '', duration: 90, title: '', category: 'Tático', intensity: 'Média' });
    alert('Sessão de treino agendada com sucesso!');
  };

  const handleDeleteTraining = (id) => {
    saveTrainings(trainings.filter(t => t.id !== id));
  };

  // Attendance Sheet selection
  const [selectedTrainingId, setSelectedTrainingId] = useState(trainings[0]?.id || '');
  const activeTraining = trainings.find(t => t.id === selectedTrainingId);

  const handleUpdateAttendance = (playerId, status) => {
    if (!activeTraining) return;
    const updated = trainings.map(t => {
      if (t.id === selectedTrainingId) {
        return {
          ...t,
          attendance: {
            ...t.attendance,
            [playerId]: status
          }
        };
      }
      return t;
    });
    saveTrainings(updated);
  };

  // Stats calculators
  const computeAttendanceRate = (training) => {
    if (!training || !squad.length) return 0;
    const attMap = training.attendance || {};
    const presents = Object.values(attMap).filter(v => v === 'Presente').length;
    return Math.round((presents / squad.length) * 100);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="border-b border-neutral-900 pb-5">
        <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase flex items-center gap-2">
          <Calendar className="text-emerald-400" /> Planeamento & Periodização
        </h1>
        <p className="text-neutral-500 text-xs mt-1">Planeje o ciclo de treinamentos, registre presença de atletas e acompanhe a carga de trabalho</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-900 overflow-x-auto custom-scrollbar">
        {[
          { id: 'calendario', label: 'Agenda de Treinos', icon: Calendar },
          { id: 'chamada', label: 'Folha de Chamada / Presença', icon: Clock },
          { id: 'stats', label: 'Métricas de Trabalho', icon: BarChart }
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

      {/* --- TAB: AGENDA / CALENDÁRIO --- */}
      {activeTab === 'calendario' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create training schedule */}
          <div className="lg:col-span-1">
            <form onSubmit={handleCreateTraining} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                <Plus size={14} className="text-emerald-400" /> Agendar Treinamento
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Título do Treino</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Treino de Finalização"
                    value={newTraining.title}
                    onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Data</label>
                    <input
                      type="date"
                      required
                      value={newTraining.date}
                      onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Hora</label>
                    <input
                      type="time"
                      value={newTraining.time}
                      onChange={(e) => setNewTraining({ ...newTraining, time: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Duração (Min)</label>
                    <input
                      type="number"
                      value={newTraining.duration}
                      onChange={(e) => setNewTraining({ ...newTraining, duration: parseInt(e.target.value) || 0 })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Intensidade</label>
                    <select
                      value={newTraining.intensity}
                      onChange={(e) => setNewTraining({ ...newTraining, intensity: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Baixa">Baixa 🟢</option>
                      <option value="Média">Média 🟡</option>
                      <option value="Alta">Alta 🔴</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Categoria Física</label>
                  <select
                    value={newTraining.category}
                    onChange={(e) => setNewTraining({ ...newTraining, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tático">Tático / Posicionamento</option>
                    <option value="Técnico">Técnico / Exercício Base</option>
                    <option value="Físico">Físico / Potência</option>
                    <option value="Recuperação">Recuperação / Fisioterapia</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
              >
                AGENDAR SESSÃO
              </button>
            </form>
          </div>

          {/* List of scheduled trainings */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest mb-4">Agenda da Temporada</h2>

              <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                {trainings.length === 0 ? (
                  <p className="text-[11px] text-neutral-600 font-mono py-4 text-center">Nenhum treino agendado.</p>
                ) : (
                  trainings.map((t) => (
                    <div key={t.id} className="flex justify-between items-center bg-neutral-950 p-4 rounded-lg border border-neutral-850">
                      <div className="font-mono text-xs space-y-1">
                        <div className="font-bold text-white uppercase">{t.title}</div>
                        <div className="text-[10px] text-neutral-500">
                          ⏱️ {t.duration} min • 🏷️ {t.category} • Carga: <span className={
                            t.intensity === 'Alta' ? 'text-rose-400' :
                            t.intensity === 'Média' ? 'text-amber-400' : 'text-emerald-400'
                          }>{t.intensity}</span>
                        </div>
                        <div className="text-[10px] text-neutral-600">📅 {t.date} às {t.time || 'Sem hora'}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
                          {computeAttendanceRate(t)}% Presença
                        </span>
                        <button
                          onClick={() => handleDeleteTraining(t.id)}
                          className="text-neutral-600 hover:text-red-400 p-1.5 rounded hover:bg-neutral-900 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB: CHAMADA / PRESENÇAS --- */}
      {activeTab === 'chamada' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Training Selector panel */}
          <div className="lg:col-span-1 bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Selecionar Treino</h2>
            <select
              value={selectedTrainingId}
              onChange={(e) => setSelectedTrainingId(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:outline-none transition-all"
            >
              <option value="">Selecione uma sessão...</option>
              {trainings.map((t) => (
                <option key={t.id} value={t.id}>{t.title} ({t.date})</option>
              ))}
            </select>

            {activeTraining && (
              <div className="bg-neutral-950 border border-neutral-900/60 p-4 rounded-lg space-y-2 text-xs font-mono text-neutral-400">
                <div><span className="text-neutral-600 font-bold uppercase">Métricas da Chamada:</span></div>
                <div className="flex justify-between"><span>Atletas no Elenco:</span> <span className="text-white font-bold">{squad.length}</span></div>
                <div className="flex justify-between"><span>Presença Registrada:</span> <span className="text-emerald-400 font-bold">{computeAttendanceRate(activeTraining)}%</span></div>
              </div>
            )}
          </div>

          {/* Roster attendance checklist table */}
          <div className="lg:col-span-2">
            {!activeTraining ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
                <ShieldAlert size={32} className="text-neutral-700 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">Nenhum treino selecionado</h3>
                <p className="text-neutral-500 text-xs mt-1">Selecione uma sessão de treino no painel lateral.</p>
              </div>
            ) : squad.length === 0 ? (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center text-xs font-mono text-neutral-500">
                Nenhum jogador cadastrado no elenco. Adicione atletas na aba "Convocatórias - Elenco".
              </div>
            ) : (
              <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                <h2 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-wider flex justify-between">
                  <span>Lista de Presença - {activeTraining.title}</span>
                  <span className="text-neutral-500">{activeTraining.date}</span>
                </h2>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                  {squad.map((pl) => {
                    const status = activeTraining.attendance?.[pl.id] || 'Presente';
                    return (
                      <div key={pl.id} className="flex justify-between items-center bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                        <span className="text-xs font-mono font-bold text-white">{pl.emoji} #{pl.number} - {pl.name}</span>
                        
                        {/* Attendance Toggle Buttons */}
                        <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 gap-1">
                          {[
                            { name: 'Presente', label: 'P', color: 'bg-emerald-500 text-black font-black' },
                            { name: 'Ausente', label: 'A', color: 'bg-red-500 text-black font-black' },
                            { name: 'Lesionado', label: 'L', color: 'bg-amber-500 text-black font-black' }
                          ].map((st) => (
                            <button
                              key={st.name}
                              onClick={() => handleUpdateAttendance(pl.id, st.name)}
                              className={`px-3 py-1 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                status === st.name ? st.color : 'text-neutral-500 hover:text-neutral-300'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB: METRICS / CHARTS --- */}
      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Workload metric summary */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              📈 Estatísticas de Treinos
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 text-center font-mono">
                <div className="text-3xl font-black text-emerald-400">{trainings.length}</div>
                <div className="text-[10px] text-neutral-500 uppercase mt-1">Sessões Agendadas</div>
              </div>
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-850 text-center font-mono">
                <div className="text-3xl font-black text-amber-500">
                  {trainings.length > 0 
                    ? Math.round(trainings.reduce((acc, t) => acc + computeAttendanceRate(t), 0) / trainings.length) 
                    : 0}%
                </div>
                <div className="text-[10px] text-neutral-500 uppercase mt-1">Média de Presença</div>
              </div>
            </div>
          </div>

          {/* Categories workload distribution */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest">Carga de Exercícios por Categoria</h2>
            
            <div className="space-y-3 font-mono text-xs">
              {['Tático', 'Técnico', 'Físico', 'Recuperação'].map((cat) => {
                const count = trainings.filter(t => t.category === cat).length;
                const pct = trainings.length > 0 ? Math.round((count / trainings.length) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="font-bold text-neutral-300">{cat}</span>
                      <span className="text-neutral-500">{count} Treinos ({pct}%)</span>
                    </div>
                    {/* Workload Bar */}
                    <div className="w-full bg-neutral-950 rounded-full h-1.5 border border-neutral-850">
                      <div style={{ width: `${pct}%` }} className="bg-emerald-500 h-full rounded-full transition-all"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

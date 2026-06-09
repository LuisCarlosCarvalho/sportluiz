import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, BarChart2, Calendar, Award, 
  Trash2, Plus, Info, CheckCircle2, User, Activity 
} from 'lucide-react';

export default function AthleteJournal() {
  const [squad, setSquad] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  
  // Dynamic stats calculated from localStorage
  const [playerAttendance, setPlayerAttendance] = useState({ present: 0, absent: 0, injured: 0, rate: 0 });
  const [playerMatchStats, setPlayerMatchStats] = useState({ passes: 0, shots: 0, fouls: 0, goals: 0, interceptions: 0 });
  
  // Custom Coach Journal entries for this athlete
  const [journalEntries, setJournalEntries] = useState([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [newEntryRating, setNewEntryRating] = useState(5); // 1-5 rating

  // Load squad
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_callups_db');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const players = parsed.agents?.filter(a => a.category === 'Jogador') || [];
        setSquad(players);
        if (players.length > 0) {
          setSelectedPlayerId(players[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Compute dynamic stats and load journal logs whenever selectedPlayerId changes
  useEffect(() => {
    if (!selectedPlayerId) return;

    // 1. Calculate Attendance Stats from Trainings DB
    const savedTrainings = localStorage.getItem('sportluiz_trainings_db');
    let present = 0, absent = 0, injured = 0;
    if (savedTrainings) {
      try {
        const trainings = JSON.parse(savedTrainings) || [];
        trainings.forEach(t => {
          const status = t.attendance?.[selectedPlayerId];
          if (status === 'Presente') present += 1;
          else if (status === 'Ausente') absent += 1;
          else if (status === 'Lesionado') injured += 1;
        });
      } catch (e) {
        console.error(e);
      }
    }
    const totalSess = present + absent + injured;
    const rate = totalSess > 0 ? Math.round((present / totalSess) * 100) : 100;
    setPlayerAttendance({ present, absent, injured, rate });

    // 2. Aggregate Match Stats from all games events
    let passes = 0, shots = 0, fouls = 0, goals = 0, interceptions = 0;
    
    // Look up all sportluiz_events_ keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('sportluiz_events_')) {
        try {
          const gameEvents = JSON.parse(localStorage.getItem(key)) || [];
          gameEvents.forEach(ev => {
            if (ev.playerId === selectedPlayerId) {
              if (ev.type === 'PASS') passes += 1;
              else if (ev.type === 'SHOT') shots += 1;
              else if (ev.type === 'FOUL') fouls += 1;
              else if (ev.type === 'GOAL') goals += 1;
              else if (ev.type === 'INTERCEPTION') interceptions += 1;
            }
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    setPlayerMatchStats({ passes, shots, fouls, goals, interceptions });

    // 3. Load coach notes entries
    const savedEntries = localStorage.getItem(`sportluiz_journal_${selectedPlayerId}`);
    if (savedEntries) {
      try {
        setJournalEntries(JSON.parse(savedEntries));
      } catch (e) {
        console.error(e);
      }
    } else {
      setJournalEntries([]);
    }

  }, [selectedPlayerId]);

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!newEntryText || !selectedPlayerId) return;

    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      text: newEntryText,
      rating: newEntryRating
    };

    const updated = [newEntry, ...journalEntries];
    setJournalEntries(updated);
    localStorage.setItem(`sportluiz_journal_${selectedPlayerId}`, JSON.stringify(updated));
    setNewEntryText('');
    setNewEntryRating(5);
  };

  const handleDeleteEntry = (entryId) => {
    const updated = journalEntries.filter(ent => ent.id !== entryId);
    setJournalEntries(updated);
    localStorage.setItem(`sportluiz_journal_${selectedPlayerId}`, JSON.stringify(updated));
  };

  const selectedPlayer = squad.find(p => p.id === selectedPlayerId);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase flex items-center gap-2">
            <BookOpen className="text-emerald-400" /> Diário de Rendimento do Atleta
          </h1>
          <p className="text-neutral-500 text-xs mt-1">Acompanhamento individual de assiduidade, telemetria de jogo e anotações do treinador</p>
        </div>

        {/* Player Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-400 font-bold uppercase tracking-wider">Atleta:</span>
          <select
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
          >
            {squad.map((p) => (
              <option key={p.id} value={p.id}>{p.emoji} #{p.number} - {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedPlayer ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-12 text-center">
          <User size={32} className="text-neutral-700 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">Nenhum Atleta Cadastrado</h3>
          <p className="text-neutral-500 text-xs mt-1">Cadastre jogadores na aba de Convocatórias para habilitar o Diário.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Columns: Profile Summary & Stats */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Profile Summary */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 text-center space-y-3 shadow-xl">
              <span className="text-4xl bg-neutral-950 w-16 h-16 rounded-2xl flex items-center justify-center border border-neutral-850 mx-auto">
                {selectedPlayer.emoji}
              </span>
              <div className="font-mono text-xs">
                <h3 className="text-base font-black text-white">#{selectedPlayer.number} {selectedPlayer.name}</h3>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">{selectedPlayer.position}</span>
              </div>
            </div>

            {/* Attendance Metrics summary */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <h4 className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Frequência em Treinos</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                  <div className="text-emerald-400 font-bold">{playerAttendance.present}</div>
                  <div className="text-[9px] text-neutral-600">Presença</div>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                  <div className="text-rose-400 font-bold">{playerAttendance.absent}</div>
                  <div className="text-[9px] text-neutral-600">Ausência</div>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850">
                  <div className="text-amber-400 font-bold">{playerAttendance.injured}</div>
                  <div className="text-[9px] text-neutral-600">Lesão</div>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-1">
                  <span>Assiduidade Geral</span>
                  <span>{playerAttendance.rate}%</span>
                </div>
                <div className="w-full bg-neutral-950 rounded-full h-1.5 border border-neutral-850">
                  <div style={{ width: `${playerAttendance.rate}%` }} className="bg-emerald-500 h-full rounded-full transition-all"></div>
                </div>
              </div>
            </div>

            {/* Telemetry Stats Summary */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <h4 className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold">Métricas Acumuladas em Jogos</h4>
              
              <div className="space-y-2 text-xs font-mono">
                {[
                  { label: '⚽ Golos Marcados', val: playerMatchStats.goals },
                  { label: '👟 Passes Realizados', val: playerMatchStats.passes },
                  { label: '🎯 Finalizações', val: playerMatchStats.shots },
                  { label: '🛡️ Desarmes / Intercepções', val: playerMatchStats.interceptions },
                  { label: '⚠️ Faltas Cometidas', val: playerMatchStats.fouls }
                ].map((stat, idx) => (
                  <div key={idx} className="flex justify-between bg-neutral-950 p-2.5 rounded border border-neutral-850">
                    <span className="text-neutral-400">{stat.label}</span>
                    <span className="text-white font-bold">{stat.val}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Columns: Coach Notes Journal logs */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Create Notes form */}
            <form onSubmit={handleAddEntry} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                + Nova Anotação Tática
              </h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Avaliação do Treino (1-5)</label>
                    <select
                      value={newEntryRating}
                      onChange={(e) => setNewEntryRating(parseInt(e.target.value))}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    >
                      {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>⭐ {r} / 5</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Anotações de Rendimento</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Descreva a atitude, pontos táticos a melhorar ou rendimento do atleta..."
                    value={newEntryText}
                    onChange={(e) => setNewEntryText(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs px-5 py-2 rounded-lg transition-all"
              >
                REGISTRAR NOTA DE RENDIMENTO
              </button>
            </form>

            {/* List of journal entries */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest border-b border-neutral-850 pb-2">
                Histórico do Diário
              </h2>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {journalEntries.length === 0 ? (
                  <div className="text-center py-12 text-[10px] font-mono text-neutral-600">
                    Nenhuma anotação de rendimento registrada para este atleta.
                  </div>
                ) : (
                  journalEntries.map((ent) => (
                    <div key={ent.id} className="bg-neutral-950 p-4 rounded-lg border border-neutral-850 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded text-neutral-400 font-bold">{ent.date}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-amber-400 font-bold">{"⭐".repeat(ent.rating)}</span>
                          <button
                            onClick={() => handleDeleteEntry(ent.id)}
                            className="text-neutral-700 hover:text-red-400"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-neutral-300 leading-relaxed">{ent.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}

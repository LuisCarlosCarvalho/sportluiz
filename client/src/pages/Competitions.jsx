import React, { useState, useEffect } from 'react';
import { 
  Trophy, Plus, Trash2, Award, Info, 
  ChevronRight, Calendar, AlertCircle, RotateCcw 
} from 'lucide-react';

export default function Competitions() {
  const [clubs, setClubs] = useState([
    { id: '1', name: 'SportLuiz Futsal', emoji: '⚽' },
    { id: '2', name: 'Benfica Futsal', emoji: '🦅' },
    { id: '3', name: 'Sporting CP', emoji: '🦁' },
    { id: '4', name: 'Braga Futsal', emoji: '🛡️' }
  ]);
  const [newClubName, setNewClubName] = useState('');
  const [newClubEmoji, setNewClubEmoji] = useState('🛡️');

  const [matches, setMatches] = useState([
    { id: '1', homeId: '1', awayId: '2', homeGoals: 4, awayGoals: 2 },
    { id: '2', homeId: '3', awayId: '4', homeGoals: 2, awayGoals: 2 },
    { id: '3', homeId: '2', awayId: '3', homeGoals: 1, awayGoals: 3 }
  ]);
  const [homeClubId, setHomeClubId] = useState('');
  const [awayClubId, setAwayClubId] = useState('');
  const [homeGoalsInput, setHomeGoalsInput] = useState(0);
  const [awayGoalsInput, setAwayGoalsInput] = useState(0);

  // Load standings data
  useEffect(() => {
    const savedClubs = localStorage.getItem('sportluiz_league_clubs');
    const savedMatches = localStorage.getItem('sportluiz_league_matches');
    if (savedClubs) setClubs(JSON.parse(savedClubs));
    if (savedMatches) setMatches(JSON.parse(savedMatches));
  }, []);

  const saveState = (updatedClubs, updatedMatches) => {
    setClubs(updatedClubs);
    setMatches(updatedMatches);
    localStorage.setItem('sportluiz_league_clubs', JSON.stringify(updatedClubs));
    localStorage.setItem('sportluiz_league_matches', JSON.stringify(updatedMatches));
  };

  const handleAddClub = (e) => {
    e.preventDefault();
    if (!newClubName) return;
    const nClub = {
      id: Date.now().toString(),
      name: newClubName,
      emoji: newClubEmoji
    };
    saveState([...clubs, nClub], matches);
    setNewClubName('');
  };

  const handleDeleteClub = (id) => {
    const updatedClubs = clubs.filter(c => c.id !== id);
    const updatedMatches = matches.filter(m => m.homeId !== id && m.awayId !== id);
    saveState(updatedClubs, updatedMatches);
  };

  const handleAddMatch = (e) => {
    e.preventDefault();
    if (!homeClubId || !awayClubId || homeClubId === awayClubId) {
      alert("Selecione dois clubes diferentes para o confronto.");
      return;
    }
    const nMatch = {
      id: Date.now().toString(),
      homeId: homeClubId,
      awayId: awayClubId,
      homeGoals: parseInt(homeGoalsInput) || 0,
      awayGoals: parseInt(awayGoalsInput) || 0
    };
    saveState(clubs, [nMatch, ...matches]);
    setHomeClubId('');
    setAwayClubId('');
    setHomeGoalsInput(0);
    setAwayGoalsInput(0);
  };

  const handleDeleteMatch = (id) => {
    saveState(clubs, matches.filter(m => m.id !== id));
  };

  const handleResetLeague = () => {
    if (confirm("Tem certeza que deseja apagar todos os jogos e reiniciar o torneio?")) {
      saveState(clubs, []);
    }
  };

  // Standings generator logic
  const calculateStandings = () => {
    // Initialize stats structure for each club
    const stats = {};
    clubs.forEach(c => {
      stats[c.id] = {
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0
      };
    });

    // Compute matches stats
    matches.forEach(m => {
      const h = stats[m.homeId];
      const a = stats[m.awayId];
      if (!h || !a) return; // skip deleted clubs

      h.played += 1;
      a.played += 1;
      h.goalsFor += m.homeGoals;
      h.goalsAgainst += m.awayGoals;
      a.goalsFor += m.awayGoals;
      a.goalsAgainst += m.homeGoals;

      if (m.homeGoals > m.awayGoals) {
        h.wins += 1;
        h.points += 3;
        a.losses += 1;
      } else if (m.homeGoals < m.awayGoals) {
        a.wins += 1;
        a.points += 3;
        h.losses += 1;
      } else {
        h.draws += 1;
        h.points += 1;
        a.draws += 1;
        a.points += 1;
      }

      h.goalDiff = h.goalsFor - h.goalsAgainst;
      a.goalDiff = a.goalsFor - a.goalsAgainst;
    });

    // Convert object to array and sort by Points desc, Goal Diff desc, Goals For desc
    return Object.values(stats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
      return b.goalsFor - a.goalsFor;
    });
  };

  const standings = calculateStandings();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase flex items-center gap-2">
            <Trophy className="text-emerald-400" /> Gestor de Competições
          </h1>
          <p className="text-neutral-500 text-xs mt-1">Simulador e organizador de campeonatos de pontos corridos com tabela auto-classificada</p>
        </div>

        <button
          onClick={handleResetLeague}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-950/20 bg-neutral-950 text-red-400 hover:bg-red-950/10 text-xs font-mono rounded-lg transition-all"
        >
          <RotateCcw size={13} /> Reiniciar Liga
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Columns: Config and matches inputs */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Add club */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              🛡️ Adicionar Clubes
            </h2>
            <form onSubmit={handleAddClub} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Nome do Clube</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Porto Futsal"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Emoji / Escudo</label>
                <input
                  type="text"
                  value={newClubEmoji}
                  onChange={(e) => setNewClubEmoji(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
              >
                CADASTRAR CLUBE
              </button>
            </form>
          </div>

          {/* Record results */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              ⚽ Inserir Placar
            </h2>
            <form onSubmit={handleAddMatch} className="space-y-4">
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Mandante</label>
                  <select
                    required
                    value={homeClubId}
                    onChange={(e) => setHomeClubId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Selecione...</option>
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    value={homeGoalsInput}
                    onChange={(e) => setHomeGoalsInput(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs font-mono text-white text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="text-center font-mono text-xs text-neutral-600 font-bold">X</div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Visitante</label>
                  <select
                    required
                    value={awayClubId}
                    onChange={(e) => setAwayClubId(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Selecione...</option>
                    {clubs.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min="0"
                    value={awayGoalsInput}
                    onChange={(e) => setAwayGoalsInput(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-850 rounded-lg px-3 py-2 text-xs font-mono text-white text-center focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
              >
                REGISTRAR CONFRONTÃO
              </button>
            </form>
          </div>

        </div>

        {/* Center Canvas: Live Sorted Standings Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl">
            <h2 className="text-xs font-bold font-mono text-neutral-300 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Award size={14} className="text-emerald-400" /> Tabela de Classificação
            </h2>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left font-mono text-xs select-none">
                <thead>
                  <tr className="border-b border-neutral-800 text-[10px] text-neutral-500 uppercase font-bold">
                    <th className="py-2.5 w-8 text-center">Pos</th>
                    <th className="py-2.5">Clube</th>
                    <th className="py-2.5 w-10 text-center">P</th>
                    <th className="py-2.5 w-8 text-center">J</th>
                    <th className="py-2.5 w-8 text-center">V</th>
                    <th className="py-2.5 w-8 text-center">E</th>
                    <th className="py-2.5 w-8 text-center">D</th>
                    <th className="py-2.5 w-10 text-center">GM</th>
                    <th className="py-2.5 w-10 text-center">GS</th>
                    <th className="py-2.5 w-10 text-center">DG</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850 text-neutral-300">
                  {standings.map((st, index) => (
                    <tr 
                      key={st.id} 
                      className={`hover:bg-neutral-950/40 transition-colors ${
                        index === 0 ? 'bg-emerald-950/10 text-emerald-400 font-extrabold' : ''
                      }`}
                    >
                      <td className="py-3 text-center text-neutral-500">{index + 1}</td>
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        <span>{st.emoji}</span> <span>{st.name}</span>
                      </td>
                      <td className="py-3 text-center text-white font-extrabold">{st.points}</td>
                      <td className="py-3 text-center">{st.played}</td>
                      <td className="py-3 text-center">{st.wins}</td>
                      <td className="py-3 text-center">{st.draws}</td>
                      <td className="py-3 text-center">{st.losses}</td>
                      <td className="py-3 text-center">{st.goalsFor}</td>
                      <td className="py-3 text-center">{st.goalsAgainst}</td>
                      <td className={`py-3 text-center font-bold ${
                        st.goalDiff > 0 ? 'text-emerald-500' :
                        st.goalDiff < 0 ? 'text-rose-500' : 'text-neutral-500'
                      }`}>{st.goalDiff > 0 ? `+${st.goalDiff}` : st.goalDiff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Fixtures list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between h-[510px]">
            <div className="space-y-4 flex-grow overflow-hidden flex flex-col min-h-0">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest border-b border-neutral-850 pb-2">
                Jogos da Rodada
              </h2>

              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-grow pr-1">
                {matches.length === 0 ? (
                  <div className="text-center py-16 text-[10px] font-mono text-neutral-600">
                    Nenhum jogo inserido ainda.
                  </div>
                ) : (
                  matches.map((m) => {
                    const home = clubs.find(c => c.id === m.homeId);
                    const away = clubs.find(c => c.id === m.awayId);
                    return (
                      <div 
                        key={m.id}
                        className="bg-neutral-950 p-3 rounded-lg border border-neutral-850 text-xs font-mono flex justify-between items-center"
                      >
                        <div className="flex-1 flex justify-between items-center">
                          <span className="font-bold text-white uppercase truncate flex-1">{home?.emoji} {home?.name}</span>
                          <span className="bg-neutral-900 px-2 py-0.5 rounded font-black text-emerald-400 font-mono text-center mx-2 w-10">
                            {m.homeGoals} - {m.awayGoals}
                          </span>
                          <span className="font-bold text-white uppercase truncate flex-1 text-right">{away?.name} {away?.emoji}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteMatch(m.id)}
                          className="text-neutral-700 hover:text-red-400 ml-2"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

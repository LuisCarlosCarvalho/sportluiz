import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Video, Plus, Trash2, Clock, 
  Download, Upload, AlertCircle, Info, ChevronRight 
} from 'lucide-react';

export default function VideoAnalysis() {
  const [videoUrl, setVideoUrl] = useState('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'); // default sample video
  const [videoFile, setVideoFile] = useState(null);
  
  const [tags, setTags] = useState([
    { id: '1', title: 'Transição Ofensiva Rápida', timestamp: 10, category: 'Tático', note: 'Pivot faz o pivô e ala infiltra.' },
    { id: '2', title: 'Golo de Canto Ensaiado', timestamp: 35, category: 'Finalização', note: 'Cruzamento rasteiro direto no fixo.' }
  ]);
  const [tagName, setTagName] = useState('');
  const [tagCategory, setTagCategory] = useState('Tático');
  const [tagNote, setTagNote] = useState('');

  const videoRef = useRef(null);

  // Load tags from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_video_tags');
    if (saved) {
      try {
        setTags(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveTags = (newTags) => {
    setTags(newTags);
    localStorage.setItem('sportluiz_video_tags', JSON.stringify(newTags));
  };

  const handleAddTag = () => {
    if (!tagName) return;
    const currentTime = videoRef.current ? Math.floor(videoRef.current.currentTime) : 0;

    const newTag = {
      id: Date.now().toString(),
      title: tagName,
      timestamp: currentTime,
      category: tagCategory,
      note: tagNote
    };

    saveTags([...tags, newTag]);
    setTagName('');
    setTagNote('');
  };

  const handleDeleteTag = (id) => {
    saveTags(tags.filter(t => t.id !== id));
  };

  const handleJumpToTime = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play();
    }
  };

  const formatTimestamp = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLocalVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoFile(file);
      clearTags();
    }
  };

  const clearTags = () => {
    saveTags([]);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase flex items-center gap-2">
            <Video className="text-emerald-400" /> Análise de Vídeo e Eventos
          </h1>
          <p className="text-neutral-500 text-xs mt-1">Carregue lances de jogos e marque timestamps táticos interativos para estudo coletivo</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-xs font-mono rounded-lg transition-all text-neutral-300 cursor-pointer">
            <Upload size={13} /> Escolher Vídeo Local
            <input type="file" onChange={handleLocalVideoUpload} className="hidden" accept="video/*" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Video Player Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-neutral-950 border border-neutral-900 rounded-2xl overflow-hidden shadow-2xl relative aspect-video">
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              className="w-full h-full"
            />
          </div>

          {/* Quick instructions indicator */}
          <div className="bg-neutral-900/40 border border-neutral-900 p-4 rounded-xl text-neutral-500 text-[11px] font-mono flex gap-2">
            <Info size={16} className="text-emerald-400 flex-shrink-0" />
            <p>
              Rode o vídeo e clique em <b>"Marcar Momento"</b> para registrar lances. Ao clicar na tag listada na lateral direita, o player pulará exatamente para o momento marcado.
            </p>
          </div>
        </div>

        {/* Video Tagging Controller */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Create tag */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <Plus size={14} className="text-emerald-400" /> Registar Lance Tático
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Nome do Lance</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Canto Defensivo"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Categoria</label>
                  <select
                    value={tagCategory}
                    onChange={(e) => setTagCategory(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tático">Tático</option>
                    <option value="Finalização">Finalização</option>
                    <option value="Erro Defensivo">Falha / Erro</option>
                    <option value="Bola Parada">Bola Parada</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Ação</label>
                  <button
                    onClick={handleAddTag}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
                  >
                    MARCAR MOMENTO
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Observações / Anotações</label>
                <textarea
                  rows={2}
                  placeholder="Descreva detalhes táticos observados..."
                  value={tagNote}
                  onChange={(e) => setTagNote(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* List of tag markers */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between h-[300px]">
            <div className="space-y-4 flex-grow overflow-hidden flex flex-col min-h-0">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest border-b border-neutral-850 pb-2 flex justify-between">
                <span>Timeline do Vídeo</span>
                <span className="text-[10px] text-neutral-500">{tags.length} Marcadores</span>
              </h2>

              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-grow pr-1">
                {tags.length === 0 ? (
                  <div className="text-center py-16 text-[10px] font-mono text-neutral-600">
                    Nenhum marcador de lance registrado.
                  </div>
                ) : (
                  tags.map((t) => (
                    <div 
                      key={t.id}
                      className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-850 text-xs font-mono flex justify-between items-start gap-1"
                    >
                      <button
                        onClick={() => handleJumpToTime(t.timestamp)}
                        className="text-left flex-1 hover:text-emerald-400 cursor-pointer"
                      >
                        <div className="font-bold text-white uppercase flex items-center gap-1.5">
                          <span className="text-[9px] bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded text-emerald-400 font-bold">{formatTimestamp(t.timestamp)}</span>
                          {t.title}
                        </div>
                        {t.note && <div className="text-[9px] text-neutral-500 mt-1">{t.note}</div>}
                      </button>
                      <button
                        onClick={() => handleDeleteTag(t.id)}
                        className="text-neutral-600 hover:text-red-400 pt-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

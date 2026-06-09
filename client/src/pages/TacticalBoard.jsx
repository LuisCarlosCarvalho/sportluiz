import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Plus, Trash2, Save, Download, 
  Trash, Edit, FileCode, CheckCircle, Info, ChevronRight, ChevronLeft 
} from 'lucide-react';

export default function TacticalBoard() {
  const [drillTitle, setDrillTitle] = useState('Jogada Ensaiada 1');
  const [drillCategory, setDrillCategory] = useState('Ataque');
  const [courtType, setCourtType] = useState('futsal'); // futsal (court), football (field)
  const [drills, setDrills] = useState([]);
  
  // Animation frames state: each frame holds a list of player/ball/cone coordinates
  const [frames, setFrames] = useState([
    {
      players: [
        { id: 'h1', team: 'home', number: '1', name: 'GR', x: 8, y: 50, color: 'bg-emerald-500' },
        { id: 'h2', team: 'home', number: '5', name: 'Fixo', x: 25, y: 50, color: 'bg-emerald-500' },
        { id: 'h3', team: 'home', number: '10', name: 'Ala D', x: 40, y: 20, color: 'bg-emerald-500' },
        { id: 'h4', team: 'home', number: '7', name: 'Ala E', x: 40, y: 80, color: 'bg-emerald-500' },
        { id: 'h5', team: 'home', number: '9', name: 'Pivô', x: 70, y: 50, color: 'bg-emerald-500' },
        
        { id: 'a1', team: 'away', number: '1', name: 'GR', x: 92, y: 50, color: 'bg-blue-500' },
        { id: 'a2', team: 'away', number: '3', name: 'D1', x: 65, y: 35, color: 'bg-blue-500' },
        { id: 'a3', team: 'away', number: '4', name: 'D2', x: 65, y: 65, color: 'bg-blue-500' }
      ],
      balls: [
        { id: 'b1', x: 28, y: 50 }
      ],
      cones: []
    }
  ]);

  const [activeFrameIndex, setActiveFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackInterval = useRef(null);

  // Drawing overlay canvas
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState('#34d399'); // emerald
  const [toolMode, setToolMode] = useState('drag'); // drag, draw

  // Load drills library from local storage
  useEffect(() => {
    const saved = localStorage.getItem('sportluiz_drills_db');
    if (saved) {
      try {
        setDrills(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Set up drawing canvas dimensions on mount/resize
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineWidth = 3;
    }
  }, []);

  // Animation Playback
  useEffect(() => {
    if (isPlaying) {
      playbackInterval.current = setInterval(() => {
        setActiveFrameIndex((prev) => {
          if (prev >= frames.length - 1) {
            return 0; // Loop back
          }
          return prev + 1;
        });
      }, 800); // 800ms per frame
    } else {
      clearInterval(playbackInterval.current);
    }
    return () => clearInterval(playbackInterval.current);
  }, [isPlaying, frames.length]);

  // Frame editing helpers
  const updateActiveFrame = (updater) => {
    const updated = [...frames];
    updated[activeFrameIndex] = updater(frames[activeFrameIndex]);
    setFrames(updated);
  };

  // Drag-and-drop token manipulation
  const [draggedElement, setDraggedElement] = useState(null);

  const handlePointerDown = (type, id, e) => {
    if (toolMode !== 'drag') return;
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    setDraggedElement({ type, id, rect });
  };

  const handlePointerMove = (e) => {
    if (!draggedElement) return;
    const { type, id, rect } = draggedElement;
    
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Clamp coordinates inside pitch boundaries
    const clampedX = Math.max(2, Math.min(98, x));
    const clampedY = Math.max(2, Math.min(98, y));

    updateActiveFrame((frame) => {
      if (type === 'player') {
        const players = frame.players.map(p => p.id === id ? { ...p, x: clampedX, y: clampedY } : p);
        return { ...frame, players };
      } else if (type === 'ball') {
        const balls = frame.balls.map(b => b.id === id ? { ...b, x: clampedX, y: clampedY } : b);
        return { ...frame, balls };
      } else if (type === 'cone') {
        const cones = frame.cones.map(c => c.id === id ? { ...c, x: clampedX, y: clampedY } : c);
        return { ...frame, cones };
      }
      return frame;
    });
  };

  const handlePointerUp = () => {
    setDraggedElement(null);
  };

  // Drawing canvas logic
  const startDrawing = (e) => {
    if (toolMode !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.strokeStyle = drawColor;
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || toolMode !== 'draw') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Frame management
  const addFrame = () => {
    // Clone active frame
    const currentFrame = frames[activeFrameIndex];
    const newFrame = JSON.parse(JSON.stringify(currentFrame));
    const newFrames = [...frames];
    newFrames.splice(activeFrameIndex + 1, 0, newFrame);
    setFrames(newFrames);
    setActiveFrameIndex(activeFrameIndex + 1);
  };

  const removeFrame = (index) => {
    if (frames.length <= 1) return;
    const newFrames = frames.filter((_, idx) => idx !== index);
    setFrames(newFrames);
    setActiveFrameIndex(Math.max(0, activeFrameIndex - 1));
  };

  // Save drill to library
  const handleSaveDrill = () => {
    const newDrill = {
      id: Date.now().toString(),
      title: drillTitle,
      category: drillCategory,
      courtType,
      frames
    };
    
    const updated = [newDrill, ...drills];
    setDrills(updated);
    localStorage.setItem('sportluiz_drills_db', JSON.stringify(updated));
    alert('Exercício salvo com sucesso na sua biblioteca local!');
  };

  const handleLoadDrill = (drill) => {
    setDrillTitle(drill.title);
    setDrillCategory(drill.category);
    setCourtType(drill.courtType || 'futsal');
    setFrames(drill.frames);
    setActiveFrameIndex(0);
    clearCanvas();
  };

  const handleAddCone = () => {
    updateActiveFrame((frame) => ({
      ...frame,
      cones: [...frame.cones, { id: `cone-${Date.now()}`, x: 50, y: 15 }]
    }));
  };

  const currentFrame = frames[activeFrameIndex] || frames[0];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-900 pb-5 gap-4">
        <div>
          <h1 className="text-xl font-black font-mono tracking-tighter text-white uppercase flex items-center gap-2">
            <Play className="text-emerald-400" /> Quadro Tático & Animador
          </h1>
          <p className="text-neutral-500 text-xs mt-1">Crie exercícios, pranchetas de treinamento e simulações com animação frame-a-frame</p>
        </div>

        {/* Court layout switcher */}
        <div className="flex bg-neutral-950 p-1 rounded-lg border border-neutral-900">
          <button 
            onClick={() => setCourtType('futsal')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
              courtType === 'futsal' ? 'bg-neutral-900 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Quadra Futsal
          </button>
          <button 
            onClick={() => setCourtType('football')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded transition-all cursor-pointer ${
              courtType === 'football' ? 'bg-neutral-900 text-emerald-400' : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Campo Futebol
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Toolbox and Save */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Save & Metadata */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <Save size={14} className="text-emerald-400" /> Salvar Exercício
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Título do Exercício</label>
                <input
                  type="text"
                  value={drillTitle}
                  onChange={(e) => setDrillTitle(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">Categoria Tática</label>
                <select
                  value={drillCategory}
                  onChange={(e) => setDrillCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Ataque">Ataque / Sistema Ofensivo</option>
                  <option value="Defesa">Defesa / Pressão</option>
                  <option value="Transição">Transição Rápida</option>
                  <option value="Bolas Paradas">Bolas Paradas / Cantos</option>
                  <option value="Aquecimento">Aquecimento / Drills</option>
                </select>
              </div>

              <button
                onClick={handleSaveDrill}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs py-2 rounded-lg transition-all"
              >
                SALVAR NA BIBLIOTECA
              </button>
            </div>
          </div>

          {/* Canvas Tools */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              🔧 Ferramentas
            </h2>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setToolMode('drag')}
                className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                  toolMode === 'drag' 
                    ? 'bg-emerald-500 border-emerald-600 text-black' 
                    : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                🖐️ Mover Fichas
              </button>
              <button
                onClick={() => setToolMode('draw')}
                className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                  toolMode === 'draw' 
                    ? 'bg-emerald-500 border-emerald-600 text-black' 
                    : 'bg-neutral-950 border-neutral-850 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                ✏️ Desenhar
              </button>
            </div>

            {toolMode === 'draw' && (
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Cor do Pincel</span>
                <div className="flex gap-2">
                  {['#34d399', '#3b82f6', '#f59e0b', '#ef4444', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setDrawColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        drawColor === color ? 'border-white scale-110' : 'border-transparent'
                      }`}
                    ></button>
                  ))}
                </div>
                <button 
                  onClick={clearCanvas}
                  className="w-full bg-neutral-950 hover:bg-neutral-850 text-red-400 border border-neutral-850 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Limpar Desenho
                </button>
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-neutral-800/60">
              <button
                onClick={handleAddCone}
                className="w-full bg-neutral-950 hover:bg-neutral-850 text-neutral-300 border border-neutral-850 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer"
              >
                + Adicionar Cone ⚠️
              </button>
            </div>
          </div>
        </div>

        {/* Center Canvas Board */}
        <div 
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="lg:col-span-2 space-y-4"
        >
          {/* Interactive court container */}
          <div 
            className={`w-full aspect-[5/3] relative rounded-2xl border-2 border-neutral-800 overflow-hidden shadow-2xl select-none transition-all duration-300 ${
              courtType === 'futsal' 
                ? 'bg-blue-950/40' 
                : 'bg-emerald-950/20'
            }`}
          >
            {/* Visual court markings */}
            <div className="absolute inset-0 border-[3px] border-white/20 m-3 flex items-center justify-center pointer-events-none">
              <div className="h-full w-[2px] bg-white/20 absolute left-1/2 -translate-x-1/2"></div>
              <div className="w-1/5 aspect-square border-2 border-white/20 rounded-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className={`h-1/2 w-[12%] border-t-2 border-r-2 border-b-2 border-white/20 absolute left-0 top-1/4 ${courtType === 'futsal' ? 'rounded-r-full' : ''}`}></div>
              <div className={`h-1/2 w-[12%] border-t-2 border-l-2 border-b-2 border-white/20 absolute right-0 top-1/4 ${courtType === 'futsal' ? 'rounded-l-full' : ''}`}></div>
            </div>

            {/* Drawing overlay canvas */}
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              className={`absolute inset-0 z-10 ${toolMode === 'draw' ? 'cursor-pencil pointer-events-auto' : 'pointer-events-none'}`}
            />

            {/* Draggable Players Home / Away */}
            {currentFrame?.players.map((p) => (
              <div
                key={p.id}
                onPointerDown={(e) => handlePointerDown('player', p.id, e)}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full border border-white/80 shadow-lg text-white font-mono text-[10px] font-black flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none z-20 ${p.color}`}
              >
                <span>{p.number}</span>
                <span className="text-[6px] tracking-tighter opacity-80 uppercase block">{p.name}</span>
              </div>
            ))}

            {/* Draggable Ball */}
            {currentFrame?.balls.map((b) => (
              <div
                key={b.id}
                onPointerDown={(e) => handlePointerDown('ball', b.id, e)}
                style={{ left: `${b.x}%`, top: `${b.y}%` }}
                className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-white border border-black shadow-lg text-[8px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none z-20"
              >
                ⚽
              </div>
            ))}

            {/* Draggable Cones */}
            {currentFrame?.cones.map((c) => (
              <div
                key={c.id}
                onPointerDown={(e) => handlePointerDown('cone', c.id, e)}
                style={{ left: `${c.x}%`, top: `${c.y}%` }}
                className="absolute w-5 h-5 -ml-2.5 -mt-2.5 text-lg flex items-center justify-center cursor-grab active:cursor-grabbing select-none z-20"
                title="Cone"
              >
                ⚠️
              </div>
            ))}
          </div>

          {/* ANIMATION CYCLES FOOTER CONTROLS */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Playback actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2.5 rounded-lg border text-black font-bold transition-all cursor-pointer ${
                  isPlaying 
                    ? 'bg-amber-400 border-amber-500 hover:bg-amber-300' 
                    : 'bg-emerald-500 border-emerald-600 hover:bg-emerald-400'
                }`}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>

              <div className="text-xs font-mono font-bold text-neutral-400">
                Frame: <span className="text-white">{activeFrameIndex + 1}</span> / <span className="text-neutral-500">{frames.length}</span>
              </div>
            </div>

            {/* Frame List Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px] py-1 custom-scrollbar">
              {frames.map((_, idx) => (
                <div key={idx} className="flex-shrink-0 flex items-center gap-0.5 bg-neutral-950 p-1 rounded-md border border-neutral-850">
                  <button
                    onClick={() => { setActiveFrameIndex(idx); setIsPlaying(false); }}
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded transition-all cursor-pointer ${
                      activeFrameIndex === idx ? 'bg-emerald-500 text-black' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    #{idx + 1}
                  </button>
                  {frames.length > 1 && (
                    <button 
                      onClick={() => removeFrame(idx)}
                      className="text-neutral-600 hover:text-red-400 text-[9px] px-0.5"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Frame actions */}
            <button
              onClick={addFrame}
              className="flex items-center gap-1 bg-neutral-950 hover:bg-neutral-850 text-emerald-400 border border-neutral-850 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
            >
              <Plus size={13} /> CLONAR FRAME
            </button>
          </div>
        </div>

        {/* Right Column: Drills Library */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between h-[450px]">
            <div className="space-y-4 flex-grow overflow-hidden flex flex-col min-h-0">
              <h2 className="text-xs font-bold font-mono text-neutral-400 uppercase tracking-widest border-b border-neutral-850 pb-2">
                Minha Biblioteca
              </h2>

              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-grow pr-1">
                {drills.length === 0 ? (
                  <div className="text-center py-16 text-[10px] font-mono text-neutral-600">
                    Nenhum exercício salvo.
                  </div>
                ) : (
                  drills.map((dr) => (
                    <button
                      key={dr.id}
                      onClick={() => handleLoadDrill(dr)}
                      className="w-full text-left bg-neutral-950 hover:bg-neutral-850 p-3 rounded-lg border border-neutral-850 text-xs font-mono transition-all flex flex-col gap-1"
                    >
                      <span className="font-bold text-white uppercase truncate">{dr.title}</span>
                      <div className="flex justify-between w-full text-[9px] text-neutral-500 mt-0.5">
                        <span>🏷️ {dr.category}</span>
                        <span>🎞️ {dr.frames?.length || 1} frames</span>
                      </div>
                    </button>
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

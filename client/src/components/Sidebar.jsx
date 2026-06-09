import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Users, BarChart2, Activity, Play, Calendar, Trophy, 
  BookOpen, ChevronLeft, ChevronRight, LogOut, CreditCard
} from 'lucide-react';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const currentTier = user?.subscriptionTier || 'FREE';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Convocatórias', path: '/callups', icon: Users },
    { name: 'Registo de Ações', path: '/stats', icon: BarChart2 },
    { name: 'Marcador Futsal', path: '/scoreboard', icon: Activity },
    { name: 'Quadro Tático', path: '/tactical-board', icon: Play },
    { name: 'Planeamento', path: '/planning', icon: Calendar },
    { name: 'Análise de Vídeo', path: '/video-analysis', icon: Play },
    { name: 'Competições', path: '/competitions', icon: Trophy },
    { name: 'Diário do Atleta', path: '/athlete-journal', icon: BookOpen },
    { name: 'Plano de Assinatura', path: '/plans', icon: CreditCard },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <aside 
      className={`bg-neutral-950 border-r border-neutral-900 min-h-screen flex flex-col justify-between transition-all duration-300 relative select-none z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3 bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white p-1 rounded-full transition-all shadow-md cursor-pointer hover:border-emerald-500/50"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div>
        {/* Branding */}
        <div className="p-6 border-b border-neutral-900/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black text-lg font-mono">
            S
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-sm font-black tracking-tighter text-white font-mono">
                SPORTLUIZ // LABS
              </h1>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest block">
                {currentTier} PLAN
              </span>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-mono font-bold transition-all group cursor-pointer
                  ${isActive 
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm shadow-emerald-950/20' 
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40 border border-transparent'
                  }
                `}
              >
                <IconComponent 
                  size={16} 
                  className={`flex-shrink-0 transition-transform group-hover:scale-105`} 
                />
                {!isCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer info and Logout */}
      <div className="p-4 border-t border-neutral-900/60 space-y-3">
        {!isCollapsed && user && (
          <div className="px-2 py-1 text-[10px] font-mono text-neutral-500 truncate">
            {user.email}
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-mono font-bold text-neutral-400 hover:text-red-400 hover:bg-red-950/10 border border-transparent hover:border-red-950/20 transition-all group cursor-pointer"
        >
          <LogOut size={16} className="flex-shrink-0" />
          {!isCollapsed && <span>Terminar Sessão</span>}
        </button>
      </div>
    </aside>
  );
}

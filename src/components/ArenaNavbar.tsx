import React from 'react';
import { Home, Trophy, Search, User, Dumbbell, Sun, Moon, Edit3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ArenaNavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const ArenaNavbar: React.FC<ArenaNavbarProps> = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme } = useTheme();
  
  const tabs = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'rankings', icon: Trophy, label: 'Rankings' },
    { id: 'search', icon: Search, label: 'Busca' },
    { id: 'gyms', icon: Dumbbell, label: 'Academias' },
    { id: 'profile', icon: User, label: 'Meu Perfil' },
    { id: 'profile/edit', icon: Edit3, label: 'Editar Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--surface)] border-t border-[var(--border-ui)] z-50 md:top-0 md:bottom-auto md:h-screen md:w-20 md:flex-col md:border-r md:border-t-0 transition-colors duration-300">
      <div className="flex justify-around items-center h-16 md:flex-col md:h-full md:py-8">
        <div className="hidden md:block mb-8">
          <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">A</div>
        </div>
        
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center space-y-1 transition-all ${
              activeTab === tab.id ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <tab.icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-tighter md:hidden">{tab.label}</span>
          </button>
        ))}

        <button 
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center space-y-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all md:mt-auto"
          title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
        >
          {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
          <span className="text-[10px] font-bold uppercase tracking-tighter md:hidden">
            {theme === 'light' ? 'Escuro' : 'Claro'}
          </span>
        </button>
      </div>
    </nav>
  );
};

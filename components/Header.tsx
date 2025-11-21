import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Moon, Sun, MessageSquare, Settings, Brain } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ darkMode, toggleTheme }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Hub', icon: <BookOpen size={20} /> },
    { path: '/chat', label: 'AI Tutor', icon: <MessageSquare size={20} /> },
    { path: '/generator', label: 'Quiz Gen', icon: <Brain size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg text-white shadow-lg shadow-orange-500/20">
            <BookOpen size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:inline">
            Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-red-500">Hub</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`p-2 sm:px-3 sm:py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium
                  ${isActive 
                    ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors focus:outline-none"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
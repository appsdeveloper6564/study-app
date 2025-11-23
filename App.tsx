import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import Home from './pages/Home';
import QuizGenerator from './pages/QuizGenerator';
import QuizPlayer from './pages/QuizPlayer';
import AIChat from './pages/AIChat';
import Settings from './pages/Settings';
import ChapterView from './pages/SubjectView';
import SEOUpdater from './components/SEOUpdater';
import CustomNotification from './components/CustomNotification';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('slh_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('slh_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('slh_theme', 'light');
    }
  }, [darkMode]);

  return (
    <StoreProvider>
      <BrowserRouter>
        <SEOUpdater />
        <div className="min-h-screen flex flex-col font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
          <CustomNotification />
          <Header darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/generator" element={<QuizGenerator />} />
              <Route path="/play/:id" element={<QuizPlayer />} />
              <Route path="/chat" element={<AIChat />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/chapter/:id" element={<ChapterView />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;
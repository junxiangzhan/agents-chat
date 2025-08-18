
import React, { useState, useCallback, useEffect } from 'react';
import { CharacterProfile, ChatMessage } from './types';
import CharacterSetup from './pages/character-setup';
import ConversationView from './pages/conversation-view';
import ThemeSwitcher from './components/theme-switcher';

type View = 'setup' | 'conversation';
type Theme = 'system' | 'light' | 'dark';

const App: React.FC = () => {
  const [view, setView] = useState<View>('setup');
  const [characters, setCharacters] = useState<[CharacterProfile, CharacterProfile] | null>(null);
  const [worldview, setWorldview] = useState<string>('');
  const [model, setModel] = useState<string>('gemini-2.5-flash');
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[] | undefined>(undefined);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    return savedTheme || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('app-theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const updateTheme = () => {
        root.dataset.theme = mediaQuery.matches ? 'dark' : 'light';
      };
      
      mediaQuery.addEventListener('change', updateTheme);
      updateTheme(); // Initial check
      
      return () => mediaQuery.removeEventListener('change', updateTheme);
    } else {
      root.dataset.theme = theme;
    }
  }, [theme]);

  const handleThemeChange = () => {
    setTheme(current => {
      if (current === 'system') return 'light';
      if (current === 'light') return 'dark';
      return 'system';
    });
  };

  const handleSimulationStart = useCallback((charA: CharacterProfile, charB: CharacterProfile, world: string, modelName: string, initialConversation?: ChatMessage[]) => {
    setCharacters([charA, charB]);
    setWorldview(world);
    setModel(modelName);
    setConversationHistory(initialConversation);
    setView('conversation');
  }, []);

  const handleBackToSetup = useCallback(() => {
    setCharacters(null);
    setWorldview('');
    setConversationHistory(undefined);
    setView('setup');
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>AI 角色聊天模擬器</h1>
          <p>創建兩個角色，設定世界觀，並觀看他們的故事展開。</p>
        </div>
        <ThemeSwitcher theme={theme} onThemeChange={handleThemeChange} />
      </header>
      <main className="app-main">
        {view === 'setup' && <CharacterSetup onStart={handleSimulationStart} />}
        {view === 'conversation' && characters && (
          <ConversationView 
            characterA={characters[0]} 
            characterB={characters[1]} 
            worldview={worldview}
            model={model}
            onBack={handleBackToSetup} 
            initialConversation={conversationHistory}
          />
        )}
      </main>
    </div>
  );
};

export default App;

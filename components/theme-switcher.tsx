
import React from 'react';
import { SunIcon, MoonIcon, MonitorIcon } from './icons';

type Theme = 'system' | 'light' | 'dark';

interface ThemeSwitcherProps {
  theme: Theme;
  onThemeChange: () => void;
}

const themeLabels: Record<Theme, string> = {
  system: '切換至亮色主題',
  light: '切換至暗色主題',
  dark: '切換至系統主題',
};

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onThemeChange }) => {
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <SunIcon />;
      case 'dark':
        return <MoonIcon />;
      default:
        return <MonitorIcon />;
    }
  };

  return (
    <button
      className="theme-switcher"
      onClick={onThemeChange}
      aria-label={themeLabels[theme]}
      title={themeLabels[theme]}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeSwitcher;
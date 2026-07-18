
import React, { createContext, useContext, useEffect, useState } from 'react';
import { store } from '../lib/store';

export type Theme = 'light' | 'dark';
export type FontSize = 'sm' | 'md' | 'lg';

interface SettingsContextType {
  theme: Theme;
  fontSize: FontSize;
  setTheme: (t: Theme) => void;
  setFontSize: (s: FontSize) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [fontSize, setFontSizeState] = useState<FontSize>('md');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load initial settings from persistent store
    store.get<{ theme: Theme; fontSize: FontSize }>('app_preferences').then((saved) => {
      if (saved) {
        if (saved.theme) setThemeState(saved.theme);
        if (saved.fontSize) setFontSizeState(saved.fontSize);
      }
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    // Apply theme class to document
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply font size to document
    const sizes = { sm: '14px', md: '16px', lg: '18px' };
    root.style.fontSize = sizes[fontSize];

    // Persist settings
    store.set('app_preferences', { theme, fontSize });
  }, [theme, fontSize, isLoaded]);

  const setTheme = (t: Theme) => setThemeState(t);
  const setFontSize = (s: FontSize) => setFontSizeState(s);

  return (
    <SettingsContext.Provider value={{ theme, fontSize, setTheme, setFontSize }}>
      <div className={theme === 'dark' ? 'dark' : ''}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

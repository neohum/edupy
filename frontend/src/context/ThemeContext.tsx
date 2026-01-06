import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { themes } from './themes';
import type { Theme } from './themes';

interface ThemeContextType {
  currentTheme: Theme;
  currentThemeIndex: number;
  setThemeByIndex: (index: number) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'edupy_selected_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentThemeIndex, setCurrentThemeIndex] = useState<number>(() => {
    // 로컬 스토리지에서 저장된 테마 인덱스 불러오기
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved !== null) {
      const index = parseInt(saved, 10);
      if (!isNaN(index) && index >= 0 && index < themes.length) {
        return index;
      }
    }
    return 10; // 기본값: Lagoon Lab
  });

  const setThemeByIndex = (index: number) => {
    if (index >= 0 && index < themes.length) {
      setCurrentThemeIndex(index);
      localStorage.setItem(THEME_STORAGE_KEY, index.toString());
    }
  };

  // 테마 변경 시 CSS 변수 업데이트
  useEffect(() => {
    const theme = themes[currentThemeIndex];
    const [bg, text, accent, secondary] = theme.palette;

    document.documentElement.style.setProperty('--theme-bg', bg);
    document.documentElement.style.setProperty('--theme-text', text);
    document.documentElement.style.setProperty('--theme-accent', accent);
    document.documentElement.style.setProperty('--theme-secondary', secondary);
  }, [currentThemeIndex]);

  return (
    <ThemeContext.Provider
      value={{
        currentTheme: themes[currentThemeIndex],
        currentThemeIndex,
        setThemeByIndex,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

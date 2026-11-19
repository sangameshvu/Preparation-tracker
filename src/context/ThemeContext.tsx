import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';
export type GlassEffect = 'full' | 'reduced' | 'off';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  glassEffect: GlassEffect;
  setGlassEffect: (effect: GlassEffect) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('cat2027_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // Default dark mode first
  });

  const [glassEffect, setGlassEffectState] = useState<GlassEffect>(() => {
    const saved = localStorage.getItem('cat2027_ui_glass');
    if (saved === 'full' || saved === 'reduced' || saved === 'off') {
      return saved as GlassEffect;
    }
    // Default to "Reduced" on small screens or low-power devices
    if (typeof window !== 'undefined') {
      const isSmall = window.innerWidth < 768;
      const isLowPower = typeof navigator !== 'undefined' && Boolean(navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
      if (isSmall || isLowPower) {
        return 'reduced';
      }
    }
    return 'full';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('cat2027_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-glass', glassEffect);
    localStorage.setItem('cat2027_ui_glass', glassEffect);
  }, [glassEffect]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  const setGlassEffect = (effect: GlassEffect) => {
    setGlassEffectState(effect);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, glassEffect, setGlassEffect }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

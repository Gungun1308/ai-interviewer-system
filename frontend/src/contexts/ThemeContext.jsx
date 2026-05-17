import React, { createContext, useContext, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const stored = localStorage.getItem('theme');
      return stored === 'dark' || stored === 'light' ? stored : 'light';
    } catch {
      return 'light';
    }
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // ignore write failures
    }
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export default ThemeContext;

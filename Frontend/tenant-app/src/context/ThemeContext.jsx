import React, { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContextCore';
import { getInitialTheme } from '@trackify/shared';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => getInitialTheme('trackify-theme'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('trackify-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

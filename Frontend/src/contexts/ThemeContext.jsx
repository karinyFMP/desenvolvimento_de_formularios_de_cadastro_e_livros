import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Criação do Contexto de Tema
export const ThemeContext = createContext();

// 2. Componente Provedor do Tema
export const ThemeProvider = ({ children }) => {
  // Inicializa buscando do localStorage para persistir a escolha, ou usa 'light' como padrão
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('@cadastroApp:theme') || 'light';
  });

  // Função para alternar o estado do tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Aplica a classe 'dark' no <html> para que o Tailwind CSS dark mode funcione
  useEffect(() => {
    localStorage.setItem('@cadastroApp:theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 3. Hook customizado para uso fácil
export const useTheme = () => {
  return useContext(ThemeContext);
};

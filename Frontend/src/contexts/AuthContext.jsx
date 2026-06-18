import React, { createContext, useState, useContext, useEffect } from 'react';

// 1. Criação do Contexto
export const AuthContext = createContext();

// 2. Componente Provedor (Provider)
export const AuthProvider = ({ children }) => {
  
  // O estado inicial utiliza uma função (lazy initialization) para checar o Local Storage
  // Isso acontece antes mesmo da renderização inicial garantindo persistência imediata.
  const [usuario, setUsuario] = useState(() => {
    try {
      const usuarioSalvo = localStorage.getItem('@cadastroApp:usuario');
      return usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
    } catch {
      localStorage.removeItem('@cadastroApp:usuario');
      return null;
    }
  });
  
  // Variável derivada baseada no estado real (agora persistido)
  const logado = !!usuario;

  // Efeito (Ciclo de Vida) para observar mudanças e garantir o sincronismo
  // Embora já salvasemos nos métodos de login/logout, este useEffect é útil
  // caso o estado seja modificado de outra forma.
  useEffect(() => {
    if (usuario) {
      localStorage.setItem('@cadastroApp:usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('@cadastroApp:usuario');
    }
  }, [usuario]);

  // Função para fazer login e atualizar o estado
  const login = (dadosUsuario) => {
    setUsuario(dadosUsuario);
  };

  // Função para fazer logout
  const logout = () => {
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, logado, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado
export const useAuth = () => {
  return useContext(AuthContext);
};

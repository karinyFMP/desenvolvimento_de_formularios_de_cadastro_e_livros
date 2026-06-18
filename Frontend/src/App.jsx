import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import FormularioCadastro from './components/FormularioCadastro';
import FormularioLogin from './components/FormularioLogin';
import ListaUsuarios from './components/ListaUsuarios';
import MeusFavoritos from './components/MeusFavoritos';
import MinhaEstante from './components/MinhaEstante';
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

/* ══════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════ */
const Navbar = () => {
  const { logado, usuario, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const navLinkClass = ({ isActive }) =>
    `relative px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150 ${
      isActive
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-base tracking-tight select-none">
          <span className="text-xl">📚</span>
          <span>BookSync</span>
        </div>

        {/* Centro: Links de navegação */}
        {logado && (
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/usuarios" className={navLinkClass}>
              Lista Geral
            </NavLink>
            <NavLink to="/favoritos" className={navLinkClass}>
              ⭐ Favoritos
            </NavLink>
            <NavLink to="/estante" className={navLinkClass}>
              📚 Minha Estante
            </NavLink>
          </nav>
        )}

        {/* Direita: Ações */}
        <div className="flex items-center gap-2">
          {logado && (
            <>
              <span className="hidden sm:block text-sm text-slate-500 dark:text-slate-400 font-medium">
                {usuario.nome.split(' ')[0]}
              </span>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              >
                Sair
              </button>
            </>
          )}

          {/* Toggle de tema */}
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Barra de navegação mobile */}
      {logado && (
        <nav className="flex sm:hidden items-center gap-1 px-4 pb-2 border-t border-slate-100 dark:border-slate-800 pt-1">
          <NavLink to="/usuarios" className={({ isActive }) => `flex-1 text-center py-1.5 text-xs font-medium rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
            Lista Geral
          </NavLink>
          <NavLink to="/favoritos" className={({ isActive }) => `flex-1 text-center py-1.5 text-xs font-medium rounded-lg transition-all ${isActive ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
            ⭐ Favoritos
          </NavLink>
          <NavLink to="/estante" className={({ isActive }) => `flex-1 text-center py-1.5 text-xs font-medium rounded-lg transition-all ${isActive ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
            📚 Estante
          </NavLink>
        </nav>
      )}
    </header>
  );
};

/* ══════════════════════════════════════════
   APP ROOT
══════════════════════════════════════════ */
function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              className: '!text-sm !font-medium !rounded-xl !shadow-lg',
              duration: 3500,
              style: { maxWidth: '360px' },
            }}
          />

          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
              <Routes>

                {/* ROTA PÚBLICA — Cadastro */}
                <Route path="/" element={
                  <div className="max-w-md mx-auto">
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Criar conta</h1>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Preencha os campos abaixo para se registar.
                      </p>
                    </div>
                    <FormularioCadastro />
                  </div>
                } />

                {/* ROTA PÚBLICA — Login */}
                <Route path="/login" element={
                  <div className="max-w-md mx-auto">
                    <div className="mb-8">
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bem-vindo(a) de volta</h1>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Faça login para aceder à sua conta.
                      </p>
                    </div>
                    <FormularioLogin />
                  </div>
                } />

                {/* ROTA PROTEGIDA — Lista Geral */}
                <Route path="/usuarios" element={
                  <ProtectedRoute><ListaUsuarios /></ProtectedRoute>
                } />

                {/* ROTA PROTEGIDA — Meus Favoritos */}
                <Route path="/favoritos" element={
                  <ProtectedRoute><MeusFavoritos /></ProtectedRoute>
                } />

                {/* ROTA PROTEGIDA — Minha Estante */}
                <Route path="/estante" element={
                  <ProtectedRoute><MinhaEstante /></ProtectedRoute>
                } />

              </Routes>
            </main>
          </div>

        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

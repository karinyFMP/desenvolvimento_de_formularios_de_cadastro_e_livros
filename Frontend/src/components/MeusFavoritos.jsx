import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MeusFavoritos = () => {
  const [favoritos, setFavoritos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const { usuario } = useAuth();

  useEffect(() => {
    if (!usuario) return;
    setLoading(true);
    setErro('');
    axios.get(`${import.meta.env.VITE_API_URL}/api/favoritos/${usuario.id}`)
      .then(res => setFavoritos(res.data.data))
      .catch(() => setErro('Erro ao carregar a sua lista de favoritos.'))
      .finally(() => setLoading(false));
  }, [usuario]);

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Meus Favoritos</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Perfis que você marcou com ⭐ na lista geral
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-400 dark:text-slate-600">
          <svg className="animate-spin w-6 h-6 mr-2.5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <span className="text-sm">Carregando...</span>
        </div>
      )}

      {/* Erro */}
      {erro && !loading && (
        <div className="card p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10 text-sm text-red-600 dark:text-red-400">
          {erro}
        </div>
      )}

      {/* Empty state — Requisito da Aula 11 */}
      {!loading && !erro && favoritos.length === 0 && (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4 select-none">⭐</p>
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
            A sua lista de favoritos está vazia.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-500 mb-5">
            Vá até a Lista Geral e clique na estrela ao lado de um usuário.
          </p>
          <Link
            to="/usuarios"
            className="btn-primary !text-xs !px-4 !py-2 inline-flex"
          >
            Ver Lista Geral →
          </Link>
        </div>
      )}

      {/* Lista de favoritos usando tabela */}
      {!loading && !erro && favoritos.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Favorito</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">E-mail</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {favoritos.map((fav, idx) => (
                <tr
                  key={fav.id}
                  className={`table-row-base ${
                    idx % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-800/30' : 'bg-white dark:bg-transparent'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="shrink-0 w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center text-sm font-bold uppercase text-amber-700 dark:text-amber-400 select-none">
                        {fav.nome.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{fav.nome}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate sm:hidden">{fav.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-slate-500 dark:text-slate-400">{fav.email}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-amber-400 text-base select-none" aria-label="Favorito">
                    ⭐
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MeusFavoritos;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

/* ── Avatar com inicial ── */
const Avatar = ({ name, variant = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400',
  };
  return (
    <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold uppercase select-none ${colors[variant]}`}>
      {name?.charAt(0) ?? '?'}
    </div>
  );
};

/* ── Spinner ── */
const Spinner = () => (
  <div className="flex items-center justify-center py-20 text-slate-400 dark:text-slate-600">
    <svg className="animate-spin w-6 h-6 mr-2.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
    <span className="text-sm">Carregando...</span>
  </div>
);

/* ── Input de edição inline ── */
const EditInput = ({ value, onChange, type = 'text', placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="form-input"
  />
);

/* ════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════ */
const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [refresh, setRefresh] = useState(0);

  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const [favIds, setFavIds] = useState([]);

  const { usuario } = useAuth();
  const LIMIT = 5;

  /* ── Busca usuários ── */
  useEffect(() => {
    const carregarUsuarios = async () => {
      setLoading(true);
      setErro('');
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/usuarios?page=${page}&limit=${LIMIT}`);
        setUsuarios(res.data.data);
        setTotalPages(res.data.pagination.totalPages);
      } catch {
        setErro('Não foi possível carregar os usuários.');
      } finally {
        setLoading(false);
      }
    };
    carregarUsuarios();
  }, [page, refresh]);

  /* ── Busca favoritos ── */
  useEffect(() => {
    if (!usuario) return;
    axios.get(`${import.meta.env.VITE_API_URL}/api/favoritos/${usuario.id}`)
      .then(res => setFavIds(res.data.data.map(f => f.id)))
      .catch(() => {});
  }, [usuario, refresh]);

  /* ── Handlers ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este usuário permanentemente?')) return;
    const tid = toast.loading('Excluindo...');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/usuarios/${id}`);
      setRefresh(p => p + 1);
      toast.success('Usuário excluído!', { id: tid });
    } catch {
      toast.error('Erro ao excluir.', { id: tid });
    }
  };

  const startEdit = (u) => { setEditingId(u.id); setEditNome(u.nome); setEditEmail(u.email); };
  const cancelEdit = () => { setEditingId(null); };

  const saveEdit = async (id) => {
    if (!editNome.trim() || !editEmail.trim()) return toast.error('Os campos não podem estar vazios.');
    const tid = toast.loading('Salvando...');
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/usuarios/${id}`, { nome: editNome, email: editEmail });
      cancelEdit();
      setRefresh(p => p + 1);
      toast.success('Atualizado com sucesso!', { id: tid });
    } catch {
      toast.error('Erro ao atualizar.', { id: tid });
    }
  };

  const toggleFav = async (favId) => {
    if (!usuario) return;
    const isFav = favIds.includes(favId);
    try {
      if (isFav) {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/favoritos`, { data: { usuario_id: usuario.id, favorito_id: favId } });
        setFavIds(p => p.filter(i => i !== favId));
        toast.success('Removido dos favoritos!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/favoritos`, { usuario_id: usuario.id, favorito_id: favId });
        setFavIds(p => [...p, favId]);
        toast.success('Adicionado aos favoritos! ⭐');
      }
    } catch {
      toast.error('Erro ao modificar favorito.');
    }
  };

  /* ── Render ── */
  return (
    <div>
      {/* Cabeçalho da secção */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Usuários</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gerencie todos os registros do sistema</p>
      </div>

      {loading && <Spinner />}

      {erro && !loading && (
        <div className="card p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10 text-sm text-red-600 dark:text-red-400">
          {erro}
        </div>
      )}

      {!loading && !erro && usuarios.length === 0 && (
        <div className="card p-12 text-center text-slate-400 dark:text-slate-600">
          <p className="text-4xl mb-3">🧑‍💻</p>
          <p className="font-medium text-slate-600 dark:text-slate-400">Nenhum usuário encontrado.</p>
        </div>
      )}

      {/* ── TABELA ── */}
      {!loading && !erro && usuarios.length > 0 && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/60">
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-8"></th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuário</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">E-mail</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usuarios.map((user, idx) => {
                const isFav   = favIds.includes(user.id);
                const isSelf  = usuario?.id === user.id;
                const isEditing = editingId === user.id;
                const rowBg   = idx % 2 === 1
                  ? 'bg-slate-50/60 dark:bg-slate-800/30'
                  : 'bg-white dark:bg-transparent';

                return (
                  <tr key={user.id} className={`table-row-base ${rowBg}`}>

                    {/* Coluna: Favorito */}
                    <td className="px-4 py-3">
                      {!isSelf && (
                        <button
                          onClick={() => toggleFav(user.id)}
                          aria-label={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                          className={`text-lg transition-transform duration-150 hover:scale-125 active:scale-90 ${
                            isFav ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700 hover:text-amber-300'
                          }`}
                        >
                          {isFav ? '⭐' : '☆'}
                        </button>
                      )}
                    </td>

                    {/* Coluna: Usuário */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <EditInput value={editNome} onChange={e => setEditNome(e.target.value)} placeholder="Nome" />
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={user.nome} />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                              {user.nome}
                              {isSelf && <span className="ml-1.5 text-xs font-normal text-slate-400 dark:text-slate-600">(Você)</span>}
                            </p>
                            {/* E-mail visível apenas em mobile (fica na mesma coluna) */}
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate sm:hidden">{user.email}</p>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Coluna: E-mail (desktop) */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {isEditing ? (
                        <EditInput type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="E-mail" />
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 truncate max-w-xs block">{user.email}</span>
                      )}
                    </td>

                    {/* Coluna: Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(user.id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all active:scale-[0.97]">
                              Salvar
                            </button>
                            <button onClick={cancelEdit} className="btn-outline !px-3 !py-1.5 !text-xs">
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(user)} className="btn-edit">Editar</button>
                            <button onClick={() => handleDelete(user.id)} className="btn-danger">Excluir</button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ── Paginação ── */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
            <button
              onClick={() => setPage(p => p - 1)}
              disabled={page === 1}
              className="btn-outline !text-xs !px-3 !py-1.5"
            >
              ← Anterior
            </button>

            <span className="text-xs text-slate-500 dark:text-slate-400">
              Página <strong className="text-slate-700 dark:text-slate-200">{page}</strong> de <strong className="text-slate-700 dark:text-slate-200">{totalPages || 1}</strong>
            </span>

            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="btn-outline !text-xs !px-3 !py-1.5"
            >
              Próximo →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaUsuarios;

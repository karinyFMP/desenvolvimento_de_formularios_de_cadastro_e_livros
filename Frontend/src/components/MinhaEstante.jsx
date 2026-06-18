import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import ModalLivro from './ModalLivro';

const API = import.meta.env.VITE_API_URL;

/* ── Spinner ── */
const Spinner = () => (
  <div className="flex items-center justify-center py-20 text-slate-400 dark:text-slate-600 col-span-full">
    <svg className="animate-spin w-6 h-6 mr-2.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
    <span className="text-sm">Carregando...</span>
  </div>
);

/* ── Badge de Status ── */
const StatusBadge = ({ status }) => {
  const cores = {
    'quero ler': 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    'lendo':     'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    'lido':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  };
  return (
    <span className={`badge ${cores[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
};

/* ── Card de livro ── */
const CardLivro = ({ livro, abaAtiva, onToggleFavorito, onEditar, onRemover }) => (
  <div className="card p-5 flex flex-col gap-3">

    {/* Cabeçalho: título + botão de favorito */}
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate leading-snug">
          {livro.titulo}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{livro.autor}</p>
      </div>
      <button
        onClick={() => onToggleFavorito(livro)}
        aria-label={livro.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        className={`text-xl flex-shrink-0 transition-transform duration-150 hover:scale-125 active:scale-90 ${
          livro.favorito
            ? 'text-amber-400'
            : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
        }`}
      >
        {livro.favorito ? '⭐' : '☆'}
      </button>
    </div>

    {/* Badges: gênero + status */}
    <div className="flex flex-wrap gap-1.5">
      <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
        {livro.genero}
      </span>
      <StatusBadge status={livro.status} />
    </div>

    {/* Avaliação em estrelas */}
    {livro.avaliacao > 0 && (
      <p className="text-sm text-amber-400 leading-none">
        {'★'.repeat(livro.avaliacao)}{'☆'.repeat(5 - livro.avaliacao)}
      </p>
    )}

    {/* Rodapé: ações */}
    <div className="flex gap-2 mt-auto pt-2">
      {abaAtiva === 'todos' ? (
        <>
          <button 
            onClick={() => onToggleFavorito(livro)} 
            className={`flex-1 justify-center text-xs py-1.5 font-medium rounded-lg transition-all ${
              livro.favorito 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            {livro.favorito ? '⭐ Favoritado' : '☆ Favoritar'}
          </button>
          <button onClick={() => onEditar(livro)} className="btn-edit flex-1 justify-center text-xs py-1.5">
            Editar
          </button>
          <button onClick={() => onRemover(livro.id)} className="btn-danger flex-1 justify-center text-xs py-1.5">
           Remover
          </button>
        </>
      ) : (
        <button
          onClick={() => onToggleFavorito(livro)}
          className="btn-outline w-full justify-center text-xs"
        >
          ☆ Remover dos favoritos
        </button>
      )}
    </div>

  </div>
);

/* ════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════════ */
const MinhaEstante = () => {
  const { usuario } = useAuth();

  const [livros,       setLivros]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [erro,         setErro]         = useState('');
  const [busca,        setBusca]        = useState('');
  const [generoFiltro, setGeneroFiltro] = useState('');
  const [abaAtiva,     setAbaAtiva]     = useState('todos');
  const [modalAberto,  setModalAberto]  = useState(false);
  const [livroEditando, setLivroEditando] = useState(null);

  const GENEROS = ['Ficção', 'Não-ficção', 'Fantasia', 'Romance', 'Terror', 'Biografia', 'Técnico', 'Outro'];

  /* ── Carrega livros da aba ativa ── */
  const carregarLivros = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    setErro('');
    try {
      if (abaAtiva === 'todos') {
        const params = new URLSearchParams();
        if (busca)        params.set('busca',  busca);
        if (generoFiltro) params.set('genero', generoFiltro);
        const res = await axios.get(`${API}/api/livros/${usuario.id}?${params}`);
        setLivros(res.data.data);
      } else {
        const res = await axios.get(`${API}/api/livros-favoritos/${usuario.id}`);
        setLivros(res.data.data);
      }
    } catch {
      setErro('Não foi possível carregar os livros.');
    } finally {
      setLoading(false);
    }
  }, [usuario, abaAtiva, busca, generoFiltro]);

  /* ── Carrega ao trocar aba ── */
  useEffect(() => {
    if (abaAtiva !== 'todos') {
      carregarLivros();
    }
  }, [abaAtiva]);

  /* ── Debounce busca + filtro (só na aba "todos") ── */
  useEffect(() => {
    if (abaAtiva !== 'todos') return;
    const timer = setTimeout(() => carregarLivros(), 400);
    return () => clearTimeout(timer);
  }, [busca, generoFiltro, abaAtiva, usuario]);

  /* ── Toggle favorito (otimista) ── */
  const toggleFavorito = async (livro) => {
    const isFav = !!livro.favorito;
    try {
      if (isFav) {
        await axios.delete(`${API}/api/livros-favoritos`, {
          data: { usuario_id: usuario.id, livro_id: livro.id },
        });
        toast.success('Removido dos favoritos.');
      } else {
        await axios.post(`${API}/api/livros-favoritos`, {
          usuario_id: usuario.id,
          livro_id: livro.id,
        });
        toast.success('Adicionado aos favoritos! ⭐');
      }
      // Atualização otimista — sem re-fetch
      if (abaAtiva === 'favoritos' && isFav) {
        // remove o card da lista de favoritos imediatamente
        setLivros(prev => prev.filter(l => l.id !== livro.id));
      } else {
        setLivros(prev =>
          prev.map(l => l.id === livro.id ? { ...l, favorito: isFav ? 0 : 1 } : l)
        );
      }
    } catch {
      toast.error('Erro ao modificar favorito.');
    }
  };

  /* ── Salvar livro (criar ou editar) ── */
  const handleSalvar = async (data) => {
    try {
      if (livroEditando) {
        await axios.put(`${API}/api/livros/${livroEditando.id}`, {
          ...data,
          avaliacao: data.avaliacao === '' ? null : data.avaliacao,
          usuario_id: usuario.id,
        });
        toast.success('Livro atualizado!');
      } else {
        await axios.post(`${API}/api/livros`, {
          ...data,
          avaliacao: data.avaliacao === '' ? null : data.avaliacao,
          usuario_id: usuario.id,
        });
        toast.success('Livro adicionado à estante! 📚');
      }
      setModalAberto(false);
      setLivroEditando(null);
      carregarLivros();
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro ao salvar o livro.';
      toast.error(msg);
      // Propaga o erro para que o isSubmitting do react-hook-form volte a false
      throw err;
    }
  };

  /* ── Remover livro ── */
  const handleRemover = async (id) => {
    if (!window.confirm('Remover este livro da sua estante permanentemente?')) return;
    const tid = toast.loading('Removendo...');
    try {
      await axios.delete(`${API}/api/livros/${id}?usuario_id=${usuario.id}`);
      setLivros(prev => prev.filter(l => l.id !== id));
      toast.success('Livro removido!', { id: tid });
    } catch {
      toast.error('Erro ao remover o livro.', { id: tid });
    }
  };

  /* ── Abrir modal de edição ── */
  const abrirEdicao = (livro) => {
    setLivroEditando(livro);
    setModalAberto(true);
  };

  /* ── Fechar modal ── */
  const fecharModal = () => {
    setModalAberto(false);
    setLivroEditando(null);
  };

  /* ─────────────────────────────────────── RENDER ── */
  return (
    <div>
      {/* Modal */}
      <ModalLivro
        aberto={modalAberto}
        onFechar={fecharModal}
        onSalvar={handleSalvar}
        livroInicial={livroEditando}
      />

      {/* Cabeçalho da página */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Minha Estante</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Seus livros pessoais — visíveis apenas para você
          </p>
        </div>
        <button
          onClick={() => { setLivroEditando(null); setModalAberto(true); }}
          className="btn-primary shrink-0"
        >
          + Adicionar livro
        </button>
      </div>

      {/* Abas de navegação interna */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit mb-6">
        {['todos', 'favoritos'].map(aba => (
          <button
            key={aba}
            onClick={() => setAbaAtiva(aba)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              abaAtiva === aba
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {aba === 'todos' ? 'Todos os livros' : '⭐ Favoritos'}
          </button>
        ))}
      </div>

      {/* Filtros — apenas na aba "todos" */}
      {abaAtiva === 'todos' && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Buscar por título ou autor..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="form-input flex-1"
          />
          <select
            value={generoFiltro}
            onChange={e => setGeneroFiltro(e.target.value)}
            className="form-input sm:w-48"
          >
            <option value="">Todos os gêneros</option>
            {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      )}

      {/* Estados de Loading / Erro */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Spinner />
        </div>
      )}

      {erro && !loading && (
        <div className="card p-4 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-500/10 text-sm text-red-600 dark:text-red-400">
          {erro}
        </div>
      )}

      {/* Empty states */}
      {!loading && !erro && livros.length === 0 && (
        <div className="card p-12 text-center">
          {abaAtiva === 'todos' ? (
            <>
              <p className="text-5xl mb-4 select-none">📚</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sua estante está vazia.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-5">
                Adicione seu primeiro livro e comece a organizar suas leituras!
              </p>
              <button
                onClick={() => { setLivroEditando(null); setModalAberto(true); }}
                className="btn-primary inline-flex"
              >
                + Adicionar primeiro livro
              </button>
            </>
          ) : (
            <>
              <p className="text-5xl mb-4 select-none">⭐</p>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nenhum livro favorito ainda.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500 mb-5">
                Na lista de livros, clique na estrela ☆ para favoritar.
              </p>
              <button
                onClick={() => setAbaAtiva('todos')}
                className="btn-outline inline-flex"
              >
                Ver todos os livros →
              </button>
            </>
          )}
        </div>
      )}

      {/* Grid de cards */}
      {!loading && !erro && livros.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {livros.map(livro => (
            <CardLivro
              key={livro.id}
              livro={livro}
              abaAtiva={abaAtiva}
              onToggleFavorito={toggleFavorito}
              onEditar={abrirEdicao}
              onRemover={handleRemover}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MinhaEstante;

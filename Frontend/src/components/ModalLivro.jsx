import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { livroSchema } from '../schemas/livroSchema';

/* ── Campo reutilizável (copiado de FormularioCadastro) ── */
const Field = ({ label, id, error, children }) => (
  <div>
    <label htmlFor={id} className="form-label">{label}</label>
    {children}
    {error && (
      <p role="alert" className="field-error">
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
        {error}
      </p>
    )}
  </div>
);

const GENEROS = ['Ficção', 'Não-ficção', 'Fantasia', 'Romance', 'Terror', 'Biografia', 'Técnico', 'Outro'];
const STATUS  = ['quero ler', 'lendo', 'lido'];

const ModalLivro = ({ aberto, onFechar, onSalvar, livroInicial = null }) => {
  const isEdicao = livroInicial !== null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(livroSchema),
    defaultValues: isEdicao
      ? {
          titulo: livroInicial.titulo,
          autor: livroInicial.autor,
          genero: livroInicial.genero,
          status: livroInicial.status,
          avaliacao: livroInicial.avaliacao ?? '',
        }
      : { titulo: '', autor: '', genero: '', status: 'quero ler', avaliacao: '' },
  });

  /* Reseta o formulário quando o modal abre/fecha ou muda de livro */
  useEffect(() => {
    if (aberto) {
      reset(
        isEdicao
          ? { titulo: livroInicial.titulo, autor: livroInicial.autor, genero: livroInicial.genero, status: livroInicial.status, avaliacao: livroInicial.avaliacao ?? '' }
          : { titulo: '', autor: '', genero: '', status: 'quero ler', avaliacao: '' }
      );
    }
  }, [aberto, livroInicial]);

  if (!aberto) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onFechar();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700/60">

        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isEdicao ? '✏️ Editar livro' : '📚 Adicionar livro'}
          </h2>
          <button
            onClick={onFechar}
            aria-label="Fechar modal"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit(onSalvar)} noValidate className="flex flex-col gap-4">

          <Field label="Título" id="titulo" error={errors.titulo?.message}>
            <input
              type="text"
              id="titulo"
              placeholder="Ex: O Senhor dos Anéis"
              className={errors.titulo ? 'form-input-error' : 'form-input'}
              {...register('titulo')}
            />
          </Field>

          <Field label="Autor" id="autor" error={errors.autor?.message}>
            <input
              type="text"
              id="autor"
              placeholder="Ex: J.R.R. Tolkien"
              className={errors.autor ? 'form-input-error' : 'form-input'}
              {...register('autor')}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Gênero" id="genero" error={errors.genero?.message}>
              <select
                id="genero"
                className={errors.genero ? 'form-input-error' : 'form-input'}
                {...register('genero')}
              >
                <option value="">Selecione...</option>
                {GENEROS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>

            <Field label="Status" id="status" error={errors.status?.message}>
              <select
                id="status"
                className={errors.status ? 'form-input-error' : 'form-input'}
                {...register('status')}
              >
                {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Avaliação (opcional)" id="avaliacao" error={errors.avaliacao?.message}>
            <select
              id="avaliacao"
              className="form-input"
              {...register('avaliacao')}
            >
              <option value="">— Sem avaliação —</option>
              <option value="1">1 ⭐</option>
              <option value="2">2 ⭐⭐</option>
              <option value="3">3 ⭐⭐⭐</option>
              <option value="4">4 ⭐⭐⭐⭐</option>
              <option value="5">5 ⭐⭐⭐⭐⭐</option>
            </select>
          </Field>

          {/* Rodapé */}
          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={onFechar} className="btn-outline">
              Cancelar
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Salvando...
                </>
              ) : 'Salvar'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ModalLivro;

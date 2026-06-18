import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

/* ── Schema de validação Zod para Login ── */
const loginSchema = z.object({
  email: z.string().min(1, 'O e-mail é obrigatório').email('Formato de e-mail inválido'),
  senha: z.string().min(1, 'A senha é obrigatória'),
});

/* ── Componente de campo reutilizável ── */
const Field = ({ label, id, error, children }) => (
  <div>
    <label htmlFor={id} className="form-label">
      {label}
    </label>
    {children}
    {error && (
      <p role="alert" className="field-error">
        <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
        </svg>
        {error}
      </p>
    )}
  </div>
);

/* ── Componente principal ── */
const FormularioLogin = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(loginSchema) });

  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const tid = toast.loading('Realizando login...');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
        email: data.email,
        senha: data.senha,
      });
      toast.success(res.data.mensagem || 'Login realizado com sucesso!', { id: tid });
      reset();
      if (res.data.usuario) {
        login(res.data.usuario);
        navigate('/usuarios'); // Redireciona para a lista geral (ou /estante)
      }
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro de conexão com o servidor.';
      toast.error(msg, { id: tid });
    }
  };

  return (
    <div className="card p-6 sm:p-8">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

        <Field label="E-mail" id="email" error={errors.email?.message}>
          <input
            type="email"
            id="email"
            placeholder="seu@email.com"
            autoComplete="email"
            className={errors.email ? 'form-input-error' : 'form-input'}
            {...register('email')}
          />
        </Field>

        <Field label="Senha" id="senha" error={errors.senha?.message}>
          <input
            type="password"
            id="senha"
            placeholder="Sua senha"
            autoComplete="current-password"
            className={errors.senha ? 'form-input-error' : 'form-input'}
            {...register('senha')}
          />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full mt-1"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Entrando...
            </>
          ) : 'Entrar'}
        </button>
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
          Não tem conta? <Link to="/" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Cadastre-se</Link>
        </p>

      </form>
    </div>
  );
};

export default FormularioLogin;

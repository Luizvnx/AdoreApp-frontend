import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, UserCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import type { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('SUPER_ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage(null);
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Erro de autenticação:', err);
      if (!err.response) {
        setErrorMessage('Não foi possível conectar ao servidor. Verifique sua conexão ou se a API está acessível.');
      } else if (err.response.status === 429) {
        setErrorMessage(
          err.response.data?.error ||
          'Excesso de tentativas. Por favor, aguarde.'
        );
      } else {
        setErrorMessage(
          err.response.data?.error ||
          err.response.data?.message ||
          'E-mail ou senha incorretos.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-hidden bg-slate-950 text-white font-sans flex items-center justify-center p-4 sm:p-6 relative pt-safe pb-safe">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-cyan-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] rounded-full bg-blue-600/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 transition-all hover:border-slate-700/50">

        {/* App Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="text-cyan-400" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
            AvivaApp
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Gestão Integrada para a sua Igreja
          </p>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm animate-fade-in">
            <AlertCircle size={20} className="shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              E-mail
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Senha
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role selector (Mock role selection for testing) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Perfil de Acesso (Teste)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none">
                <UserCheck size={18} />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="SUPER_ADMIN" className="bg-slate-900">SUPER_ADMIN (Pastor/Diretoria)</option>
                <option value="ADMIN_WELCOME" className="bg-slate-900">ADMIN_WELCOME (Acolhimento)</option>
                <option value="GC_SUPERVISOR" className="bg-slate-900">GC_SUPERVISOR (Supervisor de GC)</option>
                <option value="GC_LEADER" className="bg-slate-900">GC_LEADER (Líder de GC)</option>
                <option value="WORSHIP_LEADER" className="bg-slate-900">WORSHIP_LEADER (Líder de Louvor)</option>
                <option value="MEMBER" className="bg-slate-900">MEMBER (Membro Comum)</option>
              </select>
              <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 pointer-events-none">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-semibold py-4 rounded-2xl transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Entrando...</span>
              </>
            ) : (
              <span>Acessar Painel</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center mt-8 text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          <span>AvivaApp &copy; 2026</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Trophy, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabase';

export const ArenaAuth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              username: username.toLowerCase(),
              full_name: fullName,
              role: 'athlete'
            });
          if (profileError) throw profileError;
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-[var(--primary)] rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)]"
          >
            <Trophy size={40} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[var(--text-main)] italic">
            Arena <span className="text-[var(--primary)]">Comp</span>
          </h1>
          <p className="text-[var(--text-muted)] text-xs uppercase tracking-[0.3em] font-bold">A maior rede social esportiva do Brasil</p>
        </div>

        {/* Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--surface)] border border-[var(--border-ui)] p-8 rounded-3xl space-y-6 shadow-2xl backdrop-blur-xl transition-colors duration-300"
        >
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[var(--bg)]/50 border border-[var(--border-ui)] rounded-2xl py-3 pl-12 pr-4 text-sm text-[var(--text-main)] focus:border-[var(--primary)] outline-none transition-all"
                    required
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[var(--bg)]/50 border border-[var(--border-ui)] rounded-2xl py-3 pl-12 pr-4 text-sm text-[var(--text-main)] focus:border-[var(--primary)] outline-none transition-all"
                    required
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg)]/50 border border-[var(--border-ui)] rounded-2xl py-3 pl-12 pr-4 text-sm text-[var(--text-main)] focus:border-[var(--primary)] outline-none transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg)]/50 border border-[var(--border-ui)] rounded-2xl py-3 pl-12 pr-4 text-sm text-[var(--text-main)] focus:border-[var(--primary)] outline-none transition-all"
                required
              />
            </div>

            {error && <p className="text-rose-500 text-[10px] font-bold uppercase tracking-widest text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 hover:bg-[var(--primary-highlight)] transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

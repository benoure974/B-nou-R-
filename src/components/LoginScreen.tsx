import React, { useState, useEffect } from 'react';
import { Eye, Mail, Lock, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';
import { Member } from '../types';

interface LoginScreenProps {
  members: Member[];
  onLoginSuccess: (member: Member) => void;
}

export default function LoginScreen({ members, onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberEmail, setRememberEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved email if remember is set
    const saved = localStorage.getItem('remember_email');
    if (saved) {
      setEmail(saved);
      setRememberEmail(true);
    }
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const match = members.find(
        (m) => m.loginId.toLowerCase().trim() === email.toLowerCase().trim()
      );

      if (!match) {
        setError('Utilisateur inconnu. Veuillez vérifier votre email de connexion.');
        setIsLoading(false);
        return;
      }

      if (match.password !== password) {
        setError('Mauvais mot de passe. Veuillez réessayer.');
        setIsLoading(false);
        return;
      }

      if (rememberEmail) {
        localStorage.setItem('remember_email', email);
      } else {
        localStorage.removeItem('remember_email');
      }

      setIsLoading(false);
      onLoginSuccess(match);
    }, 600);
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    // Autologin in next frame or immediately
    const found = members.find((m) => m.loginId === roleEmail);
    if (found) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(found);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#081619] text-[#E8E8E8] px-4 py-8 relative overflow-hidden select-none">
      {/* Ancient Temple Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-950/20 via-[#081619]/95 to-[#081619] pointer-events-none" />
      
      {/* Decorative Gold Stars / Points */}
      <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-amber-500/10" />
      <div className="absolute top-1/4 right-20 w-1.5 h-1.5 rounded-full bg-amber-500/20" />
      <div className="absolute bottom-16 left-1/3 w-2.5 h-2.5 rounded-full bg-amber-500/5 animate-pulse" />

      <div className="w-full max-w-md z-10">
        {/* All Seeing Eye / L'Oeil Omniscient */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4 flex items-center justify-center">
            {/* Radiant glowing aura */}
            <div className="absolute w-24 h-24 rounded-full bg-[#0C7A7A]/20 blur-xl animate-pulse" />
            <div className="w-20 h-20 rounded-full border border-amber-500/40 flex items-center justify-center bg-[#081619] shadow-lg shadow-[#0C7A7A]/10">
              <Eye className="h-10 w-10 text-[#C5A059] animate-pulse" />
            </div>
            {/* Triangle surrounding the eye */}
            <div className="absolute w-24 h-24 border border-amber-500/10 rotate-45 pointer-events-none" />
          </div>

          <h1 className="font-sans text-3xl font-bold tracking-wider text-[#E8E8E8] text-center mb-1 font-semibold uppercase">
            RL Bénou Ré
          </h1>
          <p className="font-sans text-xs tracking-widest text-[#87A0A0] uppercase text-center max-w-xs leading-relaxed">
            Ordre Initiatique Ancien et Primitif de Memphis-Misraïm
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-[#122428] border border-amber-500/20 rounded-2xl shadow-2xl p-8 backdrop-blur-md relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500/20 border border-amber-500/30 text-amber-500 text-[10px] font-mono tracking-widest px-4 py-0.5 rounded-full">
            ORIENT DE SAINT-PIERRE
          </div>

          {error && (
            <div className="mb-6 bg-red-950/40 border border-red-500/30 text-red-200 text-sm p-4 rounded-xl flex items-start gap-2 animate-shake">
              <span className="text-red-400 font-bold">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#87A0A0] font-sans tracking-wide block">
                Email de connexion
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#C5A059]">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ex: vm@loge.com"
                  className="w-full bg-[#081619]/60 border border-[#87A0A0]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-[#E8E8E8] focus:border-[#C5A059] focus:outline-none transition font-sans placeholder-gray-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs text-[#87A0A0] font-sans tracking-wide block">
                Mot de Passe
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#C5A059]">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#081619]/60 border border-[#87A0A0]/30 rounded-xl pl-10 pr-4 py-3 text-sm text-[#E8E8E8] focus:border-[#C5A059] focus:outline-none transition font-sans placeholder-gray-600"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberEmail}
                  onChange={(e) => setRememberEmail(e.target.checked)}
                  className="rounded border-[#87A0A0]/30 text-[#0C7A7A] focus:ring-[#0C7A7A] bg-[#081619]/60 h-4 w-4 accent-[#0C7A7A]"
                />
                <span className="text-xs text-[#87A0A0] font-sans hover:text-[#E8E8E8] transition">
                  Se souvenir de mon email
                </span>
              </label>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0C7A7A] hover:bg-[#0A6868] text-[#E8E8E8] border border-amber-500/30 rounded-xl py-3.5 px-4 font-sans font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition hover:shadow-lg hover:shadow-[#0C7A7A]/20 active:translate-y-px"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-[#E8E8E8] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="h-4 w-4 text-[#C5A059]" />
                  ENTRER SUR LE PARVIS
                </>
              )}
            </button>
          </form>

          {/* Quick Access/Interactive roles list */}
          <div className="mt-8 border-t border-[#87A0A0]/10 pt-5">
            <h4 className="text-[10px] text-amber-500 font-mono tracking-widest uppercase mb-3 text-center flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Accès Rapide (Démo / Test)
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleQuickLogin('vm@loge.com')}
                className="bg-[#081619]/60 hover:bg-[#081619] border border-[#87A0A0]/20 rounded-lg p-2 flex flex-col items-center transition hover:border-[#C5A059]/40 group"
              >
                <span className="font-semibold text-amber-400 text-[11px] group-hover:text-amber-300 transition">Vénérable Maître</span>
                <span className="text-[9px] text-gray-500">vm@loge.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin('secretaire@loge.com')}
                className="bg-[#081619]/60 hover:bg-[#081619] border border-[#87A0A0]/20 rounded-lg p-2 flex flex-col items-center transition hover:border-[#C5A059]/40 group"
              >
                <span className="font-semibold text-[#87A0A0] text-[11px] group-hover:text-[#E8E8E8] transition">Secrétaire</span>
                <span className="text-[9px] text-gray-500">secretaire@loge.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin('tresorier@loge.com')}
                className="bg-[#081619]/60 hover:bg-[#081619] border border-[#87A0A0]/20 rounded-lg p-2 flex flex-col items-center transition hover:border-[#C5A059]/40 group"
              >
                <span className="font-semibold text-[#87A0A0] text-[11px] group-hover:text-[#E8E8E8] transition">Trésorière</span>
                <span className="text-[9px] text-gray-500">tresorier@loge.com</span>
              </button>
              <button
                onClick={() => handleQuickLogin('membre@loge.com')}
                className="bg-[#081619]/60 hover:bg-[#081619] border border-[#87A0A0]/20 rounded-lg p-2 flex flex-col items-center transition hover:border-[#C5A059]/40 group"
              >
                <span className="font-semibold text-[#87A0A0] text-[11px] group-hover:text-[#E8E8E8] transition">Apprenti</span>
                <span className="text-[9px] text-gray-500">membre@loge.com</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-[#87A0A0]/40 font-mono mt-8">
          NON NOBIS DOMINE, NON NOBIS, SED NOMINI TUO DA GLORIAM
        </p>
      </div>
    </div>
  );
}

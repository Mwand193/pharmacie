
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Eye, EyeOff, AlertCircle, CheckCircle, Pill } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, updateUser } = useAuth();
  
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(matricule, password);

      if (!result.success) {
        setError(result.error || 'Identifiants invalides');
        setLoading(false);
        return;
      }

      if (result.requiresPasswordChange) {
        setShowPasswordChange(true);
        setPasswordSuccess('Première connexion. Nouveau mot de passe requis.');
        setLoading(false);
        return;
      }

      // Récupérer l'utilisateur stocké
      const storedUser = JSON.parse(localStorage.getItem('medtrack-user') || '{}');
      
      // Redirection selon le rôle
      switch(storedUser.role) {
        case 'admin':
          router.push('/dashboard');
          break;
        case 'pharmacie':
          router.push('/dashboard');
          break;
        case 'fabricant':
          router.push('/dashboard');
          break;
        case 'distributeur':
          router.push('/dashboard');
          break;
        default:
          setError('Rôle utilisateur non reconnu');
      }
      
    } catch (err: any) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 4) {
      setPasswordError('Minimum 4 caractères');
      return;
    }

    setPasswordChangeLoading(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('medtrack-user') || '{}');
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: newPassword,
          first_login: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;

      const { data: updatedUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (fetchError || !updatedUser) {
        throw new Error('Erreur récupération données');
      }

      updateUser(updatedUser);
      setPasswordSuccess('Mot de passe mis à jour ! Redirection...');
      
      setTimeout(() => {
        // Redirection selon le rôle après changement de mot de passe
        switch(updatedUser.role) {
          case 'admin':
            router.push('/dashboard');
            break;
          case 'pharmacie':
            router.push('/dashboard');
            break;
          case 'fabricant':
            router.push('/dashboard');
            break;
          case 'distributeur':
            router.push('/dashboard');
            break;
          default:
            router.push('/login');
        }
      }, 1500);

    } catch (err: any) {
      setPasswordError('Erreur mise à jour');
      setPasswordChangeLoading(false);
    }
  };

  const backToLogin = () => {
    setShowPasswordChange(false);
    setNewPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setPassword('');
    setMatricule('');
    setPasswordChangeLoading(false);
  };

  // Page de changement de mot de passe
  if (showPasswordChange) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-black flex items-center justify-center">
                <Pill className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-light tracking-wider text-gray-900">MEDTRACK</h1>
            <p className="text-xs text-gray-500 mt-1 tracking-wide">première connexion</p>
          </div>

          {/* Form */}
          <div className="bg-white border border-gray-200 p-6">
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-2">
                <CheckCircle className="w-3 h-3 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {!passwordSuccess && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 text-blue-700 text-xs">
                Pour des raisons de sécurité, veuillez définir un nouveau mot de passe.
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                  NOUVEAU MOT DE PASSE
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-black focus:outline-none pr-10 bg-white"
                    placeholder="Minimum 4 caractères"
                    required
                    disabled={passwordChangeLoading }
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    disabled={passwordChangeLoading || !!passwordSuccess}
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {newPassword.length > 0 && newPassword.length < 4 && (
                  <p className="text-xs text-amber-600 mt-1">Le mot de passe doit contenir au moins 4 caractères</p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={passwordChangeLoading }
                  className="w-full bg-black text-white py-2.5 text-xs font-medium tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordChangeLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      MISE À JOUR...
                    </span>
                  ) : (
                    'ENREGISTRER LE MOT DE PASSE'
                  )}
                </button>

                {!passwordSuccess && (
                  <button
                    type="button"
                    onClick={backToLogin}
                    disabled={passwordChangeLoading}
                    className="w-full text-xs text-gray-500 py-2 hover:text-black transition-colors disabled:opacity-50"
                  >
                    ← Retour à la connexion
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Page de login principale
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src='/logo.png' className='object-contain w-full h-full' alt="MedTrack Logo" />
            </div>
          </div>
          <h1 className="text-xl font-light tracking-wider text-gray-900">MEDTRACK</h1>
          <p className="text-xs text-gray-500 mt-1 tracking-wide">traçabilité pharmaceutique</p>
        </div>

        {/* Login Form */}
        <div className="bg-white border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="matricule" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                MATRICULE
              </label>
              <input
                id="matricule"
                type="text"
                value={matricule}
                onChange={(e) => setMatricule(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-black focus:outline-none bg-white"
                placeholder="Ex: ADM001"
                required
                disabled={loading}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-500 mb-2 tracking-wide">
                MOT DE PASSE
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 focus:border-black focus:outline-none pr-10 bg-white"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 text-xs font-medium tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  CONNEXION...
                </span>
              ) : (
                'SE CONNECTER'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-center text-xs text-gray-400">
              For <span className='text-green-600 font-medium'>PrincePharma</span> v1.0 · Sécurisé
            </p>
          </div>
        </div>

        {/* Comptes de test */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            Tests: ADM001 / PHA001 / FAB001 / DIS001
          </p>
          <p className="text-xs text-gray-400 mt-1">
            MDP: admin123 / pharma123 / fab123 / dist123
          </p>
        </div>
      </div>
    </div>
  );
}
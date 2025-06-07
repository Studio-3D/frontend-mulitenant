"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import LoadingSpin from '../../components/LoadingSpin'; // Import your loading spinner component

export default function Login() {
  // State
  const [email, setEmail] = useState('superadmin@gmail.com');
  const [password, setPassword] = useState('superadmin');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { login, user, loading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login({
        email,
        password,
        rememberMe
      });
      router.push('/tableau-de-bord'); // Redirect to dashboard after successful login
    } catch (err) {
      console.error('Login error:', err);
      setError("L'e-mail ou le mot de passe n'est pas valide ou l'utilisateur n'est pas Actif");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner during auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Real Estate Illustration */}
      <div className="hidden md:flex md:flex-1 relative items-center justify-center bg-gray-50">
        <div className="px-12 py-20">
          <img
            src="/images/bg1.jpg"
            alt="Real Estate Illustration"
            className="max-w-[38rem] rounded-lg shadow-lg"
          />
        </div>
        {/* Decorative overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 opacity-60"></div>
        
        {/* Real estate related text */}
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <h2 className="text-2xl font-bold !text-gray-800">Gestion Immobilière Professionnelle</h2>
          <p className="text-gray-600 mt-2">Solutions complètes pour votre entreprise</p>
        </div>
      </div>

      {/* Right side - Login Form - exactly like MUI version */}
      <div className="w-full md:w-2/5 lg:w-2/5 xl:w-[450px] flex items-center justify-center border-l border-gray-200 !text-gray-500">
        <div className="p-7 w-full max-w-[450px]">
          {/* Logo */}
          <div className="absolute top-8 left-8 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 20h2m0 0h6m-6 0v-8.548c0-.534 0-.801.065-1.05a2 2 0 0 1 .28-.617c.145-.213.346-.39.748-.741l4.801-4.202c.746-.652 1.119-.978 1.538-1.102c.37-.11.765-.11 1.135 0c.42.124.794.45 1.54 1.104l4.8 4.2c.402.352.603.528.748.74c.127.19.222.398.28.618c.065.249.065.516.065 1.05V20m-10 0h4m-4 0v-4a2 2 0 1 1 4 0v4m0 0h6m0 0h2"/>
            </svg>
            <span className="ml-2 text-xl font-bold leading-6">Immo Gestion</span>
          </div>

          <div className="mb-6 mt-16">
            <h5 className="text-2xl font-semibold mb-1.5">Bienvenue sur Immo Gestion! 👋🏻</h5>
            <p className="text-gray-500">Veuillez vous connecter</p>
          </div>

          <form noValidate autoComplete="off" onSubmit={handleSubmit}>
            {/* Email field - Styled exactly like MUI */}
            <div className="mb-4">
              <div className="relative">
                <label 
                  htmlFor="email"
                  className={`absolute text-xs font-medium bg-white px-2 -top-2 left-2 z-10
                    ${email ? 'text-[#666cff]' : 'text-gray-500'}`}
                >
                  Email
                </label>
                <input
                  id="email"
                  autoFocus
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-md bg-transparent
                    ${error ? 'border-red-500' : email ? 'border-[#666cff]' : 'border-gray-300'}
                    focus:outline-none focus:border-[#666cff] focus:border-2`}
                />
              </div>
              {error && <p className="mt-1 text-xs !text-red-500">{error}</p>}
            </div>

            {/* Password field - Styled exactly like MUI */}
            <div className="mb-4">
              <div className="relative">
                <label 
                  htmlFor="password"
                  className={`absolute text-xs font-medium bg-white px-2 -top-2 left-2 z-10
                    ${password ? 'text-[#666cff]' : 'text-gray-500'}`}
                >
                  Password
                </label>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-md bg-transparent
                    ${error ? 'border-red-500' : password ? 'border-[#666cff]' : 'border-gray-300'}
                    focus:outline-none focus:border-[#666cff] focus:border-2 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 !text-gray-500"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password - Fix the checkbox color */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="relative inline-block">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="opacity-0 absolute h-4 w-4 cursor-pointer"
                  />
                  <div 
                    className={`border rounded w-4 h-4 flex flex-shrink-0 justify-center items-center mr-2
                      ${rememberMe ? 'bg-[#666cff] border-[#666cff]' : 'border-gray-400'}`}
                  >
                    {rememberMe && (
                      <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                      </svg>
                    )}
                  </div>
                </div>
                <label htmlFor="remember-me" className="ml-2 text-sm !text-gray-600">
                  Remember Me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-[#666cff] hover:underline">
                Mot de passe oublié?
              </Link>
            </div>

            {/* Login Button - exactly like MUI */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium !text-white bg-[#666cff] hover:bg-[#5a5fe6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#666cff] mb-7"
            >
              {isLoading ? 'Chargement...' : 'Se Connecter'}
            </button>

            {/* Divider - exactly like MUI */}
            <div className="relative mt-7 mb-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white text-sm !text-gray-500"></span>
              </div>
            </div>

            {/* Footer with legal links */}
            <div className="text-center text-gray-500 text-sm mt-8">
              <p>© 2023 Immo Gestion. Tous droits réservés.</p>
              <div className="mt-2 space-x-4">
                <Link href="/conditions-generales" className="!text-blue-600 hover:text-blue-800">
                  Conditions Générales
                </Link>
                <span>•</span>
                <Link href="/politique-confidentialite" className="!text-blue-600 hover:text-blue-800">
                  Politique de Confidentialité
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

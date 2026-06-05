"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, Home, Check } from 'lucide-react';

export default function Login() {
  // State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { login, user } = useAuth();
  const loginAttempted = useRef(false);

  // Charger les données sauvegardées au chargement de la page
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const rememberMe = localStorage.getItem('rememberMe') === 'true';
    
    if (rememberMe && savedEmail) {
      setFormData({
        email: savedEmail,
        password: savedPassword || '',
        rememberMe: true
      });
    }
  }, []);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loginAttempted.current) {
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/tableau-de-bord');
      }
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      // Gérer la sauvegarde des identifiants si "Se souvenir de moi" est coché
      if (formData.rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
        localStorage.setItem('rememberedPassword', formData.password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        // Supprimer les données sauvegardées si la case n'est pas cochée
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }
      
      await login(formData);
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      console.log('Login successful, redirect URL found:', redirectUrl);

      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/tableau-de-bord');
      }
    } catch (err) {
      setError("L'e-mail ou le mot de passe n'est pas valide ou l'utilisateur n'est pas Actif");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Left side - Hidden on mobile, visible on tablet/desktop */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center bg-gray-50">
        <div className="px-8 py-12">
          <img
            src="/images/bg1.jpg"
            alt="Real Estate Illustration"
            className="max-w-md rounded-lg shadow-lg"
            loading="lazy"
          />
        </div>
        <div className="absolute bottom-12 left-0 right-0 text-center px-4">
          <h2 className="text-xl font-bold text-gray-800">Gestion Immobilière Professionnelle</h2>
          <p className="text-gray-600 mt-1 text-sm">Solutions complètes pour votre entreprise</p>
        </div>
      </div>

      {/* Right side - Login Form (full width on mobile) */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-8 md:py-0">
        <div className="p-6 sm:p-8 w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="flex justify-center md:justify-start mb-6">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              <span className="text-lg sm:text-xl font-bold text-gray-800">Immo Gestion</span>
            </div>
          </div>

          <div className="mb-6 text-center md:text-left">
            <h1 className="text-xl sm:text-2xl font-semibold mb-2">Bienvenue! 👋🏻</h1>
            <p className="text-gray-500 text-sm sm:text-base">Veuillez vous connecter</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email field */}
            <div className="mb-4">
              <div className="relative">
                <label 
                  htmlFor="email"
                  className={`absolute text-xs font-medium bg-white px-2 -top-2 left-2 z-10
                    ${formData.email ? 'text-[#666cff]' : 'text-gray-500'}`}
                >
                  Email
                </label>
                <input
                  placeholder='user@gmail.com'
                  id="email"
                  name="email"
                  type="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-md bg-white
                    ${error ? 'border-red-500' : formData.email ? 'border-[#666cff]' : 'border-gray-300'}
                    focus:outline-none focus:border-[#666cff] focus:ring-1 focus:ring-[#666cff]`}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="mb-4">
              <div className="relative">
                <label 
                  htmlFor="password"
                  className={`absolute text-xs font-medium bg-white px-2 -top-2 left-2 z-10
                    ${formData.password ? 'text-[#666cff]' : 'text-gray-500'}`}
                >
                  Password
                </label>
                <input
                 placeholder='password'
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-md bg-white pr-10
                    ${error ? 'border-red-500' : formData.password ? 'border-[#666cff]' : 'border-gray-300'}
                    focus:outline-none focus:border-[#666cff] focus:ring-1 focus:ring-[#666cff]`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#666cff] border-gray-300 rounded focus:ring-[#666cff] cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600 cursor-pointer select-none">
                  Se souvenir de moi
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm font-medium text-[#666cff] hover:underline">
                Mot de passe oublié?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-[#666cff] hover:bg-[#5a5fe6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#666cff] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </span>
              ) : 'Se Connecter'}
            </button>

            {/* Footer 
            <div className="text-center text-gray-400 text-xs mt-8">
              <p>© {new Date().getFullYear()} Immo Gestion</p>
              <div className="mt-2 space-x-3">
                <Link href="/conditions-generales" className="hover:text-gray-600">
                  CGU
                </Link>
                <span>•</span>
                <Link href="/politique-confidentialite" className="hover:text-gray-600">
                  Confidentialité
                </Link>
              </div>
            </div>*/}
          </form>
        </div>
      </div>
    </div>
  );
}
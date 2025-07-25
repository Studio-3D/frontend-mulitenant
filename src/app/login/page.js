"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, Home, Check } from 'lucide-react';

export default function Login() {
  // State
  const [formData, setFormData] = useState({
    email: 'superadmin@gmail.com',
    password: 'superadmin',
    rememberMe: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { login, user } = useAuth();

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
    if (user) {
      router.push('/tableau-de-bord');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      await login(formData);
      router.push('/tableau-de-bord');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || "L'e-mail ou le mot de passe n'est pas valide ou l'utilisateur n'est pas Actif");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left side - Real Estate Illustration */}
      <div className="hidden md:flex md:flex-1 relative items-center justify-center bg-gray-50">
        <div className="px-12 py-20">
          <img
            src="/images/bg1.jpg"
            alt="Real Estate Illustration"
            className="max-w-[38rem] rounded-lg shadow-lg"
            loading="lazy"
            width={608}
            height={456}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 opacity-60"></div>
        
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <h2 className="text-2xl font-bold !text-gray-800">Gestion Immobilière Professionnelle</h2>
          <p className="text-gray-600 mt-2">Solutions complètes pour votre entreprise</p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-2/5 lg:w-2/5 xl:w-[450px] flex items-center justify-center border-l border-gray-200 !text-gray-500">
        <div className="p-7 w-full max-w-[450px]">
          {/* Logo */}
          <div className="absolute top-8 left-8 flex items-center">
            <Home className="w-6 h-6" />
            <span className="ml-2 text-xl font-bold leading-6">Immo Gestion</span>
          </div>

          <div className="mb-6 mt-16">
            <h1 className="text-2xl font-semibold mb-1.5">Bienvenue sur Immo Gestion! 👋🏻</h1>
            <p className="text-gray-500">Veuillez vous connecter</p>
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
                  id="email"
                  name="email"
                  type="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-md bg-transparent
                    ${error ? 'border-red-500' : formData.email ? 'border-[#666cff]' : 'border-gray-300'}
                    focus:outline-none focus:border-[#666cff] focus:border-2`}
                  aria-describedby="email-error"
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
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-3 border rounded-md bg-transparent
                    ${error ? 'border-red-500' : formData.password ? 'border-[#666cff]' : 'border-gray-300'}
                    focus:outline-none focus:border-[#666cff] focus:border-2 pr-10`}
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 !text-gray-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="relative inline-block">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="opacity-0 absolute h-4 w-4 cursor-pointer"
                  />
                  <div 
                    className={`border rounded w-4 h-4 flex flex-shrink-0 justify-center items-center mr-2
                      ${formData.rememberMe ? 'bg-[#666cff] border-[#666cff]' : 'border-gray-400'}`}
                  >
                    {formData.rememberMe && <Check className="w-3 h-3 text-white" />}
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium !text-white bg-[#666cff] hover:bg-[#5a5fe6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#666cff] mb-7 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Chargement...
                </span>
              ) : 'Se Connecter'}
            </button>

            {/* Divider */}
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
              <p>© {new Date().getFullYear()} Immo Gestion. Tous droits réservés.</p>
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
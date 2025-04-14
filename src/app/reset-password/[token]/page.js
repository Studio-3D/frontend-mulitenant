"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { use } from 'react';
import authConfig from '../../../configs/auth'; // Correct import path

export default function ResetPassword({ params }) {
  // Properly unwrap the params using React.use
  const unwrappedParams = use(params);
  const token = unwrappedParams.token;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(true);
  
  const router = useRouter();

  useEffect(() => {
    // Verify token validity
    const verifyToken = async () => {
      try {
        // Change from GET to POST method to match the API requirements
        const response = await axios.post(`${authConfig.validateTokenEndpoint}/${token}`);
        setEmail(response.data.email || '');
        setIsTokenValid(true);
      } catch (err) {
        console.error('Token verification error:', err);
        setIsTokenValid(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Password validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsLoading(true);
    try {
      // Use the correct endpoint from authConfig
      await axios.post(authConfig.resetPasswordEndpoint, {
        email,
        password,
        token,
        password_confirmation: confirmPassword
      });
      
      setSuccess('Votre mot de passe a été réinitialisé avec succès.');
      setPassword('');
      setConfirmPassword('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.response?.data?.message || 'Une erreur est survenue, veuillez réessayer.');
      
      if (err.response?.status === 401) {
        setIsTokenValid(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isTokenValid) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8">
          <div className="flex items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-[#666cff]">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 20h2m0 0h6m-6 0v-8.548c0-.534 0-.801.065-1.05a2 2 0 0 1 .28-.617c.145-.213.346-.39.748-.741l4.801-4.202c.746-.652 1.119-.978 1.538-1.102c.37-.11.765-.11 1.135 0c.42.124.794.45 1.54 1.104l4.8 4.2c.402.352.603.528.748.74c.127.19.222.398.28.618c.065.249.065.516.065 1.05V20m-10 0h4m-4 0v-4a2 2 0 1 1 4 0v4m0 0h6m0 0h2"/>
            </svg>
            <span className="ml-2 text-xl font-bold leading-6">Immo Gestion</span>
          </div>
          
          <h5 className="text-2xl font-semibold mb-4 text-red-500">Lien expiré 🔒</h5>
          <p className="text-gray-500 mb-6">Le lien de réinitialisation est invalide ou a expiré.</p>
          
          <Link 
            href="/forgot-password" 
            className="w-full inline-block py-2 px-4 border border-transparent rounded-md shadow-sm text-center text-sm font-medium !text-white bg-[#666cff] hover:bg-[#5a5fe6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#666cff]"
          >
            Demander un nouveau lien
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 items-center justify-center p-4 !text-gray-500 relative">
      {/* Background Image - Updated styling and path */}
      <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
        {/* Try different image paths */}
        <img 
          src="/images/bg1.jpg" 
          alt="Background illustration" 
          className="w-full h-full object-cover opacity-30"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
      
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative z-10">
        <div className="flex items-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="text-[#666cff]">
            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 20h2m0 0h6m-6 0v-8.548c0-.534 0-.801.065-1.05a2 2 0 0 1 .28-.617c.145-.213.346-.39.748-.741l4.801-4.202c.746-.652 1.119-.978 1.538-1.102c.37-.11.765-.11 1.135 0c.42.124.794.45 1.54 1.104l4.8 4.2c.402.352.603.528.748.74c.127.19.222.398.28.618c.065.249.065.516.065 1.05V20m-10 0h4m-4 0v-4a2 2 0 1 1 4 0v4m0 0h6m0 0h2"/>
          </svg>
          <span className="ml-2 text-xl font-bold leading-6">Immo Gestion</span>
        </div>
        
        <div className="mb-6">
          <h5 className="text-xl font-semibold mb-1.5">Réinitialisation du mot de passe 🔒</h5>
          <p className="text-gray-500 text-sm">
            Votre nouveau mot de passe doit contenir au moins 8 caractères mixte entre des lettres et nombres et symbols pour que votre compte soit bien sécurisé.
          </p>
        </div>

        {success ? (
          <div className="mb-6">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 text-green-700">
              <p>{success}</p>
              <p className="mt-1 text-sm">Redirection vers la page de connexion...</p>
            </div>
          </div>
        ) : (
          <form noValidate autoComplete="off" onSubmit={handleSubmit}>
            <div className="mb-4">
              <div className="relative">
                <label htmlFor="password" className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-transparent
                      ${error && !confirmPassword ? 'border-red-500' : 'border-gray-300'}
                      focus:outline-none focus:ring-2 focus:ring-[#666cff] focus:border-[#666cff] pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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
            </div>

            <div className="mb-6">
              <div className="relative">
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-transparent
                      ${error ? 'border-red-500' : 'border-gray-300'}
                      focus:outline-none focus:ring-2 focus:ring-[#666cff] focus:border-[#666cff] pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? (
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
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium !text-white bg-[#666cff] hover:bg-[#5a5fe6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#666cff] mb-5"
            >
              {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser'}
            </button>
            
            <div className="flex justify-center">
              <Link 
                href="/login" 
                className="flex items-center text-sm font-medium text-[#666cff] hover:underline"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="m12 19-7-7 7-7"></path>
                  <path d="M5 12h14"></path>
                </svg>
                Retour à la connexion
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

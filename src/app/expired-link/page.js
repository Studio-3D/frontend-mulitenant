"use client";
import Link from 'next/link';

export default function ExpiredLink() {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="hidden md:flex md:flex-1 relative items-center justify-center bg-gray-50">
        <div className="px-12 py-20">
          <img
            src="/images/bg1.jpg"
            alt="Real Estate Illustration"
            className="max-w-[38rem] rounded-lg shadow-lg"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 opacity-60"></div>
        <div className="absolute bottom-16 left-0 right-0 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Gestion Immobilière Professionnelle</h2>
          <p className="text-gray-600 mt-2">Solutions complètes pour votre entreprise</p>
        </div>
      </div>

      <div className="w-full md:w-2/5 lg:w-2/5 xl:w-[450px] flex items-center justify-center border-l border-gray-200 !text-gray-500">
        <div className="p-7 w-full max-w-[450px] text-center">
          <div className="absolute top-8 left-8 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 20h2m0 0h6m-6 0v-8.548c0-.534 0-.801.065-1.05a2 2 0 0 1 .28-.617c.145-.213.346-.39.748-.741l4.801-4.202c.746-.652 1.119-.978 1.538-1.102c.37-.11.765-.11 1.135 0c.42.124.794.45 1.54 1.104l4.8 4.2c.402.352.603.528.748.74c.127.19.222.398.28.618c.065.249.065.516.065 1.05V20m-10 0h4m-4 0v-4a2 2 0 1 1 4 0v4m0 0h6m0 0h2"/>
            </svg>
            <span className="ml-2 text-xl font-bold leading-6">Immo Gestion</span>
          </div>

          <div className="mt-16 mb-8">
            <div className="text-[#666cff] mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3H10z"></path>
                <path d="M17 2v9"></path>
              </svg>
            </div>
            <h5 className="text-2xl font-semibold mb-2">Lien expiré! 🔒</h5>
            <p className="text-gray-500 mb-6">
              Ce lien de récupération de mot de passe est invalide ou a expiré.
            </p>
            
            <Link 
              href="/forgot-password" 
              className="w-full inline-block py-2 px-4 mb-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#666cff] hover:bg-[#5a5fe6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#666cff]"
            >
              Demander un nouveau lien
            </Link>
            
            <Link 
              href="/login" 
              className="flex justify-center items-center text-sm font-medium text-[#666cff] hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M5 12h14"></path>
              </svg>
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

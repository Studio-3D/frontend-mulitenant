"use client";

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import authConfig from '../../configs/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await axios.post(authConfig.forgotPasswordEndpoint, { email });
      setSuccess(
        "Un email avec les instructions a été envoyé si l'adresse est associée à un compte."
      );
      setEmail('');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Une erreur est survenue, veuillez réessayer plus tard.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left section - illustration */}
      <div className="hidden md:flex md:flex-1 relative items-center justify-center bg-gray-50">
        <div className="px-12 py-20">
          <img
            src="/images/bg1.jpg"
            alt="Illustration immobilier"
            className="max-w-[38rem] rounded-lg shadow-lg"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-100 opacity-60"></div>

        <div className="absolute bottom-16 left-0 right-0 text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Gestion Immobilière Professionnelle
          </h2>
          <p className="text-gray-600 mt-2">
            Solutions complètes pour votre entreprise
          </p>
        </div>
      </div>

      {/* Right section - form */}
      <div className="w-full md:w-2/5 lg:w-2/5 xl:w-[450px] flex items-center justify-center border-l border-gray-200 text-gray-600">
        <div className="p-8 w-full max-w-[450px]">
          {/* Logo */}
          <div className="absolute top-8 left-8 flex items-center text-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 20h2m0 0h6m-6 0v-8.548c0-.534 0-.801.065-1.05a2 2 0 0 1 .28-.617c.145-.213.346-.39.748-.741l4.801-4.202c.746-.652 1.119-.978 1.538-1.102c.37-.11.765-.11 1.135 0c.42.124.794.45 1.54 1.104l4.8 4.2c.402.352.603.528.748.74c.127.19.222.398.28.618c.065.249.065.516.065 1.05V20m-10 0h4m-4 0v-4a2 2 0 1 1 4 0v4m0 0h6m0 0h2" />
            </svg>
            <span className="ml-2 text-xl font-bold">Immo Gestion</span>
          </div>

          {/* Header */}
          <div className="mb-6 mt-16">
            <h1 className="text-2xl font-semibold mb-2">Mot de passe oublié ? 🔒</h1>
            <p className="text-sm text-gray-500">
              Entrez votre email pour recevoir les instructions de réinitialisation.
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 rounded">
                {success}
              </div>
              <Link
                href="/login"
                className="w-full block text-center py-2 px-4 rounded-md bg-[#666cff] text-white text-sm font-medium hover:bg-[#5a5fe6] transition"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label
                  htmlFor="email"
                  className={`absolute text-xs font-medium bg-white px-1 -top-2 left-3 z-10 ${
                    email ? 'text-[#666cff]' : 'text-gray-500'
                  }`}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-3 border rounded-md bg-transparent placeholder-transparent
                    ${error ? 'border-red-500' : email ? 'border-[#666cff]' : 'border-gray-300'}
                    focus:outline-none focus:border-[#666cff] focus:ring-1 focus:ring-[#666cff]`}
                  required
                />
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 rounded-md bg-[#666cff] text-white text-sm font-medium hover:bg-[#5a5fe6] transition disabled:opacity-50"
              >
                {isLoading ? 'Envoi en cours...' : 'Envoyer les instructions'}
              </button>

              <Link
                href="/login"
                className="flex justify-center items-center text-sm font-medium text-[#666cff] hover:underline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M5 12h14" />
                </svg>
                Retour à la connexion
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

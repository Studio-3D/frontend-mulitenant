"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';

export default function TikTokCallback() {
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Traitement de l\'authentification TikTok...');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for errors from TikTok
        if (error) {
          throw new Error(errorDescription || `TikTok OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Paramètres d\'authentification manquants');
        }

        // Verify state matches what we stored
        const storedState = localStorage.getItem('tiktok_oauth_state');
        if (state !== storedState) {
          throw new Error('État OAuth invalide - possible attaque CSRF');
        }

        setMessage('Échange du code d\'autorisation...');

        // Exchange code for access token
        const token = localStorage.getItem("accessToken");
        const response = await axios.post(
          `${APIURL.ROOTV1}/tiktok/callback`,
          {
            code: code,
            state: state
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data && response.data.success) {
          setStatus('success');
          setMessage('Authentification TikTok réussie!');

          // Store access token temporarily for the parent window
          if (response.data.access_token) {
            localStorage.setItem('tiktok_access_token_temp', response.data.access_token);
          }

          // Notify parent window of success
          if (window.opener) {
            window.opener.postMessage({
              type: 'TIKTOK_AUTH_SUCCESS',
              access_token: response.data.access_token,
              expires_in: response.data.expires_in
            }, window.location.origin);
          }

          // Close the popup after a short delay
          setTimeout(() => {
            window.close();
          }, 1500);

        } else {
          throw new Error(response.data?.message || 'Échec de l\'authentification TikTok');
        }

      } catch (error) {
        console.error('TikTok callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Erreur lors de l\'authentification TikTok');

        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({
            type: 'TIKTOK_AUTH_ERROR',
            error: error.message || 'Erreur lors de l\'authentification TikTok'
          }, window.location.origin);
        }

        // Close popup after error display
        setTimeout(() => {
          window.close();
        }, 3000);
      } finally {
        // Clean up stored state
        localStorage.removeItem('tiktok_oauth_state');
      }
    };

    handleCallback();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        );
      case 'success':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* TikTok Logo */}
            <div className="mb-6">
              <svg 
                className="w-12 h-12 mx-auto text-black" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.23 0 .47.03.7.08V9.4a6.17 6.17 0 00-1-.08 6.3 6.3 0 106.3 6.3c0-.23-.01-.46-.02-.7V9.49a8.32 8.32 0 004.13 1.09V7.14h-.01z" />
              </svg>
            </div>

            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Authentification TikTok
            </h2>

            {/* Status icon */}
            <div className="mb-4">
              {getStatusIcon()}
            </div>

            {/* Status message */}
            <p className={`text-sm ${
              status === 'error' ? 'text-red-600' : 
              status === 'success' ? 'text-green-600' : 
              'text-gray-600'
            }`}>
              {message}
            </p>

            {/* Additional info for processing state */}
            {status === 'processing' && (
              <p className="text-xs text-gray-500 mt-2">
                Veuillez patienter pendant que nous finalisons votre authentification...
              </p>
            )}

            {/* Error state - offer retry or close */}
            {status === 'error' && (
              <div className="mt-4 space-y-2">
                <button
                  onClick={() => window.close()}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Fermer
                </button>
              </div>
            )}

            {/* Success state info */}
            {status === 'success' && (
              <p className="text-xs text-gray-500 mt-2">
                Cette fenêtre se fermera automatiquement...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

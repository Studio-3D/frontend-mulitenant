"use client";
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader } from 'lucide-react';

const DeconnexionPage = () => {
  const { forceLogout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const performLogout = async () => {
      try {
        await forceLogout();
        // Ensure redirect happens even if forceLogout doesn't redirect
        setTimeout(() => {
          try {
            router.push('/login');
          } catch (error) {
            // Fallback to window.location if router.push fails
            console.warn("Router.push failed, using window.location:", error);
            window.location.href = '/login';
          }
        }, 500);
      } catch (error) {
        console.error('Logout error:', error);
        // Even if logout fails, redirect to login
        router.push('/login');
      }
    };

    performLogout();
  }, [forceLogout, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Déconnexion en cours...</h2>
        <p className="text-sm text-gray-600">Veuillez patienter pendant que nous vous déconnectons.</p>
      </div>
    </div>
  );
};

export default DeconnexionPage;

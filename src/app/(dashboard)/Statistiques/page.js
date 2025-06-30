'use client';
import React, { useEffect, useState } from 'react';
import { Dashboard } from '../../../components/statistique/Dashboard';
import { fr } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';

// Set default locale to French for all date-fns functions
setDefaultOptions({
  locale: fr,
});

const page = () => {
  const [isLoading, setIsLoading] = useState(true);


   // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  if (isLoading) {
    return (
      <div className="flex w-full min-h-screen justify-center items-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}

export default page;

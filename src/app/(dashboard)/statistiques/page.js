'use client';
import React, { useEffect, useState } from 'react';
import { Dashboard } from '../../../components/statistique/Dashboard';
import { fr } from 'date-fns/locale';
import { setDefaultOptions } from 'date-fns';
// Set default locale to French for all date-fns functions
setDefaultOptions({
  locale: fr,
});

export default function page() {
  /*const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
      <LoadingSpin />
    </div>
    );
  }*/

  return <Dashboard />;
}

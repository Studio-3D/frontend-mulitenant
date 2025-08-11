'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useClearNomPrenomFrein() {
  /* Removes selectedProspect when navigating to another route ✅ Removes selectedProspect when refreshing the page ✅ Removes selectedProspect when the VisiteForm component unmounts*/

  const router = useRouter();

  useEffect(() => {
    // Function to clear localStorage
    const clearProspect = () => {
      localStorage.removeItem('nom_prenom_frein');
    };

    // Clear localStorage on page reload
    window.addEventListener('beforeunload', clearProspect);

     // Clear localStorage when navigating to another route
     const handleRouteChange = () => {
        clearProspect();
    };
    return () => {
      window.removeEventListener('beforeunload', clearProspect);
      handleRouteChange();
    };
  }, [router]);
}



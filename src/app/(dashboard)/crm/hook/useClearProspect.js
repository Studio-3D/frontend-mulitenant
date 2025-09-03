'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useClearProspect() {
  /* Removes selectedProspect when navigating to another route ✅ Removes selectedProspect when refreshing the page ✅ Removes selectedProspect when the VisiteForm component unmounts*/

  const router = useRouter();

  useEffect(() => {
    // Function to clear localStorage
    const clearProspect = () => {
     // localStorage.removeItem('selectedProspect');
      //localStorage.removeItem('selectedClient');
      if(localStorage.getItem('selectedClient_show_client')){
        localStorage.removeItem('selectedClient_show_client')
      }
       if(localStorage.getItem('selectedProspect')){
        localStorage.removeItem('selectedProspect')
      }
       if(localStorage.getItem('selectedClient')){
        localStorage.removeItem('selectedClient')
      }

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



'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, isCommercial, isRespoLivraison, isSuperAdmin } from '@/configs/enum';
import EtatDossierTable from './EtatDossierTable';

export default function Page() {
 
  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();

   useEffect(() => {
      if (
        !isAdmin(userRole) &&
        !isSuperAdmin(userRole) &&
        !isRespoLivraison(userRole)
      ) {
        router.push('/');
      }
    }, [router]);



  //const clientId = dataClient?.dataClient?.id;
  return (
    <div>
     
            <EtatDossierTable  />
        
    </div>
  );
}

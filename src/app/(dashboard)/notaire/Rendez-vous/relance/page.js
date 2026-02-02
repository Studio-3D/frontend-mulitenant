'use client';

import React, { useEffect } from 'react';
import RelancesRdv_notaire from '../page';
import { useRouter } from 'next/navigation';
import { isNotaire,isAdmin, isSuperAdmin, isRespoLivraison} from '@/configs/enum';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();
// Validation du rôle
  useEffect(() => {
    if (!isNotaire(userRole) && !isRespoLivraison(userRole)) {
      router.push('/');
    }
  }, [router, userRole]);

  
 

  return (
    <div>
      
        <>
          <div>
         
            <RelancesRdv_notaire type={2} />
          </div>
        </>
      
    </div>
  );
}

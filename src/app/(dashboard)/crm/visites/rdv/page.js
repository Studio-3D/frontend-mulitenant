'use client';

import React, { useEffect } from 'react';
import RelancesRdv_Visites_Table from '../RelancesRdv_Visites_Table';
import { isAdmin, isSuperAdmin, isCommercial, isRespoCommercial } from '../../../../../configs/enum';
import { useAuth } from '../../../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Page() {
  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();
  useEffect(() => {
    if (
      !isAdmin(userRole) &&
      !isSuperAdmin(userRole) &&
      !isCommercial(userRole)&&
      !isRespoCommercial(userRole)
    ) {
      router.push('/');
    }
  }, [router]);

  
 

  return (
    <div>
      
        <>
          <div>
         
            <RelancesRdv_Visites_Table type={2} />
          </div>
        </>
      
    </div>
  );
}

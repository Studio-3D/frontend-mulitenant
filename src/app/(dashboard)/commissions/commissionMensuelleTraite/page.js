'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Trait_accCommissionTable from '../commissionCumul/Trait_accCommissionTable';
import { isAdmin, isCommercial, isSuperAdmin } from '@/configs/enum';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
  const [child, setChild] = useState(null);
  const { user } = useAuth();
  const userRole = user?.role;
  const router = useRouter();
  useEffect(() => {
    if (
      !isAdmin(userRole) &&
      !isSuperAdmin(userRole) &&
      !isCommercial(userRole)
    ) {
      router.push('/');
    }
  }, [router]);


  return (
    <div>
      {child ? (
        child
      ) : (
        <>
          <div>
            <Trait_accCommissionTable type={1}/>
          </div>
        </>
      )}
    </div>
  );
}

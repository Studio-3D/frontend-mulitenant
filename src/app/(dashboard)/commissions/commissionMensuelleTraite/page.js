'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CommissionTableParType from '../commissionCumul/CommissionTableParType';
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
            <CommissionTableParType type={1}/>
          </div>
        </>
      )}
    </div>
  );
}

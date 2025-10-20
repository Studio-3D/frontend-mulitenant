'use client';

import React, { useEffect } from 'react';
import RelancesFreinsTable from './RelancesFreinsTable';
import { isAdmin, isSuperAdmin, isCommercial } from '../../../../../configs/enum';
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
      !isCommercial(userRole)
    ) {
      router.push('/');
    }
  }, [router]);

  
 

  return (
    <div>
      <RelancesFreinsTable />
    </div>
  );
}

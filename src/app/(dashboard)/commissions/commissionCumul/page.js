'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Trait_accCommissionTable from './Trait_accCommissionTable';
import { isAdmin, isCommercial, isSuperAdmin } from '@/configs/enum';
import { useAuth } from '@/context/AuthContext';

export default function Page() {
  const ACTION = { EDIT: 'edit', ADD: 'add' };
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
            <Trait_accCommissionTable type={0} />
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import HistoImpoTable from './HistoImpoTable';
import { useRouter } from 'next/navigation';
import { isAdmin, isSuperAdmin, isCommercial } from '../../../configs/enum';
import { useAuth } from '../../../context/AuthContext';

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
      <HistoImpoTable />
    </div>
  );
}

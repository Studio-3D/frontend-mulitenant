'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import { ComptabilitePage } from '../../../components/comptabilite/ComptabilitePage';
import LoadingSpin from '@/components/LoadingSpin';

const Page = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Check user permissions
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }

  return (
    <div>
      <ComptabilitePage />
    </div>
  );
};

export default Page;

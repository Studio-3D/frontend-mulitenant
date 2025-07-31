'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import CoefficientManager from '@/components/comptabilite/CoefficientManager';
import ComptabiliteTabsNav from '@/components/comptabilite/ComptabiliteTabsNav';
import LoadingSpin from '@/components/LoadingSpin';

const CoefficientPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Check user permissions
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)) {
      router.push('/home');
    }
  }, [user, router]);

  // Check if project is selected

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }

  return (
    <div >
      <ComptabiliteTabsNav />

      <CoefficientManager />
    </div>
  );
};

export default CoefficientPage;

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isComptable, isSuperAdmin } from '@/configs/enum';
import ComptabiliteTabsNav from '@/components/comptabilite/ComptabiliteTabsNav';
import FournisseursManager from '@/components/comptabilite/FournisseursManager';
import LoadingSpin from '@/components/LoadingSpin';

const FournisseursPage = () => {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const router = useRouter();

  // Check user permissions and project selection
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)&& !isComptable(user.role)) {
      router.push('/home');
    } else if (!selectedProjet) {
      router.push('/comptabilite');
    }
  }, [user, selectedProjet, router]);

  if (!user || !selectedProjet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> {/* Use your loading spinner here */}
      </div>
    );
  }

  return (
    <div >
    </div>
  );
};

export default FournisseursPage;

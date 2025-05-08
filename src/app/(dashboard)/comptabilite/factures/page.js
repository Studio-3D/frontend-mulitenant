'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import ComptabiliteTabsNav from '@/components/comptabilite/ComptabiliteTabsNav';
import FacturesManager from '@/components/comptabilite/FacturesManager';

const FacturesPage = () => {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const router = useRouter();

  // Check user permissions and project selection
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)) {
      router.push('/home');
    } else if (!selectedProjet) {
      router.push('/comptabilite');
    }
  }, [user, selectedProjet, router]);

  if (!user || !selectedProjet) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Comptabilité - Factures</h1>
      
      <ComptabiliteTabsNav />
      
      <FacturesManager userRole={user?.role} />
    </div>
  );
};

export default FacturesPage;

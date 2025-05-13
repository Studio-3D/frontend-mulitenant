'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import ComptabiliteTabsNav from '@/components/comptabilite/ComptabiliteTabsNav';
import DecomptesManager from '@/components/comptabilite/DecomptesManager';

const DecomptesPage = () => {
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
      <h1 className="text-2xl font-bold mb-6">Comptabilité - Décomptes</h1>
      
      <ComptabiliteTabsNav />
      
      <DecomptesManager userRole={user?.role} />
    </div>
  );
};

export default DecomptesPage;

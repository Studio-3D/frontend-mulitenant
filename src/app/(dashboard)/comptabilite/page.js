'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import TvaTrancheManager from '@/components/comptabilite/TvaTrancheManager';
import ProjetSelector from '@/components/ProjetSelector';
import ComptabiliteTabsNav from '@/components/comptabilite/ComptabiliteTabsNav';

const ComptabilitePage = () => {
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const [needsProjectSelection, setNeedsProjectSelection] = useState(true);
  const router = useRouter();

  // Check user permissions
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)) {
      router.push('/home');
    }
  }, [user, router]);

  // Check if project is selected
  useEffect(() => {
    if (selectedProjet) {
      setNeedsProjectSelection(false);
    } else {
      setNeedsProjectSelection(true);
    }
  }, [selectedProjet]);

  const handleProjectSelected = () => {
    setNeedsProjectSelection(false);
  };

  if (!user) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Comptabilité - TVA</h1>
      
      {/* Tabs navigation */}
      <ComptabiliteTabsNav />
      
      {needsProjectSelection ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sélectionner un projet</h2>
          <p className="mb-4">Veuillez sélectionner un projet pour gérer la TVA</p>
          <ProjetSelector onSelect={handleProjectSelected} />
        </div>
      ) : (
        <TvaTrancheManager userRole={user?.role} />
      )}
    </div>
  );
};

export default ComptabilitePage;

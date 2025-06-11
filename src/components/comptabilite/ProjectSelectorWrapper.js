'use client';

import { useProjet } from '@/context/ProjetContext';
import ProjetDialog from '@/components/ProjetDialog';

const ProjectSelectorWrapper = ({ children }) => {
  const { selectedProjet } = useProjet();

  if (!selectedProjet) {
    return (
      <div className="flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 !text-gray-800">Sélectionner un projet</h2>
        <p className="mb-6 !text-gray-600 text-center">
          Veuillez sélectionner un projet pour accéder à la comptabilité
        </p>
        <ProjetDialog />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProjectSelectorWrapper;

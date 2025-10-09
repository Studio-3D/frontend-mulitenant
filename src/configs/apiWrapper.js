// hooks/useSelectedProjet.js
import { useProjet } from '@/context/ProjetContext';

export const useSelectedProjet = () => {
  const { selectedProjet } = useProjet();
  return selectedProjet;
};
'use client';

import { AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useSociete } from '@/context/SocieteContext'; // ✅ import du context

export default function DeletSociete({
  Id,
  onClose,
  message,
  type = 'Donnée',
}) {
  const [loading, setLoading] = useState(false);
  const { deleteSociete } = useSociete(); // ✅ utilise le context

  const handleDelete = async () => {
    if (!Id) {
      toast.error(`${type} invalide`);
      return;
    }

    setLoading(true);
    try {
      // ✅ suppression via le contexte
      await deleteSociete(Id);

      if (onClose) onClose(); // Fermer le modal
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-[500px] p-4">
      <AlertCircle className="text-[#FF4E4E] w-14 h-14 mx-auto mt-2 mb-4" />
      <h2 className="text-xl font-semibold text-center">
        Confirmation de la suppression
      </h2>
      <p className="text-center text-[#878484] mt-2">{message}</p>
      <div className="flex justify-center gap-4 mt-4 mb-4">
        <button
          className="font-medium px-4 py-2 rounded-lg bg-gray-200"
          onClick={onClose}
        >              
          Non, annuler
        </button>
        <button
          className={`font-medium px-4 py-2 rounded-lg bg-[#FF4E4E] text-text ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? 'Suppression...' : 'Oui, supprimer'}
        </button>
      </div>
    </div>
  );
}

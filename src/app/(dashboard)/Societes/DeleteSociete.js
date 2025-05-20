'use client';
import { AlertCircle } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { APIURL } from '../../../configs/api';
import { useState } from 'react';
import { useSociete } from "../../../context/SocieteContext"; 

export default function DeleteSociete({ societeId, accessToken, onClose }) {
  const [loading, setLoading] = useState(false);
  const { refreshSocietes } = useSociete();

  // Delete societe handler
  const handleDelete = async () => {
    if (!societeId || !accessToken) {
      toast.error('Société ou token invalide');
      return;
    }
  
    setLoading(true);
    try {
      await axios.delete(`${APIURL.SOCIETES}/${societeId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
  
      toast.success('Société supprimée avec succès');
      onClose(societeId);
      refreshSocietes();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="w-[500px] p-4">
      <AlertCircle className="text-[#FF4E4E] text-6xl mx-auto mt-2 mb-4" />
      <h2 className="text-xl font-semibold text-center">Supprimer Société</h2>
      <p className="text-center text-[#878484] mt-2">
        Êtes-vous sûr de vouloir supprimer cette société ?
      </p>
      <div className="flex justify-center gap-4 mt-4 mb-4">
        <button
          className="font-medium px-4 py-2 rounded-lg bg-gray-200"
          onClick={onClose}
        >
          Non, annuler
        </button>
        <button
          className={`font-medium px-4 py-2 rounded-lg bg-[#FF4E4E] text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? 'Suppression...' : 'Oui, supprimer'}
        </button>
      </div>
    </div>
  );
}

'use client';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { APIURL } from '@/configs/api';

export default function Modal_Relance({ id, onClose, text }) {
  const { user, token } = useAuth();
  const accessToken = token || localStorage.getItem('accessToken');

  const [loading, setLoading] = useState(false); // State for loading spinner

  // Delete user handler
  const handleRelance = async () => {
    if (!id || !accessToken) {
      toast.error(`Id ou token invalide`);
      return;
    }

    setLoading(true); // Start loading
    try {
      await axios.get(`${APIURL.ROOTV1}/relancer_reservation/${Number(id)}`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      localStorage.setItem('load_reservation_show', 1);
      toast.success(`la Réservation est relancée!`);
      if (onClose) onClose();
    } catch (error) {
      console.error(
        'API Error:',
        error.response ? error.response.data : error.message
      );
      toast.error('Erreur lors de la suppression');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="w-[500px] p-4">
      <div className="w-full h-[60px] bg-[#5483b3] px-4">
        <div className="flex items-center justify-center h-full">
          <h1 className="text-3xl font-bold text-center text-white">
            Information
          </h1>
        </div>
      </div>
      <p className="text-center text-black mt-2">{text}</p>
      <p className="text-center text-[#878484] mt-2">
        {user.role == 3 && 'Voulez-vous Relancer cette Réservation'}
      </p>
      <div className="flex justify-center gap-4 mt-4 mb-4">
        {user.role == 3 ? (
          <>
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
              onClick={handleRelance}
              disabled={loading} // Disable while loading
            >
              {loading ? 'En Cours' : 'Oui, relancer'}
            </button>
          </>
        ) : (
          <button
            className="font-medium px-4 py-2 rounded-lg bg-gray-200"
            onClick={onClose}
          >
            OK
          </button>
        )}
      </div>
    </div>
  );
}

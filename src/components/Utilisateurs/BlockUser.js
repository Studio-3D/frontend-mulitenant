'use client';
import { AlertCircle } from "lucide-react";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { APIURL } from '../../configs/api';
import { useState } from 'react';

export default function BlockUser({ userId, accessToken, onClose }) { 
   const [loading, setLoading] = useState(false); // Moved loading state to the top level

   // Block user
   const handleBloquer = async () => {
      if (!userId || !accessToken) {
         toast.error('Utilisateur ou token invalide');
         return;
      }

      setLoading(true); // Start loading spinner
      try {
         await axios.put(`${APIURL.ROOT}/v1/desactivateUser/${userId}`, {}, {
            headers: {
               'Content-Type': 'application/json',
               'Accept': 'application/json',
               'Authorization': `Bearer ${accessToken}`
            }
         });
         toast.success('Utilisateur bloqué avec succès');
         if (onClose) onClose();
      } catch (error) {
         toast.error('Erreur lors du blocage');
      } finally {
         setLoading(false); // Stop loading spinner
      }
   };

   return (
      <div className=" w-[500px] p-4">
         {/* Confirmation Dialog */}
         <div className="text-center">
            <AlertCircle className="text-[#FF4E4E] w-14 h-14 mx-auto mt-2 mb-4" />
            <h2 className="text-xl font-semibold">Bloquer l'utilisateur</h2>
            <p className="text-[#878484] mt-2">Êtes-vous sûr de vouloir bloquer cet utilisateur ?</p>
            <div className="flex justify-center gap-4 mt-4 mb-4">
               <button 
                  onClick={onClose} 
                  className="font-medium px-4 py-2 rounded-lg bg-gray-200"
                  disabled={loading} // Disable button while loading
               >
                  Non, Annuler
               </button>
               <button
                  className={`text-white font-medium px-4 py-2 rounded-lg ${loading ? 'bg-red-300 cursor-not-allowed' : 'bg-[#FF4E4E]'}`}
                  onClick={handleBloquer}
                  disabled={loading} // Disable button while loading
               >
                  {loading ? 'Blocage...' : 'Oui, Bloquer'}
               </button>
            </div>
         </div>
      </div>
   );
}

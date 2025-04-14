'use client';
import { IoAlertCircleOutline } from "react-icons/io5";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { APIURL } from '../../configs/api';
import { useState } from 'react';

export default function UnblockUser({ userId, accessToken, onClose }) { // Ensure props are passed
       const [loading, setLoading] = useState(false); // Moved loading state to the top level
    
    // unblock user
    const handleDebloquer = async() => {

        if (!userId || !accessToken) {
            toast.error('Utilisateur ou token invalide');
            return;
        }
        setLoading(true); // Start loading spinner
        try {
            await axios.put(`${APIURL.ROOT}/v1/activateUser/${userId}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            toast.success('Utilisateur débloqué avec succès');
            onClose();
        } catch (error) {
            toast.error('Erreur lors du déblocage');
        }finally {
            setLoading(false); // Stop loading spinner
        }
    };
        

    return (
        <div className="w-[500px] p-4">
            {/* Unblock Confirmation */}
            <div className="text-center">
                <IoAlertCircleOutline className="text-[#FFA500] text-6xl mx-auto mt-2 mb-4" />
                <h2 className="text-xl font-semibold">Débloquer l'utilisateur</h2>
                <p className="text-[#878484] mt-2">Êtes-vous sûr de vouloir débloquer cet utilisateur ?</p>
                <div className="flex justify-center gap-4 mt-4 mb-4">
                    <button onClick={onClose} className="font-medium px-4 py-2 rounded-lg bg-gray-200">
                        Non, Annuler
                    </button>
                    <button className="text-white font-medium px-4 py-2 rounded-lg bg-[#4CAF50]"
                        onClick={handleDebloquer}
                        disabled={loading} // Disable button while loading
                        >
                            {loading ? 'Déblocage...' : 'Oui, Débloquer'}
                    </button>
                </div>
            </div>
        </div>
    );
}

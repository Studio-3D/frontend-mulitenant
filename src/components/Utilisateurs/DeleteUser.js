'use client';
import { IoAlertCircleOutline } from "react-icons/io5";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { APIURL } from '../../configs/api';
import { useState } from 'react';

export default function DeleteUser({ userId, accessToken, onClose }) {
    const [loading, setLoading] = useState(false); // State for loading spinner

    // Delete user handler
    const handleDelete = async () => {
        if (!userId || !accessToken) {
            toast.error('Utilisateur ou token invalide');
            return;
        }

        setLoading(true); // Start loading
        try {
            await axios.delete(`${APIURL.UTILISATEURS}/${userId}`,{
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            toast.success('Utilisateur supprimé avec succès');
            if (onClose) onClose();
        } catch (error) {
            console.error('API Error:', error.response ? error.response.data : error.message);
            toast.error('Erreur lors de la suppression');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="w-[500px] p-4">
            <IoAlertCircleOutline className="text-[#FF4E4E] text-6xl mx-auto mt-2 mb-4" />
            <h2 className="text-xl font-semibold text-center">Supprimer l'utilisateur</h2>
            <p className="text-center text-[#878484] mt-2">Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
            <div className="flex justify-center gap-4 mt-4 mb-4">
                <button
                    className="font-medium px-4 py-2 rounded-lg bg-gray-200"
                    onClick={onClose}
                >
                    Non, annuler
                </button>
                <button
                    className={`font-medium px-4 py-2 rounded-lg bg-[#FF4E4E] text-text ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={handleDelete}
                    disabled={loading} // Disable while loading
                >
                    {loading ? 'Suppression...' : 'Oui, supprimer'}
                </button>
            </div>
        </div>
    );
}

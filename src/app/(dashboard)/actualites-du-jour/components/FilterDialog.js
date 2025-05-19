import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Modal from '@/components/Modal';
import { X } from 'lucide-react';
import Autocomplete from '@/components/Autocomplete';

export default function FilterDialog({ onClose, onSubmit, initialValues, projetId, mode = 'filter' }) {
  const [fromDate, setFromDate] = useState(initialValues?.fromDate || '');
  const [toDate, setToDate] = useState(initialValues?.toDate || '');
  const [commercial, setCommercial] = useState(null);
  const [commercials, setCommercials] = useState([]);
  const [loadingCommercials, setLoadingCommercials] = useState(false);

  // Fetch commercials when dialog opens
  useEffect(() => {
    if (!projetId) return;
    
    const fetchCommercials = async () => {
      setLoadingCommercials(true);
      const accessToken = localStorage.getItem('accessToken');
      
      try {
        // Update to match the old frontend URL pattern exactly
        const response = await axios.get(
          `${APIURL.ROOTV1}/get_commerciaux/${projetId}`, 
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        
        // Add "All commercials" option - consistent with the old frontend
        const commercialsList = [
          { id: 'tout', name: 'Tous les Commerciaux', prenom: '', tout: 1 }
        ];
        
        // Format commercials data to match expected structure
        if (response.data.users && Array.isArray(response.data.users)) {
          response.data.users.forEach(user => {
            if (user.user) {
              commercialsList.push({
                id: user.user.id,
                name: user.user.name || '',
                prenom: user.user.prenom || '',
                user: user.user
              });
            } else {
              commercialsList.push({
                id: user.id,
                name: user.name || '',
                prenom: user.prenom || '',
                user: user
              });
            }
          });
        }
        
        setCommercials(commercialsList);
      } catch (error) {
        console.error('Error fetching commercials:', error);
      } finally {
        setLoadingCommercials(false);
      }
    };
    
    fetchCommercials();
  }, [projetId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      fromDate,
      toDate,
      commercial: commercial || { id: 'tous', name: 'Tous les Commerciaux' }
    });
  };

  const getTitle = () => {
    return mode === 'activities' ? "Activités par Commerciaux" : "Actualités Par commerciaux";
  };

  return (
    <Modal isVisible={true} onClose={onClose}>
      <div className="w-[500px] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{getTitle()}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                De:
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full h-[38px] p-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500"
                required={mode === 'activities'}
              />
            </div>
            
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                à:
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full h-[38px] p-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500"
                required={mode === 'activities'}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <Autocomplete
              label="Commercial:"
              options={commercials}
              value={commercial}
              onChange={setCommercial}
              placeholder="Choisissez un Commercial"
              loading={loadingCommercials}
              choix="name"
              required={false}
              name="commercial"
              errors={{}}
              backendErrors={{}}
            />
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#666CFF] text-white rounded-md hover:bg-indigo-600"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

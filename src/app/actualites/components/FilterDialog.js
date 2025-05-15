import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Modal from '@/components/Modal';
import { X } from 'lucide-react';
import Autocomplete from '@/components/Autocomplete';

export default function FilterDialog({ onClose, onSubmit, initialValues, projetId }) {
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
        const response = await axios.get(
          `${APIURL.ROOTV1}/get_commerciaux/${projetId}`, 
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        );
        
        // Add "All commercials" option
        const commercialsList = [
          { id: 'tous', nom: 'Tous les Commerciaux', prenom: '', name: 'Tous les Commerciaux' }
        ];
        
        // Format commercials data
        response.data.users.forEach(user => {
          commercialsList.push({
            id: user.user?.id || user.id,
            nom: user.user?.name || user.name || '',
            prenom: user.user?.prenom || user.prenom || '',
            name: `${user.user?.name || user.name || ''} ${user.user?.prenom || user.prenom || ''}`.trim()
          });
        });
        
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
      commercial
    });
  };

  return (
    <Modal isVisible={true} onClose={onClose}>
      <div className="w-[500px] p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filtrer les actualités</h2>
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
              />
            </div>
          </div>
          
          <div className="mb-4">
            <Autocomplete
              label="Commercial:"
              options={commercials}
              value={commercial}
              onChange={setCommercial}
              placeholder="Choisissez un commercial"
              loading={loadingCommercials}
              choix="name"
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
              className="px-4 py-2 bg-[#009FFF] text-white rounded-md hover:bg-blue-600"
            >
              Appliquer
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

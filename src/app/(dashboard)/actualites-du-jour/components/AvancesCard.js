import React, { useState } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { toast } from 'react-hot-toast';
import Modal from '@/components/Modal';

export default function AvancesCard({ avances = [], sumAvances = 0, commercial = 'tous' }) {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyDate, setHistoryDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [historySumAvances, setHistorySumAvances] = useState(0);

  const fetchHistory = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const accessToken = localStorage.getItem('accessToken');
    
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/historiques/${historyDate}/${commercial}/avances`, 
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      
      setHistoryData(response.data.historiques || []);
      setHistorySumAvances(response.data.sum_avances || 0);
      setShowHistoryModal(false);
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Erreur lors du chargement de l\'historique');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden h-full">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div className="text-lg font-semibold">Paiements</div>
          <button 
            onClick={() => setShowHistoryModal(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <span>+</span>
          </button>
        </div>
        
        <div className="px-6 pt-4 pb-2">
          {historyDate && (
            <div className="text-lg font-semibold mb-2 text-green-600">
              Date: {format(new Date(historyDate), 'dd/MM/yyyy')}
            </div>
          )}
          
          <div className="text-xl font-bold mb-4 text-blue-600">
            {historyDate ? historySumAvances : sumAvances} DH
          </div>
          
          <div className="flex justify-between mb-4 text-gray-500 text-sm font-medium">
            <div>Propriété dite Bien</div>
            <div>Avances</div>
          </div>
          
          <div className="space-y-4">
            {(historyDate ? historyData : avances).map((item, index) => (
              <div key={index} className="flex items-center">
                {/* Remove Home icon */}
                <div className="flex-1">
                  <div className="font-medium">{item.propriete_dite_bien}</div>
                  <div className="text-sm text-gray-500">
                    {item.tranche_nom ? item.tranche_nom : ''}
                    {item.bloc_nom ? '-' + item.bloc_nom : ''}
                    {item.immeuble_nom ? '-' + item.immeuble_nom : ''}
                  </div>
                </div>
                
                <div className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {item.montant} DH
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* History Modal */}
      {showHistoryModal && (
        <Modal isVisible={true} onClose={() => setShowHistoryModal(false)}>
          <div className="w-[400px] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Historique des Avances</h2>
              <button 
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                X
              </button>
            </div>
            
            <form onSubmit={fetchHistory}>
              <div className="mb-4">
                <label className="block font-medium text-gray-700 mb-1">
                  Date:
                </label>
                <input
                  type="date"
                  value={historyDate || ''}
                  onChange={(e) => setHistoryDate(e.target.value)}
                  required
                  className="w-full h-[38px] p-2 border border-gray-300 rounded-md focus:outline-none hover:border-gray-500 focus:border-gray-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowHistoryModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#009FFF] text-white rounded-md hover:bg-blue-600"
                  disabled={loading}
                >
                  {loading ? "Chargement..." : "Rechercher"}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}

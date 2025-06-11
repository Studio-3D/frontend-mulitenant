'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const TvaDialog = ({ isOpen, onClose, onSave, tranche, action, projet }) => {
  const [formData, setFormData] = useState({
    coeff: tranche?.coefficient_tranche?.coefficient || '',
    qp_bati: tranche?.qp_bati || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className={`p-6 ${action === 0 ? 'bg-purple-600' : 'bg-orange-500'} text-white`}>
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {action === 0 ? 'Calculer TVA' : 'Modifier TVA'}
              </h3>
              <button 
                onClick={onClose}
                disabled={isSubmitting}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
          </div>
          
          {/* Warning message for editing */}
          {action === 1 && (
            <div className="px-6 py-3 bg-red-200 !text-red-700 flex items-center gap-2">
              <AlertTriangle size={20} />
              <p className="text-sm">
                Si vous modifiez le coefficient ou le QP Terrain Bati, tous les TVA des biens correspondant à cette tranche seront recalculés.
              </p>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Tranche
                </label>
                <input
                  type="text"
                  value={tranche.nom}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Prix Acquisition du Projet
                </label>
                <input
                  type="text"
                  value={projet?.prix_acquisition?.toLocaleString() || ''}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  Coefficient de Réévaluation <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="coeff"
                  value={formData.coeff}
                  onChange={handleChange}
                  step="any"
                  placeholder="1.009"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium !text-gray-700 mb-1">
                  QP Terrain Bati <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="qp_bati"
                  value={formData.qp_bati}
                  onChange={handleChange}
                  placeholder="22295"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium !text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TvaDialog;

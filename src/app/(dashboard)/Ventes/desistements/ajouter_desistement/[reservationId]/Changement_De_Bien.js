import React from 'react'
import { CalendarIcon, TrendingUpIcon, BarChart3Icon } from 'lucide-react'
export function Changement_De_Bien({ formData, updateFormData }) {
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      updateFormData({ [name]: files[0] });
    } else if (type === 'radio' || type === 'checkbox') {
      updateFormData({ [name]: checked ? value : '' });
    } else {
      updateFormData({ [name]: value });
    }
  };  return (
    <div className="p-6">
     
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type d'Investissement <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Investissement locatif</option>
              <option>Projet de développement</option>
              <option>Fond immobilier</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portefeuille Total (DH) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
      <div className="border-t border-gray-200 py-4">
        <h3 className="text-md font-medium text-indigo-600 mb-4">
          Détails de l'Investissement
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ROI Prévu (%) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durée d'Investissement <span className="text-red-500">*</span>
            </label>
            <select className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Court terme (1-2 ans)</option>
              <option>Moyen terme (3-5 ans)</option>
              <option>Long terme (5+ ans)</option>
            </select>
          </div>
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Options de Réallocation
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Transfert vers autre projet
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Report sur phase suivante
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Conversion en parts
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

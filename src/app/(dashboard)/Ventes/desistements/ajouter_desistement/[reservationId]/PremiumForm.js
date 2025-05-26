import React from 'react'
import { CalendarIcon, HomeIcon } from 'lucide-react'
export function PremiumForm() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-medium text-indigo-600 mb-6">
        Ajouter Désistement - Premium
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de Bien Premium <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Villa de luxe</option>
              <option>Appartement haut standing</option>
              <option>Penthouse</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Services Inclus <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Conciergerie 24/7
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Service voiturier
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Accès spa & fitness
              </span>
            </label>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4">
        <h3 className="text-md font-medium text-indigo-600 mb-4">
          Options de Remboursement Premium
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mode de Remboursement <span className="text-red-500">*</span>
            </label>
            <select className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Remboursement intégral</option>
              <option>Échange avec autre bien premium</option>
              <option>Report sur projet futur</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Délai de Traitement Prioritaire
            </label>
            <select className="block w-full rounded-md border border-gray-300 py-2 px-3 bg-white shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>24 heures</option>
              <option>48 heures</option>
              <option>72 heures</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

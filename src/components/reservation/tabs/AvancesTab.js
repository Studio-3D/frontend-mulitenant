import React from 'react';
import { CoinsIcon, PlusIcon } from 'lucide-react';

// Mock data for avances
const avancesData = [
  {
    id: 1,
    montant: '10000 €',
    date: '15/06/2023',
    type: 'Acompte',
    methode: 'Virement bancaire',
    reference: 'VIR-2023-001',
    status: 'Confirmé'
  },
  {
    id: 2,
    montant: '5000 €',
    date: '22/06/2023',
    type: 'Avance',
    methode: 'Chèque',
    reference: 'CHQ-2023-042',
    status: 'En attente'
  },
  {
    id: 3,
    montant: '1000 €',
    date: '28/06/2023',
    type: 'Frais de dossier',
    methode: 'Carte bancaire',
    reference: 'CB-2023-105',
    status: 'Confirmé'
  }
];

export const AvancesTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <CoinsIcon className="h-5 w-5 mr-2 text-blue-500" />
          Avances
        </h2>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center">
          <PlusIcon className="h-4 w-4 mr-1" />
          Ajouter un paiement
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">Total versé</p>
            <p className="text-2xl font-bold">16 000 €</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Reste à payer</p>
            <p className="text-2xl font-bold">304 000 €</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pourcentage versé</p>
            <p className="text-2xl font-bold">5%</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Montant
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Méthode
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Référence
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {avancesData.map(avance => (
              <tr key={avance.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {avance.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {avance.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {avance.montant}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {avance.methode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {avance.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${avance.status === 'Confirmé' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {avance.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
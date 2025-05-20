import React from 'react';
import { ClockIcon } from 'lucide-react';

// Mock data for historiques
const historiqueData = [
  {
    id: 1,
    date: '12/06/2023',
    type: 'Création',
    description: 'Création de la réservation',
    user: 'Marie Dupont'
  },
  {
    id: 2,
    date: '14/06/2023',
    type: 'Modification',
    description: 'Mise à jour des informations client',
    user: 'Jean Martin'
  },
  {
    id: 3,
    date: '18/06/2023',
    type: 'Document',
    description: "Ajout de pièce d'identité",
    user: 'Marie Dupont'
  },
  {
    id: 4,
    date: '22/06/2023',
    type: 'Rendez-vous',
    description: 'Planification de la visite technique',
    user: 'Pierre Lemoine'
  },
  {
    id: 5,
    date: '25/06/2023',
    type: 'Paiement',
    description: 'Réception du premier acompte',
    user: 'Sophie Bernard'
  }
];

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'Création':
      return 'bg-green-100 text-green-800';
    case 'Modification':
      return 'bg-yellow-100 text-yellow-800';
    case 'Document':
      return 'bg-blue-100 text-blue-800';
    case 'Rendez-vous':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const HistoriquesTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <ClockIcon className="h-5 w-5 mr-2 text-blue-500" />
          Historiques
        </h2>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="px-3 py-1 border border-gray-300 rounded-md text-sm" 
          />
          <select className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-white">
            <option value="">Tous les types</option>
            <option value="creation">Création</option>
            <option value="modification">Modification</option>
            <option value="document">Document</option>
            <option value="rendez-vous">Rendez-vous</option>
            <option value="paiement">Paiement</option>
          </select>
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
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {historiqueData.map(item => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeClass(item.type)}`}>
                    {item.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.user}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
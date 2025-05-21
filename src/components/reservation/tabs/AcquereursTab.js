import React from 'react';
import { UsersIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';

// Mock data for acquéreurs
const acquereursData = [
  {
    id: 1,
    nom: 'Dubois',
    prenom: 'Thomas',
    email: 'thomas.dubois@example.com',
    telephone: '+33 6 12 34 56 78',
    adresse: '15 Rue des Lilas, 75001 Paris',
    principal: true
  },
  {
    id: 2,
    nom: 'Dubois',
    prenom: 'Sophie',
    email: 'sophie.dubois@example.com',
    telephone: '+33 6 87 65 43 21',
    adresse: '15 Rue des Lilas, 75001 Paris',
    principal: false
  }
];

export const AcquereursTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <UsersIcon className="h-5 w-5 mr-2 text-blue-500" />
          Acquéreurs
        </h2>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center">
          <PlusIcon className="h-4 w-4 mr-1" />
          Ajouter un acquéreur
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prénom
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Adresse
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {acquereursData.map(acquereur => (
              <tr key={acquereur.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {acquereur.nom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {acquereur.prenom}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {acquereur.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {acquereur.telephone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {acquereur.adresse}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {acquereur.principal && (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Principal
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    <EditIcon className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
import React from 'react';
import { DownloadIcon, EyeIcon, PlusIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

// Mock data for contracts
const contractData = {
  status: 'Non signé',
  dateActe: 'Prévu le 15/09/2023',
  notaire: 'Maître Laurent Dubois',
  lieu: '8 Avenue Victor Hugo, 75016 Paris',
  documents: []
};

export const ContractTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <div className="h-5 w-5 mr-2 text-blue-500" />
          Contrat de vente
        </h2>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center">
          <PlusIcon className="h-4 w-4 mr-1" />
          Ajouter un document
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Statut de l'acte
            </h3>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <XCircleIcon className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
              <h4 className="text-center font-semibold text-lg text-gray-800 mb-2">
                {contractData.status}
              </h4>
              <p className="text-center text-gray-500 mb-4">
                {contractData.dateActe}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div className="bg-yellow-500 h-2.5 rounded-full w-1/3"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Compromis signé</span>
                <span>Acte authentique</span>
                <span>Remise des clés</span>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-500 mt-6 mb-2">
              Informations
            </h3>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Notaire</p>
                  <p className="font-medium">{contractData.notaire}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lieu de signature</p>
                  <p className="font-medium">{contractData.lieu}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    Rendez-vous de signature
                  </p>
                  <p className="font-medium">Pas encore planifié</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Documents
            </h3>
            
            {contractData.documents.length > 0 ? (
              contractData.documents.map(doc => (
                <div key={doc.id} className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 text-blue-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">{doc.nom}</h4>
                      <p className="text-xs text-gray-500">
                        Ajouté le {doc.date} • {doc.taille}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button className="p-1 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                      <DownloadIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <div className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Aucun document disponible</p>
                <p className="text-gray-500 text-sm mb-4">
                  Les documents liés au contrat de vente apparaîtront ici
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm inline-flex items-center">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Ajouter un document
                </button>
              </div>
            )}

            <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h4 className="font-medium text-blue-800 flex items-center mb-2">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Checklist avant signature
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-gray-200 rounded-full mr-2 flex items-center justify-center text-xs">
                    1
                  </span>
                  <span className="text-gray-700">
                    Vérification des pièces d'identité
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-gray-200 rounded-full mr-2 flex items-center justify-center text-xs">
                    2
                  </span>
                  <span className="text-gray-700">
                    Vérification du financement
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-gray-200 rounded-full mr-2 flex items-center justify-center text-xs">
                    3
                  </span>
                  <span className="text-gray-700">
                    Planification du rendez-vous de signature
                  </span>
                </li>
                <li className="flex items-center">
                  <span className="w-5 h-5 bg-gray-200 rounded-full mr-2 flex items-center justify-center text-xs">
                    4
                  </span>
                  <span className="text-gray-700">
                    Préparation des documents notariés
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { FileSignatureIcon, DownloadIcon, EyeIcon, PlusIcon } from 'lucide-react';

// Mock data for compromis de ventes
const compromisData = {
  date: '05/07/2023',
  status: 'En attente de signature',
  notaire: 'Maître Laurent Dubois',
  dateSignature: 'Non signé',
  montant: '320 000 €',
  documents: [
    {
      id: 1,
      nom: 'Compromis de vente - Version 1',
      date: '30/06/2023',
      taille: '2.4 MB'
    }
  ]
};

export const CompromisVentesTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <FileSignatureIcon className="h-5 w-5 mr-2 text-blue-500" />
          Compromis de vente
        </h2>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center">
          <PlusIcon className="h-4 w-4 mr-1" />
          Ajouter un document
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Informations générales
              </h3>
              <div className="mt-2 bg-white rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Date de création</p>
                    <p className="font-medium">{compromisData.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Statut</p>
                    <p className="font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {compromisData.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Notaire</p>
                    <p className="font-medium">{compromisData.notaire}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Date de signature</p>
                    <p className="font-medium">{compromisData.dateSignature}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Détails financiers
              </h3>
              <div className="mt-2 bg-white rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Montant de la vente</p>
                    <p className="font-medium">{compromisData.montant}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Dépôt de garantie</p>
                    <p className="font-medium">32 000 €</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Frais de notaire (est.)
                    </p>
                    <p className="font-medium">25 600 €</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-medium">345 600 €</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Documents
            </h3>
            
            {compromisData.documents.map(doc => (
              <div key={doc.id} className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
                <div className="flex items-center">
                  <FileSignatureIcon className="h-8 w-8 text-blue-500 mr-3" />
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
            ))}

            <div className="mt-4 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500 mb-2">
                Aucun document signé disponible
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm inline-flex items-center">
                <PlusIcon className="h-4 w-4 mr-1" />
                Téléverser le compromis signé
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
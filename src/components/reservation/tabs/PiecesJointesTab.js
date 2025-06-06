import React from 'react';
import { 
  PaperclipIcon, 
  FileTextIcon, 
  ImageIcon, 
  DownloadIcon, 
  TrashIcon, 
  PlusIcon 
} from 'lucide-react';

// Mock data for pièces jointes
const piecesJointesData = [
  {
    id: 1,
    nom: "Carte d'identité",
    type: 'document',
    date: '12/06/2023',
    taille: '1.2 MB',
    ajoutePar: 'Marie Dupont'
  },
  {
    id: 2,
    nom: 'Justificatif de domicile',
    type: 'document',
    date: '12/06/2023',
    taille: '0.8 MB',
    ajoutePar: 'Marie Dupont'
  },
  {
    id: 3,
    nom: 'Photo propriété 1',
    type: 'image',
    date: '14/06/2023',
    taille: '3.5 MB',
    ajoutePar: 'Jean Martin'
  },
  {
    id: 4,
    nom: 'Photo propriété 2',
    type: 'image',
    date: '14/06/2023',
    taille: '2.8 MB',
    ajoutePar: 'Jean Martin'
  },
  {
    id: 5,
    nom: 'Relevé bancaire',
    type: 'document',
    date: '18/06/2023',
    taille: '1.5 MB',
    ajoutePar: 'Thomas Dubois'
  },
  {
    id: 6,
    nom: 'Contrat de travail',
    type: 'document',
    date: '18/06/2023',
    taille: '2.1 MB',
    ajoutePar: 'Thomas Dubois'
  },
  {
    id: 7,
    nom: 'Plan de la propriété',
    type: 'document',
    date: '20/06/2023',
    taille: '4.2 MB',
    ajoutePar: 'Pierre Lemoine'
  },
  {
    id: 8,
    nom: 'Attestation notaire',
    type: 'document',
    date: '22/06/2023',
    taille: '0.6 MB',
    ajoutePar: 'Sophie Bernard'
  }
];

const DocumentIcon = ({ type }) => {
  return type === 'document' ? (
    <FileTextIcon className="h-8 w-8 !text-blue-500 mr-2" />
  ) : (
    <ImageIcon className="h-8 w-8 !text-green-500 mr-2" />
  );
};

export const PiecesJointesTab = () => {
  return (
    <div className="space-y-6">
      {/* Header with search and add button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold !text-gray-800 flex items-center">
          <PaperclipIcon className="h-5 w-5 mr-2 !text-blue-500" />
          Pièces jointes
        </h2>
        <div className="flex space-x-2">
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="px-3 py-1 border border-gray-300 rounded-md text-sm" 
          />
          <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center">
            <PlusIcon className="h-4 w-4 mr-1" />
            Ajouter un document
          </button>
        </div>
      </div>

      {/* Documents grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {piecesJointesData.map(document => (
          <div key={document.id} className="border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow">
            {/* Document header with icon and actions */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <DocumentIcon type={document.type} />
                <div>
                  <h3 className="font-medium !text-gray-900 line-clamp-1">{document.nom}</h3>
                  <p className="text-xs !text-gray-500">
                    Ajouté le {document.date}
                  </p>
                </div>
              </div>
              <div className="flex">
                <button 
                  className="text-gray-500 hover:text-blue-600 mr-1 transition-colors"
                  aria-label="Télécharger"
                >
                  <DownloadIcon className="h-4 w-4" />
                </button>
                <button 
                  className="text-gray-500 hover:text-red-600 transition-colors"
                  aria-label="Supprimer"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Document footer with metadata */}
            <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between items-center text-xs !text-gray-500">
              <span>{document.taille}</span>
              <span>Par {document.ajoutePar}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
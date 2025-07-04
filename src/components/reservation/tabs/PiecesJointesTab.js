import React from 'react';
import {
  PaperclipIcon,
  FileTextIcon,
  ImageIcon,
  DownloadIcon,
  TrashIcon,
  PlusIcon,
} from 'lucide-react';

export const PiecesJointesTab = ({ reservationData, user,piecesJointesData}) => {
  const { reservation } = reservationData;
  const FileUrl = process.env.NEXT_PUBLIC_IMG_URL;

  const handleEdit_PJ = () => {
    window.localStorage.setItem('step_res_edit', 0);
    const editUrl = `${window.location.origin}/ventes/reservations/?id=${reservation.id}&action=edit`;
    window.open(editUrl, '_blank');
  };

  const handleFileClick = (fileName) => {
    const fileUrl = `${FileUrl}/Docs/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/reservations/${fileName}`;
    window.open(fileUrl, '_blank');
  };

  // Function to extract file extension and type
  const getFileType = (fileName) => {
    if (!fileName) return 'document';
    const ext = fileName.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'PNG', 'png', 'webp', 'gif'].includes(ext)
      ? 'image'
      : 'document';
  };

  return (
    <div className="space-y-6">
      {/* Header with add button */}
      <div className="flex justify-end">
        {reservation?.etat == 1 && reservation?.contrat_vente == null && (
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm flex items-center"
            onClick={handleEdit_PJ}
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Modifier les documents
          </button>
        )}
      </div>

      {/* Documents grid - KEEPING YOUR CARD DESIGN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {piecesJointesData.map((document) => {
          const fileType = getFileType(document.fichier);
          const fileDate = document.created_at
            ? new Date(document.created_at).toLocaleDateString('fr-FR')
            : 'N/A';

          return (
            <div
              key={document.id}
              className="border border-gray-200 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow"
            >
              {/* Document header with icon and actions */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  {fileType == 'pdf' ? (
                    <FileTextIcon className="h-8 w-8 text-blue-500 mr-2" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-green-500 mr-2" />
                  )}
                  <div>
                    <h3
                      className="font-medium text-gray-900 line-clamp-1 hover:text-blue-600 cursor-pointer"
                      onClick={() => handleFileClick(document.fichier)}
                    >
                      {document.fichier}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Ajouté le {fileDate}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <button
                    className="text-gray-500 hover:text-blue-600 mr-1 transition-colors"
                    aria-label="Télécharger"
                    onClick={() => handleFileClick(document.fichier)}
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Document footer with metadata */}
              <div className="mt-auto pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>{/* File size if available */}</span>
                <span>Par {user?.name || 'Utilisateur inconnu'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

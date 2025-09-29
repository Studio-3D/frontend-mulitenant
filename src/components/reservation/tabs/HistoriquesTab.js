import React, { useState, memo } from 'react';
import { X, Eye } from 'lucide-react';
import { format } from 'date-fns';
import Table from '@/components/Table';

const ChangeDetailModal = memo(({ historyItem, onClose }) => {
  if (!historyItem) return null;

  // Try to parse JSON, fallback to plain text if it fails
  const parseDescription = (description) => {
    if (!description) return { message: { new: 'No description available' } };
    
    try {
      return JSON.parse(description);
    } catch (e) {
      return {
        message: {
          old: '',
          new: description
        }
      };
    }
  };

  const changes = parseDescription(historyItem.description);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString; // Return raw string if date parsing fails
    }
  };

  const renderFieldChange = (fieldName, changeData) => {
    if (!changeData) return null;

    // Handle simple message case
    if (fieldName === 'message') {
      return (
        <div className="mb-4">
          <h4 className="font-semibold text-gray-700">Modification</h4>
          <div className="bg-blue-50 p-3 rounded">
            <p>{changeData.new}</p>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 capitalize">
          {fieldName.replace(/_/g, ' ')}
        </h4>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div style={{ background: 'rgb(228,234,240)' }} className="p-3 rounded">
            <p className="text-sm text-gray-500">Ancienne valeur</p>
            {Array.isArray(changeData.old) ? (
              <ul className="list-disc pl-5">
                {changeData.old.map((item, index) => (
                  <li key={`old-${fieldName}-${index}`}>
                    {item.client_nom && item.client_prenom
                      ? `${item.client_nom} ${item.client_prenom} (${item.pourcentage}%)`
                      : typeof item === 'object'
                      ? JSON.stringify(item)
                      : String(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {fieldName.includes('date')
                  ? formatDate(changeData.old)
                  : String(changeData.old || 'N/A')}
              </p>
            )}
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-gray-500">Nouvelle valeur</p>
            {Array.isArray(changeData.new) ? (
              <ul className="list-disc pl-5">
                {changeData.new.map((item, index) => (
                  <li key={`new-${fieldName}-${index}`}>
                    {item.nom && item.prenom
                      ? `${item.nom} ${item.prenom} (${item.pourcentage}%)`
                      : typeof item === 'object'
                      ? JSON.stringify(item)
                      : String(item)}
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                {fieldName.includes('date')
                  ? formatDate(changeData.new)
                  : String(changeData.new || 'N/A')}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFileChanges = (files) => {
    if (!files) return null;

    return (
      <div className="mb-4">
        <h4 className="font-semibold text-gray-700">Fichiers</h4>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div style={{ background: 'rgb(228,234,240)' }} className="p-3 rounded">
            <p className="text-sm text-gray-500">Anciens fichiers</p>
            {files.old && files.old.length > 0 ? (
              <ul className="list-disc pl-5">
                {files.old.map((file, index) => (
                  <li key={`old-file-${index}`}>{file}</li>
                ))}
              </ul>
            ) : (
              <p>Aucun fichier</p>
            )}
          </div>
          <div className="bg-blue-50 p-3 rounded">
            <p className="text-sm text-gray-500">Nouveaux fichiers</p>
            {files.new && files.new.length > 0 ? (
              <ul className="list-disc pl-5">
                {files.new.map((file, index) => (
                  <li key={`new-file-${index}`}>{file}</li>
                ))}
              </ul>
            ) : (
              <p>Aucun fichier</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4">
        <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h3 className="text-lg font-bold">Détails des modifications</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-black">Date</p>
                <p className="text-gray-500">
                  {format(new Date(historyItem.created_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-black">Type</p>
                <p className="text-gray-500">
                  {historyItem.action === '1'
                    ? 'Changement de Bien'
                    : historyItem.action === '2'
                    ? 'Création de Réservation'
                    : historyItem.action === '3'
                    ? 'Modification Réservation'
                    : 'Type inconnu'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-black">Responsable</p>
                <p className="text-gray-500">
                  {historyItem.user
                    ? `${historyItem.user.name || ''} ${historyItem.user.prenom || ''}`.trim()
                    : 'Utilisateur inconnu'}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-black">Bien concerné</p>
                <p className="text-gray-500">
                  {historyItem.bien?.propriete_dite_bien || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {Object.entries(changes).map(([field, change], index) => {
            if (field === 'files') {
              return (
                <div key={`files-${index}`}>{renderFileChanges(change)}</div>
              );
            }
            return (
              <div key={`${field}-${index}`}>
                {renderFieldChange(field, change)}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end p-4 border-t">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
});

ChangeDetailModal.displayName = 'ChangeDetailModal';

// Create the main component first, then wrap with memo
const HistoriquesTabComponent = ({ reservationData }) => {
  const [selectedHistory, setSelectedHistory] = useState(null);
  const histo = reservationData?.reservation?.historiques || [];

  function NomBienComplet(bien) {
    if (!bien) return 'N/A';
    const noms = [];
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
    noms.push(bien.propriete_dite_bien || 'N/A');
    return noms.join(' - ');
  }

  const formatData = () => {
    return histo.map((data) => ({
      id: data?.id || '',
      date: data?.created_at
        ? new Date(data.created_at).toLocaleDateString('fr-FR').replace(/\//g, '-')
        : 'N/A',
      type:
        data?.action === '1'
          ? 'Changement de Bien'
          : data?.action === '2'
          ? 'Création de Réservation'
          : data?.action === '3'
          ? 'Modification Réservation'
          : 'Type inconnu',
      user: data?.user
        ? `${data.user.name || ''} ${data.user.prenom || ''}`.trim()
        : 'Utilisateur inconnu',
      rawData: data,
    }));
  };

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'user', label: 'Responsable' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        return (
          <button
            onClick={() => setSelectedHistory(row.rawData)}
            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
            
          </button>
        );
      },
    },
  ];

  const data_to_export = () => {
    return histo.map((data) => ({
      date: data?.created_at
        ? new Date(data.created_at).toLocaleDateString('fr-FR')
        : 'N/A',
      type:
        data?.action === 1
          ? 'Changement de Bien'
          : data?.action === 2
          ? 'Création de Réservation'
          : data?.action === 3
          ? 'Modification Réservation'
          : 'Type inconnu',
      description: data.description,
      user: data?.user
        ? `${data.user.name || ''} ${data.user.prenom || ''}`.trim()
        : 'Utilisateur inconnu',
      ancien_bien: data?.action === 1 ? NomBienComplet(data?.bien) : '',
    }));
  };

  const columns_export = [
    { key: 'date', label: 'Date' },
    { key: 'type', label: 'Type' },
    { key: 'description', label: 'Description' },
    { key: 'user', label: 'Responsable' },
    { key: 'ancien_bien', label: 'Ancien Bien' },
  ];

  return (
    <div className="">
      <Table
        columns={columns}
        showSearch={false}
        data={formatData()}
        enableExport
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export={'historiques_export'}
      />

      {selectedHistory && (
        <ChangeDetailModal
          historyItem={selectedHistory}
          onClose={() => setSelectedHistory(null)}
        />
      )}
    </div>
  );
};

// Wrap the main component with memo
export const HistoriquesTab = memo(HistoriquesTabComponent);
import React from 'react';
import { UsersIcon, PlusIcon, EditIcon, TrashIcon } from 'lucide-react';
import Table from '@/components/Table';
import { Eye, Pencil } from 'lucide-react';
import Button from '@/components/Button'; // adjust the path as needed

export const AcquereursTab = ({ reservationData, user_role }) => {
  // Format users data for table
  const aquereurs = reservationData?.reservation?.aquereurs || [];

  const { reservation } = reservationData;
  const handleEdit_pourcentage = () => {
    window.localStorage.setItem('step_res_edit', 1);
    const editUrl = `${window.location.origin}/ventes/reservations/?id=${reservation.id}&action=edit`;

    window.open(editUrl, '_blank');
  };

  const handleShow = (aqId) => {
    window.open(`/ventes/clients/${aqId}`, '_blank');
  };

  const handleEdit = (aqId) => {
    window.open(`/ventes/clients/edit/${aqId}`, '_blank');
  };
  // Format users data for table display
  const formatData = () => {
    return aquereurs.map((data) => ({
      id: data.id,
      cin: data.client.cin,
      nom: `${data.client.nom || ''} `.trim(),
      prenom: `${data.client.prenom || ''}`.trim(),
      telephone:
        (data.client.telephone_num1 ? data.client.telephone_num1 : '') +
          (data.client.telephone &&
          data.client.telephone2 &&
          data.client.telephone2 !== 'null'
            ? ' / ' + data.client.telephone2
            : '') || 'Non spécifié',
      // source: data.prospect.source?.source,
      pourcentage: data.pourcentage,
      client_id: data.client_id,
    }));
  };

  const data_to_export = () => {
    return aquereurs.map((data) => ({
      id: data.id,
      cin: data.client.cin,
      nom: `${data.client.nom || ''} `.trim(),
      prenom: `${data.client.prenom || ''}`.trim(),
      telephone:
        (data.client.telephone_num1 ? data.client.telephone_num1 : '') +
          (data.client.telephone &&
          data.client.telephone2 &&
          data.client.telephone2 !== 'null'
            ? ' / ' + data.client.telephone2
            : '') || 'Non spécifié',
      // source: data.prospect.source?.source,
      pourcentage: data.pourcentage,
    }));
  };

  const columns_export = [
    { key: 'cin', label: 'Cin' },
    { key: 'nom', label: 'nomComplet' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'telephone', label: 'Telephone' },
    { key: 'pourcentage', label: 'Pourcentage' },
  ];

  const columns = [
    { key: 'cin', label: 'Cin' },
    {
      key: 'nom',
      label: 'Nom',
    },
    {
      key: 'prenom',
      label: 'Prénom',
    },
    { key: 'telephone', label: 'Téléphone' },

    { key: 'pourcentage', label: 'Pourcentage' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <Eye
            className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
            title="Voir détails"
            onClick={() => handleShow(row.client_id)}
          />
          {reservation.etat == 1 && (
            <>
              {user_role <= 3 && (
                <Pencil
                  className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
                  title="Modifier"
                  onClick={() => handleEdit(row.client_id)}
                />
              )}
            </>
          )}
        </div>
      ),
    },
  ];
  return (
    <>
      <div className="flex justify-end">
        {reservation?.etat == 1 && reservation.contrat_vente == null && (
          <Button
            className="mb-5"
            type="submit"
            onClick={() => handleEdit_pourcentage()}
          >
            Modifier aquéreurs
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <Table
          columns={columns}
          data={formatData()}
          enableExport
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'acquereurs_export'}
        />
      </div>
    </>
  );
};

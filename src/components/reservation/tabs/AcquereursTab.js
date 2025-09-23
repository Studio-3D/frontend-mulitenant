'use client';
import React, { useMemo, useCallback, memo } from 'react';
import { useRouter } from "next/navigation"; 
import Table from '@/components/Table';
import { Eye, Pencil, Edit } from 'lucide-react';

const AcquereursTabComponent = ({
  etat,
  contrat_vente,
  aquereurs,
  user_role,
  reservationId,
}) => {
  const router = useRouter();

  const handleEdit_pourcentage = useCallback(() => {
    window.localStorage.setItem('step_res_edit', 1);
    router.push(`/ventes/reservations/?id=${reservationId}&action=edit`);
  }, [reservationId, router]);

  const handleShow = useCallback((aqId) => {
    router.push(`/ventes/clients/${aqId}`);
  }, [router]);

  const handleEdit = useCallback((aqId) => {
    router.push(`/ventes/clients/edit/${aqId}`);
  }, [router]);

  const formatData = useMemo(() => {
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
      pourcentage: data.pourcentage,
      client_id: data.client_id,
    }));
  }, [aquereurs]);

  const data_to_export = useMemo(() => {
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
      pourcentage: data.pourcentage,
    }));
  }, [aquereurs]);

  const columns_export = useMemo(() => [
    { key: 'cin', label: 'Cin' },
    { key: 'nom', label: 'nomComplet' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'telephone', label: 'Telephone' },
    { key: 'pourcentage', label: 'Pourcentage' },
  ], []);

  const columns = useMemo(() => [
    { key: 'cin', label: 'Cin' },
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'pourcentage', label: 'Pourcentage' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <button
            className="text-blue-500 hover:text-blue-700 cursor-pointer"
            title="Voir détails"
            onClick={() => handleShow(row.client_id)}
          >
            <Eye className='w-4 h-4' />
          </button>

          {etat == 1 && user_role <= 3 && (
            <button
              className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
              title="Modifier"
              onClick={() => handleEdit(row.client_id)}
            >
              <Pencil className='w-4 h-4' />
            </button>
          )}
        </div>
      ),
    },
  ], [etat, user_role, handleShow, handleEdit]);

  const customActions = useMemo(() => {
    const actions = [];
    if (etat == 1 && contrat_vente == null) {
      actions.push({
        label: "Modifier aquéreurs",
        icon: <Edit className="w-5 h-5" />,
        className: "bg-green-600 hover:bg-green-700",
        onClick: handleEdit_pourcentage,
      });
    }
    return actions;
  }, [etat, contrat_vente, handleEdit_pourcentage]);

  return (
    <div className="space-y-6">
      <Table
        showSearch={false}
        columns={columns}
        data={formatData}
        enableExport
        data_to_export={data_to_export}
        columns_export={columns_export}
        name_file_export={'acquereurs_export'}
        customActions={customActions}
      />
    </div>
  );
};

export const AcquereursTab = memo(AcquereursTabComponent);
AcquereursTab.displayName = 'AcquereursTab';

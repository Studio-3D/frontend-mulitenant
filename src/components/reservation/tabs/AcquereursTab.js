'use client';
import React, { useMemo, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Table from '@/components/Table';
import { Eye, Pencil, Edit, PencilLine } from 'lucide-react';
import Link from 'next/link';
import { isAdmin, isAgentAdministratif, isCommercial, isRespoCommercial, isSuperAdmin } from '@/configs/enum';

const AcquereursTabComponent = ({
  statut,
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

  const columns_export = useMemo(
    () => [
      { key: 'cin', label: 'Cin' },
      { key: 'nom', label: 'nomComplet' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'telephone', label: 'Telephone' },
      { key: 'pourcentage', label: 'Pourcentage' },
    ],
    []
  );

  const columns = useMemo(
    () => [
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
            <Link
              href={`/ventes/clients/${row.client_id}`}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
              title="Voir les détails"
              target="_blank"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {etat == 1 && (user_role <= 3 || user_role==9 || user_role==10)&& (
              <Link
                href={`/ventes/clients/?id=${row.client_id}&action=edit`}
                className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
                title="Modifier"
                target="_blank"
              >
                <PencilLine className="w-4 h-4" />
              </Link>
            )}
          </div>
        ),
      },
    ],
    [etat, user_role]
  );

  
  const customActions = useMemo(() => {
  const actions = [];
  
  // Check if user can see the "Modifier aquéreurs" action
  const canEditAcquereurs = 
    // For Admin/SuperAdmin: etat == 1 && contrat_vente == null
    ((isSuperAdmin(user_role) || isAdmin(user_role)|| isAgentAdministratif(user_role)) &&
      etat == 1 &&
      contrat_vente == null) ||
    // For Commercial: statut == 0 AND etat == 1 && contrat_vente == null
    ((isCommercial(user_role)|| isRespoCommercial(user_role))&&
      statut == 0 &&
      etat == 1 &&
      contrat_vente == null);

  if (canEditAcquereurs) {
    actions.push({
      label: 'Modifier aquéreurs',
      icon: <Edit className="w-5 h-5" />,
      className: 'bg-green-600 hover:bg-green-700',
      onClick: handleEdit_pourcentage,
    });
  }
  
  return actions;
}, [etat, contrat_vente, handleEdit_pourcentage, user_role,statut]);
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

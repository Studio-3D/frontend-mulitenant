'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import { FaRegEye } from 'react-icons/fa';

import { useAuth } from '../../../../context/AuthContext';
import { ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import format from 'date-fns/format';

import {
  VISITE_INTERETS,
  VISITE_STATUT,
} from '../../../../../src/configs/enum';
import Link from 'next/link';

const VisiteTable = (dataProspect, dataClient) => {
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope

  const entity = {
    API_URL: 'visites',
    dataKey: 'data',

    searchFields: [
      'cc',
      'date',
      'nomComplet',
      'telephone',
      'interet',
      'bien',
      'statut_visite',
    ],
  };
 // Prepare parameters based on conditions
 const clientId = dataClient?.dataClient?.id;
 const prospectId = dataProspect?.dataProspect?.id;
  useEffect(() => {
  
    const params_url = clientId
      ? { client_id: clientId }
      : prospectId
      ? { prospect_id: prospectId }
      : {};
    fetchData_table_by_projet(
      entity,
      params_url,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setVisites,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200); // Wait for 1.2s after user stops typing before updating the debounced value

    return () => clearTimeout(timer); // Clean up the timeout on each render
  }, [searchTerm]);

  const handleShow = (Id) => {
    router.push(`/crm/visites/${Id}`);
  };

  // Format users data for table display
  const formatData = () => {
    return visites.map((data) => ({
      id: data.id,
      cc: data.nom_cc,
      date:
        data.date != null ? format(new Date(data.date), 'dd/MM/yyyy') : null,
      nomComplet: `${data.nom || ''} ${data.prenom || ''}`.trim(),
      prospect_id: data.prospect_id,
      telephone:
        (data.telephone ? data.telephone : '') +
          (data.telephone && data.telephone2 && data.telephone2 !== 'null'
            ? ' / ' + data.telephone2
            : '') || 'Non spécifié',
      interet: data.interet,
      propriete_dite_bien: data.propriete_dite_bien,
      bien_id: data?.bien_id,
      statut: data.statut,
      origin_id: data.origin_id,
    }));
  };

  const getStatutBadge = (st) => {
    const statusInfo = VISITE_STATUT[st] || {
      label: '',
      color: '',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
      >
        {statusInfo.label}
      </span>
    );
  };
  const getInteretBadge = (interest) => {
    const interetInfo = VISITE_INTERETS[interest];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${interetInfo.color}`}
      >
        {interetInfo.label}
      </span>
    );
  };

  // Table columns configuration
  const columns = [
    {
      key: 'cc',
      label: 'CC',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.cc}</span>
        </div>
      ),
    },
    { key: 'date', label: 'Date' },
    {
      key: 'nomComplet',
      label: 'Nom Complet',
      render: (row) => {
        return (
          <Link href={'/crm/prospects/' + row.prospect_id} target="_blank">
            <strong style={{ fontWeight: 600 }}>{row.nomComplet}</strong>
          </Link>
        );
      },
    },
    { key: 'telephone', label: 'Téléphone' },

    {
      key: 'interet',
      label: 'Intéret',
      render: (row) => {
        return getInteretBadge(row.interet);
      },
    },
    {
      key: 'bien',
      label: 'Bien',
      render: (row) => {
        return (
          <Link href={'/biens/' + row.bien_id} target="_blank">
            <strong style={{ fontWeight: 600 }}>
              {row.propriete_dite_bien}
            </strong>
          </Link>
        );
      },
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => {
        return getStatutBadge(row.statut);
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <FaRegEye
            className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
            title="Voir détails"
            onClick={() => handleShow(row.origin_id)}
          />
        </div>
      ),
    },
  ];

  {
    /* Dynamic Modals Import */
  }

  //EXPORT

  const data_to_export = () => {
    return visites.map((data) => ({
      cc: data.nom_cc,
      date:
        data.date != null ? format(new Date(data.date), 'dd/MM/yyyy') : null,
      nomComplet: `${data.nom || ''} ${data.prenom || ''}`.trim(),
      prospect_id: data.prospect_id,
      telephone:
        (data.telephone ? data.telephone : '') +
          (data.telephone && data.telephone2 && data.telephone2 !== 'null'
            ? ' / ' + data.telephone2
            : '') || 'Non spécifié',
      interet: VISITE_INTERETS[data.interet]?.label,
      propriete_dite_bien: data.propriete_dite_bien,
      statut: VISITE_STATUT[data.statut]?.label,
      origin_id: data.origin_id,
    }));
  };

  const columns_export = [
    { key: 'cc', label: 'Commercial' },
    { key: 'date', label: 'Date' },
    { key: 'nomComplet', label: 'nomComplet' },
    { key: 'telephone', label: 'Telephone' },
    { key: 'interet', label: 'Cin' },
    { key: 'propriete_dite_bien', label: 'Bien' },
    { key: 'statut', label: 'Statut' },
  ];
  const canAddVisite = isSuperAdmin(user.role) || isAdmin(user.role) || isCommercial(user.role);

let handleAddClick;
if (canAddVisite) {
  if (prospectId != null) {
    localStorage.setItem('selectedProspect', JSON.stringify(dataProspect)); // Store prospect info
  }
  handleAddClick = `${ENDPOINTS.VISITES}?action=add`;
} else {
  handleAddClick = undefined;
}

  return (
    <>
      <div className="reflative">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'visites_export'}
          columns={columns}
          data={formatData()}
          totalRows={totalRows}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          enableExport={true}
          addLink={handleAddClick}
        />
      </div>
    </>
     
  
  );
};

export default VisiteTable;

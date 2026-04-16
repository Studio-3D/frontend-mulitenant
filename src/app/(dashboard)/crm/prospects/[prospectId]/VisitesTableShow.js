'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import { Eye } from 'lucide-react';

import { useRouter } from 'next/navigation';


import Link from 'next/link';
import SelectInput from '@/components/SelectInput';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { ENDPOINTS } from '@/configs/api';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import { isAdmin, isCommercial, isRespoCommercial, isSuperAdmin, VISITE_INTERETS, VISITE_STATUT } from '@/configs/enum';

// Don't import formatDate directly, create our own formatter
const formatDateSafe = (dateString) => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    // Manual formatting to avoid date-fns issues
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return null;
  }
};

const VisiteTableShow = ({ user_id, dataProspect, dataClient ,searchParams}) => {
  const [visites, setVisites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user, token } = useAuth();
  const { selectedProjet } = useProjet();
  const accesstoken = token || localStorage.getItem('accessToken');

  const [filters, setFilters] = useState({
    interet: '', statut: ''
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const router = useRouter();

  const entity = {
    API_URL: 'visites_by_prospect_client',
    dataKey: 'data',
    searchFields: ['cc', 'date'],
  };
  
  const clientId = dataClient ? JSON.stringify(dataClient?.id) : null;
  const prospectId = dataProspect ? JSON.stringify(dataProspect?.id) : null;
  
  useEffect(() => {
    const action = searchParams?.get('action');
    if (action === 'add' || action === 'edit') {
      console.log('Skipping API call - in form mode');
      return;
    }
    const params_url = clientId
      ? { client_id: clientId }
      : prospectId
      ? { prospect_id: prospectId }
      : {};
    const combinedFilters = {
      ...(user_id ? { user_id } : {}),
      ...filters,
      ...params_url,
    };
    fetchData_table_by_projet(
      entity,
      combinedFilters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setVisites,
      setTotalRows
    );
  }, [
    searchParams,
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    clientId,
    prospectId,
    filters,
    selectedProjet,
  ]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Safe NomBienComplet function
  const NomBienComplet = (bien) => {
    if (!bien || typeof bien === 'string') {
      return '';
    }
    
    const noms = [];
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
    if (bien.propriete_dite_bien) noms.push(bien.propriete_dite_bien);
    
    return noms.length > 0 ? noms.join(' - ') : '';
  };

  // Format users data for table display
  const formatData = () => {
    if (!visites || visites.length === 0) return [];
    
    return visites.map((data) => ({
      id: data.id,
      cc: `${data.nom_cc || ''} ${data.prenom_cc || ''}`.trim(),
      date: formatDateSafe(data.date),
      nom: `${data.nom || ''}`.trim(),
      prenom: `${data.prenom || ''}`.trim(),
      prospect_id: data.prospect_id,
      telephone: (data.telephone ? data.telephone : '') +
        (data.telephone && data.telephone2 && data.telephone2 !== 'null'
          ? ' / ' + data.telephone2
          : '') || '',
      interet: data.interet,
      bien: NomBienComplet(data.bien),
      bien_id: data?.bien_id,
      statut: data.statut,
      origin_id: data.origin_id,
    }));
  };

  const getStatutBadge = (st) => {
    const statusInfo = VISITE_STATUT[st] || {
      label: '',
      color: 'bg-gray-100 text-gray-800',
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
    if (!interetInfo) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          
        </span>
      );
    }
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
      label: 'Responsable',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.cc}</span>
        </div>
      ),
    },
    { key: 'date', label: 'Date' },
    {
      key: 'interet',
      label: 'Intéret',
      render: (row) => getInteretBadge(row.interet),
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (row) => getStatutBadge(row.statut),
    },
    { key: 'bien', label: 'Bien' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          {(isSuperAdmin(user.role) || isAdmin(user.role) || isCommercial(user.role) || isRespoCommercial(user.role)) && (
            <Link
              href={`/crm/visites/${row.origin_id}`}
              className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
              title="Voir les détails"
            >
              <Eye className="w-4 h-4" />
            </Link>
          )}
        </div>
      ),
    },
  ].filter(Boolean);

  // EXPORT
  const data_to_export = () => {
    if (!visites || visites.length === 0) return [];
    
    return visites.map((data) => ({
      cc: `${data.nom_cc || ''} ${data.prenom_cc || ''}`.trim(),
      date: formatDateSafe(data.date),
      nomComplet: `${data.nom || ''} ${data.prenom || ''}`.trim(),
      prospect_id: data.prospect_id,
      telephone: (data.telephone ? data.telephone : '') +
        (data.telephone && data.telephone2 && data.telephone2 !== 'null'
          ? ' / ' + data.telephone2
          : '') || '',
      interet: VISITE_INTERETS[data.interet]?.label || '',
      bien: NomBienComplet(data.bien),
      statut: VISITE_STATUT[data.statut]?.label || '',
      origin_id: data.origin_id,
    }));
  };

  const columns_export = [
    { key: 'cc', label: 'Commercial' },
    { key: 'date', label: 'Date' },
    { key: 'nomComplet', label: 'Nom Complet' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'interet', label: 'Intérêt' },
    { key: 'bien', label: 'Bien' },
    { key: 'statut', label: 'Statut' },
  ];
  
  const canAddVisite = isSuperAdmin(user.role) || isAdmin(user.role) || isCommercial(user.role) || isRespoCommercial(user.role);

  function getAddLinkForVisite(user) {
    if (canAddVisite) {
      if (dataClient) {
        return {
          onClick: () => {
            localStorage.setItem('selectedClient', JSON.stringify({ info: { dataClient } }));
          },
          pathname: `${ENDPOINTS.VISITES}?action=add`,
        };
      } else if (dataProspect) {
        return {
          onClick: () => {
            localStorage.setItem('selectedProspect', JSON.stringify({ info: { dataProspect } }));
          },
          pathname: `${ENDPOINTS.VISITES}?action=add`,
        };
      } else {
        return `${ENDPOINTS.VISITES}?action=add`;
      }
    }
    return undefined;
  }

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  
  const resetFilters = () => {
    const reset = { interet: '' ,statut: ''};
    setFilters(reset);
    setTempFilters(reset);
  };
  
  return (
    <>
      <div className="relative py-4">
        <Table
          title={user_id ? 'Liste des visites' : ''}
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
          enableExport={formatData().length > 0}
          showSearch={false}
          addLink={!user_id && getAddLinkForVisite(user)}
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg">
              <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <SelectInput
                  value={tempFilters.interet}
                  onChange={(value) => handleFilterChange('interet', value)}
                  options={Object.values(VISITE_INTERETS)
                    .filter((data) => data.code !== 4)
                    .map((data) => ({
                      value: data.code,
                      label: data.label,
                    }))}
                  label="Choisir un Intéret"
                  className="h-10 text-sm w-full"
                />
                 <SelectInput
                  value={tempFilters.statut}
                  onChange={(value) => handleFilterChange('statut', value)}
                  options={Object.values(VISITE_STATUT)
                    .map((data) => ({
                      value: data.code,
                      label: data.label,
                    }))}
                  label="Choisir une Statut"
                  className="h-10 text-sm w-full"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Appliquer les filtres
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          }
        />
      </div>
    </>
  );
};

export default VisiteTableShow;
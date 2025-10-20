'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import { Eye } from 'lucide-react';

import { useAuth } from '../../../../context/AuthContext';
import { useProjet } from '../../../../context/ProjetContext';
import { ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import { isAdmin, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import { formatDate } from '../../../../utils/dateUtils';
import Input from '@/components/Input';

import {
  VISITE_INTERETS,
  VISITE_STATUT,
} from '../../../../../src/configs/enum';
import Link from 'next/link';
import SelectInput from '@/components/SelectInput';

const VisiteTable = ({ user_id, dataProspect, dataClient }) => {
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

  // Declare the entity object in the component scope
  const [filters, setFilters] = useState({
    cc: '',
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    interet: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const router = useRouter();
  // Declare the entity object in the component scope

  const entity = {
    API_URL: 'visites',
    dataKey: 'data',

    searchFields: ['responsable', 'date', 'nom', 'prenom', 'telephone'],
  };
  // Prepare parameters based on conditions
  const clientId = dataClient ? JSON.stringify(dataClient?.id) : null;
  const prospectId = dataProspect ? JSON.stringify(dataProspect?.id) : null;
  useEffect(() => {
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
    }, 1200); // Wait for 1.2s after user stops typing before updating the debounced value

    return () => clearTimeout(timer); // Clean up the timeout on each render
  }, [searchTerm]);

 
  // Format users data for table display
  const formatData = () => {
    return visites.map((data) => ({
      id: data.id,
      cc: data.nom_cc,
      date: data.date != null ? formatDate(data.date) : null,
      nom: `${data.nom || ''}`.trim(),
      prenom: `${data.prenom || ''}`.trim(),
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
      key: 'responsable',
      label: 'Responsable',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.cc}</span>
        </div>
      ),
    },
    { key: 'date', label: 'Date' },
    // Only show nom column if prospect_id exists
    ...(prospectId == null
      ? [
          {
            key: 'nom',
            label: 'Nom',
            render: (row) => {
              return row.prospect_id ? (
                <Link
                  href={'/crm/prospects/' + row.prospect_id}
                  target="_blank"
                >
                  <strong style={{ fontWeight: 600 }}>{row.nom}</strong>
                </Link>
              ) : null;
            },
          },
        ]
      : []),
    // Only show prenom column if prospect_id exists
    ...(prospectId == null
      ? [
          {
            key: 'prenom',
            label: 'Prénom',
            render: (row) => {
              return row.prospect_id ? (
                <Link
                  href={'/crm/prospects/' + row.prospect_id}
                  target="_blank"
                >
                  <strong style={{ fontWeight: 600 }}>{row.prenom}</strong>
                </Link>
              ) : null;
            },
          },
        ]
      : []),
    // Only show prenom column if prospect_id exists
    ...(prospectId == null
      ? [
          {
            key: 'telephone',
            label: 'Téléphone',
          },
        ]
      : []),
    {
      key: 'interet',
      label: 'Intéret',
      render: (row) => {
        return getInteretBadge(row.interet);
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
        <Link
            href={`/crm/visites/${row.origin_id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
            title="Voir les détails"
          >
            <Eye className="w-4 h-4" />
          </Link>

          
        </div>
      ),
    },
  ].filter(Boolean); // This removes any falsy values from the array

  {
    /* Dynamic Modals Import */
  }

  //EXPORT

  const data_to_export = () => {
    return visites.map((data) => ({
      cc: data.nom_cc,
      date: data.date != null ? formatDate(data.date) : null,
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
  const canAddVisite =
    isSuperAdmin(user.role) || isAdmin(user.role) || isCommercial(user.role);

  function getAddLinkForVisite(user) {
    if (canAddVisite) {
      if (dataClient) {
        return {
          onClick: () => {
            localStorage.setItem(
              'selectedClient',
              JSON.stringify({ info: { dataClient } })
            );
          },
          pathname: `${ENDPOINTS.VISITES}?action=add`,
        };
      } else if (dataProspect) {
        return {
          onClick: () => {
            localStorage.setItem(
              'selectedProspect',
              JSON.stringify({
                info: { dataProspect },
              })
            );
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
    const reset = {
      cc: '',
      nom: '',
      prenom: '',
      cin: '',
      telephone: '',
      interet: '',
    };
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
            <div className="space-y-4 p-4 rounded-lg ">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {/* Champs de recherche */}
                <Input
                  type="text"
                  label="Responsable"
                  value={tempFilters.cc}
                  onChange={(e) => handleFilterChange('cc', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                {prospectId == null && clientId == null && (
                  <>
                    <Input
                      type="text"
                      label="Nom"
                      value={tempFilters.nom}
                      onChange={(e) =>
                        handleFilterChange('nom', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                    />
                    <Input
                      type="text"
                      label="Prénom"
                      value={tempFilters.prenom}
                      onChange={(e) =>
                        handleFilterChange('prenom', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                    />

                    <Input
                      type="text"
                      label="Cin"
                      value={tempFilters.cin}
                      onChange={(e) =>
                        handleFilterChange('cin', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                    />
                    <Input
                      type="number"
                      label="Téléphome"
                      value={tempFilters.telephone}
                      onChange={(e) =>
                        handleFilterChange('telephone', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                    />
                  </>
                )}
                <SelectInput
                  value={tempFilters.interet}
                  onChange={(value) => handleFilterChange('interet', value)}
                  options={Object.values(VISITE_INTERETS)
                    .filter((data) => data.code !== 4) // This will exclude the option with code 4
                    .map((data) => ({
                      value: data.code,
                      label: data.label,
                    }))}
                  label="Choisir un Intéret"
                  className="h-10 text-sm w-full"
                />
              </div>

              {/* Boutons */}
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

export default VisiteTable;

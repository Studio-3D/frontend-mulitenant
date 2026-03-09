'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import {
  Eye,
  Pencil,
  Check,
  RefreshCw,
  Trash2,
  PencilLine,
  
} from 'lucide-react';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../../context/AuthContext';
import { useProjet } from '../../../../context/ProjetContext';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import { isAdmin, isCommercial, isRespoCommercial, isSuperAdmin } from '../../../../configs/enum';
import Input from '@/components/Input';
import Link from 'next/link';

const ClientTable = ({ searchParams }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user, token } = useAuth();
  const { selectedProjet } = useProjet();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope
  const [filters, setFilters] = useState({
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    email: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'clients',
    dataKey: 'data',
    searchFields: ['nom', 'prenom', 'email', 'telephone_num1', 'cin'],
  };

  useEffect(() => {
    // Only fetch data if we're NOT in form mode (no action parameter) AND tab is 'clients'
    const action = searchParams?.get('action');
    const currentTab = searchParams?.get('tab');
    console.log('the current tab ==>' + currentTab);

    if (action == 'add' || action == 'edit') {
      console.log('Skipping API call - in form mode or wrong tab');
      return;
    }

    fetchData_table_by_projet(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setClients,
      setTotalRows
    );
  }, [
    searchParams,
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
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

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      if (localStorage.getItem('load_data_client') == 1) {
        fetchData_table_by_projet(
          entity,
          filters,
          searchTerm,
          currentPage,
          rowsPerPage,
          accesstoken,
          setLoading,
          setError,
          setClients,
          setTotalRows
        );
        localStorage.removeItem('load_data_client');
      }
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);

 
  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  // Format users data for table display
  const formatData = () => {
    return clients.map((cl) => ({
      id: cl.id,
      nom: `${cl.nom || ''}`.trim(),
      prenom: `${cl.prenom || ''}`.trim(),
      nomComplet: `${cl.nom || ''} ${cl.prenom || ''}`.trim(),
      email: cl.email,
      cin: cl.cin,
      telephone_num1:
        (cl.telephone_num1 ? cl.telephone_num1 : '') +
          (cl.telephone_num1 &&
          cl.telephone_num2 &&
          cl.telephone_num2 !== 'null'
            ? ' / ' + cl.telephone_num2
            : '') || '',

      type_client: cl.partenaire_id,
      partenaire: cl?.partenaire,
      aquereur: cl.aquereur,
      aquereur_desistement: cl.aquereur_desistement,
      prospect: cl.prospect,
      reclamation: cl.reclamation,
    }));
  };

  // Table columns configuration
  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.nom}</span>
        </div>
      ),
    },
    {
      key: 'prenom',
      label: 'Prénom',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.prenom}</span>
        </div>
      ),
    },
    { key: 'telephone_num1', label: 'Téléphone' },
    { key: 'cin', label: 'Cin' },
    { key: 'email', label: 'Email' },
    {
      key: 'type_client',
      label: 'Type client',
      render: (row) => (
        <p
          variant="body2"
          style={{ color: row.type_client == null ? 'green' : 'red' }}
          title={
            row.type_client !== null
              ? `Partenaire : ${row.partenaire?.description || ''}`
              : 'Client particulier'
          }
        >
          {row.type_client === null ? 'Particulier' : 'Professionnel'}
        </p>
      ),
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
         

          <Link
            href={`/ventes/clients/${row.id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
            title="Voir détails"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`${ENDPOINTS.CLIENTS}?id=${row.id}&action=edit`}
            className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </Link>

          {row?.aquereur?.length === 0 &&
            row?.aquereur_desistement.length === 0 &&
            row.prospect == null &&
            row.reclamation.length === 0 && (
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setSelectedId(row.id);
                  setShowDeleteModal(true);
                }}
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
        </div>
      ),
    },
  ];

  {
    /* Dynamic Modals Import */
  }

  //EXPORT

  const data_to_export = () => {
    return clients.map((cl) => ({
      nomComplet: `${cl.nom || ''} ${cl.prenom || ''}`.trim(),
      email: cl.email,
      telephone_num1:
        (cl.telephone_num1 ? cl.telephone_num1 : '') +
          (cl.telephone_num1 &&
          cl.telephone_num2 &&
          cl.telephone_num2 !== 'null'
            ? ' / ' + cl.telephone_num2
            : '') || '',
      cin: cl.cin,

      type_client: cl.partenaire_id === null ? 'Particulier' : 'professionnel',
      partenaire: cl.partenaire_id ? cl.partenaire?.description : '',
    }));
  };

  const columns_export = [
    { key: 'nomComplet', label: 'nomComplet' },
    { key: 'telephone_num1', label: 'Telephone' },
    { key: 'cin', label: 'Cin' },
    { key: 'email', label: 'Email' },
    { key: 'type_client', label: 'Type Client' },
    { key: 'partenaire', label: 'Partenaire' },
  ];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      nom: '',
      prenom: '',
      cin: '',
      telephone: '',
      email: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  return (
    <>
      <div className="reflative p-4">
        <Table
          showSearch={false}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'clients_export'}
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
          onFilterToggle={handleFilterToggle}
          addLink={
            isSuperAdmin(user?.role) ||
            isAdmin(user?.role) ||
            isCommercial(user?.role)||
            isRespoCommercial(user?.role)
              ? `${ENDPOINTS.CLIENTS}?action=add`
              : undefined
          }
          filterComponent={
            <div className="space-y-4 ">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                <Input
                  label={'Cin'}
                  type="text"
                  placeholder="Cin"
                  value={tempFilters.cin}
                  onChange={(e) => handleFilterChange('cin', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  label={'Nom'}
                  type="text"
                  placeholder="Nom"
                  value={tempFilters.nom}
                  onChange={(e) => handleFilterChange('nom', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  label={'Prénom'}
                  type="text"
                  placeholder="Prénom"
                  value={tempFilters.prenom}
                  onChange={(e) => handleFilterChange('prenom', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  label={'Téléphone'}
                  type="number"
                  placeholder="Téléphone"
                  value={tempFilters.telephone}
                  onChange={(e) =>
                    handleFilterChange('telephone', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  label={'Email'}
                  type="email"
                  placeholder="Email"
                  value={tempFilters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
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

      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.CLIENTS}
            Id={selectedId}
            type="Client"
            message={'Etes-vous sûr de vouloir supprimer ce Client ?'}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_projet(
                entity,
                {},
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                setClients,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default ClientTable;

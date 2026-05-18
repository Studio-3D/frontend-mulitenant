'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Table from '@/components/Table';
import { Eye, Pencil, Check, RefreshCw, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { useAuth } from '../../../../context/AuthContext';
import { useProjet } from '../../../../context/ProjetContext';
import { APIURL, ENDPOINTS } from '../../../../configs/api';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../configs/api-utils';
import { isAdmin, isAgentAdministratif, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import Input from '@/components/Input';
import { useSociete } from '@/context/SocieteContext';

const PartenaireTable = () => {
  const [partenaires, setPartenaires] = useState([]);
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
  const { selectedSociete } = useSociete();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope
  const [filters, setFilters] = useState({
    description: '',
    remise: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'partenaires',
    dataKey: 'data',
    searchFields: ['description'],
  };

  useEffect(() => {
    fetchData_table_by_projet(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setPartenaires,
      setTotalRows
    );
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,selectedSociete
  ]);



  function handleEdit(PartenaireId) {
    router.push(`${ENDPOINTS.PARTENAIRES}?id=${PartenaireId}&action=edit`);
  }

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  // Format users data for table display
  const formatData = () => {
    return partenaires.map((item) => ({
      id: item.id,
      description: item.description,
      remise: item.remise || '0',
      prospect_length: item.prospect.length,
      client_length: item.client.length,
    }));
  };

  const columns = [
    { key: 'description', label: 'Partenaire' },
    { key: 'remise', label: 'Remise (%)' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleEdit(row.id)}
            title="Modifier"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {row.prospect_length == 0 && row.client_length == 0 && (
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

  const data_to_export = () => {
    return partenaires.map((item) => ({
      partenaire: item.description,
      Remise: item.remise || '0',
    }));
  };

  const columns_export = [
    { key: 'partenaire', label: 'Partenaire' },
    { key: 'remise', label: 'Remise' },
  ];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = { description: '', remise: '' };

    setFilters(reset);
    setTempFilters(reset);
  };

  return (
    <>
      <div className="reflative bg-white rounded-lg shadow-md p-4">
        <Table
          showSearch={false}
          title={'Partenaires'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'partenaires_export'}
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
            isSuperAdmin(user.role) ||
            isAdmin(user.role) ||
           
            isAgentAdministratif(user.role)
              ? `${ENDPOINTS.PARTENAIRES}?action=add`
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
                  label={'Description'}
                  type="text"
                  placeholder="Description..."
                  value={tempFilters.description}
                  onChange={(e) =>
                    handleFilterChange('description', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="number"
                  label={'Remise'}
                  placeholder="Remise..."
                  value={tempFilters.remise}
                  onChange={(e) => handleFilterChange('remise', e.target.value)}
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
            route={APIURL.PARTENAIRES}
            Id={selectedId}
            type="Partenaire"
            message={'Etes-vous sûr de vouloir supprimer ce Partenaire ?'}
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
                setPartenaires,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default PartenaireTable;

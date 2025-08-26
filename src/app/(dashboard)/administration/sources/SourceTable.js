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
import { isAdmin, isCommercial, isSuperAdmin } from '../../../../configs/enum';
import Input from '@/components/Input';

const SourceTable = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope
  const [filters, setFilters] = useState({
    source: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'sources',
    dataKey: 'data',
    searchFields: ['source'],
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
      setSources,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters]);

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
      setSources,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters]);

  function handleEdit(SourceId) {
    router.push(`${ENDPOINTS.SOURCES}?id=${SourceId}&action=edit`);
  }

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  // Format users data for table display
  const formatData = () => {
    return sources.map((source) => ({
      id: source.id,
      source: source.source,
      prospect_length: source.prospect.length,
    }));
  };

  const columns = [
    { key: 'source', label: 'Source' },
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
          {row.prospect_length == 0 && (
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
    return sources.map((ty) => ({
      source: ty.source,
    }));
  };

  const columns_export = [{ key: 'source', label: 'Source' }];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      source: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  return (
    <>
      <div className="reflative bg-white rounded-lg shadow-md p-4">
        <Table
          showSearch={false}
          title={'Sources'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'sources_export'}
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
            isCommercial(user.role)
              ? `${ENDPOINTS.SOURCES}?action=add`
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
                  label={'Source'}
                  type="text"
                  placeholder="Source..."
                  value={tempFilters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
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
            route={APIURL.SOURCES}
            Id={selectedId}
            type="Source"
            message={'Etes-vous sûr de vouloir supprimer ce Source ?'}
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
                setSources,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default SourceTable;

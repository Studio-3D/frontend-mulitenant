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

const VueTable = () => {
  const [vues, setVues] = useState([]);
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
    vue: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const entity = {
    API_URL: 'vues',
    dataKey: 'data',
    searchFields: ['vue'],
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
      setVues,
      setTotalRows
    );
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);

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
      setVues,
      setTotalRows
    );
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);

  function handleEdit(VueId) {
    router.push(`${ENDPOINTS.VUES}?id=${VueId}&action=edit`);
  }

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  // Format users data for table display
  const formatData = () => {
    return vues.map((vue) => ({
      id: vue.id,
      vue: vue.vue,
      frein_vue_length: vue.frein_vue.length,
      bien_length: vue.bien.length,
    }));
  };

  const columns = [
    { key: 'vue', label: 'Vue' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <div className="flex gap-3 items-center">
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => handleEdit(row.id)}
              title="Modifier"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {row.frein_vue_length == 0 && row.bien_length == 0 && (
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
        </div>
      ),
    },
  ];

  const data_to_export = () => {
    return vues.map((ty) => ({
      vue: ty.vue,
    }));
  };

  const columns_export = [{ key: 'vue', label: 'Vue' }];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      vue: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  return (
    <>
      <div className="reflative bg-white rounded-lg shadow-md p-4">
        <Table
          showSearch={false}
          title={'Vues'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'vues_export'}
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
              ? `${ENDPOINTS.VUES}?action=add`
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
                  label={'Vue'}
                  type="text"
                  placeholder="Vue..."
                  value={tempFilters.vue}
                  onChange={(e) => handleFilterChange('vue', e.target.value)}
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
            route={APIURL.VUES}
            Id={selectedId}
            type="Vue"
            message={'Etes-vous sûr de vouloir supprimer ce Vue ?'}
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
                setVues,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default VueTable;

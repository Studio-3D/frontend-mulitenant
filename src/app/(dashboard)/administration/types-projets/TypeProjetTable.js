'use typeprojet';

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
import { useSociete } from '@/context/SocieteContext';

const TypeProjetTable = () => {
  const { selectedSociete } = useSociete();

  const [typeprojets, setTypeProjets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user, token } = useAuth();
  const { selectedProjet ,refreshProjets} = useProjet();
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
    API_URL: 'typeProjets',
    dataKey: 'typeProjets',
    searchFields: ['type'],
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
      setTypeProjets,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters,selectedProjet,selectedSociete]);



  function handleEdit(TypeProjetId) {
    router.push(`${ENDPOINTS.TYPEPROJETS}?id=${TypeProjetId}&action=edit`);
  }

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  const formatData = () => {
    return typeprojets.map((cl) => ({
      id: cl.id,
      type: `${cl.type || ''}`.trim(),
      projet_lenght: cl.projet.length,
    }));
  };

  // Table columns configuration
  const columns = [
    { key: 'type', label: 'Type de projet' },
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
          {row.projet_lenght == 0 && (
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

  //EXPORT

  const data_to_export = () => {
    return typeprojets.map((type) => ({
      type: type.type,
    }));
  };

  const columns_export = [{ key: 'type', label: 'Type' }];

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      type: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };

  return (
    <>
      <div className="reflative bg-white rounded-lg shadow-md p-4">
        <Table
        showSearch={false}
          title={'Types de Projets'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'typeprojets_export'}
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
              ? `${ENDPOINTS.TYPEPROJETS}?action=add`
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
                  label={'Type de projet'}
                  type="text"
                  placeholder="Type..."
                  value={tempFilters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
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
            route={APIURL.TYPEPROJETS}
            Id={selectedId}
            type="Type de projet"
            message={'Etes-vous sûr de vouloir supprimer ce TypeProjet ?'}
            accessToken={accesstoken}
            onClose={async () => {
              setShowDeleteModal(false);
               // Refresh project data after deletion
              if (selectedProjet?.id) {
                try {
                  await refreshProjets(selectedProjet.id);
                } catch (refreshError) {
                  console.error('Error refreshing project after deletion:', refreshError);
                }
              }
              fetchData_table_by_projet(
                entity,
                {},
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                setTypeProjets,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default TypeProjetTable;

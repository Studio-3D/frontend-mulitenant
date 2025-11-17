'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import Table from '@/components/Table';
import CpsFilter from './CpsFilter';
import CpsForm from './CpsForm';
import { toast } from 'react-hot-toast';
import { PencilLine, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import format from 'date-fns/format';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useAuth } from '@/context/AuthContext';
import { fetchData_table_by_projet } from '@/configs/api-utils';

const CpsManager = ({}) => {
  const { user } = useAuth();

  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentCps, setCurrentCps] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cpsToDelete, setCpsToDelete] = useState(null);

  const router = useRouter();
  const accesstoken = localStorage.getItem('accessToken');

  const entity = {
    API_URL: 'cps',
    dataKey: 'data',
    searchFields: [''],
  };
  
  useEffect(() => {
    if (selectedProjet && selectedProjet.id) {
      fetchData_table_by_projet(
        entity,
        filterValues,
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setData,
        setTotalRows
      );
    }
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filterValues,
    selectedProjet,
    refreshData,
  ]);

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setCurrentPage(1);
  };

  const handleAddCps = (e) => {
    if (e) {
      e.preventDefault(); // Prevent default link behavior
      e.stopPropagation(); // Stop event propagation
    }
    setCurrentCps(null);
    setShowFormModal(true);
  };

  const handleEditCps = (id) => {
    const token = localStorage.getItem('accessToken');
    axios
      .get(`${APIURL.CPS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCurrentCps(response.data.cps);
        setShowFormModal(true);
      })
      .catch((error) => {
        toast.error('Erreur lors du chargement du CPS');
        console.error('Error fetching CPS:', error);
      });
  };

  const handleDeleteCps = (id) => {
    const cps = data.find((c) => c.id === id);
    setCpsToDelete(cps);
    setDeleteModalOpen(true);
  };

  const handleFormSave = () => {
    setShowFormModal(false);
    setCurrentCps(null);
    setRefreshData((prev) => !prev);
  };

  const handleFormCancel = () => {
    setShowFormModal(false);
    setCurrentCps(null);
  };

  const handleFileClick = (file) => {
    window.open(
      `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe_id}/cps/${file}`,
      '_blank'
    );
  };

  const columns = [
    {
      key: 'nature_travaux',
      label: 'Nature Travaux',
      render: (row) => (
        <span className="font-medium !text-gray-800">{row.nature_travaux}</span>
      ),
    },
    {
      key: 'cout',
      label: 'Coût Marché',
      render: (row) => (
        <span className="text-gray-800">{row.cout?.toLocaleString()} DH</span>
      ),
    },
    {
      key: 'date_validation',
      label: 'Date Validation',
      render: (row) =>
        row.date_validation
          ? format(new Date(row.date_validation), 'dd/MM/yyyy')
          : '-',
    },
    {
      key: 'piece_jointe',
      label: 'Pièce Jointe',
      render: (row) =>
        row.piece_jointe ? (
          <span
            className="text-blue-500 hover:underline cursor-pointer font-medium"
            onClick={() => handleFileClick(row.piece_jointe)}
          >
            {row.piece_jointe}
          </span>
        ) : (
          <span className="text-gray-500">-</span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditCps(row.id)}
            title="Modifier"
            className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
          >
            <PencilLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteCps(row.id)}
            title="Supprimer"
            className="flex items-center gap-1 !text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const exportColumns = [
    { key: 'nature_travaux', label: 'Nature Travaux' },
    { key: 'cout', label: 'Coût Marché' },
    { key: 'date_validation', label: 'Date Validation' },
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      nature_travaux: item?.nature_travaux || '',
      cout: item?.cout?.toLocaleString() + ' DH' || '',
      date_validation: item?.date_validation
        ? format(new Date(item.date_validation), 'dd/MM/yyyy')
        : '',
    }));
  };

  return (
    <div className="relative bg-white px-4 py-4">
      <Table
        name_file_export="cps"
        data_to_export={transformDataForExport()}
        columns_export={exportColumns}
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucun CPS trouvé"
        onPageChange={setCurrentPage}
        showSearch={false}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        enableExport={true}
        addLink={{
          pathname: '#', // Use hash to prevent navigation
          onClick: handleAddCps
        }}
        filterComponent={
          <CpsFilter
            onSubmit={handleFilterChange}
            initialValues={filterValues}
          />
        }
      />

      {showFormModal && (
        <Modal isVisible={true} onClose={handleFormCancel}>
          <CpsForm
            cps={currentCps}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
          />
        </Modal>
      )}

      {deleteModalOpen && cpsToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          entityName="CPS"
          itemLabel={'cps'}
          entityId={cpsToDelete.id}
          onDeleted={() => setRefreshData((prev) => !prev)}
        />
      )}
    </div>
  );
};

export default CpsManager;
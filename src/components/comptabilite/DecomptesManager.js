'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, ENDPOINTS } from '@/configs/api';
import Table from '@/components/Table';
import DecomptesFilter from './DecomptesFilter';
import DecomptesForm from './DecomptesForm';
import { toast } from 'react-hot-toast';
import { Eye, PencilLine, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import format from 'date-fns/format';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { fetchData_table_by_projet } from '@/configs/api-utils';

const DecomptesManager = () => {
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
  const [currentDecompte, setCurrentDecompte] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [decompteToDelete, setDecompteToDelete] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const id = searchParams.get('id');

  const accesstoken = localStorage.getItem('accessToken');

  const entity = {
    API_URL: 'decomptes',
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

  useEffect(() => {
    if (action === 'edit' && id) {
      handleEditDecompte(id);
    } else if (action === 'add') {
      setShowFormModal(true);
      setCurrentDecompte(null);
    }
  }, [action, id]);

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setCurrentPage(1);
  };

  const handleEditDecompte = (id) => {
    const token = localStorage.getItem('accessToken');
    axios
      .get(`${APIURL.DECOMPTES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setCurrentDecompte(response.data.decompte);
        setShowFormModal(true);
      })
      .catch((error) => {
        toast.error('Erreur lors du chargement du décompte');
        console.error('Error fetching decompte:', error);
      });
  };

  const handleDeleteDecompte = (id) => {
    const decompte = data.find((d) => d.id === id);
    setDecompteToDelete(decompte);
    setDeleteModalOpen(true);
  };

  const handleFormSave = () => {
    setShowFormModal(false);
    setRefreshData((prev) => !prev);
    router.push('/comptabilite/decomptes');
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) =>
        row.date ? format(new Date(row.date), 'dd/MM/yyyy') : '-',
    },
    {
      key: 'numero',
      label: 'Numéro',
      render: (row) => <span>{row.numero}</span>,
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (row) => (
        <span className="font-medium !text-gray-800">
          {row.montant.toLocaleString()} DH
        </span>
      ),
    },
    {
      key: 'montant_paye',
      label: 'Montant Payé',
      render: (row) => (
        <span className="text-green-600 font-medium">
          {row.factures_sum_montant
            ? row.factures_sum_montant.toLocaleString()
            : 0}{' '}
          DH
        </span>
      ),
    },
    {
      key: 'reste',
      label: 'Reste',
      render: (row) => (
        <div
          className="!text-red-700 font-bold"
          style={{ color: '#b91c1c !important' }}
        >
          {row.factures_sum_montant
            ? (row.montant - row.factures_sum_montant).toLocaleString()
            : row.montant.toLocaleString()}{' '}
          DH
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditDecompte(row.id)}
            title="Modifier"
            className="flex items-center gap-1  text-yellow-500  hover:text-yellow-700"
          >
            <PencilLine className="w-4 h-4" />
          </button>

          {row.factures && row.factures.length > 0 ? (
            <button
              onClick={() => router.push(`/comptabilite/decomptes/${row.id}`)}
              title="Voir les factures"
              className="flex items-center gap-1  !text-blue-500  hover:text-blue-700"
            >
              <Eye className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => handleDeleteDecompte(row.id)}
              title="Supprimer"
              className="flex items-center gap-1  !text-red-500  hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const exportColumns = [
    { key: 'date', label: 'Date' },
    { key: 'num', label: 'Numéro' },
    { key: 'mnt', label: 'Montant' },
    { key: 'mnt_pay', label: 'Montant Payé' },
    { key: 'reste', label: 'Reste' },
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      date: item.date ? format(new Date(item.date), 'dd/MM/yyyy') : '',
      num: item.numero || '',
      mnt: item.montant + ' DH',
      mnt_pay: (item.factures_sum_montant || 0) + ' DH',
      reste: item.factures_sum_montant
        ? item.montant - item.factures_sum_montant + ' DH'
        : item.montant + ' DH',
    }));
  };

  return (
    <div className="relative bg-white px-4 py-4">
      <Table
        name_file_export="decomptes"
        data_to_export={transformDataForExport()}
        columns_export={exportColumns}
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucun décompte trouvé"
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        rowsPerPage={rowsPerPage}
        enableExport={true}
        addLink={`${ENDPOINTS.DECOMPTES}?action=add`}
        filterComponent={
          <DecomptesFilter
            onSubmit={handleFilterChange}
            initialValues={filterValues}
          />
        }
        showSearch={false}
        onPageChange={setCurrentPage}
        currentPage={currentPage} // Convert 0-indexed to 1-indexed for display
      />

      {showFormModal && (
        <Modal
          isVisible={true}
          onClose={() => {
            setShowFormModal(false);
            router.push('/comptabilite/decomptes');
          }}
        >
          <DecomptesForm
            decompte={currentDecompte}
            onSave={handleFormSave}
            onCancel={() => {
              setShowFormModal(false);
              router.push('/comptabilite/decomptes');
            }}
          />
        </Modal>
      )}

      {deleteModalOpen && decompteToDelete && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          entityName="DECOMPTES"
          itemLabel={'Décompte'}
          entityId={decompteToDelete.id}
          onDeleted={() => setRefreshData((prev) => !prev)}
        />
      )}
    </div>
  );
};

export default DecomptesManager;

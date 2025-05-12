'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import DecomptesFilter from './DecomptesFilter';
import DecomptesForm from './DecomptesForm';
import { toast } from 'react-hot-toast';
import { Edit, Eye, Trash } from 'lucide-react';
import Modal from '@/components/Modal';
import format from 'date-fns/format';
import ProjectSelectorWrapper from './ProjectSelectorWrapper';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const DecomptesManager = ({ userRole }) => {
  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
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

  const fetchData = async () => {
    if (!selectedProjet) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const params = {
        page: page, // Use 1-indexed pagination for the API
        size: rowsPerPage,
        search: searchTerm,
        ...filterValues
      };
      
      // Update URL format: project ID should be in the path, not a query parameter
      const response = await axios.get(`${APIURL.ROOT}/v1/projets/${selectedProjet.id}/decomptes/`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      const fetchedData = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setData(fetchedData);
      setTotalRows(pagination.totalItems || fetchedData.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching decomptes data:', err);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjet && selectedProjet.id) {
      fetchData();
    }
  }, [selectedProjet, page, rowsPerPage, searchTerm, filterValues, refreshData]);

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
    setPage(1);
  };

  const handleAddDecompte = () => {
    setCurrentDecompte(null);
    setShowFormModal(true);
  };

  const handleEditDecompte = (id) => {
    const token = localStorage.getItem('accessToken');
    axios.get(`${APIURL.DECOMPTES}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setCurrentDecompte(response.data.decompte);
      setShowFormModal(true);
    })
    .catch(error => {
      toast.error("Erreur lors du chargement du décompte");
      console.error("Error fetching decompte:", error);
    });
  };

  const handleDeleteDecompte = (id) => {
    const decompte = data.find(d => d.id === id);
    setDecompteToDelete(decompte);
    setDeleteModalOpen(true);
  };

  const handleFormSave = () => {
    setShowFormModal(false);
    setRefreshData(prev => !prev);
    router.push('/comptabilite/decomptes');
  };

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (row) => row.date ? format(new Date(row.date), 'dd/MM/yyyy') : '-'
    },
    { 
      key: 'numero', 
      label: 'Numéro',
      render: (row) => <span>{row.numero}</span>
    },
    { 
      key: 'montant', 
      label: 'Montant',
      render: (row) => <span className="font-medium text-gray-800">{row.montant.toLocaleString()} DH</span>
    },
    { 
      key: 'montant_paye', 
      label: 'Montant Payé',
      render: (row) => <span className="text-green-600 font-medium">
        {row.factures_sum_montant ? row.factures_sum_montant.toLocaleString() : 0} DH
      </span>
    },
    { 
      key: 'reste', 
      label: 'Reste',
      render: (row) => (
        <div className="!text-red-700 font-bold" style={{ color: '#b91c1c !important' }}>
          {row.factures_sum_montant
            ? (row.montant - row.factures_sum_montant).toLocaleString()
            : row.montant.toLocaleString()
          } DH
        </div>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditDecompte(row.id)}
            title="Modifier"
            className="p-1.5 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200"
          >
            <Edit size={16} />
          </button>
          
          {row.factures && row.factures.length > 0 ? (
            <button
              onClick={() => router.push(`/comptabilite/decomptes/${row.id}`)}
              title="Voir les factures"
              className="p-1.5 bg-blue-100 !text-blue-600 rounded-full hover:bg-blue-200"
            >
              <Eye size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleDeleteDecompte(row.id)}
              title="Supprimer"
              className="p-1.5 bg-red-200 !text-red-600 rounded-full hover:bg-red-200"
            >
              <Trash size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const exportColumns = [
    { key: 'date', label: 'Date' },
    { key: 'num', label: 'Numéro' },
    { key: 'mnt', label: 'Montant' },
    { key: 'mnt_pay', label: 'Montant Payé' },
    { key: 'reste', label: 'Reste' }
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      date: item.date ? format(new Date(item.date), 'dd/MM/yyyy') : "",
      num: item.numero || "",
      mnt: item.montant + " DH",
      mnt_pay: (item.factures_sum_montant || 0) + " DH",
      reste: item.factures_sum_montant 
        ? (item.montant - item.factures_sum_montant) + " DH"
        : item.montant + " DH"
    }));
  };

  return (
    <ProjectSelectorWrapper>
      <div>
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
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          currentPage={page}
          rowsPerPage={rowsPerPage}
          enableExport={true}
          addLink="/comptabilite/decomptes?action=add"
          filterComponent={<DecomptesFilter onSubmit={handleFilterChange} initialValues={filterValues} />}
        />

        {showFormModal && (
          <Modal isVisible={true} onClose={() => {
            setShowFormModal(false);
            router.push('/comptabilite/decomptes');
          }}>
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
            itemLabel={`Décompte N° ${decompteToDelete.numero}`}
            entityId={decompteToDelete.id}
            onDeleted={() => setRefreshData(prev => !prev)}
          />
        )}
      </div>
    </ProjectSelectorWrapper>
  );
};

export default DecomptesManager;

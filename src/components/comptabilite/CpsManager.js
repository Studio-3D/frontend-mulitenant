'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import Table from '@/components/Table';
import CpsFilter from './CpsFilter';
import CpsForm from './CpsForm';
import { toast } from 'react-hot-toast';
import { Edit, Eye, Trash } from 'lucide-react';
import Modal from '@/components/Modal';
import format from 'date-fns/format';
import ProjectSelectorWrapper from './ProjectSelectorWrapper';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const CpsManager = ({ userRole }) => {
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
  const [currentCps, setCurrentCps] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [cpsToDelete, setCpsToDelete] = useState(null);
  
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
        page,
        size: rowsPerPage,
        search: searchTerm,
        ...filterValues
      };
      
      const response = await axios.get(`${APIURL.ROOT}/v1/projets/${selectedProjet.id}/cps/`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      
      const fetchedData = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setData(fetchedData);
      setTotalRows(pagination.totalItems || fetchedData.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching CPS data:', err);
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
      handleEditCps(id);
    } else if (action === 'add') {
      setShowFormModal(true);
      setCurrentCps(null);
    }
  }, [action, id]);

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setPage(1);
  };

  const handleEditCps = (id) => {
    const token = localStorage.getItem('accessToken');
    axios.get(`${APIURL.CPS}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setCurrentCps(response.data.cps);
      setShowFormModal(true);
    })
    .catch(error => {
      toast.error("Erreur lors du chargement du CPS");
      console.error("Error fetching CPS:", error);
    });
  };

  const handleDeleteCps = (id) => {
    const cps = data.find(c => c.id === id);
    setCpsToDelete(cps);
    setDeleteModalOpen(true);
  };

  const handleFormSave = () => {
    setShowFormModal(false);
    setRefreshData(prev => !prev);
    router.push('/comptabilite/cps');
  };

  const handleFileClick = (file) => {
    window.open(`${RESOURCE_URL.DOCS}/${selectedProjet?.societe?.raison_sociale_concatene}_${selectedProjet?.societe_id}/cps/${file}`, '_blank');
  };

  const columns = [
    { 
      key: 'nature_travaux', 
      label: 'Nature Travaux',
      render: (row) => <span className="font-medium !text-gray-800">{row.nature_travaux}</span>
    },
    { 
      key: 'cout', 
      label: 'Coût Marché',
      render: (row) => <span className="text-gray-800">{row.cout?.toLocaleString()} DH</span>
    },
    { 
      key: 'date_validation', 
      label: 'Date Validation',
      render: (row) => row.date_validation ? format(new Date(row.date_validation), 'dd/MM/yyyy') : '-'
    },
    { 
      key: 'piece_jointe', 
      label: 'Pièce Jointe',
      render: (row) => row.piece_jointe ? (
        <span 
          className="text-blue-700 hover:underline cursor-pointer font-medium"
          onClick={() => handleFileClick(row.piece_jointe)}
        >
          {row.piece_jointe}
        </span>
      ) : <span className="text-gray-500">-</span>
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditCps(row.id)}
            title="Modifier"
            className="p-1.5 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDeleteCps(row.id)}
            title="Supprimer"
            className="p-1.5 bg-red-200 !text-red-600 rounded-full hover:bg-red-200"
          >
            <Trash size={16} />
          </button>
        </div>
      )
    }
  ];

  const exportColumns = [
    { key: 'nature_travaux', label: 'Nature Travaux' },
    { key: 'cout', label: 'Coût Marché' },
    { key: 'date_validation', label: 'Date Validation' }
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      nature_travaux: item?.nature_travaux || "",
      cout: item?.cout?.toLocaleString() + " DH" || "",
      date_validation: item?.date_validation ? format(new Date(item.date_validation), 'dd/MM/yyyy') : ""
    }));
  };

  return (
    <ProjectSelectorWrapper>
      <div>
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
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          currentPage={page}
          rowsPerPage={rowsPerPage}
          enableExport={true}
          addLink="/comptabilite/cps?action=add"
          filterComponent={<CpsFilter onSubmit={handleFilterChange} initialValues={filterValues} />}
        />

        {showFormModal && (
          <Modal isVisible={true} onClose={() => {
            setShowFormModal(false);
            router.push('/comptabilite/cps');
          }}>
            <CpsForm 
              cps={currentCps} 
              onSave={handleFormSave}
              onCancel={() => {
                setShowFormModal(false);
                router.push('/comptabilite/cps');
              }}
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
            onDeleted={() => setRefreshData(prev => !prev)}
          />
        )}
      </div>
    </ProjectSelectorWrapper>
  );
};

export default CpsManager;

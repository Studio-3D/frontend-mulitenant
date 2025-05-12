'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL, RESOURCE_URL } from '@/configs/api';
import Table from '@/components/Table';
import FournisseursFilter from './FournisseursFilter';
import FournisseursForm from './FournisseursForm';
import { toast } from 'react-hot-toast';
import { Edit2, Eye, Trash2 } from 'lucide-react';
import Modal from '@/components/Modal';
import ProjectSelectorWrapper from './ProjectSelectorWrapper';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

const FournisseursManager = ({ userRole }) => {
  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); // Use 0-based pagination like old frontend
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentFournisseur, setCurrentFournisseur] = useState(null);
  const [facturesModalOpen, setFacturesModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [fournisseurToDelete, setFournisseurToDelete] = useState(null);
  
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
        page: page + 1, // Convert from 0-indexed to 1-indexed for the API
        size: rowsPerPage,
        search: searchTerm,
        ...filterValues
      };
      
      console.log("Fetching fournisseurs with params:", params);
      
      // Update URL format: project ID should be in the path, not a query parameter
      const response = await axios.get(`${APIURL.ROOT}/v1/projets/${selectedProjet.id}/fournisseurs/`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      console.log("Fournisseurs response:", response.data);
      
      const fetchedData = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setData(fetchedData);
      setTotalRows(pagination.totalItems || fetchedData.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching fournisseurs data:', err);
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
      handleEditFournisseur(id);
    } else if (action === 'add') {
      setShowFormModal(true);
      setCurrentFournisseur(null);
    }
  }, [action, id]);

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setPage(0); // Reset to page 0 (not 1) when filtering
  };

  const handleViewFactures = (fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setFacturesModalOpen(true);
  };

  const handleAddFournisseur = () => {
    setCurrentFournisseur(null);
    setShowFormModal(true);
  };

  const handleEditFournisseur = (id) => {
    const token = localStorage.getItem('accessToken');
    axios.get(`${APIURL.FOURNISSEURS}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(response => {
      setCurrentFournisseur(response.data.fournisseur);
      setShowFormModal(true);
    })
    .catch(error => {
      toast.error("Erreur lors du chargement du fournisseur");
      console.error("Error fetching fournisseur:", error);
    });
  };

  const handleDeleteFournisseur = (id) => {
    const fournisseur = data.find(f => f.id === id);
    setFournisseurToDelete(fournisseur);
    setDeleteModalOpen(true);
  };

  const handleFormSave = () => {
    setShowFormModal(false);
    setRefreshData(prev => !prev);
    router.push('/comptabilite/fournisseurs');
  };

  const handleFileClick = (file) => {
    window.open(`${RESOURCE_URL.DOCS}/${selectedProjet?.societe?.raison_sociale_concatene}_${selectedProjet?.societe_id}/fournisseurs/${file}`, '_blank');
  };

  const columns = [
    { 
      key: 'ice', 
      label: 'ICE',
      render: (row) => <span>{row.ice}</span>
    },
    { 
      key: 'code', 
      label: 'Code',
      render: (row) => <span>{row.code}</span>
    },
    { 
      key: 'nom', 
      label: 'Nom',
      render: (row) => <span className="font-medium">{row.nom}</span>
    },
    { 
      key: 'rc', 
      label: 'RC',
      render: (row) => <span>{row.rc}</span>
    },
    { 
      key: 'fichier_rc', 
      label: 'Fichier RC',
      render: (row) => row.fichier_rc ? (
        <span 
          className="text-blue-600 hover:underline cursor-pointer"
          onClick={() => handleFileClick(row.fichier_rc)}
        >
          {row.fichier_rc}
        </span>
      ) : '-'
    },
    { 
      key: 'adresse', 
      label: 'Adresse',
      render: (row) => <span>{row.adresse || '-'}</span>
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEditFournisseur(row.id)}
            title="Modifier"
            className="p-1.5 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200"
          >
            <Edit2 size={16} />
          </button>
          {row.factures && row.factures.length > 0 ? (
            <button
              onClick={() => handleViewFactures(row)}
              title="Voir Factures"
              className="p-1.5 bg-blue-100 !text-blue-600 rounded-full hover:bg-blue-200"
            >
              <Eye size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleDeleteFournisseur(row.id)}
              title="Supprimer"
              className="p-1.5 bg-red-200 !text-red-600 rounded-full hover:bg-red-200"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const exportColumns = [
    { key: 'ice', label: 'ICE' },
    { key: 'code', label: 'Code' },
    { key: 'nom', label: 'Nom' },
    { key: 'rc', label: 'RC' },
    { key: 'fichier_rc', label: 'Fichier RC' },
    { key: 'adresse', label: 'Adresse' }
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      ice: item?.ice || "",
      code: item?.code || "",
      nom: item?.nom || "",
      rc: item?.rc || "",
      fichier_rc: item?.fichier_rc || "",
      adresse: item?.adresse || ""
    }));
  };

  // Display page is 1-indexed for UI
  const displayPage = page + 1;

  // Handle page changes - convert from 1-indexed UI to 0-indexed API
  const handlePageChange = (newPage) => {
    setPage(newPage - 1); // Convert 1-indexed to 0-indexed
  };

  return (
    <ProjectSelectorWrapper>
      <div>
        <Table
          name_file_export="fournisseurs"
          data_to_export={transformDataForExport()}
          columns_export={exportColumns}
          columns={columns}
          data={data}
          totalRows={totalRows}
          loading={loading}
          error={error}
          emptyMessage="Aucun fournisseur trouvé"
          onPageChange={handlePageChange}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          currentPage={displayPage} // Convert 0-indexed to 1-indexed for display
          rowsPerPage={rowsPerPage}
          enableExport={true}
          addLink="/comptabilite/fournisseurs?action=add"
          filterComponent={<FournisseursFilter onSubmit={handleFilterChange} initialValues={filterValues} />}
        />

        {showFormModal && (
          <Modal isVisible={true} onClose={() => {
            setShowFormModal(false);
            router.push('/comptabilite/fournisseurs');
          }}>
            <FournisseursForm 
              fournisseur={currentFournisseur} 
              onSave={handleFormSave}
              onCancel={() => {
                setShowFormModal(false);
                router.push('/comptabilite/fournisseurs');
              }}
            />
          </Modal>
        )}

        {facturesModalOpen && selectedFournisseur && (
          <Modal isVisible={true} onClose={() => setFacturesModalOpen(false)}>
            <div className="p-5">
              <h2 className="text-xl font-bold mb-4">Factures du fournisseur: {selectedFournisseur.code} - {selectedFournisseur.nom}</h2>
              {selectedFournisseur.factures && selectedFournisseur.factures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedFournisseur.factures.map(facture => (
                    <div key={facture.id} className="border p-4 rounded-md bg-gray-50">
                      <p className="font-medium">N°: {facture.num_facture}</p>
                      <p className="text-green-600 font-bold">Montant: {facture.montant?.toLocaleString()} DH</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucune facture trouvée</p>
              )}
            </div>
          </Modal>
        )}

        {deleteModalOpen && fournisseurToDelete && (
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            entityName="FOURNISSEURS"
            itemLabel={`${fournisseurToDelete.code} - ${fournisseurToDelete.nom}`}
            entityId={fournisseurToDelete.id}
            onDeleted={() => {
              setRefreshData(prev => !prev);
              router.push('/comptabilite/fournisseurs');
            }}
          />
        )}
      </div>
    </ProjectSelectorWrapper>
  );
};

export default FournisseursManager;

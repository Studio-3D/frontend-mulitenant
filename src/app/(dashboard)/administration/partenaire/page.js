"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Table from '@/components/Table';
import { APIURL } from '@/configs/api';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function PartenairesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch partenaires when component mounts or when project changes
  const fetchPartenaires = useCallback(async () => {
    // Only proceed if a project is selected
    if (!selectedProjet) {
      setPartenaires([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(`${APIURL.PARTENAIRES}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          projet_id: selectedProjet.id,
          page: pagination.page,
          size: pagination.pageSize,
          description: searchTerm || undefined
        }
      });
      
      // Handle different response structures
      let partenairesData = [];
      
      if (Array.isArray(response.data)) {
        partenairesData = response.data;
      } else if (response.data && Array.isArray(response.data.partenaires)) {
        partenairesData = response.data.partenaires;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        partenairesData = response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        partenairesData = [];
      }
      
      setPartenaires(partenairesData);
      
      // Handle pagination info
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total || partenairesData.length
        }));
      } else {
        setPagination(prev => ({
          ...prev,
          total: partenairesData.length
        }));
      }
      
    } catch (err) {
      console.error("Error fetching partenaires:", err);
      setError("Erreur lors du chargement des partenaires");
      setPartenaires([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProjet, pagination.page, pagination.pageSize, searchTerm]);

  useEffect(() => {
    fetchPartenaires();
  }, [fetchPartenaires]);

  // Define table columns
  const columns = [
    { key: "description", label: "Description" },
    { key: "remise", label: "Remise (%)" }
  ];

  // Format data for the Table component
  const formatPartenairesForTable = () => {
    if (!Array.isArray(partenaires)) {
      console.error("partenaires is not an array:", partenaires);
      return [];
    }
    
    return partenaires.map(partenaire => ({
      id: partenaire.id,
      description: partenaire.description || 'N/A',
      remise: partenaire.remise || '0'
    }));
  };

  // Handle delete partenaire
  const handleDeletePartenaire = async (partenaireId) => {
    // Check if partenaire is used by any prospects or clients
    const partenaireToDelete = partenaires.find(p => p.id === partenaireId);
    if (
      partenaireToDelete && 
      ((partenaireToDelete.prospect && partenaireToDelete.prospect.length > 0) ||
      (partenaireToDelete.client && partenaireToDelete.client.length > 0))
    ) {
      toast.error("Impossible de supprimer ce partenaire car il est utilisé par des prospects ou clients");
      return;
    }
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire?")) {
      try {
        const token = localStorage.getItem("accessToken");
        await axios.delete(`${APIURL.PARTENAIRES}/${partenaireId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        toast.success("Partenaire supprimé avec succès");
        fetchPartenaires(); // Refresh the list
      } catch (err) {
        console.error("Error deleting partenaire:", err);
        toast.error("Erreur lors de la suppression du partenaire");
      }
    }
  };

  // Handle table actions
  const handleTableAction = (action, partenaireId) => {
    switch(action) {
      case 'view':
        router.push(`/Administration/Partenaires/${partenaireId}`);
        break;
      case 'edit':
        router.push(`/Administration/Partenaires/edit/${partenaireId}`);
        break;
      case 'delete':
        handleDeletePartenaire(partenaireId);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPagination({
      page: 1,
      pageSize: newSize,
      total: pagination.total
    });
  };

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Check if user has permission to manage partenaires
  const canManagePartenaires = user && (user.role === 1 || user.role === 2); // SuperAdmin or Admin

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {!selectedProjet ? (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p className="text-amber-700">Veuillez sélectionner un projet pour gérer les partenaires.</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-2xl font-bold !text-gray-800">Gestion des Partenaires</h1>
            <p className="text-gray-600">
              Projet: <span className="font-medium">{selectedProjet.nom}</span>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 !text-red-700 p-4 mb-4" role="alert">
              <p>{error}</p>
            </div>
          )}

          {/* Table with loading state */}
          <Table 
            columns={columns}
            data={formatPartenairesForTable()}
            onAction={handleTableAction}
            onSearch={handleSearch}
            searchTerm={searchTerm}
            addButtonLink={canManagePartenaires ? "/Administration/Partenaires/ajouter" : ""}
            addButtonText="Ajouter Partenaire"
            enableExport={true}
            loading={loading}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            availableActions={canManagePartenaires ? ['view', 'edit', 'delete'] : ['view']}
          />
          <DeleteConfirmationModal
            isOpen={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            entityName="PARTENAIRES"
            itemLabel={rowToDelete?.label}
            entityId={rowToDelete?.id}
            data={freins}
            onDeleted={() => fetchFreins(filterParams)} // <- ici
          />
        </>
      )}
    </div>
  );
}

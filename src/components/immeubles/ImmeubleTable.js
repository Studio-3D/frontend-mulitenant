"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, Edit, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';

export default function ImmeubleTable({ projetId, blocId, trancheId }) {
  const [immeubles, setImmeubles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Check user permissions for managing immeubles
  const canManageImmeubles = user?.role === 1 || user?.role === 2; // Superadmin or Admin

  // Define table columns with action buttons
  const columns = [
    { key: 'nom', label: 'Immeuble' },
    { key: 'bloc_nom', label: 'Bloc' },
    { key: 'titre_foncier', label: 'Titre foncier' },
    { key: 'nbre_biens', label: 'Nombre de biens' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-4 items-center">
          <button
            className="text-teal-500 hover:text-teal-700"
            onClick={() => handleAction('view', row.id)}
            title="Voir"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {canManageImmeubles && (
            <>
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleAction('edit', row.id)}
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => handleAction('delete', row.id)}
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  // Fetch immeubles data
  useEffect(() => {
    const fetchImmeubles = async () => {
      if (!projetId) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const params = { projet_id: projetId };
        
        // Add optional filter parameters if provided
        if (blocId) {
          params.bloc_id = blocId;
        } else if (trancheId) {
          params.tranche_id = trancheId;
        }
        
        const response = await axios.get(`${APIURL.IMMEUBLES}`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        
        if (response.data && response.data.data) {
          let immeublesData = response.data.data;
          
          // Additional client-side filtering for tranche if needed
          if (trancheId && !blocId) {
            // Fetch the blocs for this tranche to get their IDs
            const blocsResponse = await axios.get(`${APIURL.BLOCS}`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { tranche_id: trancheId }
            });
            
            if (blocsResponse.data && blocsResponse.data.data) {
              // Create a list of bloc IDs for this tranche
              const trancheBlocIds = blocsResponse.data.data
                .filter(bloc => bloc.tranche_id && bloc.tranche_id.toString() === trancheId.toString())
                .map(bloc => bloc.id.toString());
              
              // Only keep immeubles that belong to blocs in this tranche
              immeublesData = immeublesData.filter(immeuble => 
                immeuble.bloc_id && trancheBlocIds.includes(immeuble.bloc_id.toString())
              );
            }
          }
          
          setImmeubles(immeublesData);
        } else {
          setError("Aucun immeuble trouvé");
          setImmeubles([]);
        }
      } catch (err) {
        console.error("Failed to load immeubles:", err);
        setError("Erreur lors du chargement des immeubles");
        setImmeubles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImmeubles();
  }, [projetId, blocId, trancheId, refreshFlag]);

  // Format immeubles data for table
  const formattedImmeubles = immeubles
    .filter(immeuble => 
      searchTerm === '' || 
      immeuble.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      immeuble.bloc?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      immeuble.titre_foncier?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(immeuble => ({
      id: immeuble.id,
      nom: immeuble.nom || 'Sans nom',
      bloc_nom: immeuble.bloc?.nom || 'N/A',
      titre_foncier: immeuble.titre_foncier || 'N/A',
      nbre_biens: immeuble.nbre_biens || '0'
    }));

  // Calculate paginated data
  const paginatedData = formattedImmeubles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Handle export
  const handleExport = () => {
    const dataToExport = formattedImmeubles.map(immeuble => ({
      Immeuble: immeuble.nom,
      Bloc: immeuble.bloc_nom,
      "Titre foncier": immeuble.titre_foncier,
      "Nombre de biens": immeuble.nbre_biens
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Immeubles");
    XLSX.writeFile(workbook, "immeubles_export.xlsx");
    
    toast.success("Export réalisé avec succès");
  };

  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Immeubles/${id}`);
        break;
      case 'edit':
        router.push(`/Immeubles/${id}/modifier`);
        break;
      case 'delete':
        if (confirm("Êtes-vous sûr de vouloir supprimer cet immeuble ? Cette action est irréversible.")) {
          deleteImmeubleById(id);
        }
        break;
      default:
        console.log(`Action ${action} for immeuble ${id}`);
    }
  };

  // Delete immeuble
  const deleteImmeubleById = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.IMMEUBLES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Immeuble supprimé avec succès");
      setRefreshFlag(prev => !prev); // Trigger a refresh
    } catch (err) {
      console.error("Failed to delete immeuble:", err);
      toast.error("Erreur lors de la suppression de l'immeuble");
    }
  };
  
  // Create URL for add button with appropriate query params
  const addButtonUrl = canManageImmeubles 
    ? `/Immeubles/ajouter?projet=${projetId}${blocId ? `&bloc=${blocId}` : ''}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  return (
    <Table 
      columns={columns}
      data={paginatedData}
      totalRows={formattedImmeubles.length}
      loading={loading}
      error={error}
      addUserLink={addButtonUrl}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      enableExport={formattedImmeubles.length > 0}
      onExport={handleExport}
    />
  );
}

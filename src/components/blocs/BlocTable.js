"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, Pencil, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';

export default function BlocTable({ projetId, trancheId }) {
  const [blocs, setBlocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Check user permissions for managing blocs
  const canManageBlocs = user?.role === 1 || user?.role === 2; // Superadmin or Admin

  // Define table columns with action buttons
  const columns = [
    { key: 'nom', label: 'Bloc' },
    { key: 'tranche_nom', label: 'Tranche' },
    { key: 'titre_foncier', label: 'Titre foncier' },
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
          
          {canManageBlocs && (
            <>
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => handleAction('edit', row.id)}
                title="Modifier"
              >
                <Pencil className="w-4 h-4" />
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

  // Fetch blocs data
  useEffect(() => {
    const fetchBlocs = async () => {
      if (!projetId) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const params = { projet_id: projetId };
        
        // If trancheId is provided, filter by it
        if (trancheId) {
          params.tranche_id = trancheId;
        }
        
        const response = await axios.get(`${APIURL.BLOCS}`, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        
        if (response.data && response.data.data) {
          // Extra filtering to ensure only blocs for this tranche are shown
          let blocsData = response.data.data;
          
          if (trancheId) {
            // Double check filtering on the client side
            blocsData = blocsData.filter(bloc => 
              bloc.tranche_id && bloc.tranche_id.toString() === trancheId.toString()
            );
          }
          
          setBlocs(blocsData);
        } else {
          setError("Aucun bloc trouvé");
          setBlocs([]);
        }
      } catch (err) {
        console.error("Failed to load blocs:", err);
        setError("Erreur lors du chargement des blocs");
        setBlocs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocs();
  }, [projetId, trancheId, refreshFlag]);

  // Format blocs data for table
  const formattedBlocs = blocs
    .filter(bloc => 
      searchTerm === '' || 
      bloc.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bloc.tranche?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bloc.titre_foncier?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(bloc => ({
      id: bloc.id,
      nom: bloc.nom || 'Sans nom',
      tranche_nom: bloc.tranche?.nom || 'N/A',
      titre_foncier: bloc.titre_foncier || 'N/A'
    }));

  // Calculate paginated data
  const paginatedData = formattedBlocs.slice(
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

  // Handle export - This is the functionality we're keeping
  const handleExport = () => {
    const dataToExport = formattedBlocs.map(bloc => ({
      Bloc: bloc.nom,
      Tranche: bloc.tranche_nom,
      "Titre foncier": bloc.titre_foncier
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Blocs");
    XLSX.writeFile(workbook, "blocs_export.xlsx");
    
    toast.success("Export réalisé avec succès");
  };

  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Blocs/${id}`);
        break;
      case 'edit':
        router.push(`/Blocs/${id}/modifier`);
        break;
      case 'delete':
        if (confirm("Êtes-vous sûr de vouloir supprimer ce bloc ? Cette action est irréversible.")) {
          deleteBlocById(id);
        }
        break;
      default:
        console.log(`Action ${action} for bloc ${id}`);
    }
  };

  // Delete bloc
  const deleteBlocById = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.BLOCS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Bloc supprimé avec succès");
      setRefreshFlag(prev => !prev); // Trigger a refresh
    } catch (err) {
      console.error("Failed to delete bloc:", err);
      toast.error("Erreur lors de la suppression du bloc");
    }
  };
  
  // Create URL for add button with appropriate query params
  const addButtonUrl = canManageBlocs 
    ? `/Blocs/ajouter?projet=${projetId}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  return (
    <Table 
      columns={columns}
      data={paginatedData}
      totalRows={formattedBlocs.length}
      loading={loading}
      error={error}
      addUserLink={addButtonUrl}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      enableExport={formattedBlocs.length > 0} // Only enable if we have data
      onExport={handleExport} // Pass the export function to the Table component
    />
  );
}

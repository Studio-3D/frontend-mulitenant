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

export default function TrancheTable({ projetId }) {
  const [tranches, setTranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Check user permissions for managing tranches
  const canManageTranches = user?.role === 1 || user?.role === 2; // Superadmin or Admin

  // Define table columns with action buttons
  const columns = [
    { key: 'nom', label: 'Tranche' },
    { key: 'date_lancement', label: 'Date lancement' },
    { key: 'niveau_etages', label: 'Niveau d\'étages' },
    { key: 'date_livraison', label: 'Date livraison' },
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
          
          {canManageTranches && (
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

  // Fetch tranches data
  useEffect(() => {
    const fetchTranches = async () => {
      if (!projetId) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`${APIURL.TRANCHES}`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { projet_id: projetId }
        });
        
        if (response.data && response.data.data) {
          // Update to use data array from response
          setTranches(response.data.data);
        } else {
          setError("Aucune tranche trouvée");
          setTranches([]);
        }
      } catch (err) {
        console.error("Failed to load tranches:", err);
        setError("Erreur lors du chargement des tranches");
        setTranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTranches();
  }, [projetId, refreshFlag]);

  // Format tranches data for table
  const formattedTranches = tranches
    .filter(tranche => 
      searchTerm === '' || 
      tranche.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(tranche => ({
      id: tranche.id,
      nom: tranche.nom || 'Sans nom',
      date_lancement: tranche.date_lancement ? new Date(tranche.date_lancement).toLocaleDateString('fr-FR') : 'N/A',
      niveau_etages: tranche.niveau_etages || 'N/A',
      date_livraison: tranche.date_livraison ? new Date(tranche.date_livraison).toLocaleDateString('fr-FR') : 'N/A'
    }));

  // Calculate paginated data
  const paginatedData = formattedTranches.slice(
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
    const dataToExport = formattedTranches.map(tranche => ({
      Tranche: tranche.nom,
      "Date lancement": tranche.date_lancement,
      "Niveau d'étages": tranche.niveau_etages,
      "Date livraison": tranche.date_livraison
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tranches");
    XLSX.writeFile(workbook, "tranches_export.xlsx");
    
    toast.success("Export réalisé avec succès");
  };

  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Tranches/${id}`);
        break;
      case 'edit':
        router.push(`/Tranches/${id}/modifier`);
        break;
      case 'delete':
        if (confirm("Êtes-vous sûr de vouloir supprimer cette tranche ? Cette action est irréversible.")) {
          deleteTrancheById(id);
        }
        break;
      default:
        console.log(`Action ${action} for tranche ${id}`);
    }
  };

  // Delete tranche
  const deleteTrancheById = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.TRANCHES}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Tranche supprimée avec succès");
      setRefreshFlag(prev => !prev); // Trigger a refresh
    } catch (err) {
      console.error("Failed to delete tranche:", err);
      toast.error("Erreur lors de la suppression de la tranche");
    }
  };
  
  // Create URL for add button with appropriate query params
  const addButtonUrl = canManageTranches ? `/Tranches/ajouter?projet=${projetId}` : "";

  return (
    <Table 
      columns={columns}
      data={paginatedData}
      totalRows={formattedTranches.length}
      loading={loading}
      error={error}
      addLink={addButtonUrl}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      enableExport={formattedTranches.length > 0}
      onExport={handleExport}
    />
  );
}

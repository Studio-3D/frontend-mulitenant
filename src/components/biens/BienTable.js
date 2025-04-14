"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import * as XLSX from 'xlsx';

export default function BienTable({ projetId, immeubleId, blocId, trancheId }) {
  const [biens, setBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Format property status
  const formatEtat = (etat) => {
    switch(etat) {
      case 'disponible': return 'Disponible';
      case 'reserve': return 'Réservé';
      case 'vendu': return 'Vendu';
      default: return etat;
    }
  };

  // Define table columns with action buttons
  const columns = [
    { key: 'propriete_dite_bien', label: 'Désignation' },
    { key: 'numero', label: 'Numéro' },
    { key: 'niveau', label: 'Niveau' },
    { key: 'immeuble_nom', label: 'Immeuble' },
    { key: 'prix', label: 'Prix (Dhs)' },
    { key: 'etat', label: 'État' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        // Check user permissions for managing biens
        const canManageBiens = user?.role === 1 || user?.role === 2; // Superadmin or Admin
        
        return (
          <div className="flex gap-4 items-center">
            {canManageBiens && (
              <>
                <button
                  className="text-blue-500 hover:text-blue-700"
                  onClick={() => handleAction('edit', row.id)}
                  title="Modifier"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleAction('delete', row.id)}
                  title="Supprimer"
                >
                  <RiDeleteBin6Line className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  // Fetch biens data
  useEffect(() => {
    const fetchBiens = async () => {
      if (!projetId) return;
      
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const params = { projet_id: projetId };
        
        // Add optional filter parameters if provided
        if (immeubleId) {
          params.immeuble_id = immeubleId;
        } else if (blocId) {
          params.bloc_id = blocId;
        } else if (trancheId) {
          params.tranche_id = trancheId;
        }
        
        console.log("Fetching biens with params:", params);
        
        const response = await axios.get(APIURL.BIENS, {
          headers: { Authorization: `Bearer ${token}` },
          params
        });
        
        let biensData = [];
        
        if (response.data && response.data.data) {
          biensData = response.data.data;
        } else if (response.data && response.data.biens) {
          biensData = response.data.biens;
        }
        
        // Additional client-side filtering for tranche
        if (trancheId && !blocId && !immeubleId && biensData.length > 0) {
          // First try direct tranche_id filtering if the API supports it
          const biensWithTrancheId = biensData.filter(bien => 
            bien.tranche_id && bien.tranche_id.toString() === trancheId.toString()
          );
          
          if (biensWithTrancheId.length > 0) {
            // If we found biens with direct tranche_id, use those
            biensData = biensWithTrancheId;
          } else {
            // Otherwise, we need to get blocs and immeubles for this tranche
            const blocsResponse = await axios.get(`${APIURL.BLOCS}`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { tranche_id: trancheId }
            });
            
            if (blocsResponse.data && blocsResponse.data.data) {
              // Get bloc IDs for this tranche
              const trancheBlocIds = blocsResponse.data.data
                .filter(bloc => bloc.tranche_id && bloc.tranche_id.toString() === trancheId.toString())
                .map(bloc => bloc.id.toString());
              
              // Filter biens to only include those from these blocs or their immeubles
              biensData = biensData.filter(bien => {
                if (bien.bloc_id && trancheBlocIds.includes(bien.bloc_id.toString())) {
                  return true;
                }
                
                // For biens with immeuble_id, check if the immeuble belongs to one of our blocs
                if (bien.immeuble_id) {
                  // We might need to fetch the immeuble to check its bloc_id
                  // For now, we'll assume the API is handling this correctly
                  return true;
                }
                
                return false;
              });
            }
          }
        }
        
        setBiens(biensData);
      } catch (err) {
        console.error("Failed to load biens:", err);
        setError("Erreur lors du chargement des biens");
        setBiens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBiens();
  }, [projetId, immeubleId, blocId, trancheId, refreshFlag]);

  // Format biens data for table
  const formattedBiens = biens
    .filter(bien => 
      searchTerm === '' || 
      bien.propriete_dite_bien?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bien.immeuble?.nom?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map(bien => ({
      id: bien.id,
      propriete_dite_bien: bien.propriete_dite_bien || 'Sans nom',
      numero: bien.numero || 'N/A',
      niveau: bien.niveau?.toString() || 'N/A',
      immeuble_nom: bien.immeuble?.nom || 'N/A',
      prix: bien.prix?.toLocaleString('fr-FR') || '0',
      etat: formatEtat(bien.etat || 'disponible')
    }));

  // Calculate paginated data
  const paginatedData = formattedBiens.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(1);
  };

  // Handle export
  const handleExport = () => {
    const dataToExport = formattedBiens.map(bien => ({
      Désignation: bien.propriete_dite_bien,
      Numéro: bien.numero,
      Niveau: bien.niveau,
      Immeuble: bien.immeuble_nom,
      Prix: bien.prix,
      État: bien.etat
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Biens");
    XLSX.writeFile(workbook, "biens_export.xlsx");
    
    toast.success("Export réalisé avec succès");
  };

  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'edit':
        router.push(`/Biens/${id}/modifier`);
        break;
      case 'delete':
        if (confirm("Êtes-vous sûr de vouloir supprimer ce bien ? Cette action est irréversible.")) {
          deleteBienById(id);
        }
        break;
      default:
        console.log(`Action ${action} for bien ${id}`);
    }
  };

  // Delete bien
  const deleteBienById = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${APIURL.BIENS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Bien supprimé avec succès");
      setRefreshFlag(prev => !prev); // Trigger a refresh
    } catch (err) {
      console.error("Failed to delete bien:", err);
      toast.error("Erreur lors de la suppression du bien");
    }
  };

  // Check user permissions for managing biens
  const canManageBiens = user?.role === 1 || user?.role === 2; // Superadmin or Admin
  
  // Create URL for add button with appropriate query params
  const addButtonUrl = canManageBiens 
    ? `/Biens/ajouter?projet=${projetId}${blocId ? `&bloc=${blocId}` : ''}${immeubleId ? `&immeuble=${immeubleId}` : ''}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  return (
    <Table 
      columns={columns}
      data={paginatedData}
      totalRows={formattedBiens.length}
      loading={loading}
      error={error}
      addUserLink={addButtonUrl}
      onSearchChange={handleSearchChange}
      currentPage={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      enableExport={formattedBiens.length > 0}
      onExport={handleExport}
    />
  );
}

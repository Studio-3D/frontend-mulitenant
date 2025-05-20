"use client";
import { useEffect, useState } from 'react';
import { useProjet } from '@/context/ProjetContext';
import { useSociete } from '@/context/SocieteContext';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Table from '@/components/Table';
import { Eye, Pencil, Trash2 } from "lucide-react";
import * as XLSX from 'xlsx';

export default function ProjetsPage() {
  const { selectedSociete } = useSociete();
  const { fetchProjets, loading, projets } = useProjet();
  const { user } = useAuth();
  const [hasFetched, setHasFetched] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProjets, setFilteredProjets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Only super admins and admin users can create projects
  const canCreateProjet = user?.role === 1 || user?.role === 2;

  // Define table columns with actions
  const columns = [
    { key: 'nom', label: 'Nom du projet' },
    { key: 'code', label: 'Code' },
    { key: 'type', label: 'Type' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'date', label: 'Date création' },
    { key: 'statut', label: 'Statut' },
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
        </div>
      )
    }
  ];

  // Get the société from localStorage as a fallback
  useEffect(() => {
    // Log the context value
    console.log("From context - Selected société:", selectedSociete);
    
    // Check localStorage as fallback
    const savedSociete = localStorage.getItem("selectedSociete");
    if (!selectedSociete && savedSociete) {
      console.log("Using localStorage fallback for société:", JSON.parse(savedSociete));
    }
    
    // Only fetch projects if we have a selected société and haven't fetched yet
    const effectiveSociete = selectedSociete || (savedSociete ? JSON.parse(savedSociete) : null);
    
    if (effectiveSociete && !hasFetched && !loading) {
      const doFetch = async () => {
        console.log("Fetching projects for société:", effectiveSociete.id);
        try {
          await fetchProjets();
          setHasFetched(true);
        } catch (err) {
          console.error("Error fetching projets:", err);
          setError("Erreur lors du chargement des projets");
        }
      };
      
      doFetch();
    }
  }, [selectedSociete, loading, hasFetched, fetchProjets]);

  // Format projects data for table
  useEffect(() => {
    if (!projets) return;
    
    // Apply search filter
    const filtered = projets.filter(projet => 
      searchTerm === '' || 
      projet.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projet.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Format data for table with all required fields
    const formattedProjets = filtered.map(projet => {
      // Properly handle type based on the correct property path
      let typeValue = 'N/A';
      if (projet.type_projet && projet.type_projet.type) {
        typeValue = projet.type_projet.type;
      }
      
      return {
        id: projet.id,
        nom: projet.nom || 'Sans nom',
        code: projet.code || 'N/A',
        type: typeValue,
        adresse: projet.adresse || 'N/A',
        date: new Date(projet.created_at).toLocaleDateString('fr-FR') || 'N/A',
        statut: projet.statut || 'Actif'
      };
    });
    
    setFilteredProjets(formattedProjets);
  }, [projets, searchTerm]);

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Handle table row actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Projets/${id}`);
        break;
      case 'edit':
        router.push(`/Projets/${id}/modifier`);
        break;
      case 'delete':
        // You could implement a confirmation modal here
        console.log('Delete project', id);
        break;
      default:
        console.log(`Action ${action} for project ${id}`);
    }
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    const dataToExport = filteredProjets.map(projet => ({
      'Nom du projet': projet.nom,
      'Code': projet.code,
      'Type': projet.type,
      'Adresse': projet.adresse,
      'Date création': projet.date,
      'Statut': projet.statut
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projets");
    XLSX.writeFile(workbook, "projets_export.xlsx");
  };

  // Calculate paginated data
  const paginatedData = filteredProjets.slice(
    (currentPage - 1) * rowsPerPage, 
    currentPage * rowsPerPage
  );

  return (
    <div className="relative ">
      {/* Table with projects */}
      <Table 
        columns={columns}
        data={paginatedData}
        totalRows={filteredProjets.length}
        loading={loading}
        error={error}
        addUserLink={canCreateProjet ? "/Projets/ajouter" : undefined}
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onExport={handleExportExcel}
        enableExport={filteredProjets.length > 0}
      />
    </div>
  );
}

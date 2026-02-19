"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import InputSelect from '../inputSelect';
import Link from 'next/link';
import Input from '../Input';
import { useProjet } from '@/context/ProjetContext';
import Modal from '../Modal';
import DeleteData from '../DeleteData';

export default function BlocTable({ projetId, trancheId }) {
  const [blocs, setBlocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tranches, setTranches] = useState([]);
  
  const router = useRouter();
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const accessToken = localStorage.getItem("accessToken");

  // Filters state
  const [filters, setFilters] = useState({
    nom: '', 
    tranche: '',
    titre_foncier: ''
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  // Fetch tranches data
  useEffect(() => {
    const fetchTranches = async () => {
      try {
        if (selectedProjet?.nbre_tranches !== 0 && !trancheId) {
          const response = await axios.get(`${APIURL.TRANCHES}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { projet_id: projetId }
          });
          setTranches(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching tranches:', err);
      }
    };

    if (projetId) {
      fetchTranches();
    }
  }, [projetId, trancheId, accessToken, selectedProjet]);

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    const reset = { nom: '', tranche: '', titre_foncier: '' };
    setFilters(reset);
    setTempFilters(reset);
    setCurrentPage(1);
  };

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters();
  };

  // Load blocs data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        ...(projetId && { projet_id: projetId }),
        ...(trancheId && { tranche_id: trancheId }),
        search: searchTerm,
        page: currentPage,
        size: rowsPerPage // Changed from 'per_page' to 'size' to match backend
      };

      const response = await axios.get(`${APIURL.BLOCS}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params
      });

      if (response.data?.data) {
        setBlocs(response.data.data);
        // Use either the pagination total or direct total from response
        setTotalRows(response.data.pagination?.totalItems || response.data.total || 0);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error('Error loading blocs:', err);
      setError(err.response?.data?.message || err.message || "Failed to load blocs");
      toast.error("Erreur lors du chargement des blocs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projetId) {
      loadData();
    }
  }, [searchTerm, filters, currentPage, rowsPerPage, projetId, trancheId]);

  // Format data for table
  const formattedBlocs = blocs.map(bloc => ({
    id: bloc.id,
    nom: bloc.nom || 'Sans nom',
    tranche_nom: bloc.tranche?.nom || '',
    titre_foncier: bloc.titre_foncier || '',
    nbre_immeubles: bloc.nbre_immeubles || 0,
    nbre_biens: bloc.nbre_biens || 0
  }));

  // Check user permissions
  const canManageBlocs = user?.role === 1 || user?.role === 2;

  // Table columns
  const columns = [
    { key: 'nom', label: 'Bloc' },
    { key: 'tranche_nom', label: 'Tranche' },
    { key: 'titre_foncier', label: 'Titre foncier' },
    { key: 'nbre_immeubles', label: 'Nbr Immeubles' },
    { key: 'nbre_biens', label: 'Nbr Biens' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-4 items-center">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleAction('view', row.id)}
            title="Voir Bloc"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {canManageBlocs && (
            <>
              <button
                className="text-yellow-500 hover:text-yellow-700"
                onClick={() => handleAction('edit', row.id)}
                title="Modifier Bloc"
              >
                <PencilLine className="w-4 h-4" />
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setSelectedId(row.id);
                  setShowDeleteModal(true);
                }}  
                title="Supprimer Bloc"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  // Export data
  const data_to_export = formattedBlocs.map(bloc => ({
    'Bloc': bloc.nom,
    'Tranche': bloc.tranche_nom,
    'Titre foncier': bloc.titre_foncier,
    'Nombre immeubles': bloc.nbre_immeubles,
    'Nombre biens': bloc.nbre_biens
  }));

  const columns_export = [
    { key: "Bloc", label: "Bloc" },
    { key: "Tranche", label: "Tranche" },
    { key: "Titre foncier", label: "Titre foncier" },
    { key: "Nombre immeubles", label: "Nombre d'immeubles" },
    { key: "Nombre biens", label: "Nombre de biens" }
  ];

  // Handle actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/blocs/${id}`);
        break;
      case 'edit':
        router.push(`/blocs/${id}/modifier`);
        break;
      default:
        console.log(`Action ${action} for bloc ${id}`);
    }
  };

  // Add button URL
  const addButtonUrl = canManageBlocs 
    ? `/blocs/ajouter?projet=${projetId}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  // Error and empty states
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };


  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Blocs</h3>
      <Table 
        columns={columns}
        showSearch={false}
        data={formattedBlocs}
        totalRows={totalRows}
        loading={loading}
        error={error}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg">
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <Input
                label="Nom"
                type="text"
                placeholder="Nom..."
                value={tempFilters.nom}
                onChange={(e) => handleFilterChange("nom", e.target.value)}
                className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
              />
              <Input
                label="Titre foncier"
                type="text"
                placeholder="Titre foncier..."
                value={tempFilters.titre_foncier}
                onChange={(e) => handleFilterChange("titre_foncier", e.target.value)}
                className="h-7 px-1 py-1 text-xs rounded-sm border border-gray-300 w-full"
              />
              {selectedProjet?.nbre_tranches !== 0 && !trancheId && (
                <InputSelect
                  label="Tranche"
                  options={tranches.map(t => ({ label: t.nom, value: t.nom }))}
                  value={tempFilters.tranche}
                  onChange={(value) => handleFilterChange("tranche", value?.value || '')}
                />
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
              >
                Réinitialiser
              </button>
              <button
                type="button"
                onClick={applyFilters}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Appliquer les filtres
              </button>
            </div>
          </div>
        }
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        data_to_export={data_to_export}
        columns_export={columns_export}
        name_file_export="bloc_export"
        addLink={addButtonUrl}
        onFilterToggle={handleFilterToggle}
        enableExport={formattedBlocs.length > 0}
      />
      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.BLOCS}
            Id={selectedId}
            type="Bloc"
            message="Êtes-vous sûr de vouloir supprimer ce bloc ?"
            accessToken={accessToken}
            onClose={() => {
              setShowDeleteModal(false);
              loadData();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from "@/context/AuthContext";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import { useProjet } from '@/context/ProjetContext';
import Input from '../Input';
import InputSelect from '../inputSelect';
import Link from 'next/link';
import Modal from '../Modal';
import DeleteData from '../DeleteData';

export default function ImmeubleTable({ projetId, trancheId, blocId }) {
  const [immeubles, setImmeubles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blocs, setBlocs] = useState([]);
  const [tranches, setTranches] = useState([]);
  
  const router = useRouter();
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const accessToken = localStorage.getItem("accessToken");
  const [totalRows, setTotalRows] = useState(0);

  // Filters state
  const [filters, setFilters] = useState({
    nom: '', 
    tranche: '', 
    bloc: '',
    titre_foncier: ''
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  // Debugging logs
  useEffect(() => {
    console.log('Current immeubles:', immeubles);
    console.log('Total rows:', totalRows);
    console.log('Filters:', filters);
    console.log('Project ID:', projetId);
    console.log('Tranche ID:', trancheId);
    console.log('Bloc ID:', blocId);
  }, [immeubles, totalRows, filters, projetId, trancheId, blocId]);

  // Fetch tranches and blocs data
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        if (selectedProjet?.nbre_tranches !== 0 && !trancheId && !blocId) {
          const tranchesResponse = await axios.get(`${APIURL.TRANCHES}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { projet_id: projetId }
          });
          setTranches(tranchesResponse.data.data || []);
        }

        if (selectedProjet?.nbre_blocs !== 0 && !blocId) {
          const params = trancheId ? { tranche_id: trancheId } : {};
          const blocsResponse = await axios.get(`${APIURL.BLOCS}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params
          });
          setBlocs(blocsResponse.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching related data:', err);
      }
    };

    if (projetId) {
      fetchRelatedData();
    }
  }, [projetId, trancheId, blocId, accessToken, selectedProjet]);

  // Filter handlers
  const handleFilterChange = (field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    const reset = { nom: '', tranche: '', bloc: '', titre_foncier: '' };
    setFilters(reset);
    setTempFilters(reset);
    setCurrentPage(1);
  };

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters();
  };

  // Load immeubles data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        ...(projetId && { projet_id: projetId }),
        ...(trancheId && { tranche_id: trancheId }),
        ...(blocId && { bloc_id: blocId }),
        search: searchTerm,
        page: currentPage,
        per_page: rowsPerPage
      };

      console.log('Fetching immeubles with params:', params);

      const response = await axios.get(`${APIURL.IMMEUBLES}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params
      });

      console.log('API response:', response.data);

      if (response.data?.data) {
        setImmeubles(response.data.data);
        setTotalRows(response.data.total || 0);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error('Error loading immeubles:', err);
      setError(err.message || "Failed to load immeubles");
      toast.error("Erreur lors du chargement des immeubles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projetId) {
      loadData();
    }
  }, [searchTerm, filters, currentPage, rowsPerPage, projetId, trancheId, blocId]);

  // Format data for table
  const formattedImmeubles = immeubles.map(immeuble => ({
    id: immeuble.id,
    nom: immeuble.nom || 'Sans nom',
    bloc_nom: immeuble.bloc?.nom || '',
    tranche_nom: immeuble.tranche?.nom || '',
    titre_foncier: immeuble.titre_foncier || '',
    nbre_biens: immeuble.nbre_biens || 0
  }));

  // Check user permissions
  const canManageImmeubles = user?.role === 1 || user?.role === 2;

  // Table columns
  const columns = [
    { key: 'nom', label: 'Immeuble' },
    { key: 'tranche_nom', label: 'Tranche' },
    { key: 'bloc_nom', label: 'Bloc' },
    { key: 'titre_foncier', label: 'Titre foncier' },
    { key: 'nbre_biens', label: 'Nbr Biens' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-4 items-center">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleAction('view', row.id)}
            title="Voir Immeuble"
          >
            <Eye className="w-4 h-4" />
          </button>
          
          {canManageImmeubles && (
            <>
              <button
                className="text-yellow-500 hover:text-yellow-700"
                onClick={() => handleAction('edit', row.id)}
                title="Modifier Immeuble"
              >
                <PencilLine className="w-4 h-4" />
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setSelectedId(row.id);
                  setShowDeleteModal(true);
                }}  
                title="Supprimer Immeuble"
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
  const data_to_export = () => {
    return formattedImmeubles.map(immeuble => ({
      'Immeuble': immeuble.nom,
      'Tranche': immeuble.tranche_nom,
      'Bloc': immeuble.bloc_nom,
      'Titre foncier': immeuble.titre_foncier,
      'Nombre de biens': immeuble.nbre_biens
    }));
  };

  const columns_export = [
    { key: "Immeuble", label: "Immeuble" },
    { key: "Tranche", label: "Tranche" },
    { key: "Bloc", label: "Bloc" },
    { key: "Titre foncier", label: "Titre foncier" },
    { key: "Nombre de biens", label: "Nombre de biens" }
  ];

  // Handle actions
  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Immeubles/${id}`);
        break;
      case 'edit':
        router.push(`/Immeubles/${id}/modifier`);
        break;
      default:
        console.log(`Action ${action} for immeuble ${id}`);
    }
  };

  // Add button URL
  const addButtonUrl = canManageImmeubles 
    ? `/Immeubles/ajouter?projet=${projetId}${blocId ? `&bloc=${blocId}` : ''}${trancheId ? `&tranche=${trancheId}` : ''}`
    : "";

  // Error and empty states
  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!loading && formattedImmeubles.length === 0) {
    return (
      <div className="p-4">
        <p>Aucun immeuble trouvé pour ce projet</p>
        {addButtonUrl && (
          <Link href={addButtonUrl} className="text-blue-500 hover:underline">
            Ajouter un immeuble
          </Link>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Immeubles</h3>
      <Table
        columns={columns}
        showSearch={false}
        data={formattedImmeubles}
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
              {selectedProjet?.nbre_tranches !== 0 && !trancheId && !blocId && (
                <InputSelect
                  label="Tranche"
                  options={tranches.map(t => ({ label: t.nom, value: t.nom }))}
                  value={tempFilters.tranche}
                  onChange={(value) => handleFilterChange("tranche", value?.value || '')}
                />
              )}
              {selectedProjet?.nbre_blocs !== 0 && !blocId && (
                <InputSelect
                  label="Bloc"
                  options={blocs.map(b => ({ label: b.nom, value: b.nom }))}
                  value={tempFilters.bloc}
                  onChange={(value) => handleFilterChange("bloc", value?.value || '')}
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
        onPageChange={setCurrentPage}
        onRowsPerPageChange={setRowsPerPage}
        data_to_export={data_to_export()}
        columns_export={columns_export}
        name_file_export="immeuble_export"
        addLink={addButtonUrl}
        onFilterToggle={handleFilterToggle}
        onSearchChange={setSearchTerm}
        enableExport={formattedImmeubles.length > 0}
      />
      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.IMMEUBLES}
            Id={selectedId}
            type="Immeuble"
            message="Êtes-vous sûr de vouloir supprimer cet immeuble ?"
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
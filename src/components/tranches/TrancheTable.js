'use client';
import { useState, useEffect } from 'react';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, PencilLine, Trash2 } from 'lucide-react';
import Input from '../Input';
import axios from 'axios';
import Modal from '../Modal';
import DeleteData from '../DeleteData';
import { formatDate } from '@/utils/dateUtils';

export default function TrancheTable({ projetId }) {
  const [tranches, setTranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();
  const { user } = useAuth();
  const [filters, setFilters] = useState({ nom: '', niveau_etages: '' });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  const accessToken = localStorage.getItem('accessToken');
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canManageTranches = user?.role === 1 || user?.role === 2;

  const columns = [
    { key: 'nom', label: 'Tranche' },
    { key: 'date_lancement', label: 'Date lancement' },
    { key: 'niveau_etages', label: "Niveau d'étages" },
    { key: 'date_livraison', label: 'Date Livraison' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-4 items-center">
          <button
            className="text-blue-500 hover:text-blue-700"
            onClick={() => handleAction('view', row.id)}
            title="Voir Tranche"
          >
            <Eye className="w-4 h-4" />
          </button>

          {canManageTranches && (
            <>
              <button
                className="text-yellow-500 hover:text-yellow-700"
                onClick={() => handleAction('edit', row.id)}
                title="Modifier Tranche"
              >
                <PencilLine className="w-4 h-4" />
              </button>
              <button
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setSelectedId(row.id);
                  setShowDeleteModal(true);
                }}
                title="Supprimer Tranche"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        ...(projetId && { projet_id: projetId }),
        search: searchTerm,
        page: currentPage,
        size: rowsPerPage, // Changed from 'per_page' to 'size' to match your backend
      };

      const response = await axios.get(`${APIURL.TRANCHES}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });

      if (response.data?.data) {
        setTranches(response.data.data);
        // Use either the pagination total or direct total from response
        setTotalRows(
          response.data.pagination?.totalItems || response.data.total || 0
        );
      } else {
        throw new Error('Format de données API invalide');
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Erreur lors du chargement des données'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projetId) {
      loadData();
    } else {
      setError('Project ID is required');
    }
  }, [searchTerm, filters, currentPage, rowsPerPage, projetId]);

  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setCurrentPage(1); // Reset to first page when applying filters
  };

  const resetFilters = () => {
    const reset = { nom: '', niveau_etages: '' };
    setFilters(reset);
    setTempFilters(reset);
    setCurrentPage(1); // Reset to first page when resetting filters
  };

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters();
  };

  const formattedTranches = tranches.map((tranche) => ({
    id: tranche.id,
    nom: tranche.nom || 'Sans nom',
    date_lancement: tranche.date_lancement
      ? new Date(tranche.date_lancement).toLocaleDateString('fr-FR')
      : '',
    niveau_etages: tranche.niveau_etages || '',
    date_lancement: tranche.date_livraison
      ? new Date(tranche.date_livraison).toLocaleDateString('fr-FR')
      : '',
  }));

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newSize) => {
    setRowsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const data_to_export = formattedTranches.map((tranche) => ({
    Tranche: tranche.nom,
    'Date lancement': tranche.date_lancement,
    "Niveau d'étages": tranche.niveau_etages,
    'Date livraison': tranche.date_livraison,
  }));

  const columns_export = [
    { key: 'Tranche', label: 'Tranche' },
    { key: 'Date lancement', label: 'Date de lancement' },
    { key: "Niveau d'étages", label: "Niveau d'étages" },
    { key: 'Date livraison', label: 'Date de livraison' },
  ];

  const handleAction = (action, id) => {
    switch (action) {
      case 'view':
        router.push(`/Tranches/${id}`);
        break;
      case 'edit':
        router.push(`/Tranches/${id}/modifier`);
        break;
      default:
        console.log(`Action ${action} for tranche ${id}`);
    }
  };

  const addButtonUrl = canManageTranches
    ? `/Tranches/ajouter?projet=${projetId}`
    : '';

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Tranches</h3>
      <Table
        columns={columns}
        showSearch={false}
        data={formattedTranches}
        totalRows={totalRows}
        loading={loading}
        filterComponent={
          <div className="space-y-4 p-4 rounded-lg">
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              }}
            >
              <Input
                label="Nom"
                type="text"
                name="nom"
                value={tempFilters.nom}
                onChange={(e) => handleFilterChange('nom', e.target.value)}
                placeholder="Nom..."
                className="h-9 px-3 py-2 border border-gray-300 rounded-md w-full text-sm"
              />
              <Input
                label={"Niveau d'étage"}
                type="text"
                name="niveau_etages"
                value={tempFilters.niveau_etages}
                onChange={(e) =>
                  handleFilterChange('niveau_etages', e.target.value)
                }
                placeholder="Niveau d'étage..."
                className="h-9 px-3 py-2 border border-gray-300 rounded-md w-full text-sm"
              />
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
        error={error}
        addLink={addButtonUrl}
        onSearchChange={handleSearchChange}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        enableExport={formattedTranches.length > 0}
        data_to_export={data_to_export}
        columns_export={columns_export}
        name_file_export={'tranche_export'}
        onFilterToggle={handleFilterToggle}
      />
      {showDeleteModal && selectedId && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.TRANCHES}
            Id={selectedId}
            type="Tranche"
            message="Êtes-vous sûr de vouloir supprimer cette tranche ?"
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

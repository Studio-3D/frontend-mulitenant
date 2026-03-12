'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { APIURL } from '@/configs/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { Eye, PencilLine, Trash2 } from 'lucide-react';
import Table from '@/components/Table';
import Link from 'next/link';
import { isAdmin, isSuperAdmin,isCommercial, isRespoLivraison } from '@/configs/enum';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import Input from '@/components/Input';
import SelectInput from '@/components/SelectInput';
import { useSociete } from '@/context/SocieteContext';

const Page = ({ user_id }) => {
  // State Management
  const { selectedSociete } = useSociete();
  const { token, user } = useAuth();
  const { removeProjet } = useProjet();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

    const userRole = user?.role;
  
    useEffect(() => {
      if (
        user && 
        !isAdmin(userRole) &&
        !isSuperAdmin(userRole) &&
        !isCommercial(userRole)&&
        !isRespoLivraison(userRole)
      ) {
        router.push('/');
      }
    }, [user, userRole, router]);
  // State for filters - use 'type' to match backend expectation
  const [filters, setFilters] = useState({
    nom: '',
    code: '',
    type: '', // Changed back to 'type' to match backend
    adresse: '',
    date: '',
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  const accesstoken = token || localStorage.getItem('accessToken');

  // Extract unique types from projects with IDs
  const typeOptions = useMemo(() => {
    if (!projects || projects.length === 0) return [];

    const uniqueTypes = new Map();
    projects.forEach((project) => {
      if (project.type_projet?.id && project.type_projet?.type) {
        // Use ID as value, name as label
        uniqueTypes.set(project.type_projet.id, project.type_projet.type);
      }
    });

    return Array.from(uniqueTypes, ([id, type]) => ({
      label: type,
      value: id.toString(), // Convert to string for SelectInput
    }));
  }, [projects]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? '' : date.toLocaleDateString('fr-FR');
    } catch {
      return '';
    }
  };

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    setFilters(tempFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const reset = {
      nom: '',
      code: '',
      type: '', // Changed back to 'type'
      adresse: '',
      date: '',
    };
    setCurrentPage(1);
    setFilters(reset);
    setTempFilters(reset);
  };

  // Fetch projects data with pagination and filtering
  const fetchProjects = useCallback(async () => {
    const accessToken = accesstoken;

    if (!accessToken) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      // Create a clean params object with only defined values
      const params = {
        page: currentPage,
        size: rowsPerPage,
      };

      // Add filters only if they have values
      if (filters.nom) params.nom = filters.nom;
      if (filters.code) params.code = filters.code;
      if (filters.type) params.type = filters.type; // Use 'type' to match backend
      if (filters.adresse) params.adresse = filters.adresse;

      // Format date for API if needed
      if (filters.date) {
        const dateObj = new Date(filters.date);
        params.date = dateObj.toISOString().split('T')[0];
      }

      if (!isSuperAdmin(user?.role) && user?.societe_id) {
        params.societe_id = user.societe_id;
      }

      /*if (user?.id && !isSuperAdmin(user?.role) && !isAdmin(user?.role)) {
        params.user_id = user.id;
      }*/
      if (user_id) {
        params.user_id = user_id;
      }
      const response = await axios.get(`${APIURL.PROJETS}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params,
      });

      if (response.data?.projets) {
        setProjects(response.data.projets);
        setTotalRows(
          response.data.total || response.data.pagination?.totalItems || 0
        );
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [accesstoken, router, currentPage, rowsPerPage, filters, user]);

  // Fetch data when dependencies change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects,selectedSociete]);

  // Format projects for display
  const formattedProjects = useMemo(() => {
    return projects.map((projet) => ({
      ...projet,
      nom: projet.nom || 'Sans nom',
      code: projet.code || '',
      type: projet.type_projet?.type || 'Non spécifié',
      adresse: projet.adresse || '',
      date: formatDate(projet.created_at),
      formatted_type: projet.type_projet?.type || 'Non spécifié',
      formatted_date: formatDate(projet.created_at),
    }));
  }, [projects]);

  // Data for export
  const dataToExport = useMemo(() => {
    return formattedProjects.map((projet) => ({
      'Nom du projet': projet.nom,
      Code: projet.code,
      Type: projet.type,
      Adresse: projet.adresse,
      'Date création': projet.date,
    }));
  }, [formattedProjects]);

  // Filter component for projets
  const filterComponent = (
    <div className="space-y-4">
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
      >
        <Input
          label="Nom"
          type="text"
          placeholder="Nom du projet..."
          value={tempFilters.nom}
          onChange={(e) => handleFilterChange('nom', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        <Input
          label="Code"
          type="text"
          placeholder="Code du projet..."
          value={tempFilters.code}
          onChange={(e) => handleFilterChange('code', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        <SelectInput
          label="Type"
          value={tempFilters.type} // Use 'type' to match backend
          onChange={(value) => handleFilterChange('type', value)} // Use 'type' to match backend
          options={typeOptions}
          placeholder="Type de projet"
          className="h-10 text-sm w-full"
        />

        <Input
          label="Adresse"
          type="text"
          placeholder="Adresse..."
          value={tempFilters.adresse}
          onChange={(e) => handleFilterChange('adresse', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />

        <Input
          label="Date création"
          type="date"
          placeholder="Sélectionner une date"
          value={tempFilters.date}
          onChange={(e) => handleFilterChange('date', e.target.value)}
          className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={applyFilters}
          className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Appliquer les filtres
        </button>
        <button
          type="button"
          onClick={resetFilters}
          className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
  };

  // Handle delete action
  const handleDelete = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    if (selectedId) {
      removeProjet(selectedId);
    }
    fetchProjects();
  };

  // Table Columns
  const columns = [
    { key: 'nom', label: 'Nom du projet' },
    { key: 'code', label: 'Code' },
    {
      key: 'type',
      label: 'Type',
      render: (row) => row.type_projet?.type || '',
    },
    { key: 'adresse', label: 'Adresse' },
    {
      key: 'created_at',
      label: 'Date création',
      render: (row) => formatDate(row.created_at),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-4 items-center text-sm">
          <Link
            href={`/projets/${row.id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
            title="Voir le projet"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {(isSuperAdmin(user?.role) || isAdmin(user?.role)) && (
            <>
              <Link
                href={`/projets/editProject/${row.id}`}
                className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700"
                title="Modifier le projet"
              >
                <PencilLine className="w-4 h-4" />
              </Link>
              <button
                onClick={() => handleDelete(row.id)}
                className="flex items-center gap-1 text-red-500 hover:text-red-700"
                title="Supprimer le projet"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      {/*cacher button ajouter si on est dans show user module projet*/}
      <Table
        title={'Liste des Projets'}
        showSearch={false}
        data={formattedProjects}
        columns={columns}
        loading={loading}
        totalRows={totalRows}
        error={error}
        addLink={
          user_id == null &&
          (isSuperAdmin(user?.role) || isAdmin(user?.role)
            ? '/projets/addProject'
            : undefined)
        }
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="Aucun projet trouvé"
        filterComponent={filterComponent}
        enableExport={formattedProjects.length > 0}
        data_to_export={dataToExport}
        columns_export={[
          { key: 'Nom du projet', label: 'Nom du projet' },
          { key: 'Code', label: 'Code' },
          { key: 'Type', label: 'Type' },
          { key: 'Adresse', label: 'Adresse' },
          { key: 'Date création', label: 'Date création' },
        ]}
        name_file_export="liste_des_projets"
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.PROJETS}
            Id={selectedId}
            type="Projet"
            message="Êtes-vous sûr de vouloir supprimer ce projet ?"
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              handleDeleteSuccess();
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default Page;

'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { APIURL } from '@/configs/api'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Eye, PencilLine, Trash2 } from "lucide-react"
import Table from "@/components/Table"
import Link from 'next/link'
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import ProjetFilter from './ProjetFilter';

const INITIAL_FILTERS = { 
  nom: '', 
  code: '', 
  type: '', 
  adresse: '', 
  date: '' 
};

const Page = () => {
  // State Management
  const { token, user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [tempFilters, setTempFilters] = useState(INITIAL_FILTERS);

  const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('fr-FR');
  } catch {
    return 'N/A';
  }
};

const filteredProjets = useMemo(() => {
  if (!projects) return [];
  return projects.filter(projet => {
    const projetType = projet.type_projet?.type || '';
    const projetDate = formatDate(projet.created_at);
    
    return (
      (projet.nom || '').toLowerCase().includes(filters.nom.toLowerCase()) &&
      (projet.code || '').toLowerCase().includes(filters.code.toLowerCase()) &&
      (filters.type === '' || projetType.toLowerCase().includes(filters.type.toLowerCase())) &&
      (projet.adresse || '').toLowerCase().includes(filters.adresse.toLowerCase()) &&
      (filters.date === '' || projetDate.includes(filters.date))
    );
  }).map(projet => ({
    ...projet,
    nom: projet.nom || 'Sans nom',
    code: projet.code || '',
    type: projet.type_projet?.type || 'Non spécifié',
    adresse: projet.adresse || '',
    date: formatDate(projet.created_at),
    formatted_type: projet.type_projet?.type || 'Non spécifié',
    formatted_date: formatDate(projet.created_at)
  }));
}, [projects, filters]);

  const dataToExport = useMemo(() => {
  return filteredProjets.map((projet) => ({
    'Nom du projet': projet.nom,
    'Code': projet.code,
    'Type': projet.type,
    'Adresse': projet.adresse,
    'Date création': projet.date,
  }));
}, [filteredProjets]);

  const handleFilterChange = useCallback((field, value) => {
    setTempFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setFilters(tempFilters);
    setCurrentPage(1);
  }, [tempFilters]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setTempFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  }, []);

  // Fetch projects data with pagination
const fetchProjects = useCallback(async () => {
  const accessToken = token || localStorage.getItem("accessToken")
  
  // Redirect if no token
  if (!accessToken) {
    router.push('/login') 
    return
  }

  setLoading(true)
  try {
    const params = {
      page: currentPage,
      size: rowsPerPage,
    };

    // For non-super admins, filter by user's société
    if (!isSuperAdmin(user?.role) && user?.societe_id) {
      params.societe_id = user.societe_id;
    }

    // If you still want user-specific projects for non-admin roles
    if (user?.id && !isSuperAdmin(user?.role) && !isAdmin(user?.role)) {
      params.user_id = user.id;
    }

    const response = await axios.get(`${APIURL.PROJETS}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params
    })
    
    console.log("API Response:", response.data);
    if (response.data?.projets) {
      setProjects(response.data.projets)
      setTotalRows(response.data.total || response.data.pagination?.totalItems || 0)
    } else {
      throw new Error("Invalid API response format")
    }
  } catch (error) {
    console.error("Error fetching data:", error)
    setError(error.response?.data?.message || "Failed to load projects")
  } finally {
    setLoading(false)
  }
}, [token, router, currentPage, rowsPerPage, user])

  // Fetch data when dependencies change
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Handle delete action
  const handleDelete = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };


  // Table Columns
  const columns = [
    { key: 'nom', label: 'Nom du projet' },
    { key: 'code', label: 'Code' },
    { 
      key: 'type', 
      label: 'Type',
      render: (row) => row.type_projet?.type || 'N/A'
    },
    { key: 'adresse', label: 'Adresse' },
    { 
      key: 'created_at', 
      label: 'Date création',
      render: (row) => formatDate(row.created_at)
    },
    { 
      key: "actions", 
      label: "Actions",
      render: (row) => (
        <div className="flex gap-4 items-center text-sm">
          <Link
            href={`/Projets/${row.id}`}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
            title="Voir le projet"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {(isSuperAdmin(user?.role) || isAdmin(user?.role)) && (
            <>
              <Link
                href={`/Projets/editProject/${row.id}`}
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
      )
    }
  ]

  return (
    <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
      <Table
        title="Liste des Projets"
        showSearch={false}
        data={filteredProjets} 
        columns={columns}
        loading={loading}
        totalRows={totalRows}
        error={error}
        addLink={(isSuperAdmin(user?.role) || isAdmin(user?.role)) ? "/Projets/addProject" : undefined}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="Aucun projet trouvé"
        filterComponent={
          <ProjetFilter
            tempFilters={tempFilters}
            handleFilterChange={handleFilterChange}
            resetFilters={resetFilters}
            applyFilters={applyFilters}
            loading={loading}
          />
        }
        enableExport={filteredProjets.length > 0}
        dataToExport={dataToExport}
        exportFileName="liste_des_projets"
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal isVisible={true} onClose={() => setShowDeleteModal(false)}>
          <DeleteData
            route={APIURL.PROJETS}
            Id={selectedId}
            type="Projet"
            message="Êtes-vous sûr de vouloir supprimer ce projet ?"
            accessToken={token || localStorage.getItem("accessToken")}
            onClose={() => {
              setShowDeleteModal(false);
              fetchProjects(); // Refresh the list after deletion
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default Page
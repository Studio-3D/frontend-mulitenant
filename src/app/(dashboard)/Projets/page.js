'use client'
import React, { useEffect, useState, useCallback } from 'react'
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
        ...(user?.id && !isSuperAdmin(user?.role) && { user_id: user.id })
      };

      const response = await axios.get(`${APIURL.PROJETS}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params
      })
      
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
      key: 'date_autorisation_construction', 
      label: 'Date création',
      render: (row) => new Date(row.created_at).toLocaleDateString()
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
                href={`${row.id}?edit=true`}
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
        data={projects} 
        columns={columns}
        loading={loading}
        totalRows={totalRows}
        error={error}
        addLink={(isSuperAdmin(user?.role) || isAdmin(user?.role)) ? "/Projets/ajouter" : undefined}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        emptyMessage="Aucun projet trouvé"
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
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { useAuth } from '@/context/AuthContext';
import { useSociete } from '@/context/SocieteContext';
import { useProjet } from '@/context/ProjetContext';
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import ObjectifTable from './ObjectifTable';
import ObjectifFilter from './ObjectifFilter';
import ObjectifForm from './ObjectifForm';

export default function ObjectifsPage() {
  const [action, setAction] = useState(null);
  const [objectifId, setObjectifId] = useState(null);
  const [objectifs, setObjectifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({});
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedSociete } = useSociete();
  const { selectedProjet } = useProjet();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  
  // This effect handles URL parameter changes
  useEffect(() => {
    // Parse query parameters
    const actionParam = searchParams.get('action');
    const idParam = searchParams.get('id');
    
    // Reset component state based on URL parameters
    setAction(actionParam || null);
    setObjectifId(idParam || null);
    
    // Load data if we're on the main page
    if (!actionParam) {
      fetchObjectifs();
    }
  }, [searchParams, selectedProjet]); // Important to include searchParams as a dependency

  const fetchObjectifs = async (filters = {}) => {
    if (!selectedProjet) {
      setObjectifs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.ROOT}/v1/projets/${selectedProjet.id}/objectifs/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          projet_id: selectedProjet.id,
          ...filters
        }
      });
      
      // Handle different response structures
      let objectifsData = [];
      
      if (Array.isArray(response.data)) {
        objectifsData = response.data;
      } else if (response.data && Array.isArray(response.data.obj)) {
        objectifsData = response.data.obj;
      } else if (response.data && response.data.objectifId && Array.isArray(response.data.obj)) {
        objectifsData = response.data.obj;
      } else {
        console.error("Unexpected API response format:", response.data);
        objectifsData = [];
      }
      
      setObjectifs(objectifsData);
    } catch (err) {
      console.error("Error fetching objectifs:", err);
      toast.error("Erreur lors du chargement des objectifs");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchObjectifs(values);
  };
  
  const handleAction = (actionType, row) => {
    if (actionType === 'view') {
      router.push(`/administration/objectifs/${row}`);
    } else if (actionType === 'edit') {
      router.push(`/administration/objectifs?action=edit&id=${row}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };
 
  // Check if user has permission to add/manage objectives
  // Adapting from old frontend roles: SuperAdmin(1), Admin(2), Commercial(3)
  const canAddObjectifs = user && [1, 2, 3].includes(user.role);

  // If not logged in or no project selected, show appropriate message
  if (!user) {
    return <div className="container mx-auto px-4 py-8">Veuillez vous connecter pour accéder à cette page.</div>;
  }
  
  

  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
        <ObjectifForm id={action === 'edit' ? objectifId : null} />
    );
  }

  // Main view with table
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <ObjectifTable
        data={objectifs}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push('/administration/objectifs?action=add')}
        onRefresh={() => fetchObjectifs(filterParams)}
        canAddObjectifs={canAddObjectifs}
        onFilterSubmit={handleFilterSubmit} 

      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="OBJECTIFS"
        itemLabel={'Objectif'}
        entityId={rowToDelete?.id}
        data={objectifs}
        onDeleted={() => fetchObjectifs(filterParams)} // <- ici
        />
    </div>
  );
}

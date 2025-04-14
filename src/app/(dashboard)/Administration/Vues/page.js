"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { TbArrowBackUp } from "react-icons/tb";
import Link from 'next/link';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import VueTable from './VueTable';
import VueFilter from './VueFilter';
import VueForm from './VueForm';

export default function VuesPage() {
  const [action, setAction] = useState(null);
  const [vueId, setVueId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [vues, setVues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({});
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
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
    setVueId(idParam || null);
    
    // Load data if we're on the main page
    if (!actionParam) {
      fetchVues();
    }
  }, [searchParams, selectedProjet]); // Important to include searchParams as a dependency

  const fetchVues = async (filters = {}) => {
    if (!selectedProjet) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(APIURL.VUES, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          projet_id: selectedProjet.id,
          ...filters
        }
      });
      
      setVues(response.data.vues || []);
    } catch (error) {
      console.error('Error fetching vues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchVues(values);
    setShowFilter(false);
  };

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/Administration/Vues?action=edit&id=${row}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

  
  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/Administration/Vues');
  };

  // If not logged in or no project selected, show appropriate message
  if (!user) {
    return <div>Veuillez vous connecter pour accéder à cette page.</div>;
  }
  
  if (!selectedProjet && !action) {
    return <div>Veuillez sélectionner un projet pour accéder aux vues.</div>;
  }

  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/Administration/Vues" className="inline-flex items-center gap-2 text-[#009FFF] hover:text-blue-800">
            <TbArrowBackUp className="text-xl" />
            <span>Retour à la liste</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">
          {action === 'add' ? 'Ajouter une nouvelle vue' : 'Modifier la vue'}
        </h1>
        <VueForm 
          id={action === 'edit' ? vueId : null} 
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  // Main view with table
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Vues</h1>
      
      {showFilter && (
        <VueFilter
          onSubmit={handleFilterSubmit} 
          onClose={() => setShowFilter(false)}
          initialValues={filterParams}
        />
      )}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="VUES"
        itemLabel={rowToDelete?.vue}
        entityId={rowToDelete?.id}
        data={vues}
        onDeleted={() => fetchVues(filterParams)} // <- ici
      />
      <VueTable
        data={vues}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push('/Administration/Vues?action=add')}
        onFilterClick={() => setShowFilter(true)}
        onRefresh={() => fetchVues(filterParams)}
      />
    </div>
  );
}

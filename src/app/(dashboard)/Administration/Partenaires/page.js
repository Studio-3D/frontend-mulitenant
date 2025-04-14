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
import PartenaireTable from './PartenaireTable';
import PartenaireFilter from './PartenaireFilter';
import PartenaireForm from './PartenaireForm';

export default function PartenairesPage() {
  const [action, setAction] = useState(null);
  const [partenaireId, setPartenaireId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [partenaires, setPartenaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
    
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedProjet } = useProjet();

  // This effect handles URL parameter changes
  useEffect(() => {
    // Parse query parameters
    const actionParam = searchParams.get('action');
    const idParam = searchParams.get('id');
    
    // Reset component state based on URL parameters
    setAction(actionParam || null);
    setPartenaireId(idParam || null);
    
    // Load data if we're on the main page
    if (!actionParam) {
      fetchPartenaires();
    }
  }, [searchParams, selectedProjet]); // Important to include searchParams as a dependency

  const fetchPartenaires = async (filters = {}) => {
    if (!selectedProjet) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(APIURL.PARTENAIRES, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          projet_id: selectedProjet.id,
          ...filters
        }
      });
      
      // Handle different response structures
      let partenaireData = [];
      
      if (Array.isArray(response.data)) {
        partenaireData = response.data;
      } else if (response.data && Array.isArray(response.data.partenaires)) {
        partenaireData = response.data.partenaires;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        partenaireData = response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        partenaireData = [];
      }
      
      setPartenaires(partenaireData);
    } catch (error) {
      console.error('Error fetching partenaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchPartenaires(values);
    setShowFilter(false);
  };

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/Administration/Partenaires?action=edit&id=${row}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

  

  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/Administration/Partenaires');
  };

  // If not logged in or no project selected, show appropriate message
  if (!user) {
    return <div>Veuillez vous connecter pour accéder à cette page.</div>;
  }
  
  if (!selectedProjet && !action) {
    return <div>Veuillez sélectionner un projet pour accéder aux partenaires.</div>;
  }

  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/Administration/Partenaires" className="inline-flex items-center gap-2 text-[#009FFF] hover:text-blue-800">
            <TbArrowBackUp className="text-xl" />
            <span>Retour à la liste</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">
          {action === 'add' ? 'Ajouter un nouveau partenaire' : 'Modifier le partenaire'}
        </h1>
        <PartenaireForm 
          id={action === 'edit' ? partenaireId : null} 
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  // Main view with table
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Partenaires</h1>
      
      {showFilter && (
        <PartenaireFilter 
          onSubmit={handleFilterSubmit} 
          onClose={() => setShowFilter(false)}
          initialValues={filterParams}
        />
      )}
      
      <PartenaireTable 
        data={partenaires}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push('/Administration/Partenaires?action=add')}
        onFilterClick={() => setShowFilter(true)}
        onRefresh={() => fetchPartenaires(filterParams)}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="PARTENAIRES"
        itemLabel={rowToDelete?.description}
        entityId={rowToDelete?.id}
        data={partenaires}
        onDeleted={() => fetchPartenaires(filterParams)} // <- ici
      />
    </div>
  );
}

"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useSociete } from '@/context/SocieteContext';
import { useProjet } from '@/context/ProjetContext';
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';
import { APIURL } from '@/configs/api';
import SocieteSelector from '@/components/SocieteSelector';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import TypeBienTable from './TypeBienTable';
import TypeBienFilter from './TypeBienFilter';
import TypeBienForm from './TypeBienForm';

export default function TypeBiensPage() {
  const [action, setAction] = useState(null);
  const [typeBienId, setTypeBienId] = useState(null);
  const [typeBiens, setTypeBiens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterParams, setFilterParams] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedSociete, loading: societeLoading } = useSociete();
  const { selectedProjet, loading: projetLoading } = useProjet();

  // This effect handles URL parameter changes
  useEffect(() => {
    // Parse query parameters
    const actionParam = searchParams.get('action');
    const idParam = searchParams.get('id');
    
    // Reset component state based on URL parameters
    setAction(actionParam || null);
    setTypeBienId(idParam || null);
    
    // Load data if we're on the main page
    if (!actionParam && selectedProjet) {
      fetchTypeBiens();
    }
  }, [searchParams, selectedProjet]); 

  const fetchTypeBiens = async (filters = {}) => {
    if (!selectedProjet) {
      setTypeBiens([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(APIURL.TYPEBIENS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          projet_id: selectedProjet.id,
          ...filters 
        }
      });
      
      const types = response.data.typeBiens || response.data || [];
      setTypeBiens(types);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Erreur lors du chargement des types de biens: ${err.message}`);
      toast.error("Erreur lors du chargement des types de biens");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchTypeBiens(values);
  };

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/administration/types-biens?action=edit&id=${row}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

 
  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/administration/types-biens');
  };

  
 

  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
      
        <TypeBienForm 
          id={action === 'edit' ? typeBienId : null} 
          onComplete={handleFormComplete}
        />
    );
  }

  // Main view with table
  return (
    <div className="">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 !text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      <TypeBienTable
        data={typeBiens}
        loading={loading || societeLoading || projetLoading}
        onAction={handleAction}
        onAddClick={() => router.push('/administration/types-biens?action=add')}
        onFilterSubmit={handleFilterSubmit} 
        onRefresh={() => fetchTypeBiens(filterParams)}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="TYPEBIENS"
        itemLabel={'Type bien'}
        entityId={rowToDelete?.id}
        data={typeBiens}
        onDeleted={() => fetchTypeBiens(filterParams)}
      />
    </div>
  );
}

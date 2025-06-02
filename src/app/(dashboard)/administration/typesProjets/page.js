"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useSociete } from '@/context/SocieteContext';
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import toast from 'react-hot-toast';
import { APIURL } from '@/configs/api';
import SocieteSelector from '@/components/SocieteSelector';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import TypeProjetTable from './TypeProjetTable';
import TypeProjetFilter from './TypeProjetFilter';
import TypeProjetForm from './TypeProjetForm';

export default function TypeProjetsPage() {
  const [action, setAction] = useState(null);
  const [typeProjetId, setTypeProjetId] = useState(null);
  const [typeProjets, setTypeProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterParams, setFilterParams] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedSociete, loading: societeLoading, selectSociete } = useSociete();

  // This effect handles URL parameter changes
  useEffect(() => {
    const actionParam = searchParams.get('action');
    const idParam = searchParams.get('id');
  
    setAction(actionParam || null);
    setTypeProjetId(idParam || null);
  
    if (!actionParam && user) {
      if (user.role === 1 && selectedSociete) {
        fetchTypeProjets();
      } else if (user.role !== 1) {
        fetchTypeProjets();
      }
    }
  }, [searchParams, selectedSociete, user]);
  

  const fetchTypeProjets = async (filters = {}) => {
    if (!selectedSociete && user.role==1) return;
    
    setLoading(true);
    setError(null);
    
    try {
      //await selectSociete(selectedSociete);
      
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(APIURL.TYPEPROJETS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ...filters }
      });
      
      const types = response.data.typeProjets || response.data || [];
      setTypeProjets(types);
    } catch (err) {
      console.error("API Error:", err);
      setError(`Erreur lors du chargement des types de projets: ${err.message}`);
      toast.error("Erreur lors du chargement des types de projets");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchTypeProjets(values);
  };

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/administration/typesProjets?action=edit&id=${row}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

  

  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/administration/typesProjets');
  };

  // For superadmins without a selected société
  
  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
      
        <TypeProjetForm 
          id={action === 'edit' ? typeProjetId : null} 
          onComplete={handleFormComplete}
        />
    );
  }

  // Main view with table
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="TYPEPROJETS"
        itemLabel={rowToDelete?.type}
        entityId={rowToDelete?.id}
        data={typeProjets}
        onDeleted={() => fetchTypeProjets(filterParams)} // <- ici
      />
      <TypeProjetTable
        data={typeProjets}
        loading={loading || societeLoading}
        onAction={handleAction}
        onAddClick={() => router.push('/administration/typesProjets?action=add')}
        onFilterSubmit={handleFilterSubmit} 
        onRefresh={() => fetchTypeProjets(filterParams)}
      />
    </div>
  );
}
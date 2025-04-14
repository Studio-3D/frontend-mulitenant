"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useSociete } from '@/context/SocieteContext';
import { useProjet } from '@/context/ProjetContext';
import { TbArrowBackUp } from "react-icons/tb";
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
  const [showFilter, setShowFilter] = useState(false);
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
    setShowFilter(false);
  };

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/Administration/Types-Biens?action=edit&id=${row}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

 
  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/Administration/Types-Biens');
  };

  // For superadmins without a selected société
  if (user?.role === 1 && !selectedSociete && !societeLoading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Types de Biens</h1>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p>Veuillez sélectionner une société pour accéder aux types de biens.</p>
        </div>
        <SocieteSelector returnPath="/Administration/Types-Biens" />
      </div>
    );
  }
  
  // If no project is selected
  if (!selectedProjet && !action) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Types de Biens</h1>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
          <p>Veuillez sélectionner un projet pour accéder aux types de biens.</p>
        </div>
      </div>
    );
  }

  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/Administration/Types-Biens" className="inline-flex items-center gap-2 text-[#009FFF] hover:text-blue-800">
            <TbArrowBackUp className="text-xl" />
            <span>Retour à la liste</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">
          {action === 'add' ? 'Ajouter un nouveau type de bien' : 'Modifier le type de bien'}
        </h1>
        <TypeBienForm 
          id={action === 'edit' ? typeBienId : null} 
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  // Main view with table
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        Gestion des Types de Biens
{/*         {selectedProjet ? ` - Projet: ${selectedProjet.nom}` : ''}
 */}      </h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {showFilter && (
        <TypeBienFilter 
          onSubmit={handleFilterSubmit} 
          onClose={() => setShowFilter(false)}
          initialValues={filterParams}
        />
      )}
      
      <TypeBienTable
        data={typeBiens}
        loading={loading || societeLoading || projetLoading}
        onAction={handleAction}
        onAddClick={() => router.push('/Administration/Types-Biens?action=add')}
        onFilterClick={() => setShowFilter(true)}
        onRefresh={() => fetchTypeBiens(filterParams)}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="TYPEBIENS"
        itemLabel={rowToDelete?.type}
        entityId={rowToDelete?.id}
        data={typeBiens}
        onDeleted={() => fetchTypeBiens(filterParams)}
      />
    </div>
  );
}

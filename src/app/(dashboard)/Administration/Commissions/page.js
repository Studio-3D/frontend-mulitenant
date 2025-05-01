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
import CommissionTable from './CommissionTable';
import CommissionForm from './CommissionForm';

export default function CommissionsPage() {
  const [action, setAction] = useState(null);
  const [commissionId, setCommissionId] = useState(null);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const token = localStorage.getItem('accessToken');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedProjet } = useProjet();

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchCommissions(values);
  };
  // This effect handles URL parameter changes
  useEffect(() => {
    // Parse query parameters
    const actionParam = searchParams.get('action');
    const idParam = searchParams.get('id');
    
    // Reset component state based on URL parameters
    setAction(actionParam || null);
    setCommissionId(idParam || null);
    
    // Load data if we're on the main page
    if (!actionParam) {
      fetchCommissions();
    }
  }, [searchParams, selectedProjet]); // Important to include searchParams as a dependency

  const fetchCommissions = async (filters = {}) => {
    if (!selectedProjet) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${APIURL.ROOT}/v1/projets/${selectedProjet.id}/commissions_traites/`, {
        headers: { Authorization: `Bearer ${token}`,
      },
        /* params: { 
          projet_id: selectedProjet.id,
          ...filters
        } */
      });
      
      // Handle different response structures
      let commissionData = [];
      
      if (Array.isArray(response.data)) {
        commissionData = response.data;
      } else if (response.data && Array.isArray(response.data.commissions)) {
        commissionData = response.data.commissions;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        commissionData = response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        commissionData = [];
      }
      
      setCommissions(commissionData);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/administration/commissions?action=edit&id=${row}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

  

  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/administration/commissions');
  };

  // If not logged in or no project selected, show appropriate message
  if (!user) {
    return <div>Veuillez vous connecter pour accéder à cette page.</div>;
  }
  
  
  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/administration/commissions" className="inline-flex items-center gap-2 text-[#009FFF] hover:text-blue-800">
            <TbArrowBackUp className="text-xl" />
            <span>Retour à la liste</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">
          {action === 'add' ? 'Ajouter un nouveau commission' : 'Modifier le commission'}
        </h1>
        <CommissionForm
          id={action === 'edit' ? commissionId : null} 
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  // Main view with table
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Commissions</h1>
      
      
      <CommissionTable
        data={commissions}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push('/administration/commissions?action=add')}
        onFilterSubmit={handleFilterSubmit} 
        onRefresh={() => fetchCommissions(filterParams)}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="COMMISSIONS"
        itemLabel={rowToDelete?.description}
        entityId={rowToDelete?.id}
        data={commissions}
        onDeleted={() => fetchCommissions(filterParams)} // <- ici
      />
    </div>
  );
}

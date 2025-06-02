"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { ArrowLeft } from "lucide-react";
import Link from 'next/link';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import FreinTable from './FreinTable';
import FreinFilter from './FreinFilter';
import FreinForm from './FreinForm';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function FreinsPage() {
  const [action, setAction] = useState(null);
  const [freinId, setFreinId] = useState(null);
  const [freins, setFreins] = useState([]);
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
    setFreinId(idParam || null);
    
    // Load data if we're on the main page
    if (!actionParam) {
      fetchFreins();
    }
  }, [searchParams, selectedProjet]); // Important to include searchParams as a dependency

  const fetchFreins = async (filters = {}) => {
    if (!selectedProjet) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(APIURL.TYPEFREINS, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          projet_id: selectedProjet.id,
          ...filters
        }
      });
      
      // Handle different response structures
      let freinsData = [];
      
      if (Array.isArray(response.data)) {
        freinsData = response.data;
      } else if (response.data && Array.isArray(response.data.typefreins)) {
        freinsData = response.data.typefreins;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        freinsData = response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        freinsData = [];
      }
      
      setFreins(freinsData);
    } catch (error) {
      console.error('Error fetching freins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchFreins(values);
  };

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/administration/freins?action=edit&id=${row.id}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

 
  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/administration/freins');
  };

  // If not logged in or no project selected, show appropriate message
  if (!user) {
    return <div>Veuillez vous connecter pour accéder à cette page.</div>;
  }
  
  

  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
      
        <FreinForm
          id={action === 'edit' ? freinId : null} 
          onComplete={handleFormComplete}
        />
    );
  }

  // Main view with table
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <FreinTable
        data={freins}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push('/administration/freins?action=add')}
        onFilterSubmit={handleFilterSubmit} 
        onRefresh={() => fetchFreins(filterParams)}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="TYPEFREINS"
        itemLabel={rowToDelete?.label}
        entityId={rowToDelete?.id}
        data={freins}
        onDeleted={() => fetchFreins(filterParams)} // <- ici
        />
    </div>
  );
}

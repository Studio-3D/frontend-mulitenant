"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import Link from 'next/link';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import BanqueTable from './BanqueTable';
import BanqueFilter from './BanqueFilter';
import BanqueForm from './BanqueForm';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useSociete } from '@/context/SocieteContext';
import SocieteSelector from '@/components/SocieteSelector';

export default function BanquesPage() {
  const [action, setAction] = useState(null);
  const [banqueId, setBanqueId] = useState(null);
  const [banques, setBanques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [banqueToDelete, setBanqueToDelete] = useState(null);
  const token = localStorage.getItem('accessToken');

    
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedSociete, loading: societeLoading } = useSociete();
  const [totalRows, setTotalRows] = useState(0);

  // This effect handles URL parameter changes
  useEffect(() => {
    // Parse query parameters
    const actionParam = searchParams.get('action');
    const idParam = searchParams.get('id');
    
    // Reset component state based on URL parameters
    setAction(actionParam || null);
    setBanqueId(idParam || null);
    
    // Load data if we're on the main page
    if (!actionParam) {
      fetchBanques();
    }
  }, [searchParams, selectedSociete]); // Important to include searchParams as a dependency

  const fetchBanques = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await axios.get(APIURL.BANQUES, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      
      setBanques(response.data.banques || []);
      setTotalRows(response.data.pagination?.totalItems || 0);

    } catch (error) {
      console.error('Error fetching banques:', error);
    } finally {
      setLoading(false);
    }
  };

  

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/administration/banques?action=edit&id=${row.id}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
        setBanqueToDelete(row);
        setDeleteModalOpen(true);
      }
    }


 

  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/administration/banques');
  };

  // If not logged in, show appropriate message
  if (!user) {
    return <div>Veuillez vous connecter pour accéder à cette page.</div>;
  }

  

    const handleFilterSubmit = (values) => {
      setFilterParams(values);
      fetchBanques(values);
    };
    

  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
        
        <BanqueForm
          id={action === 'edit' ? banqueId : null} 
          onComplete={handleFormComplete}
        />
      
    );
  }

  // Main view with table
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <BanqueTable
        data={banques}
        totalRows={totalRows}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push('/administration/banques?action=add')}
        onFilterSubmit={handleFilterSubmit} 
        onRefresh={() => fetchBanques(filterParams)}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="BANQUES"
        itemLabel={'Banque'}
        entityId={banqueToDelete?.id}
        data={banques}
        onDeleted={() => fetchBanques(filterParams)} // <- ici
        />

    </div>
  );
}

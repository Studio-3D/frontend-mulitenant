"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { TbArrowBackUp } from "react-icons/tb";
import Link from 'next/link';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import BanqueTable from './BanqueTable';
import BanqueFilter from './BanqueFilter';
import BanqueForm from './BanqueForm';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function BanquesPage() {
  const [action, setAction] = useState(null);
  const [banqueId, setBanqueId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [banques, setBanques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [banqueToDelete, setBanqueToDelete] = useState(null);
  const token = localStorage.getItem('accessToken');

    
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { selectedProjet } = useProjet();
  const [totalRows, setTotalRows] = useState(0);

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
  }, [searchParams, selectedProjet]); // Important to include searchParams as a dependency

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

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchBanques(values);
    setShowFilter(false);
  };

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/Administration/Banques?action=edit&id=${row.id}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
        setBanqueToDelete(row);
        setDeleteModalOpen(true);
      }
    }


 

  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/Administration/Banques');
  };

  // If not logged in, show appropriate message
  if (!user) {
    return <div>Veuillez vous connecter pour accéder à cette page.</div>;
  }

  // Show form for add/edit actions
  if (action === 'add' || action === 'edit') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/Administration/Banques" className="inline-flex items-center gap-2 text-[#009FFF] hover:text-blue-800">
            <TbArrowBackUp className="text-xl" />
            <span>Retour à la liste</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">
          {action === 'add' ? 'Ajouter une nouvelle banque' : 'Modifier la banque'}
        </h1>
        <BanqueForm
          id={action === 'edit' ? banqueId : null} 
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  // Main view with table
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Banques</h1>
      
      {showFilter && (
        <BanqueFilter
          onSubmit={handleFilterSubmit} 
          onClose={() => setShowFilter(false)}
          initialValues={filterParams}
        />
      )}
      
      <BanqueTable
        data={banques}
        totalRows={totalRows}
        setData={setBanques}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push('/Administration/Banques?action=add')}
        onFilterClick={() => setShowFilter(true)}
        onRefresh={() => fetchBanques(filterParams)}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="BANQUES"
        itemLabel={banqueToDelete?.nom}
        entityId={banqueToDelete?.id}
        data={banques}
        onDeleted={() => fetchBanques(filterParams)} // <- ici
        />

    </div>
  );
}

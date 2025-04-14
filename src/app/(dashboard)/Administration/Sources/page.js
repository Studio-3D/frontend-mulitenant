"use client"
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TbArrowBackUp } from "react-icons/tb";
import Link from 'next/link';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import SourceTable from './SourceTable';
import SourceFilter from './SourceFilter';
import SourceForm from './SourceForm';

export default function SourcesPage() {
  const [action, setAction] = useState(null);
  const [sourceId, setSourceId] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterParams, setFilterParams] = useState({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // This effect handles URL parameter changes
  useEffect(() => {
    // Parse query parameters
    const actionParam = searchParams.get('action');
    const idParam = searchParams.get('id');
    
    // Reset component state based on URL parameters
    setAction(actionParam || null);
    setSourceId(idParam || null);
    
    // Load data if we're on the main page
    if (!actionParam) {
      fetchSources();
    }
  }, [searchParams]); // Include searchParams as a dependency

  const fetchSources = async (filters = {}) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(APIURL.SOURCES, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      
      // Handle different response structures
      let sourcesData = [];
      
      if (Array.isArray(response.data)) {
        sourcesData = response.data;
      } else if (response.data && Array.isArray(response.data.sources)) {
        sourcesData = response.data.sources;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        sourcesData = response.data.data;
      } else {
        console.error("Unexpected API response format:", response.data);
        sourcesData = [];
      }
      
      setSources(sourcesData);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (values) => {
    setFilterParams(values);
    fetchSources(values);
    setShowFilter(false);
  };

  const handleAction = (actionType, row) => {
    if (actionType === 'edit') {
      router.push(`/Administration/Sources?action=edit&id=${row}`);
    } else if (actionType === 'delete') {
      // Handle delete with confirmation
      setRowToDelete(row);
      setDeleteModalOpen(true);
    }
  };

 
  // Handle form completion
  const handleFormComplete = () => {
    // Use router.replace instead of push to ensure a clean navigation
    router.replace('/Administration/Sources');
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
          <Link href="/Administration/Sources" className="inline-flex items-center gap-2 text-[#009FFF] hover:text-blue-800">
            <TbArrowBackUp className="text-xl" />
            <span>Retour à la liste</span>
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">
          {action === 'add' ? 'Ajouter une nouvelle source' : 'Modifier la source'}
        </h1>
        <SourceForm 
          id={action === 'edit' ? sourceId : null} 
          onComplete={handleFormComplete}
        />
      </div>
    );
  }

  // Main view with table
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gestion des Sources</h1>
      
      {showFilter && (
        <SourceFilter 
          onSubmit={handleFilterSubmit} 
          onClose={() => setShowFilter(false)}
          initialValues={filterParams}
        />
      )}
      
      <SourceTable 
        data={sources}
        loading={loading}
        onAction={handleAction}
        onAddClick={() => router.push('/Administration/Sources?action=add')}
        onFilterClick={() => setShowFilter(true)}
        onRefresh={() => fetchSources(filterParams)}
      />
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        entityName="SOURCES"
        itemLabel={rowToDelete?.source}
        entityId={rowToDelete?.id}
        data={sources}
        onDeleted={() => fetchSources(filterParams)} // <- ici
        />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Table from '@/components/Table';
import CRMNavbar from '@/components/CRMNavbar';
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '@/configs/api';
import { format } from 'date-fns';
import { Plus, Filter } from 'lucide-react';
import { VISITE_INTERETS } from '@/configs/enum';

export default function AppelsPage() {
  const router = useRouter();
  const { selectedProjet } = useProjet();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [appels, setAppels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  
  const [filterValues, setFilterValues] = useState({
    nom: '',
    prenom: '',
    cin: '',
    telephone: '',
    interet: '',
    date: '',
    cc: ''
  });

  // Define table columns
  const columns = [
    { 
      key: 'cin', 
      title: 'CIN',
      render: (row) => row.prospect?.cin || '-'
    },
    { 
      key: 'nom', 
      title: 'Nom',
      render: (row) => row.prospect?.nom || '-'
    },
    { 
      key: 'prenom', 
      title: 'Prénom',
      render: (row) => row.prospect?.prenom || '-'
    },
    { 
      key: 'telephone', 
      title: 'Téléphone',
      render: (row) => {
        if (row.prospect?.telephone_num2) {
          return `${row.prospect?.telephone || ''} / ${row.prospect?.telephone_num2 || ''}`;
        }
        return row.prospect?.telephone || '-';
      }
    },
    { 
      key: 'source', 
      title: 'Source',
      render: (row) => row.prospect?.source?.source || '-'
    },
    { 
      key: 'interet', 
      title: 'Intérêt',
      render: (row) => renderInteret(row.last_traitement_appel?.interet)
    }
  ];

  // Function to render interet with appropriate styling
  const renderInteret = (interet) => {
    const interetInfo = VISITE_INTERETS[interet] || { label: 'Inconnu', color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${interetInfo.color}`}>
        {interetInfo.label}
      </span>
    );
  };

  // Fetch appels data
  const fetchAppels = useCallback(async () => {
    if (!selectedProjet) {
      console.error("Aucun projet sélectionné. Veuillez sélectionner un projet pour afficher les appels");
      setLoading(false);
      setError("Veuillez sélectionner un projet pour afficher les appels");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const accessToken = localStorage.getItem('accessToken');
      const params = new URLSearchParams({
        projet_id: selectedProjet.id,
        page: pagination.page,
        size: pagination.pageSize,
        ...Object.fromEntries(Object.entries(filterValues).filter(([_, v]) => v !== ''))
      });

      const response = await axios.get(
        `${APIURL.APPELS}?${params.toString()}`, 
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      const { data, meta } = response.data;
      
      setAppels(data || []);
      setPagination({
        ...pagination,
        total: meta?.total || 0
      });
    } catch (error) {
      console.error("Error fetching appels:", error);
      setError("Impossible de récupérer les données des appels");
      setAppels([]);
    } finally {
      setLoading(false);
    }
  }, [selectedProjet, pagination.page, pagination.pageSize, filterValues]);

  useEffect(() => {
    fetchAppels();
  }, [fetchAppels]);

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 2 || term.length === 0) {
      // Reset to first page when searching
      setPagination({
        ...pagination,
        page: 1
      });
      
      // Apply search to filterValues
      setFilterValues({
        ...filterValues,
        nom: term,
        prenom: term,
        cin: term,
        telephone: term
      });
    }
  };

  // Handle filter submission
  const handleFilterSubmit = (values) => {
    setFilterValues(values);
    setPagination({
      ...pagination,
      page: 1
    });
    setIsFilterOpen(false);
  };

  // Handle table actions
  const handleAction = async (action, appel) => {
    switch (action) {
      case 'view':
        router.push(`/CRM/Appels/${appel.id}`);
        break;
      case 'edit':
        router.push(`/CRM/Appels/edit/${appel.last_traitement_appel?.id}`);
        break;
      case 'delete':
        if (confirm("Êtes-vous sûr de vouloir supprimer cet appel ?")) {
          try {
            const accessToken = localStorage.getItem('accessToken');
            await axios.delete(`${APIURL.APPELS}/${appel.id}`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            
            console.log("L'appel a été supprimé avec succès");
            fetchAppels();
          } catch (error) {
            console.error("Error deleting appel:", error);
          }
        }
        break;
      case 'convert':
        // Store prospect info in localStorage and navigate to add visite page
        localStorage.setItem('selectedProspect', JSON.stringify({
          ...appel.prospect,
          id_t_appel: appel.last_traitement_appel?.id
        }));
        router.push('/CRM/Visites/add');
        break;
      default:
        break;
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setFilterValues({
      nom: '',
      prenom: '',
      cin: '',
      telephone: '',
      interet: '',
      date: '',
      cc: ''
    });
    setPagination({
      ...pagination,
      page: 1
    });
  };

  return (
    <div className="container mx-auto px-4">
      {/* CRM Navigation */}
      <CRMNavbar />
      
      {/* Main content */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Gestion des Appels</h1>
          
          <div className="flex items-center space-x-2">
            <button 
              className="px-4 py-2 border rounded-md flex items-center space-x-2 hover:bg-gray-100"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
            
            <button 
              className="px-4 py-2 bg-[#009FFF] text-white rounded-md flex items-center space-x-2 hover:bg-blue-700"
              onClick={() => router.push('/CRM/Appels/add')}
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un appel</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Filter modal */}
        {isFilterOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 z-40 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl z-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filtrer les appels</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Appliquez des filtres pour affiner les résultats
              </p>
              
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="nom" className="block text-sm font-medium">Nom</label>
                  <input 
                    id="nom"
                    className="w-full border rounded-md p-2"
                    value={filterValues.nom}
                    onChange={(e) => setFilterValues({...filterValues, nom: e.target.value})}
                    placeholder="Nom du prospect"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="prenom" className="block text-sm font-medium">Prénom</label>
                  <input 
                    id="prenom"
                    className="w-full border rounded-md p-2"
                    value={filterValues.prenom}
                    onChange={(e) => setFilterValues({...filterValues, prenom: e.target.value})}
                    placeholder="Prénom du prospect"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="cin" className="block text-sm font-medium">CIN</label>
                  <input 
                    id="cin"
                    className="w-full border rounded-md p-2"
                    value={filterValues.cin}
                    onChange={(e) => setFilterValues({...filterValues, cin: e.target.value})}
                    placeholder="CIN du prospect"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="telephone" className="block text-sm font-medium">Téléphone</label>
                  <input 
                    id="telephone"
                    className="w-full border rounded-md p-2"
                    value={filterValues.telephone}
                    onChange={(e) => setFilterValues({...filterValues, telephone: e.target.value})}
                    placeholder="Téléphone du prospect"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="cc" className="block text-sm font-medium">Commercial</label>
                  <input 
                    id="cc"
                    className="w-full border rounded-md p-2"
                    value={filterValues.cc}
                    onChange={(e) => setFilterValues({...filterValues, cc: e.target.value})}
                    placeholder="Nom du commercial"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="interet" className="block text-sm font-medium">Intérêt</label>
                  <select 
                    id="interet"
                    className="w-full border rounded-md p-2"
                    value={filterValues.interet}
                    onChange={(e) => setFilterValues({...filterValues, interet: e.target.value})}
                  >
                    <option value="">Tous</option>
                    {Object.values(VISITE_INTERETS).map((interet) => (
                      <option key={interet.code} value={interet.code}>
                        {interet.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="date" className="block text-sm font-medium">Date</label>
                  <input 
                    id="date"
                    type="date"
                    className="w-full border rounded-md p-2"
                    value={filterValues.date}
                    onChange={(e) => setFilterValues({...filterValues, date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  className="px-4 py-2 border rounded-md hover:bg-gray-100"
                  onClick={resetFilters}
                >
                  Réinitialiser
                </button>
                <button 
                  className="px-4 py-2 bg-[#009FFF] text-white rounded-md hover:bg-blue-700"
                  onClick={() => handleFilterSubmit(filterValues)}
                >
                  Appliquer
                </button>
              </div>
            </div>
          </div>
        )}

        <Table
          columns={columns}
          data={appels}
          onAction={handleAction}
          onSearch={handleSearch}
          searchTerm={searchTerm}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination({...pagination, page})}
          onPageSizeChange={(pageSize) => setPagination({...pagination, pageSize, page: 1})}
          availableActions={["view", "edit", "delete", "convert"]}
          customActions={[
            { 
              key: 'convert', 
              icon: 'ArrowUpRight', 
              label: 'Convertir en visite',
              condition: (item) => item.last_traitement_appel?.visite_id === null
            }
          ]}
          enableExport={true}
        />

        {appels.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Aucun appel trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

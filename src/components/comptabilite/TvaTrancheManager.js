'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import TvaDialog from './TvaDialog';
import TvaFilter from './TvaFilter';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { Edit, Eye, PlusCircle } from 'lucide-react';

const TvaTrancheManager = ({ userRole }) => {
  const { selectedProjet } = useProjet();
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTranche, setSelectedTranche] = useState(null);
  const [dialogAction, setDialogAction] = useState(0); // 0 for add, 1 for edit

  const fetchData = async () => {
    if (!selectedProjet) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      // Update to use the correct API endpoint structure
      const params = {
        page,
        size: rowsPerPage,
        search: searchTerm,
        ...filterValues
      };

      // Debug logging
      console.log("Fetching tranches with params:", params);
      
      // Updated URL format - using RESTful nested resources pattern
      const response = await axios.get(`${APIURL.ROOT}/v1/projets/${selectedProjet.id}/tranches/`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      console.log("Tranches API response:", response.data);

      // Extract data based on the actual API response structure
      const fetchedTranches = response.data.data || [];
      const pagination = response.data.pagination || {};
      
      setData(fetchedTranches);
      setTotalRows(pagination.totalItems || fetchedTranches.length);
      setError(null);
    } catch (err) {
      console.error('Error fetching tranches data:', err);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjet && selectedProjet.id) {
      console.log("Selected project changed, fetching tranches for:", selectedProjet.id);
      fetchData();
    }
  }, [selectedProjet, page, rowsPerPage, searchTerm, filterValues]);

  const handleViewTva = (trancheId) => {
    // Redirect to the TVA biens list page for this tranche, not the tranche details
    router.push(`/comptabilite/tva/biens/${trancheId}`);
  };

  const handleViewTrancheDetails = (trancheId) => {
    router.push(`http://localhost:3000/Tranches/${trancheId}`);
  };

  const handleAddTva = (tranche) => {
    setSelectedTranche(tranche);
    setDialogAction(0);
    setDialogOpen(true);
  };

  const handleEditTva = (tranche) => {
    setSelectedTranche(tranche);
    setDialogAction(1);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedTranche(null);
  };

  const handleDialogSave = async (formData) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios({
        method: 'put',
        url: `${APIURL.ROOTV1}/calculer_tva/${selectedTranche.id}`,
        data: { 
          coefficient: formData.coeff, 
          qp_bati: formData.qp_bati,
          action: dialogAction 
        },
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('TVA calculée avec succès');
      fetchData();
      closeDialog();
    } catch (err) {
      console.error('Error saving TVA data:', err);
      toast.error('Erreur lors du calcul de la TVA');
    }
  };

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setPage(1);
  };

  const columns = [
    { 
      key: 'nom', 
      label: 'Tranche',
      render: (row) => <span className="font-medium">{row.nom}</span>
    },
    { 
      key: 'coefficient', 
      label: 'Coefficient de Réévaluation',
      render: (row) => row.coefficient_tranche?.coefficient || '-'
    },
    { 
      key: 'valeur_terrain_reevalue', 
      label: 'Valeur Terrain Réévalué',
      render: (row) => row.valeur_terrain_reevalue?.toLocaleString() || '-'
    },
    { 
      key: 'qp_bati', 
      label: 'QP Terrain Bati',
      render: (row) => row.qp_bati?.toLocaleString() || '-'
    },
    { 
      key: 'qp_percent', 
      label: 'QP En %',
      render: (row) => row.qp_terrain_tranche_percent ? `${(row.qp_terrain_tranche_percent * 100).toFixed(2)}%` : '-'
    },
    { 
      key: 'qp_valeur', 
      label: 'QP En Valeur',
      render: (row) => row.qp_terrain_tranche_valeur?.toLocaleString() || '-'
    },
    { 
      key: 'sup', 
      label: 'Total Sup',
      render: () => '23 183' // Hardcoded like in the original code
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          {row.coefficient_tranche === null ? (
            <button
              onClick={() => handleAddTva(row)}
              title="Ajouter TVA"
              className="p-1.5 bg-green-100 !text-green-600 rounded-full hover:bg-green-200"
            >
              <PlusCircle size={16} strokeWidth={2.5} />
            </button>
          ) : (
            <>
              <button
                onClick={() => handleViewTva(row.id)}
                title="Liste des TVA par Bien" // Updated title to be clearer
                className="p-1.5 bg-blue-100 !text-blue-600 rounded-full hover:bg-blue-200"
              >
                <Eye size={16} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => handleEditTva(row)}
                title="Modifier TVA"
                className="p-1.5 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200"
              >
                <Edit size={16} strokeWidth={2.5} />
              </button>
            </>
          )}
          <button
            onClick={() => handleViewTrancheDetails(row.id)}
            title="Voir Détails Tranche"
            className="p-1.5 bg-purple-100 !text-purple-600 rounded-full hover:bg-purple-200"
          >
            <Eye size={16} strokeWidth={2.5} />
          </button>
        </div>
      )
    }
  ];

  // For export functionality
  const exportColumns = [
    { key: 'nom', label: 'Tranche' },
    { key: 'coefficient', label: 'Coefficient de Réévaluation' },
    { key: 'valeur_terrain_reevalue', label: 'Valeur Terrain Réévalué' },
    { key: 'qp_bati', label: 'QP Terrain Bati' },
    { key: 'qp_terrain_tranche_percent', label: 'QP En %' },
    { key: 'qp_terrain_tranche_valeur', label: 'QP En Valeur' },
    { key: 'sum', label: 'Total Sup' },
    { key: 'nbre_blocs', label: 'Nbre blocs' },
    { key: 'nbre_immeubles', label: 'Nbre immeubles' },
    { key: 'nbre_biens', label: 'Nbre biens' },
    { key: 'pr', label: 'Projet' }
  ];

  const transformDataForExport = () => {
    return data.map((item) => ({
      nom: item?.nom || "",
      coefficient: item?.coefficient_tranche?.coefficient || "",
      valeur_terrain_reevalue: item?.valeur_terrain_reevalue?.toLocaleString() || "",
      qp_bati: item?.qp_bati?.toLocaleString() || "",
      qp_terrain_tranche_percent: item?.qp_terrain_tranche_percent ? (item.qp_terrain_tranche_percent * 100).toFixed(2) : "",
      qp_terrain_tranche_valeur: item?.qp_terrain_tranche_valeur?.toLocaleString() || "",
      sum: '23 183',
      nbre_blocs: item?.nbre_blocs || "",
      nbre_immeubles: item?.nbre_immeubles || "",
      nbre_biens: item?.nbre_biens || "",
      pr: selectedProjet?.nom || ""
    }));
  };

  return (
    <div>
      <div className="bg-[#3a3349] text-white p-4 rounded-lg mb-4 grid grid-cols-2 gap-4">
        <div>
          <h5 className="font-medium">Prix d'Acquisition: 
            <span className="ml-2">{selectedProjet?.prix_acquisition?.toLocaleString()}</span>
          </h5>
        </div>
        <div>
          <h5 className="font-medium">Total Superficie Terrain: 
            <span className="ml-2">{selectedProjet?.surface_terrain?.toLocaleString()}</span>
          </h5>
        </div>
      </div>

      <Table
        name_file_export="tvaTranche"
        data_to_export={transformDataForExport()}
        columns_export={exportColumns}
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucune tranche trouvée"
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        currentPage={page}
        rowsPerPage={rowsPerPage}
        enableExport={true}
        filterComponent={<TvaFilter onSubmit={handleFilterChange} initialValues={filterValues} />}
      />

      {dialogOpen && selectedTranche && (
        <TvaDialog
          isOpen={dialogOpen}
          onClose={closeDialog}
          onSave={handleDialogSave}
          tranche={selectedTranche}
          action={dialogAction}
          projet={selectedProjet}
        />
      )}
    </div>
  );
};

export default TvaTrancheManager;

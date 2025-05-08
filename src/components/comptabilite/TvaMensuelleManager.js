'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useProjet } from '@/context/ProjetContext';
import { APIURL } from '@/configs/api';
import Table from '@/components/Table';
import TvaMensuelleFilter from './TvaMensuelleFilter';
import { toast } from 'react-hot-toast';
import format from 'date-fns/format';
import ProjectSelectorWrapper from './ProjectSelectorWrapper';

const TvaMensuelleManager = ({ userRole }) => {
  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0); // Use 0-based pagination like old frontend
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [sumTvaADeclarer, setSumTvaADeclarer] = useState(0);
  const [modePaiementList, setModePaiementList] = useState([]);

  // Fetch mode payment list using exact URL format from old frontend
  useEffect(() => {
    const fetchModePaiementList = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        
        // Use correct API endpoint
        const response = await axios.get(`${APIURL.ROOT}/Mode_paiement_Enum`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log("Mode payment list response:", response.data);
        setModePaiementList(response.data || []);
      } catch (err) {
        console.error('Error fetching mode payment list:', err);
      }
    };
    
    fetchModePaiementList();
  }, []);

  const fetchData = async () => {
    if (!selectedProjet) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      
      // Match the exact parameter structure and naming from the old frontend
      const params = {
        page: page + 1, // Convert 0-indexed to 1-indexed for the API
        size: rowsPerPage,
        search: searchTerm,
        ...filterValues
      };

      console.log("Fetching TVA mensuelle with params:", params);

      // Correct URL format: project ID should be in the path, not a parameter
      const response = await axios.get(`${APIURL.ROOT}/v1/projets/${selectedProjet.id}/get_tva_collecte_mensuelle/`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      console.log("TVA mensuelle response:", response.data);

      // Use the same response structure parsing as the old frontend
      const fetchedData = response.data.data || [];
      
      setData(fetchedData);
      
      // Set pagination data exactly like the old frontend does
      if (response.data.pagination) {
        setTotalRows(response.data.pagination.totalItems || fetchedData.length);
      } else {
        setTotalRows(fetchedData.length);
      }

      // Calculate sum of TVA to declare
      let sum = 0;
      fetchedData.forEach(item => {
        sum += Number(item.tva_a_payer || 0);
      });
      setSumTvaADeclarer(sum);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching TVA mensuelle data:', err);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch data when dependencies change
  useEffect(() => {
    if (selectedProjet && selectedProjet.id) {
      fetchData();
    }
  }, [selectedProjet, page, rowsPerPage, searchTerm, filterValues]);

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setPage(0); // Reset to first page (0-indexed)
  };

  // Convert from 0-indexed (API) to 1-indexed (UI)
  const displayPage = page + 1;

  // Handle page changes - convert from 1-indexed UI to 0-indexed API
  const handlePageChange = (newPage) => {
    setPage(newPage - 1); // Convert 1-indexed to 0-indexed
  };

  // Handle rows per page changes
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page
  };

  const getTypeEncaissementLabel = (type) => {
    switch (type) {
      case '1': return 'Avances';
      case '2': return 'Restitution';
      case '3': return 'Remboursement';
      case '4': return 'Décharge Reliquat';
      case '5': return 'Déblocage Crédit';
      case '6': return 'Pénalité';
      default: return '-';
    }
  };

  const getModePaiementLabel = (mode) => {
    const found = modePaiementList.find(item => item.value === mode);
    return found ? found.title : '-';
  };

  const columns = [
    { 
      key: 'date', 
      label: 'Date',
      render: (row) => row.encaissement?.date_encaissement ? 
        format(new Date(row.encaissement.date_encaissement), 'dd/MM/yyyy') : '-'
    },
    { 
      key: 'bien', 
      label: 'Bien',
      render: (row) => (
        <a 
          href={`/biens/${row.reservation?.bien_id}`} 
          target="_blank" 
          className="text-blue-600 hover:underline"
        >
          {row.reservation?.bien.propriete_dite_bien || '-'}
        </a>
      )
    },
    { 
      key: 'reservation', 
      label: 'Code Réservation',
      render: (row) => (
        <a 
          href={`/reservations/${row.reservation?.id}`} 
          target="_blank" 
          className="text-blue-600 hover:underline"
        >
          {row.reservation?.code_reservation || '-'}
        </a>
      )
    },
    { 
      key: 'client', 
      label: 'Client',
      render: (row) => {
        // For remboursement
        if (row.encaissement?.remboursement_id) {
          const client = row.encaissement?.remboursement?.aquereur?.client;
          if (!client) return '-';
          
          return (
            <a 
              href={`/clients/${client.id}`} 
              target="_blank" 
              className="text-blue-600 hover:underline"
            >
              {`${client.nom} ${client.prenom}`}
            </a>
          );
        }
        
        // For regular cases
        if (!row.reservation?.aquereurs) return '-';
        
        return (
          <div className="space-y-1">
            {Object.keys(row.reservation.aquereurs).map(key => {
              const client = row.reservation.aquereurs[key].client;
              return (
                <div key={key}>
                  <a 
                    href={`/clients/${client.id}`} 
                    target="_blank" 
                    className="text-blue-600 hover:underline block"
                  >
                    {`${client.nom} ${client.prenom}`}
                  </a>
                </div>
              );
            })}
          </div>
        );
      }
    },
    { 
      key: 'montant', 
      label: 'Montant',
      render: (row) => {
        const sign = row.encaissement?.type_encaissement === '1' || 
                    row.encaissement?.type_encaissement === '4' || 
                    row.encaissement?.type_encaissement === '5' || 
                    row.encaissement?.type_encaissement === '6' ? '+' : '-';
                    
        return `${sign} ${row.encaissement?.montant?.toLocaleString() || 0} DH`;
      }
    },
    { 
      key: 'type_encaissement', 
      label: 'Type Encaissement',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium
          ${row.encaissement?.type_encaissement === '1' ? 'bg-green-100 text-green-800' : 
            row.encaissement?.type_encaissement === '2' ? 'bg-red-100 text-red-800' :
            row.encaissement?.type_encaissement === '3' ? 'bg-yellow-100 text-yellow-800' :
            row.encaissement?.type_encaissement === '4' ? 'bg-blue-100 text-blue-800' :
            row.encaissement?.type_encaissement === '5' ? 'bg-purple-100 text-purple-800' :
            'bg-gray-100 text-gray-800'}`
        }>
          {getTypeEncaissementLabel(row.encaissement?.type_encaissement)}
        </span>
      )
    },
    { 
      key: 'mode_encaissement', 
      label: 'Mode Encaissement',
      render: (row) => {
        const mode = row.encaissement?.avance?.mode_paiement;
        const bank = row.encaissement?.avance?.banque;
        const paymentNumber = row.encaissement?.avance?.numero_paiement;
        
        return (
          <div>
            <div className="font-medium">{getModePaiementLabel(mode)}</div>
            {bank && paymentNumber && 
              <div className="text-xs text-gray-500">{`${bank.nom} N°P: ${paymentNumber}`}</div>
            }
          </div>
        );
      }
    },
    { 
      key: 'avance_terrain', 
      label: 'Avance Terrain',
      render: (row) => row.avance_terrain?.toString().replace(/,/g, '.') || '0'
    },
    { 
      key: 'avance_bien_ttc', 
      label: 'Avance Bien TTC',
      render: (row) => row.avance_bien_ttc?.toString().replace(/,/g, '.') || '0'
    },
    { 
      key: 'avance_bien_ht', 
      label: 'Avance Bien HT',
      render: (row) => row.avance_bien_ht?.toString().replace(/,/g, '.') || '0'
    },
    { 
      key: 'tva_a_payer', 
      label: 'TVA à Déclarer',
      render: (row) => row.tva_a_payer?.toString().replace(/,/g, '.') || '0'
    }
  ];

  const exportColumns = [
    { key: 'date', label: 'Date' },
    { key: 'bien', label: 'Bien' },
    { key: 'code_reservation', label: 'Code Réservation' },
    { key: 'montant', label: 'Montant' },
    { key: 'type_enc', label: 'Type Encaissement' },
    { key: 'avance_terrain', label: 'Avance Terrain' },
    { key: 'avance_bien_ttc', label: 'Avance Bien TTC' },
    { key: 'avance_bien_ht', label: 'Avance Bien HT' },
    { key: 'tva_a_payer', label: 'TVA à Déclarer' },
    { key: 'aq_names', label: 'Nom client' },
    { key: 'aq_cin', label: 'CIN client' },
    { key: 'aq_tele', label: 'Tél. client' }
  ];

  const transformDataForExport = () => {
    return data.map(item => {
      // Extract client names, CINs, and phone numbers
      let acquereursNames = '';
      let acquereursCin = '';
      let acquereursTele = '';
      
      if (item.encaissement?.remboursement_id) {
        const client = item.encaissement?.remboursement?.aquereur?.client;
        if (client) {
          acquereursNames = `${client.nom} ${client.prenom}`;
          acquereursCin = client.cin || '';
          acquereursTele = client.telephone_num1 || '';
        }
      } else if (item.reservation?.aquereurs) {
        acquereursNames = Object.keys(item.reservation.aquereurs)
          .map(key => {
            const client = item.reservation.aquereurs[key].client;
            return `${client.nom} ${client.prenom}`;
          })
          .join(' / ');
          
        acquereursCin = Object.keys(item.reservation.aquereurs)
          .map(key => item.reservation.aquereurs[key].client.cin || '')
          .join(' / ');
          
        acquereursTele = Object.keys(item.reservation.aquereurs)
          .map(key => item.reservation.aquereurs[key].client.telephone_num1 || '')
          .join(' / ');
      }
      
      // Format date
      const date = item.encaissement?.date_encaissement ? 
        format(new Date(item.encaissement.date_encaissement), 'dd/MM/yyyy') : '';
        
      // Format amount with sign
      const sign = item.encaissement?.type_encaissement === '1' || 
                  item.encaissement?.type_encaissement === '4' || 
                  item.encaissement?.type_encaissement === '5' || 
                  item.encaissement?.type_encaissement === '6' ? '+' : '-';
      const montant = `${sign} ${item.encaissement?.montant?.toLocaleString() || 0} DH`;
      
      return {
        date: date,
        bien: item.reservation?.bien.propriete_dite_bien || "",
        code_reservation: item.reservation?.code_reservation || "",
        montant: montant,
        type_enc: getTypeEncaissementLabel(item.encaissement?.type_encaissement),
        avance_terrain: item.avance_terrain?.toString().replace(/,/g, '.') || "",
        avance_bien_ttc: item.avance_bien_ttc?.toString().replace(/,/g, '.') || "",
        avance_bien_ht: item.avance_bien_ht?.toString().replace(/,/g, '.') || "",
        tva_a_payer: item.tva_a_payer?.toString().replace(/,/g, '.') || "",
        aq_names: acquereursNames,
        aq_cin: acquereursCin,
        aq_tele: acquereursTele
      };
    });
  };

  return (
    <ProjectSelectorWrapper>
      <div>
        <div className="flex justify-end mb-4">
          <div className="text-xl font-bold !text-red-600">
            Somme TVA à déclarer : {sumTvaADeclarer.toLocaleString()} DH
          </div>
        </div>
        
        <Table
          name_file_export="tvaMensuelle"
          data_to_export={transformDataForExport()}
          columns_export={exportColumns}
          columns={columns}
          data={data}
          totalRows={totalRows}
          loading={loading}
          error={error}
          emptyMessage="Aucune TVA mensuelle trouvée"
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSearchChange={setSearchTerm}
          currentPage={displayPage} // Use 1-indexed for display
          rowsPerPage={rowsPerPage}
          enableExport={true}
          filterComponent={<TvaMensuelleFilter onSubmit={handleFilterChange} initialValues={filterValues} />}
        />
      </div>
    </ProjectSelectorWrapper>
  );
};

export default TvaMensuelleManager;

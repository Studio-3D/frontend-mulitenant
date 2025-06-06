'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isSuperAdmin } from '@/configs/enum';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import ComptabiliteTabsNav from '@/components/comptabilite/ComptabiliteTabsNav';
import Table from '@/components/Table';
import { toast } from 'react-hot-toast';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import TvaBiensFilter from '@/components/comptabilite/TvaBiensFilter';

const TvaBiensPage = () => {
  const params = useParams();
  const trancheId = params.trancheId;

  const { user } = useAuth();
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
  const [trancheDetails, setTrancheDetails] = useState(null);
  const [summaryData, setSummaryData] = useState({
    total_tva: 0,
    total_prix_ttc: 0
  });

  // Check user permissions and project selection
  useEffect(() => {
    if (user && !isAdmin(user.role) && !isSuperAdmin(user.role)) {
      router.push('/home');
    } else if (!selectedProjet) {
      router.push('/comptabilite');
    }
  }, [user, selectedProjet, router]);

  // Fetch tranche details
  useEffect(() => {
    const fetchTrancheDetails = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${APIURL.ROOT}/v1/tranches/${trancheId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTrancheDetails(response.data.tranche);
      } catch (error) {
        console.error('Error fetching tranche details:', error);
        toast.error('Erreur lors du chargement des détails de la tranche');
      }
    };

    if (trancheId && selectedProjet) {
      fetchTrancheDetails();
    }
  }, [trancheId, selectedProjet]);

  const fetchTotals = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.ROOT}/v1/get_totaux/${trancheId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSummaryData({
        total_prix_ttc: response.data.total_prix_ttc || 0,
        total_tva: response.data.total_tva || 0
      });
    } catch (error) {
      console.error('Error fetching totals:', error);
    }
  };

  const fetchData = async () => {
    if (!selectedProjet || !trancheId) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = `${APIURL.ROOT}/v1/projets/${selectedProjet.id}/getBiensByTranche_tva/`;

      const params = {
        tranche_id: trancheId,
        page,
        size: rowsPerPage,
        search: searchTerm,
        ...filterValues
      };

      const response = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });

      const fetchedBiens = response.data.data || [];
      const pagination = response.data.pagination || {};

      setData(fetchedBiens);
      setTotalRows(pagination.totalItems || fetchedBiens.length);
      setError(null);

      // Also fetch totals
      fetchTotals();
    } catch (err) {
      console.error('Error fetching biens data:', err);
      setError('Erreur lors du chargement des données');
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProjet && trancheId) {
      fetchData();
    }
  }, [selectedProjet, trancheId, page, rowsPerPage, searchTerm, filterValues]);

  const handleFilterChange = (values) => {
    setFilterValues(values);
    setPage(1);
  };

  const handleShowTvaCollecte = (bienId) => {
    localStorage.setItem('active_tab_bien_id', bienId);
    window.open(`/biens/${bienId}`, '_blank');
  };

  const columns = [
    {
      key: 'propriete_dite_bien',
      label: 'Bien',
      render: (row) => <span className="font-medium">{row.propriete_dite_bien}</span>
    },
    {
      key: 'code_reservation',
      label: 'Code Réservation',
      render: (row) =>
        row.reservation ? (
          <Link
            href={`/reservations/${row.reservation.id}`}
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            {row.reservation.code_reservation}
          </Link>
        ) : (
          '-'
        )
    },
    {
      key: 'client',
      label: 'Client',
      render: (row) => {
        if (!row.reservation?.aquereurs) return '-';

        return Object.keys(row.reservation.aquereurs).map((key) => (
          <div key={key}>
            <Link
              href={`/clients/${row.reservation.aquereurs[key].client.id}`}
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              {row.reservation.aquereurs[key].client.nom} {row.reservation.aquereurs[key].client.prenom}
            </Link>
          </div>
        ));
      }
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => (
        <div>
          <div>{row.type_bien?.type || '-'}</div>
          <div>{row.conventionne == 0 ? 'Non Conventionné' : 'Conventionné'}</div>
        </div>
      )
    },
    {
      key: 'prix_ttc',
      label: 'Prix TTC',
      render: (row) => row.bien_tva?.prix_ttc?.toString().replace(/,/g, '.') || '-'
    },
    {
      key: 'qp_terrain_percent',
      label: 'QP Terrain %',
      render: (row) => (row.bien_tva?.qp_terrain_percent ? `${row.bien_tva.qp_terrain_percent * 100}%` : '-')
    },
    {
      key: 'qp_terrain_valeur',
      label: 'QP Terrain Valeur',
      render: (row) => row.bien_tva?.qp_terrain_valeur?.toString().replace(/,/g, '.') || '-'
    },
    {
      key: 'prix_ht_hors_terrain',
      label: 'Prix HT Hors Terrain',
      render: (row) => row.bien_tva?.prix_vente_ht_hors_terrain?.toString().replace(/,/g, '.') || '-'
    },
    {
      key: 'tva',
      label: 'TVA',
      render: (row) => row.bien_tva?.tva?.toString().replace(/,/g, '.') || '-'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        if (!row.tva_collectes?.length && !row.tva_collectes_ancien_reservation?.length) {
          return null;
        }

        return (
          <button
            onClick={() => handleShowTvaCollecte(row.id)}
            title={row.tva_collectes?.length > 0 ? 'TVA Collectés' : 'Anciens TVA Collectés'}
            className={`p-1.5 rounded-full ${
              row.tva_collectes?.length > 0
                ? 'bg-blue-100 !text-blue-600 hover:bg-blue-200'
                : 'bg-gray-100 !text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Eye size={16} strokeWidth={2.5} />
          </button>
        );
      }
    }
  ];

  const taux_tva = selectedProjet?.taux_tva * 100 || 20;

  if (!user || !selectedProjet || !trancheDetails) {
    return <div className="p-6 text-center">Chargement...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">TVA par Bien - Tranche {trancheDetails.nom}</h1>

      <ComptabiliteTabsNav />

      <div className="mt-6 mb-4 grid grid-cols-3 gap-4 bg-cyan-100 p-4 rounded-lg">
        <div>
          <h5 className="font-medium text-cyan-900">Total des TVA: {summaryData.total_tva.toLocaleString()}</h5>
        </div>
        <div>
          <h5 className="font-medium text-cyan-900">Taux TVA: {taux_tva}%</h5>
        </div>
        <div>
          <h5 className="font-medium text-cyan-900">Total Prix TTC: {summaryData.total_prix_ttc.toLocaleString()}</h5>
        </div>
      </div>

      <Table
        name_file_export="tvaBiens"
        columns={columns}
        data={data}
        totalRows={totalRows}
        loading={loading}
        error={error}
        emptyMessage="Aucun bien trouvé"
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        currentPage={page}
        rowsPerPage={rowsPerPage}
        enableExport={true}
        filterComponent={<TvaBiensFilter onSubmit={handleFilterChange} initialValues={filterValues} />}
      />
    </div>
  );
};

export default TvaBiensPage;

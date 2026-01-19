'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { ExternalLink, Receipt, Info } from 'lucide-react';
import Table from '@/components/Table';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import Link from 'next/link';
import { useProjet } from '@/context/ProjetContext';
export default function BienTvaCollecte({ bienId, bien }) {
  const [tvaCollectes, setTvaCollectes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ancien, setAncien] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { selectedProjet } = useProjet();

  const token = localStorage.getItem('accessToken');
  const [filters, setFilters] = useState({
    nom: '',
    niveau_etages: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });
  // State for TVA summary information
  const [tvaSummary, setTvaSummary] = useState({
    prix_ttc: 0,
    qp_terrain_valeur: 0,
    tva: 0,
    tva_declaree: 0,
    tva_reste: 0,
  });

  useEffect(() => {
    // First, get the bien details to determine the projet_id and TVA info
    const fetchBienForProject = async () => {
      try {
        const bienResponse = await axios.get(`${APIURL.BIENS}/${bienId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (bienResponse.data && bienResponse.data.bien) {
          const bienData = bienResponse.data.bien;

          // Determine which type of TVA collectes to fetch
          if (bienData.tva_collectes && bienData.tva_collectes.length > 0) {
            setAncien(0);
          } else if (
            bienData.tva_collectes_ancien_reservation &&
            bienData.tva_collectes_ancien_reservation.length > 0
          ) {
            setAncien(1);
          } else {
            setAncien(0); // Default to 0 if no info is available
          }

          // Set TVA summary information
          setTvaSummary({
            prix_ttc: bienData.Bien_Tva?.prix_ttc || 0,
            qp_terrain_valeur: bienData.Bien_Tva?.qp_terrain_valeur || 0,
            tva: bienData.Bien_Tva?.tva || 0,
            tva_declaree: bienData.tva_collectes_sum_tva_a_payer || 0,
            tva_reste:
              (bienData.Bien_Tva?.tva || 0) -
              (bienData.tva_collectes_sum_tva_a_payer || 0),
          });
        }
      } catch (err) {
        console.error('Error fetching bien details:', err);
        setError('Impossible de déterminer le projet pour ce bien');
        setLoading(false);
      }
    };

    if (bienId) {
      fetchBienForProject();
    }
  }, [bienId,selectedProjet]);
  const entity = {
    API_URL: 'get_tva_collecte_par_bien',
    dataKey: 'data',
    name: 'data',
    searchFields: [''],
  };

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const resetFilters = () => {
    const reset = {
      nom: '',
      niveau_etages: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };
  useEffect(() => {
    // Create params_url object with conditional parameters
    const params_url = {
      ...(bienId && { bien_id: bienId }),
      ...(ancien !== null && { ancien: ancien }),
    };

    const combinedFilters = { ...filters, ...params_url };

    fetchData_table_by_projet(
      entity,
      combinedFilters,
      searchTerm,
      currentPage,
      rowsPerPage,
      token,
      setLoading,
      setError,
      setTvaCollectes,
      setTotalRows
    );
  }, [searchTerm, currentPage, rowsPerPage, token, filters, bienId, ancien,selectedProjet]);

  const typeEncaissementMap = {
    1: { label: 'Avances', color: 'bg-green-100 !text-green-800' },
    2: { label: 'Restitution', color: 'bg-red-100 !text-red-800' },
    3: { label: 'Remboursement', color: 'bg-yellow-100 !text-yellow-800' },
    4: { label: 'Décharge Reliquat', color: 'bg-blue-100 !text-blue-800' },
    5: { label: 'Déblocage Crédit', color: 'bg-purple-100 text-purple-800' },
    6: { label: 'Pénalité', color: 'bg-pink-100 text-pink-800' },
  };
  const ModeEncaissementMap = {
    1: { label: 'Espèce', color: 'bg-green-100 !text-green-800' },
    2: { label: 'Chèque', color: 'bg-red-100 !text-red-800' },
    3: { label: 'Chèque de banque', color: 'bg-yellow-100 !text-yellow-800' },
    4: { label: 'Chèque certifie', color: 'bg-blue-100 !text-blue-800' },
    5: { label: 'Virement', color: 'bg-purple-100 text-purple-800' },
    6: { label: 'Versement', color: 'bg-pink-100 text-pink-800' },
    7: { label: 'Transfert dossier', color: 'bg-pink-100 text-pink-800' },
  };

  const getTypeEncaissementBadge = (type) => {
    const info = typeEncaissementMap[type];
    if (!info) return null;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}
      >
        {info.label}
      </span>
    );
  };

  const getModeEncaissementBadge = (type) => {
    const info = ModeEncaissementMap[type];
    if (!info) return null;

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${info.color}`}
      >
        {info.label}
      </span>
    );
  };

  // Define columns for the Table component
  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) =>
        row.encaissement?.date_encaissement &&
        format(new Date(row.encaissement.date_encaissement), 'dd/MM/yyyy'),
    },
    {
      key: 'code_res',
      label: 'Code Réservation',
      render: (row) => (
        <Link
          target="_blank"
          href={'/ventes/reservations/' + row.reservation.id}
        >
          <strong style={{ fontWeight: 600 }}>
            {row.reservation?.code_reservation}
          </strong>
        </Link>
      ),
    },
    {
      key: 'client_id',
      label: 'Client',
      render: (row) => (
        <>
          {row.reservation?.aquereurs
            ? Object.keys(row.reservation.aquereurs).map((key) => {
                const aquereur = row.reservation.aquereurs[key];
                return (
                  <Link
                    key={aquereur.client.id} // Add unique key here
                    target="_blank"
                    href={'/ventes/clients/' + aquereur.client.id}
                    style={{
                      textDecoration: 'none',
                    }}
                  >
                   <strong style={{ fontWeight: 600 }}>
                      {aquereur.client.nom} {aquereur.client.prenom}
                    </strong>
                  </Link>
                );
              })
            : ''}
        </>
      ),
    },
    {
      key: 'encaissement',
      label: 'Encaissement',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              ['1', '4', '5', '6'].includes(row.encaissement?.type_encaissement)
                ? 'bg-green-100 !text-green-800'
                : 'bg-red-100 !text-red-800'
            }`}
          >
            {row.encaissement?.type_encaissement == '1'
              ? '+'
              : row.encaissement?.type_encaissement == '2'
              ? '-'
              : row.encaissement?.type_encaissement == '3'
              ? '-'
              : row.encaissement?.type_encaissement == '4'
              ? '+'
              : row.encaissement?.type_encaissement == '5'
              ? '+'
              : row.encaissement?.type_encaissement == '6'
              ? '+'
              : null}
            {row.encaissement?.montant?.toLocaleString()} DH
          </span>
        </div>
      ),
    },
    {
      key: 'type_encaissement',
      label: 'Type Encaissement',
      render: (row) =>
        getTypeEncaissementBadge(row.encaissement?.type_encaissement),
    },
    {
      key: 'mode_encaissement',
      label: 'Mode Encaissement',
      render: (row) => (
        <div>
          {getModeEncaissementBadge(row.encaissement?.avance?.mode_paiement)}
          {row.encaissement?.avance?.banque && (
            <span>
              {' ' +
                row.encaissement.avance.banque.nom +
                ' N°P :' +
                row.encaissement.avance.numero_paiement}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'avance_terrain',
      label: 'Avance terrain',
      render: (row) =>
        `${parseFloat(row.avance_terrain || 0).toLocaleString()} DH`,
    },
    {
      key: 'avance_bien_ttc',
      label: 'Avance bien TTC',
      render: (row) =>
        `${parseFloat(row.avance_bien_ttc || 0).toLocaleString()} DH`,
    },
    {
      key: 'avance_bien_ht',
      label: 'Avance bien HT',
      render: (row) =>
        `${parseFloat(row.avance_bien_ht || 0).toLocaleString()} DH`,
    },
    {
      key: 'tva_a_payer',
      label: 'TVA à déclarer',
      render: (row) => (
        <span className="font-medium !text-blue-600">
          {parseFloat(row.tva_a_payer || 0).toLocaleString()} DH
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <a
          href={`/ventes/reservations/${row.reservation_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          <ExternalLink size={14} />
        </a>
      ),
    },
  ];

  // Export columns definition - matching the table columns
  const columnsExport = [
    { key: 'date', label: 'Date' },
    { key: 'code_res', label: 'Code Réservation' },
    { key: 'client', label: 'Client' },
    { key: 'encaissement', label: 'Encaissement' },
    { key: 'type_encaissement', label: 'Type Encaissement' },
    { key: 'mode_encaissement', label: 'Mode Encaissement' },
    { key: 'avance_terrain', label: 'Avance terrain' },
    { key: 'avance_bien_ttc', label: 'Avance bien TTC' },
    { key: 'avance_bien_ht', label: 'Avance bien HT' },
    { key: 'tva_a_payer', label: 'TVA à déclarer' },
  ];

  // Prepare data for export
  const data_to_export = tvaCollectes.map((row) => {
    const clientNames = row.reservation?.aquereurs
      ? Object.keys(row.reservation.aquereurs)
          .map(
            (key) =>
              `${row.reservation.aquereurs[key].client.nom} ${row.reservation.aquereurs[key].client.prenom}`
          )
          .join(', ')
      : '';

    const encaissementSign =
      row.encaissement?.type_encaissement == '1'
        ? '+'
        : row.encaissement?.type_encaissement == '2'
        ? '-'
        : row.encaissement?.type_encaissement == '3'
        ? '-'
        : row.encaissement?.type_encaissement == '4'
        ? '+'
        : row.encaissement?.type_encaissement == '5'
        ? '+'
        : row.encaissement?.type_encaissement == '6'
        ? '+'
        : '';

    const encaissementValue = `${encaissementSign}${row.encaissement?.montant?.toLocaleString()} DH`;

    const typeEncaissement =
      typeEncaissementMap[row.encaissement?.type_encaissement]?.label || '';
    const modeEncaissement =
      ModeEncaissementMap[row.encaissement?.avance?.mode_paiement]?.label || '';
    const bankInfo = row.encaissement?.avance?.banque
      ? ` ${row.encaissement.avance.banque.nom} N°P:${row.encaissement.avance.numero_paiement}`
      : '';

    return {
      date: row.encaissement?.date_encaissement
        ? format(new Date(row.encaissement.date_encaissement), 'dd/MM/yyyy')
        : '',
      code_res: row.reservation?.code_reservation || '',
      client: clientNames,
      encaissement: encaissementValue,
      type_encaissement: typeEncaissement,
      mode_encaissement: modeEncaissement + bankInfo,
      avance_terrain: `${parseFloat(
        row.avance_terrain || 0
      ).toLocaleString()} DH`,
      avance_bien_ttc: `${parseFloat(
        row.avance_bien_ttc || 0
      ).toLocaleString()} DH`,
      avance_bien_ht: `${parseFloat(
        row.avance_bien_ht || 0
      ).toLocaleString()} DH`,
      tva_a_payer: `${parseFloat(row.tva_a_payer || 0).toLocaleString()} DH`,
    };
  });

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (perPage) => {
    setRowsPerPage(perPage);
    setCurrentPage(1); // Reset to first page
  };

  // Handle search
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page
  };

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md !text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Horizontal TVA Information */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Info className="text-blue-500 w-5 h-5" />
            Informations TVA - {bien?.propriete_dite_bien || 'Bien'}
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm !text-gray-500 mb-1">Prix vente TTC</p>
              <p className="font-medium text-lg">
                {tvaSummary.prix_ttc.toLocaleString()} DH
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm !text-gray-500 mb-1">QP terrain valeur</p>
              <p className="font-medium text-lg">
                {tvaSummary.qp_terrain_valeur.toLocaleString()} DH
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm !text-gray-500 mb-1">% Tva</p>
              <p className="font-medium text-lg">20%</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm !text-blue-600 font-medium mb-1">
                TVA globale
              </p>
              <p className="font-bold text-lg !text-blue-600">
                {tvaSummary.tva.toLocaleString()} DH
              </p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm !text-green-600 font-medium mb-1">
                TVA déclarée
              </p>
              <p className="font-bold text-lg !text-green-600">
                {tvaSummary.tva_declaree.toLocaleString()} DH
              </p>
            </div>

            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm !text-red-600 font-medium mb-1">
                TVA restante
              </p>
              <p className="font-bold text-lg !text-red-600">
                {tvaSummary.tva_reste.toLocaleString()} DH
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TVA Collecte Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Receipt className="text-blue-500 w-5 h-5" />
            {ancien === 0 || ancien === null
              ? 'Les TVA collectée'
              : 'Les Anciens TVA collectée'}
          </h2>
        </div>

        <div className="p-6">
          <Table
            title=""
            showSearch={false}
            data={tvaCollectes}
            columns={columns}
            totalRows={totalRows}
            loading={loading}
            emptyMessage="Aucune TVA collectée pour ce bien."
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onSearchChange={handleSearchChange}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            enableExport={tvaCollectes.length > 0}
            name_file_export="tva_collecte"
            data_to_export={data_to_export}
            columns_export={columnsExport}
          />
        </div>
      </div>
    </div>
  );
}

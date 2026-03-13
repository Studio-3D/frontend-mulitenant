'use client';

import { useState, useEffect } from 'react';
import { useProjet } from '@/context/ProjetContext';
import Table from '@/components/Table';
import TvaMensuelleFilter from './TvaMensuelleFilter';
import format from 'date-fns/format';
import ProjectSelectorWrapper from './ProjectSelectorWrapper';
import { getModePaiementLabel } from '@/configs/enum';
import { fetchData_table_by_projet } from '@/configs/api-utils';
import { useSociete } from '@/context/SocieteContext';

const TvaMensuelleManager = ({  }) => {
  const { selectedSociete } = useSociete();
  const { selectedProjet } = useProjet();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [sumTvaADeclarer, setSumTvaADeclarer] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // Fetch mode payment list using exact URL format from old frontend

  const accesstoken = localStorage.getItem('accessToken');

  const entity = {
    API_URL: 'get_tva_collecte_mensuelle',
    dataKey: 'data',
    searchFields: [''],
  };

  useEffect(() => {
    if (selectedProjet && selectedProjet.id) {
      fetchData_table_by_projet(
        entity,
        filterValues,
        searchTerm,
        currentPage,
        rowsPerPage,
        accesstoken,
        setLoading,
        setError,
        setData,
        setTotalRows
      );
    }
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filterValues,selectedProjet,selectedSociete]);

  // Calculate sum of TVA to declare
 useEffect(() => {
  if (data) {
    let sum = 0;
    data.forEach((item) => {
      sum += Number(item.tva_a_payer || 0);
    });
    setSumTvaADeclarer(sum);
  }
}, [data]);
  const handleFilterChange = (values) => {
    setFilterValues(values);
    setCurrentPage(1); // Reset to first page (0-indexed)
  };
  // Convert from 0-indexed (API) to 1-indexed (UI)

  const getTypeEncaissementLabel = (type) => {
    switch (type) {
      case '1':
        return 'Avances';
      case '2':
        return 'Restitution';
      case '3':
        return 'Remboursement';
      case '4':
        return 'Décharge Reliquat';
      case '5':
        return 'Déblocage Crédit';
      case '6':
        return 'Pénalité';
      default:
        return '-';
    }
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (row) =>
        row.encaissement?.date_encaissement
          ? format(new Date(row.encaissement.date_encaissement), 'dd/MM/yyyy')
          : '-',
    },
    {
      key: 'bien',
      label: 'Bien',
      render: (row) => (
        <a
          href={`/biens/${row.reservation?.bien_id}`}
          target="_blank"
         
        >
          <strong style={{fontWeight:600}}>{row.reservation?.bien.propriete_dite_bien || '-'}</strong>
        </a>
      ),
    },
    {
      key: 'reservation',
      label: 'Code Réservation',
      render: (row) => (
        <a
          href={`/ventes/reservations/${row.reservation?.id}`}
          target="_blank"
         
        >
       <strong style={{fontWeight:600}}>   {row.reservation?.code_reservation || '-'}</strong>
        </a>
      ),
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
              href={`/ventes/clients/${client.id}`}
              target="_blank"
            >
                <strong style={{fontWeight:600}}>{`${client.nom} ${client.prenom}`}</strong>
            </a>
          );
        }

        // For regular cases
        if (!row.reservation?.aquereurs) return '-';

        return (
          <div className="space-y-1">
            {Object.keys(row.reservation.aquereurs).map((key) => {
              const client = row.reservation.aquereurs[key].client;
              return (
                <div key={key}>
                  <a
                    href={`/clients/${client.id}`}
                    target="_blank"
                  
                  >
                     <strong style={{fontWeight:600}}>{`${client.nom} ${client.prenom}`}</strong>
                  </a>
                </div>
              );
            })}
          </div>
        );
      },
    },
    {
      key: 'montant',
      label: 'Montant',
      render: (row) => {
        const sign =
          row.encaissement?.type_encaissement === '1' ||
          row.encaissement?.type_encaissement === '4' ||
          row.encaissement?.type_encaissement === '5' ||
          row.encaissement?.type_encaissement === '6'
            ? '+'
            : '-';

        return `${sign} ${row.encaissement?.montant?.toLocaleString() || 0} DH`;
      },
    },
    {
      key: 'type_encaissement',
      label: 'Type Encaissement',
      render: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium
          ${
            row.encaissement?.type_encaissement === '1'
              ? 'bg-green-100 !text-green-800'
              : row.encaissement?.type_encaissement === '2'
              ? 'bg-red-100 !text-red-800'
              : row.encaissement?.type_encaissement === '3'
              ? 'bg-yellow-100 !text-yellow-800'
              : row.encaissement?.type_encaissement === '4'
              ? 'bg-blue-100 !text-blue-800'
              : row.encaissement?.type_encaissement === '5'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-gray-100 !text-gray-800'
          }`}
        >
          {getTypeEncaissementLabel(row.encaissement?.type_encaissement)}
        </span>
      ),
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
            {bank && paymentNumber && (
              <div className="text-xs !text-gray-500">{`${bank.nom} N°P: ${paymentNumber}`}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'tva_a_payer',
      label: 'TVA à Déclarer',
      render: (row) => row.tva_a_payer?.toString().replace(/,/g, '.') || '0',
    },
  ];

  const exportColumns = [
    { key: 'date', label: 'Date' },
    { key: 'bien', label: 'Bien' },
    { key: 'code_reservation', label: 'Code Réservation' },
    { key: 'montant', label: 'Montant' },
    { key: 'type_enc', label: 'Type Encaissement' },
    { key: 'tva_a_payer', label: 'TVA à Déclarer' },
    { key: 'aq_names', label: 'Nom client' },
    { key: 'aq_cin', label: 'CIN client' },
    { key: 'aq_tele', label: 'Tél. client' },
  ];

  const transformDataForExport = () => {
    return data.map((item) => {
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
          .map((key) => {
            const client = item.reservation.aquereurs[key].client;
            return `${client.nom} ${client.prenom}`;
          })
          .join(' / ');

        acquereursCin = Object.keys(item.reservation.aquereurs)
          .map((key) => item.reservation.aquereurs[key].client.cin || '')
          .join(' / ');

        acquereursTele = Object.keys(item.reservation.aquereurs)
          .map(
            (key) => item.reservation.aquereurs[key].client.telephone_num1 || ''
          )
          .join(' / ');
      }

      // Format date
      const date = item.encaissement?.date_encaissement
        ? format(new Date(item.encaissement.date_encaissement), 'dd/MM/yyyy')
        : '';

      // Format amount with sign
      const sign =
        item.encaissement?.type_encaissement === '1' ||
        item.encaissement?.type_encaissement === '4' ||
        item.encaissement?.type_encaissement === '5' ||
        item.encaissement?.type_encaissement === '6'
          ? '+'
          : '-';
      const montant = `${sign} ${
        item.encaissement?.montant?.toLocaleString() || 0
      } DH`;

      return {
        date: date,
        bien: item.reservation?.bien.propriete_dite_bien || '',
        code_reservation: item.reservation?.code_reservation || '',
        montant: montant,
        type_enc: getTypeEncaissementLabel(
          item.encaissement?.type_encaissement
        ),
        tva_a_payer: item.tva_a_payer?.toString().replace(/,/g, '.') || '',
        aq_names: acquereursNames,
        aq_cin: acquereursCin,
        aq_tele: acquereursTele,
      };
    });
  };

  return (
    <ProjectSelectorWrapper>
      <div>
        {/* <div className="flex justify-end mb-4">
          <div className="text-xl font-bold !text-red-600">
            Somme TVA à déclarer : {sumTvaADeclarer.toLocaleString()} DH
          </div>
        </div> */}
        <div className=" bg-white p-6">
          <Table
            showSearch={false}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
            onSearchChange={setSearchTerm}
            enableExport={true}
            enableImport={false}
            data_to_export={transformDataForExport()}
            name_file_export="tvaMensuelle"
            columns_export={exportColumns}
            columns={columns}
            data={data}
            totalRows={totalRows}
            loading={loading}
            error={error}
            filterComponent={
              <TvaMensuelleFilter
                onSubmit={handleFilterChange}
                initialValues={filterValues}
              />
            }
          />
        </div>
      </div>
    </ProjectSelectorWrapper>
  );
};

export default TvaMensuelleManager;

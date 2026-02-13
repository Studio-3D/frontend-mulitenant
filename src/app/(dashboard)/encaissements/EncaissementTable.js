'use client';

import Table from '@/components/Table';
import { useEffect, useState, useRef } from 'react';
import { Eye } from 'lucide-react';

import { fetchData_table_by_projet } from '@/configs/api-utils';
import { MODE_PAIEMENT } from '@/configs/enum';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';
import format from 'date-fns/format';
import Link from 'next/link';

import DateRangePicker from '@/components/DateRangePicker';
import SelectInput from '@/components/SelectInput';
import { useProjet } from '@/context/ProjetContext';
import { useRouter } from 'next/navigation';

const EncaissementTable = ({ dataClient_id, bien_id }) => {
  const [encaissements, setEncaissements] = useState([]);
  const router = useRouter();

  const { selectedProjet } = useProjet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  // Store filter info separately for display
  const [filterInfo, setFilterInfo] = useState(null);

  // Initialize filters from localStorage if available
  const storedFilters = localStorage.getItem('encaissement_filters');
  const initialFilters = storedFilters ? JSON.parse(storedFilters) : null;

  // Set the filters for the API call
  const [filters, setFilters] = useState({
    code_reservation: '',
    bienId: '',
    client: '',
    montant: '',
    type_encaissement: initialFilters?.type_encaissement || '',
    de: initialFilters?.start || '',
    a: initialFilters?.end || '',
    user_id:
      initialFilters?.commercial !== 'tous' ? initialFilters?.commercial : '',
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });

  // Set filter info for display
  useEffect(() => {
    if (initialFilters) {
      setFilterInfo({
        commercial_name: initialFilters.commercial_name,
        type_encaissement: initialFilters.type_encaissement,
        start: initialFilters.start,
        end: initialFilters.end,
      });

      // Clear the stored filters after use (but keep for display)
      localStorage.removeItem('encaissement_filters');
    }
  }, []);

  const handleFilterChange = (field, value) => {
    // Only reset user_id if we're changing a different field
    if (field !== 'user_id') {
      setTempFilters((prev) => ({
        ...prev,
        user_id: '', // Reset user_id when other fields change
        [field]: value,
      }));
    } else {
      setTempFilters((prev) => ({ ...prev, [field]: value }));
    }
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    // Clear filter info when applying new filters
    setFilterInfo(null);
  };

  const resetFilters = () => {
    const reset = {
      code_reservation: '',
      bienId: '',
      client: '',
      client_id: '',
      montant: '',
      type_encaissement: '',
      de: '',
      a: '',
      user_id: '',
    };
    setFilters(reset);
    setTempFilters(reset);
    // Clear filter info when resetting filters
    setFilterInfo(null);
  };

  const entity = {
    API_URL: 'encaissements',
    dataKey: 'data',
    name: 'Encaissement',
    searchFields: [''],
  };

  const handleShow = (type_encaissement, res_id, des_id, pen_des_id) => {
    let route,
      id = null;
    if (type_encaissement == 1) {
      //avances
      route = '/ventes/reservations/';
      id = res_id;
    } else if (type_encaissement == 3) {
      //DESISTEMENTS
      route = '/ventes/desistements/show';
      id = des_id;
    } else if (type_encaissement == 6) {
      //PENALITES
      route = '/ventes/desistements/show';
      id = pen_des_id;
    }
    window.open(`${route}/${id}`, '_blank');
  };

  const handleFilterToggle = (isOpen) => {
    if (!isOpen) resetFilters(); // Si on ferme, on réinitialise
  };

  useEffect(() => {
    const params_url = dataClient_id
      ? { client_id: dataClient_id?.id }
      : bien_id
      ? { bien_id: bien_id }
      : {};
    const combinedFilters = { ...filters, ...params_url };

    fetchData_table_by_projet(
      entity,
      combinedFilters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setEncaissements,
      setTotalRows
    );
  }, [searchTerm, currentPage, rowsPerPage, accesstoken, filters,selectedProjet]);

  const typeEncaissementMap = {
    1: { label: 'Avances', color: 'bg-green-100 !text-green-800' },
    2: { label: 'Restitution', color: 'bg-red-100 !text-red-800' },
    3: { label: 'Remboursement', color: 'bg-yellow-100 !text-yellow-800' },
    4: { label: 'Décharge Reliquat', color: 'bg-blue-100 !text-blue-800' },
    5: { label: 'Déblocage Crédit', color: 'bg-purple-100 text-purple-800' },
    6: { label: 'Pénalité', color: 'bg-pink-100 text-pink-800' },
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

  const columns = [
    {
      key: 'code_reservation',
      label: 'Code Réservation',
      render: (row) => (
        <Link target="_blank" href={'/reservations/show/' + row.reservation_id}>
          <strong style={{ fontWeight: 600 }}>{row.reservations.code_reservation}</strong>
        </Link>
      ),
    },

    // Conditionally show Bien column only if bien_id is not provided
    ...(!bien_id
      ? [
          {
            key: 'bien',
            label: 'Bien',
            render: (row) => (
              <Link target="_blank" href={'/biens/' + row.reservations.bien_id}>
                <strong style={{ fontWeight: 600 }}>
                  {row.reservations.bien.propriete_dite_bien}
                </strong>
              </Link>
            ),
          },
        ]
      : []),
    // Conditionally show Client column only if dataClient_id is not provided
    ...(!dataClient_id
      ? [
          {
            key: 'client',
            label: 'Client',
            render: (row) => (
              <>
                {row.reservations.aquereurs.length > 0
                  ? Object.keys(row.reservations.aquereurs).map((key) => (
                      <Link
                        key={key}
                        target="_blank"
                        href={
                          '/ventes/clients/' +
                          row.reservations.aquereurs[key].client.id
                        }
                      >
                        <strong style={{ fontWeight: 600 }}>
                          {row.reservations.aquereurs[key].client.nom}{' '}
                          {row.reservations.aquereurs[key].client.prenom}
                        </strong>
                        <br />
                      </Link>
                    ))
                  : row.reservations.aquereurs_ancien &&
                    Object.keys(row.reservations.aquereurs_ancien).map(
                      (key) => (
                        <Link
                          key={key}
                          target="_blank"
                          href={
                            '/ventes/clients/' +
                            row.reservations.aquereurs_ancien[key].client.id
                          }
                        >
                          <strong style={{ fontWeight: 600 }}>
                            {row.reservations.aquereurs_ancien[key].client.nom}{' '}
                            {
                              row.reservations.aquereurs_ancien[key].client
                                .prenom
                            }
                          </strong>
                          <br />
                        </Link>
                      )
                    )}
              </>
            ),
          },
        ]
      : []),
    {
      key: 'type_encaissement',
      label: 'Type Encaissement',
      render: (row) => getTypeEncaissementBadge(row.type_encaissement),
    },

    {
      key: 'montant',
      label: 'Montant',
      render: (row) => {
        const isPositive = ['1', '4', '5', '6'].includes(row.type_encaissement);
        const sign =
          row.type_encaissement === '1'
            ? '+'
            : row.type_encaissement === '2'
            ? '-'
            : row.type_encaissement === '3'
            ? '-'
            : row.type_encaissement === '4'
            ? '+'
            : row.type_encaissement === '5'
            ? '+'
            : row.type_encaissement === '6'
            ? '+'
            : '';
        return (
          <span style={{ color: isPositive ? 'green' : 'red' }}>
            {sign}
            {row.montant} DH
          </span>
        );
      },
    },
    {
      key: 'date_encaissement',
      label: 'Date Encaissement',
      render: (row) => format(new Date(row.date_encaissement), 'dd/MM/yyyy'),
    },
    {
      key: 'num_remise',
      label: 'N° Encaissement',
      render: (row) =>
        row.type_encaissement === '1'
          ? row.avance?.last_statut.num_remise
          : row.type_encaissement === '6'
          ? row.penalite?.last_statut.num_remise
          : null,
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <button
            title="Voir détails"
            className="text-blue-500 hover:text-blue-700"
            onClick={() =>
              handleShow(
                row.type_encaissement,
                row.reservation_id,
                row.remboursement?.desistement_id,
                row.penalite?.desistement_id
              )
            }
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const formatData = () => {
    return encaissements; // ou sortedData si vous avez trié/filtré vos données
  };
  const rows = formatData();

  const data_to_export = () => {
    return encaissements.map((item) => {
      const acquereursNames = item?.reservations?.aquereurs
        ? item.reservations.aquereurs
            .map(
              (acq) =>
                (acq.client?.nom || '') + ' ' + (acq.client?.prenom || '')
            )
            .join(' / ')
        : '';

      const acquereursCin = item?.reservations?.aquereurs
        ? item.reservations.aquereurs
            .map((acq) => acq.client?.cin || '')
            .join(' / ')
        : '';

      const acquereursTele = item?.reservations?.aquereurs
        ? item.reservations.aquereurs
            .map((acq) => acq.client?.telephone_num1 || '')
            .join(' / ')
        : '';

      return {
        cc: (
          (item.avance?.user?.name || '') +
          ' ' +
          (item.avance?.user?.prenom || '')
        ).trim(),
        bien: item.reservations?.bien?.propriete_dite_bien || '',
        prix: item.reservations?.prix || '',
        avance: item.montant?.toLocaleString() + ' DH' || '',
        mode_paiement: MODE_PAIEMENT[item.avance?.statut]?.label || '',
        banque: item.avance?.banque?.nom || '',
        num_pai: item.avance?.numero_paiement || '',
        date_reg:
          item.date_reglement != null
            ? format(new Date(item.date_reglement), 'dd/MM/yyyy')
            : null,
        num_rem:
          item.type_encaissement == '1'
            ? item.avance?.last_statut?.num_remise
            : item.type_encaissement == '6'
            ? item.penalite?.last_statut?.num_remise
            : null,
        date_encaissement:
          item.date_encaissement != null
            ? format(new Date(item.date_encaissement), 'dd/MM/yyyy')
            : null,
        type_enc:
          item.type_encaissement == '1'
            ? 'Avances'
            : item.type_encaissement == '2'
            ? 'Restitution'
            : item.type_encaissement == '3'
            ? 'Remboursement'
            : item.type_encaissement == '4'
            ? 'Décharge Reliquat'
            : item.type_encaissement == '5'
            ? 'Déblocage Crédit'
            : item.type_encaissement == '6'
            ? 'Pénalité'
            : null,
        // ... reste du code inchangé ...
        code_res: item.reservations?.code_reservation || '',
        date_res:
          item.reservations?.date_reservation != null
            ? format(new Date(item.reservations.date_reservation), 'dd/MM/yyyy')
            : '',
        aq_names: acquereursNames,
        aq_cin: acquereursCin,
        aq_tele: acquereursTele,
      };
    });
  };

  const columns_export = [
    { key: 'code_res', label: 'Code reservation' },
    { key: 'date_res', label: 'Date reservation' },
    { key: 'num_rem', label: 'N° Remise' },
    { key: 'date_encaissement', label: 'Date Encaiss' },
    { key: 'bien', label: 'Bien' },
    { key: 'prix', label: 'Prix de vente' },
    { key: 'avance', label: 'Avance' },
    { key: 'type_enc', label: 'Type Encaiss' },
    { key: 'cc', label: 'CC' },
    { key: 'banque', label: 'Banque' },
    { key: 'mode_paiement', label: 'Mode paiement' },
    { key: 'num_pai', label: 'Num paiement' },
    { key: 'date_reg', label: 'Date Reglement' },
    { key: 'aq_names', label: 'Nom client' },
    { key: 'aq_cin', label: 'Cin client' },
    { key: 'aq_tele', label: 'Tele client' },
  ];

  const type_encaissements = [
    { key: '1', label: 'Avances' },
    { key: '2', label: 'Restitution' },
    { key: '3', label: 'Remboursements' },
    { key: '4', label: 'Décharge Reliquat' },
    { key: '5', label: 'Déblocage Crédit' },
    { key: '6', label: 'Pénalités' },
  ];

  return (
    <>
      <div className="reflative bg-white rounded-lg p-4">
        {/* Show filter info if parameters were passed from Actualites */}
        {user.role <= 2 && filterInfo && (
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500">
            <p className="font-medium">Filtres appliqués:</p>
            {filterInfo.commercial_name && (
              <p className="text-sm">
                Commercial: {filterInfo.commercial_name}
              </p>
            )}

            <p className="text-sm">
              Type Encaissement:{' '}
              {
                'Avances'
                /*filterInfo.type_encaissement === '1' ? 'Avances' : 
                filterInfo.type_encaissement === '2' ? 'Restitution' :
                filterInfo.type_encaissement === '3' ? 'Remboursements' :
                filterInfo.type_encaissement === '4' ? 'Décharge Reliquat' :
                filterInfo.type_encaissement === '5' ? 'Déblocage Crédit' :
                filterInfo.type_encaissement === '6' ? 'Pénalités' : ''*/
              }
            </p>

            {filterInfo.start && filterInfo.end && (
              <p className="text-sm">
                Période: {format(new Date(filterInfo.start), 'dd/MM/yyyy')} -{' '}
                {format(new Date(filterInfo.end), 'dd/MM/yyyy')}
              </p>
            )}
          </div>
        )}

        <Table
          showSearch={false}
          title={!dataClient_id && 'Encaissements'}
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'encaissement_export'}
          columns={columns}
          onFilterToggle={handleFilterToggle}
          data={formatData()}
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg">
              {/* First row - inputs */}
              <div
                className={`grid grid-cols-1 gap-4 lg:grid-cols-${
                  !dataClient_id ? '4' : '3'
                }`}
              >
                <Input
                  type="text"
                  label={'Code Réservation'}
                  placeholder="Code Réservation"
                  value={tempFilters.code_reservation}
                  onChange={(e) =>
                    handleFilterChange('code_reservation', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                {!dataClient_id && (
                  <Input
                    type="text"
                    label={'Client'}
                    placeholder="Client"
                    value={tempFilters.client}
                    onChange={(e) =>
                      handleFilterChange('client', e.target.value)
                    }
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                )}
                {!bien_id && (
                  <Input
                    type="text"
                    label={'Propriete dite Bien'}
                    placeholder="Propriete dite Bien"
                    value={tempFilters.bien}
                    onChange={(e) => handleFilterChange('bien', e.target.value)}
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                )}

                <Input
                  label="Montant"
                  type="text"
                  placeholder="Montant"
                  value={tempFilters.montant}
                  onChange={(e) =>
                    handleFilterChange('montant', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
              </div>

              {/* Second row - remaining inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectInput
                  placeholder="Choisir un type"
                  value={tempFilters.type_encaissement}
                  onChange={(value) =>
                    handleFilterChange('type_encaissement', value)
                  }
                  options={Object.values(type_encaissements).map((data) => ({
                    value: data.key,
                    label: data.label,
                  }))}
                  label="Choisir un type"
                  className="h-10 text-sm w-full"
                />

                <DateRangePicker
                  startName="de"
                  endName="a"
                  startValue={tempFilters.de}
                  endValue={tempFilters.a}
                  onChange={handleFilterChange}
                  placeholder="Choisir une Date"
                  label="Date"
                />
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Appliquer les filtres
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-3 py-2 bg-gray-400 text-white text-sm rounded hover:bg-gray-500"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          }
          totalRows={totalRows}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          enableExport={true}
        />
      </div>
    </>
  );
};

export default EncaissementTable;

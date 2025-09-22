'use client';

import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { Eye, Download } from 'lucide-react';

import { useAuth } from '../../../../context/AuthContext';
import { useProjet } from '../../../../context/ProjetContext';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import Link from 'next/link';
import { format, parseISO, isValid } from 'date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import MyDocument from './bon_pre_reservation.js';
import Input from '@/components/Input';

const PreReservationTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filters, setFilters] = useState({
    bien: '',
    prospect: '',
    respo: '',
    code_pre: '',
  });

  const [tempFilters, setTempFilters] = useState({ ...filters });
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const resetFilters = () => {
    const reset = Object.fromEntries(
      Object.keys(filters).map((key) => [key, ''])
    );
    setFilters(reset);
    setTempFilters(reset);
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const { token } = useAuth();
  const { selectedProjet } = useProjet();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope

  const entity = {
    API_URL: 'pre_reservations',
    dataKey: 'data',
    searchFields: [''],
  };

  useEffect(() => {
    localStorage.setItem('v_id_cadre', null);
    localStorage.setItem('v_id_org', null);
    fetchData_table_by_projet(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setData,
      setTotalRows
    );
  }, [
    accesstoken,
    currentPage,
    rowsPerPage,
    searchTerm,
    filters,
    selectedProjet,
  ]);

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1200); // Wait for 1.2s after user stops typing before updating the debounced value

    return () => clearTimeout(timer); // Clean up the timeout on each render
  }, [searchTerm]);
  const handleShow = (data) => {
    if (data.appel_id != null) {
      window.open(`/crm/appels/${data.t_appel.appel.id}`);
    } else if (data.visite_id) {
      localStorage.setItem('v_id_cadre', data.visite.related_show_id);
      window.open(`/crm/visites/${data.visite.origin_id}`);
    }
  };

  const formatData = () => {
    return data.map((pro) => {
      // Get RDV
      const rdvRaw =
        pro.visite_id && pro?.visite?.rdv_relation?.rdv
          ? pro.visite.rdv_relation.rdv
          : pro.appel_id && pro?.t_appel?.rdv?.rdv
          ? pro.t_appel.rdv.rdv
          : null;

      const rdv =
        rdvRaw && isValid(parseISO(rdvRaw))
          ? format(parseISO(rdvRaw), 'dd/MM/yyyy HH:mm')
          : '';

      // Get Respo
      const respo =
        pro.visite_id && pro?.visite?.user
          ? `${pro.visite.user.name || ''} ${
              pro.visite.user.prenom || ''
            }`.trim()
          : pro.appel_id && pro?.t_appel?.user
          ? `${pro.t_appel.user.name || ''} ${
              pro.t_appel.user.prenom || ''
            }`.trim()
          : pro.desistement_id && pro?.desistement?.user
          ? `${pro.desistement.user.name || ''} ${
              pro.desistement.user.prenom || ''
            }`.trim()
          : '';

      // Get Prospect
      const prospect =
        pro.visite_id && pro?.visite?.prospect
          ? `${pro.visite.prospect.nom || ''} ${
              pro.visite.prospect.prenom || ''
            }`.trim()
          : pro.appel_id && pro?.t_appel?.appel?.prospect
          ? `${pro.t_appel.appel.prospect.nom || ''} ${
              pro.t_appel.appel.prospect.prenom || ''
            }`.trim()
          : '';
      const prospect_id =
        pro.visite_id && pro?.visite?.prospect
          ? pro.visite.prospect.id
          : pro.appel_id && pro?.t_appel?.appel?.prospect
          ? pro.t_appel.appel.prospect_id
          : '';

      return {
        id: pro.id,
        code: `${pro.code_pre_reserve}`.trim(),
        date: pro.date_pre_reserve,
        respo,
        prospect,
        rdv,
        bien_id: pro.bien_id,
        bien_propriete: pro.bien?.propriete_dite_bien || '',
        bien: pro.bien,
        visite_id: pro.visite_id,
        visite: pro.visite,
        appel_id: pro.appel_id,
        t_appel: pro.t_appel,
        desistement_id: pro.desistement_id,
        desistement: pro.desistement,
        prospect_id,
      };
    });
  };

  // Table columns configuration
  const columns = [
    {
      key: 'date',
      label: 'Date ',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>
            {row.date ? format(new Date(row.date), 'dd/MM/yyyy ') : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'code',
      label: 'Code Pré Réservation',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>{row.code}</span>
        </div>
      ),
    },
    {
      key: 'bien',
      label: 'Bien',
      render: (row) => {
        return (
          <Link target="_blank" href={`/Biens/${row?.bien.id}`}>
            <strong style={{ fontWeight: 600 }}>
              {' '}
              {NomBienComplet(row.bien)}
            </strong>
          </Link>
        );
      },
    },
    { key: 'respo', label: 'Commercial' },
    {
      key: 'prospect',
      label: 'Prospect',
      render: (row) => {
        return (
          <Link target="_blank" href={`/crm/prospects/${row?.prospect_id}`}>
            <strong style={{ fontWeight: 600 }}>{row.prospect}</strong>
          </Link>
        );
      },
    },
    { key: 'rdv', label: 'Rendez Vous' },

    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <div title="Voir détails">
            <Eye
              className="w-4 h-4 !text-blue-500 hover:text-blue-700 cursor-pointer"
              title="Voir détails"
              onClick={() => handleShow(row)}
            />
          </div>

          <PDFDownloadLink
            document={
              <MyDocument
                data={[
                  row.visite_id,
                  row.code_pre_reserve,
                  row.t_appel != null
                    ? row.t_appel.rdv.rdv
                    : row?.visite != null
                    ? row.visite?.rdv_relation?.rdv
                    : null,
                  row.date_pre_reserve,
                  row.bien?.propriete_dite_bien,
                  row.bien?.niveau,
                  row.bien?.superficie_architecte,
                  row.bien?.orientation,
                  row.bien?.prix,
                  row.t_appel != null
                    ? row.t_appel.user?.name
                    : row?.visite != null
                    ? row.visite?.user?.name
                    : null,
                  row.t_appel != null
                    ? row.t_appel.user?.prenom
                    : row?.visite != null
                    ? row.visite?.user?.prenom
                    : null,
                ]}
              />
            }
            fileName="bon_pre_reservation.pdf"
          >
            {({ loading }) => (
              <button
                className={`text-indigo-500 hover:text-indigo-700 ${
                  loading ? 'opacity-50' : ''
                }`}
                title="Télécharger PDF"
                disabled={loading}
              >
                {loading ? '...' : <Download className="w-4 h-4" />}
              </button>
            )}
          </PDFDownloadLink>
        </div>
      ),
    },
  ];

  {
    /* Dynamic Modals Import */
  }

  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }
  //EXPORT

  const data_to_export = () => {
    return data.map((pro) => {
      // Get RDV
      const rdvRaw =
        pro.visite_id && pro?.visite?.rdv_relation?.rdv
          ? pro.visite.rdv_relation.rdv
          : pro.appel_id && pro?.t_appel?.rdv?.rdv
          ? pro.t_appel.rdv.rdv
          : null;

      const rdv =
        rdvRaw && isValid(parseISO(rdvRaw))
          ? format(parseISO(rdvRaw), 'dd/MM/yyyy HH:mm')
          : '';

      // Get Respo
      const respo =
        pro.visite_id && pro?.visite?.user
          ? `${pro.visite.user.name || ''} ${
              pro.visite.user.prenom || ''
            }`.trim()
          : pro.appel_id && pro?.t_appel?.user
          ? `${pro.t_appel.user.name || ''} ${
              pro.t_appel.user.prenom || ''
            }`.trim()
          : pro.desistement_id && pro?.desistement?.user
          ? `${pro.desistement.user.name || ''} ${
              pro.desistement.user.prenom || ''
            }`.trim()
          : '';

      // Get Prospect
      const prospect =
        pro.visite_id && pro?.visite?.prospect
          ? `${pro.visite.prospect.nom || ''} ${
              pro.visite.prospect.prenom || ''
            }`.trim()
          : pro.appel_id && pro?.t_appel?.appel?.prospect
          ? `${pro.t_appel.appel.prospect.nom || ''} ${
              pro.t_appel.appel.prospect.prenom || ''
            }`.trim()
          : '';

      return {
        code: `${pro.code_pre_reserve}`.trim(),
        date: format(new Date(pro.date_pre_reserve), 'dd/MM/yyyy'),
        respo,
        prospect,
        rdv,
        bien_propriete: pro?.bien?.propriete_dite_bien || '',
        bien: pro?.bien || '',
      };
    });
  };

  const columns_export = [
    { key: 'date', label: 'Date' },
    { key: 'code', label: 'Code' },
    { key: 'respo', label: 'Commercial' },
    { key: 'prospect', label: 'Prospect' },
    { key: 'bien_propriete', label: 'Bien' },
    { key: 'rdv', label: 'Rendez Vous' },
  ];

  //npm install jspdf

  return (
    <>
      <div className="relative bg-white shadow-md rounded-lg px-4 py-4">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'pre_reservations_export'}
          columns={columns}
          data={formatData()}
          totalRows={totalRows}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          onSearchChange={setSearchTerm}
          enableExport={formatData().length > 0}
          showSearch={false}
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg ">
              <div
                className="grid gap-1"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {/* Champs de recherche */}
                <Input
                  type="text"
                  label="Bien"
                  value={tempFilters.bien}
                  onChange={(e) => handleFilterChange('bien', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="Nom & Prénom"
                  value={tempFilters.prospect}
                  onChange={(e) =>
                    handleFilterChange('prospect', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="Responsable"
                  value={tempFilters.respo}
                  onChange={(e) => handleFilterChange('respo', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="text"
                  label="Code"
                  value={tempFilters.code_pre}
                  onChange={(e) =>
                    handleFilterChange('code_pre', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
              </div>

              {/* Boutons */}
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
        />
      </div>
    </>
  );
};

export default PreReservationTable;

import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { Eye, CheckCircle } from 'lucide-react';

import { useAuth } from '../../../../context/AuthContext';
import { useProjet } from '../../../../context/ProjetContext';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import Link from 'next/link';
import { format } from 'date-fns';
import DateInput from '@/components/DateInput';
import {
  MODES_RELANCES,
  VISITE_INTERETS,
  getRelance_label,
} from '../../../../../src/configs/enum';
import Input from '@/components/Input';
import SelectInput from '@/components/SelectInput';

import Modal from '@/components/Modal';
import Modal_Traite from '../../crm/Modal_Traite';

const RelancesRdvAppelsTable = (type) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [client, setClient] = useState(null);

  const [open_dialog_r, setOpen_dialog_r] = useState(false);
  const [text, setText] = useState(' ');
  const [ID_rel_rdv, setID_rel_rdv] = useState(0);

  const { token } = useAuth();
  const { selectedProjet } = useProjet();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope

  const [filters, setFilters] = useState({
    nom_prenom: '',
    cin: '',
    telephone: '',
    mode_relance: '',
    date_relance: '',
    rdv: '',
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

  const entity = {
    API_URL: 'relances_rdv_appels',
    dataKey: 'data',
    searchFields: ['date_relance', 'rdv'],
  };

  useEffect(() => {
    const params_url = { type: Number(type.type) };
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

  useEffect(() => {
    //Implementing the setInterval method
    const interval = setInterval(() => {
      if (localStorage.getItem('load_data_rdv_relance_appels') == 1) {
        fetchData_table_by_projet(
          entity,
          { type: Number(type.type) },
          searchTerm,
          currentPage,
          rowsPerPage,
          accesstoken,
          setLoading,
          setError,
          setData,
          setTotalRows
        );
        localStorage.removeItem('load_data_rdv_relance_appels');
      }
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [accesstoken, currentPage, rowsPerPage, searchTerm]);
  const handleShow = (appelId) => {
    router.push(`/crm/appels/${appelId}`);
  };

  const handleValider = (Id, text, clt) => {
    setClient(clt);
    setOpen_dialog_r(true);
    setText(text);
    setID_rel_rdv(Id);
  };

  const formatData = () => {
    return data.map((pro) => {
      return {
        id: pro.id,
        cc: pro.traite_appel.user.name + ' ' + pro.traite_appel.user.prenom,
        nomComplet: `${
          pro.traite_appel.appel.prospect.nom +
          ' ' +
          pro.traite_appel.appel.prospect.prenom
        }`.trim(),
        prospect_id: pro.traite_appel.appel.prospect.id,
        cin: pro.traite_appel.appel.prospect.cin,
        telephone:
          (pro.traite_appel.appel?.prospect.telephone
            ? pro.traite_appel.appel?.prospect.telephone
            : '') +
            (pro.traite_appel.appel.appel?.prospect.telephone &&
            pro.traite_appel.appel.appel?.prospect.telephone_num2 &&
            pro.traite_appel.appel.appel?.prospect.telephone_num2 !== 'null'
              ? ' / ' + pro.traite_appel.appel.appel?.prospect.telephone_num2
              : '') || 'Non spécifié',
        interet: pro.traite_appel?.interet,
        mode_relance: pro.mode_relance,
        date_relance: pro.date_relance,
        rdv: pro.rdv,
        appel_id: pro.traite_appel.appel.id,
      };
    });
  };
  const getInteretBadge = (interest) => {
    const interetInfo = VISITE_INTERETS[interest];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${interetInfo.color}`}
      >
        {interetInfo.label}
      </span>
    );
  };

  // Dynamically build columns based on type
  const columns = [
    { key: 'cc', label: 'Commercial' },
    { key: 'cin', label: 'Cin' },
    {
      key: 'nomComplet',
      label: 'Nom Complet',
      render: (row) => {
        return (
          <Link target="_blank" href={`/crm/prospects/${row?.prospect_id}`}            className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
>
            <strong style={{ fontWeight: 600 }}>{row.nomComplet}</strong>
          </Link>
        );
      },
    },
    { key: 'telephone', label: 'Téléphone' },
    {
      key: 'interet',
      label: 'Intéret',
      render: (row) => {
        return getInteretBadge(row.interet);
      },
    },
  ];

  // Add conditional columns based on type.type Relance
  if (Number(type.type) == 1) {
    columns.push(
      {
        key: 'mode_relance',
        label: 'Mode Relance',
        render: (row) => {
          return getRelance_label(row.mode_relance);
        },
      },
      {
        key: 'date_relance',
        label: 'Date Relance',
        render: (row) => (
          <div className="flex items-center gap-3">
            <span>
              {row.date_relance
                ? format(new Date(row.date_relance), 'dd/MM/yyyy ')
                : ''}
            </span>
          </div>
        ),
      }
    );
  } else {
    columns.push({
      key: 'rdv',
      label: 'Rendez Vous',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>
            {row.rdv ? format(new Date(row.rdv), 'dd/MM/yyyy HH:mm') : ''}
          </span>
        </div>
      ),
    });
  }

  // Add "Actions" column at the end
  columns.push({
    key: 'actions',
    label: 'Actions',
    render: (row) => (
      <div className="flex gap-3 items-center">
        <Link
          href={`/crm/appels/${row.appel_id}`} // Adjust the URL as needed
          className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
          title="Voir détails"
        >
          <Eye className="w-4 h-4" />
        </Link>
        {Number(type.type) == 1 ? (
          <CheckCircle
            className="w-4 h-4 !text-red-500 hover:text-red-700 cursor-pointer"
            title="Traiter Relance"
            onClick={() => handleValider(row.id, 'Relance', row.nomComplet)}
          />
        ) : (
          <CheckCircle
            className="w-4 h-4 !text-green-500 hover:text-green-700 cursor-pointer"
            title="Traiter Rendez Vous"
            onClick={() => handleValider(row.id, 'RDV', row.nomComplet)}
          />
        )}
      </div>
    ),
  });

  {
    /* Dynamic Modals Import */
  }

  //EXPORT

  const data_to_export = () => {
    return data.map((pro) => {
      return {
        cc: pro.traite_appel.user.name + ' ' + pro.traite_appel.user.prenom,

        nomComplet: `${
          pro.traite_appel.appel.prospect.nom +
          ' ' +
          pro.traite_appel.appel.prospect.prenom
        }`.trim(),
        cin: pro.traite_appel.appel.prospect.cin,
        telephone:
          (pro.traite_appel.appel?.prospect.telephone
            ? pro.traite_appel.appel?.prospect.telephone
            : '') +
            (pro.traite_appel.appel.appel?.prospect.telephone &&
            pro.traite_appel.appel.appel?.prospect.telephone_num2 &&
            pro.traite_appel.appel.appel?.prospect.telephone_num2 !== 'null'
              ? ' / ' + pro.traite_appel.appel.appel?.prospect.telephone_num2
              : '') || 'Non spécifié',
        interet: VISITE_INTERETS[pro.traite_appel?.interet]?.label,
        mode_relance: getRelance_label(pro.mode_relance),
        date_relance:
          pro.date_relance != null
            ? format(new Date(pro.date_relance), 'dd/MM/yyyy')
            : null,
        rdv:
          pro.rdv != null
            ? format(new Date(pro.rdv), 'dd/MM/yyyy HH:mm')
            : null,
      };
    });
  };

  const columns_export = [
    { key: 'cc', label: 'Commercial' },
    { key: 'cin', label: 'Cin' },
    { key: 'nomComplet', label: 'Nom Complet' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'interet', label: 'interet' },
    { key: 'mode_relance', label: 'Mode Relance' },
    { key: 'date_relance', label: 'Date Relance' },
    { key: 'rdv', label: 'Rendez Vous' },
  ];
  return (
    <div>
      <div className="py-4">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={
            Number(type.type) == 1
              ? 'relances_appels_exports'
              : 'Rendez-Vous_appels_exports'
          }
          showSearch={false}
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
                  label="Nom Complet"
                  value={tempFilters.nom_prenom}
                  onChange={(e) =>
                    handleFilterChange('nom_prenom', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="Cin"
                  value={tempFilters.cin}
                  onChange={(e) => handleFilterChange('cin', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="number"
                  label="Téléphone"
                  value={tempFilters.telephone}
                  onChange={(e) =>
                    handleFilterChange('telephone', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                {Number(type.type) == 1 ? (
                  <>
                    <Input
                      type="date"
                      label="Date Relance"
                      value={tempFilters.date_relance}
                      onChange={(e) =>
                        handleFilterChange('date_relance', e.target.value)
                      }
                      className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                    />

                    <SelectInput
                      value={tempFilters.mode_relance}
                      onChange={(value) =>
                        handleFilterChange('mode_relance', value)
                      }
                      options={Object.values(MODES_RELANCES).map((data) => ({
                        value: data.code,
                        label: data.label,
                      }))}
                      label="Choisir un Mode Relance"
                      className="h-10 text-sm w-full"
                    />
                  </>
                ) : (
                  <Input
                    type="date"
                    label="Rendez Vous"
                    value={tempFilters.rdv}
                    onChange={(e) => handleFilterChange('rdv', e.target.value)}
                    className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                  />
                )}
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
      {open_dialog_r && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_dialog_r(false)}>
            <Modal_Traite
              type_menu={1} //1appels
              client={client}
              text={text}
              id={ID_rel_rdv}
              onClose={() => setOpen_dialog_r(false)}
            />
          </Modal>
        </>
      )}
    </div>
  );
};
export default RelancesRdvAppelsTable;

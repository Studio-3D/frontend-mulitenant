import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { FaRegEye, FaCheckCircle } from 'react-icons/fa';

import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_projet } from '../../../../../src/configs/api-utils';
import Link from 'next/link';
import { format } from 'date-fns';

import BreadCrumb from '../../navigation/BreadCrumb';
import {
  VISITE_INTERETS,
  getRelance_label,
} from '../../../../../src/configs/enum';

import Modal from '@/components/Modal';
import Modal_Traite from '../../crm/Modal_Traite';

const RelancesRdv_Visites_Table = (type) => {
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
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope

  const entity = {
    API_URL: 'relances_rdv_visites',
    dataKey: 'data',
    searchFields: [],
  };

  useEffect(() => {
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
  }, [accesstoken, currentPage, rowsPerPage, searchTerm]);

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
      if (localStorage.getItem('load_data_rdv_relance_visites') == 1) {
        localStorage.setItem('load_data_rdv_relance_visites', 0);

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
      }
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [accesstoken, currentPage, rowsPerPage, searchTerm]);
  const handleShow = (vId) => {
    router.push(`/crm/visites/${vId}`);
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
        cc: pro.visite.user.name + ' ' + pro.visite.user.prenom,
        nomComplet: `${
          pro.visite.prospect.nom + ' ' + pro.visite.prospect.prenom
        }`.trim(),
        prospect_id: pro.visite.prospect.id,
        cin: pro.visite.prospect.cin,
        telephone:
          (pro.visite?.prospect.telephone
            ? pro.visite?.prospect.telephone
            : '') +
            (pro.visite.appel?.prospect.telephone &&
            pro.visite.appel?.prospect.telephone_num2 &&
            pro.visite.appel?.prospect.telephone_num2 !== 'null'
              ? ' / ' + pro.visite.appel?.prospect.telephone_num2
              : '') || 'Non spécifié',
        interet: pro.visite?.interet,
        bien: pro.visite?.bien,
        mode_relance: pro.mode_relance,
        date_relance: pro.date_relance,
        rdv: pro.rdv,
        visite_id: pro.visite.origin_id,
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
          <Link target="_blank" href={`/crm/prospects/${row?.prospect_id}`}>
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
    {
      key: 'bien',
      label: 'Bien',
      render: (row) => {
        return (
          <Link target="_blank" href={`/biens/${row?.bien.id}`}>
            <strong style={{ fontWeight: 600 }}>
              {row.bien.propriete_dite_bien}
            </strong>
          </Link>
        );
      },
    },
  ];

  // Add conditional columns based on type.type Relance
  if (Number(type.type) === 1) {
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
        <FaRegEye
          className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
          title="Voir détails"
          onClick={() => handleShow(row.visite_id)}
        />
        {Number(type.type) === 1 ? (
          <FaCheckCircle
            className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
            title="Traiter Relance"
            onClick={() => handleValider(row.id, 'Relance', row.nomComplet)}
          />
        ) : (
          <FaCheckCircle
            className="w-4 h-4 text-green-500 hover:text-green-700 cursor-pointer"
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
        cc: pro.visite.user.name + ' ' + pro.visite.user.prenom,
        nomComplet: `${
          pro.visite.prospect.nom + ' ' + pro.visite.prospect.prenom
        }`.trim(),
        cin: pro.visite.prospect.cin,
        telephone:
          (pro.visite?.prospect.telephone
            ? pro.visite?.prospect.telephone
            : '') +
            (pro.visite.appel?.prospect.telephone &&
            pro.visite.appel?.prospect.telephone_num2 &&
            pro.visite.appel?.prospect.telephone_num2 !== 'null'
              ? ' / ' + pro.visite.appel?.prospect.telephone_num2
              : '') || 'Non spécifié',
        interet: VISITE_INTERETS[pro.visite?.interet]?.label,

        bien: pro.visite?.bien.proriete_dite_bien,
        mode_relance: pro.mode_relance,

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
    { key: 'bien', label: 'Bien' },
    { key: 'mode_relance', label: 'Mode Relance' },
    { key: 'date_relance', label: 'Date Relance' },
    { key: 'rdv', label: 'Rendez Vous' },
  ];
  return (
    <div>
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={'#'}
          step={
            Number(type.type) === 1 ? 'Relances Visites' : 'Rendez-Vous Visites'
          }
        />
      </div>
      <div className="reflative">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={
            Number(type.type) === 1
              ? 'relances_visites_exports'
              : 'Rendez-Vous_visites_exports'
          }
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
          enableExport={true}
        />
      </div>

      {open_dialog_r && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_dialog_r(false)}>
            <Modal_Traite
              type_menu={2} //visites
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

export default RelancesRdv_Visites_Table;

'use client';

import React, { useEffect, useState } from 'react';
import Table from '@/components/Table';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { fetchData_table_by_id } from '@/configs/api-utils';
import format from 'date-fns/format';
import DeleteData from '@/components/DeleteData';

import { Eye, Edit, CalendarClock, CheckCircle, Trash2 } from 'lucide-react';

import { APIURL, ENDPOINTS } from '@/configs/api';
import Modal from '@/components/Modal';
import Modal_Show from './Modal_Show';
import Modal_Traite from '../../../crm/Modal_Traite';
import SelectInput from '@/components/SelectInput';

import {
  isAdmin,
  isCommercial,
  isSuperAdmin,
  getTypeAppelLabel,
  VISITE_INTERETS,
  getRelance_label,
  TYPES_APPELS,
} from '../../../../../../src/configs/enum';
import Input from '@/components/Input';

const JournalTable = (id) => {
  const [filters, setFilters] = useState({
    responsable: '',
    type_appel: '',
    date: '',
    interet: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });

  const [selectedId, setSelectedId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [jornaux, setJournaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /****appels tables */
  const [open_dialog, setOpen_Dialog] = useState(false);
  const [text, setText] = useState(' ');
  const [ID_rel_rdv, setID_rel_rdv] = useState(0);
  /*detail*/
  const [interet, setInteret] = useState('');
  const [date, setDate] = useState('');
  const [type_appel, set_type_appel] = useState('');
  const [responsable, setResponsable] = useState('');

  //show traitement
  const [tranche, setTranche] = useState(null);
  const [bloc, setBloc] = useState(null);
  const [immeuble, setImmeuble] = useState(null);
  const [types_biens, set_types_biens] = useState([]);
  const [orientation, setOrientation] = useState(null);
  const [etage, setEtage] = useState(null);
  const [rdv, setRdv] = useState(null);
  const [date_relance, setDate_relance] = useState(null);
  const [mode_relance, setMode_relane] = useState(null);
  const [frein_tranches, setFreinsTranches] = useState([]);
  const [frein_typologies, setFreinsTypologies] = useState([]);
  const [frein_vues, setFreinsVues] = useState([]);
  const [frein_etages, setFreinsEtages] = useState([]);
  const [frein_orientations, setFreinsOrientations] = useState([]);
  const [frein_prix_min, setFreinsPrixMin] = useState(null);
  const [frein_prix_max, setFreinsPrixMax] = useState(null);
  const [frein_superficie_min, setFreinsSuperficieMin] = useState(null);
  const [frein_superficie_max, setFreinsSuperficieMax] = useState(null);
  const [frein_avance, setFreinsAvance] = useState(null);
  const [commentaire, setCommentaire] = useState(null);
  const [commentaire_rel, setCommentaire_rel] = useState(null);
  const [open_dialog_r, setOpen_dialog_r] = useState(false);

  const { user, token } = useAuth();
  const accesstoken = token || localStorage.getItem('accessToken');

  const router = useRouter();
  // Declare the entity object in the component scope
  const entity = {
    id: JSON.stringify(id.id),
    API_URL: 'index_traitement_appel',
    dataKey: 'data',
    searchFields: ['nomCC', 'date'],
  };

  useEffect(() => {
    fetchData_table_by_id(
      entity,
      filters,
      searchTerm,
      currentPage,
      rowsPerPage,
      accesstoken,
      setLoading,
      setError,
      setJournaux,
      setTotalRows
    );
  }, [accesstoken, currentPage, rowsPerPage, searchTerm, filters]);

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
      if (localStorage.getItem('load_data_journaux') == 1) {
        localStorage.setItem('load_data_journaux', 0);

        fetchData_table_by_id(
          entity,
          searchTerm,
          currentPage,
          rowsPerPage,
          accesstoken,
          setLoading,
          setError,
          setJournaux,
          setTotalRows
        );
      }
    }, 1000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, [accesstoken, currentPage, rowsPerPage, searchTerm]);

  const handleValider = (Id, text) => {
    console.log('le text ==>' + text);
    setOpen_dialog_r(true);
    setText(text);
    setID_rel_rdv(Id);
  };

  const handleShow = (
    date,
    interet,
    type_appel,
    responsable,
    tranche,
    bloc,
    immeuble,
    types_bien,
    orientation,
    etage,
    rdv,
    date_relance,
    mode_relance,
    frein,
    comment,
    comment_rel
  ) => {
    setInteret(interet);
    setDate(date);
    set_type_appel(type_appel == 1 ? 'Entrant' : 'Sortant');
    setResponsable(responsable);
    setTranche(tranche);
    setBloc(bloc);
    setImmeuble(immeuble);
    set_types_biens(types_bien);
    setOrientation(orientation);
    setEtage(etage);
    setRdv(rdv);
    setMode_relane(mode_relance);
    setDate_relance(date_relance);
    {
      frein?.frein_tranche.length > 0 && setFreinsTranches(frein.frein_tranche);
    }
    {
      frein?.frein_etage.length > 0 && setFreinsEtages(frein.frein_etage);
    }
    {
      frein?.frein_orientation.length > 0 &&
        setFreinsOrientations(frein.frein_orientation);
    }
    {
      frein?.frein_typologie.length > 0 &&
        setFreinsTypologies(frein.frein_typologie);
    }
    {
      frein?.frein_vue.length > 0 && setFreinsVues(frein.frein_vue);
    }
    {
      frein?.prix_min != null && setFreinsPrixMin(frein?.prix_min);
      frein?.prix_max != null && setFreinsPrixMax(frein?.prix_max);
    }
    {
      frein?.superficie_min != null && setFreinsSuperficieMin(frein?.prix_min);
      frein?.superficie_max != null && setFreinsSuperficieMax(frein?.prix_max);
    }
    {
      frein?.avance != 0 &&
        frein?.avance != null &&
        setFreinsAvance(frein?.avance);
    }
    setCommentaire(comment);
    setCommentaire_rel(comment_rel);
    setOpen_Dialog(true);
  };

  // Format users data for table display
  const formatData = () => {
    return jornaux.map((pro) => ({
      id: pro.id,
      nomcc: `${pro.user.name || ''} ${pro.user.prenom || ''}`.trim(),
      date: pro.date,
      type_appel: pro.type_appel,
      interet: pro.interet,
      tranche_nom: pro.tranche?.nom,
      bloc_nom: pro.bloc?.nom,
      immeuble_nom: pro.immeuble?.nom,
      type_biens: pro.type_biens,
      orientation: pro.orientation,
      etage: pro.etage,
      rdv: pro.rdv?.rdv,
      date_relance: pro.relance?.date_relance,
      mode_relance: pro.relance?.mode_relance,
      frein: pro.frein,
      commentaire: pro.commentaire,
      commentaire_rel: pro.relance?.commentaire,
      commentaire_rdv: pro.rdv?.commentaire,
      relance: pro.relance,
      rdv: pro.rdv,
      user: pro.user,
    }));
  };
  function handleEdit(appelId) {
    // Navigate to /utilisateurs?id={id}&action=edit
    router.push(`${ENDPOINTS.APPELS}?id=${appelId}&action=edit`);
  }

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
  const getAppelBadge = (type_appel) => {
    let color = null;
    if (type_appel == 1) {
      color = 'bg-green-100 text-green-800';
    } else {
      color = 'bg-red-100 text-red-800';
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {getTypeAppelLabel(type_appel)}
      </span>
    );
  };
  // Table columns configuration
  const columns = [
    {
      key: '',
      label: 'Date ',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span>
            {row.date ? format(new Date(row.date), 'dd/MM/yyyy ') : ''}
          </span>
        </div>
      ),
    },
    { key: 'nomcc', label: 'Responsable' },

    {
      key: 'type_appel',
      label: 'Type Appel',
      render: (row) => {
        return getAppelBadge(row.type_appel);
      },
    },
    {
      key: 'interet',
      label: 'Intéret',
      render: (row) => {
        return getInteretBadge(row.interet);
      },
    },

    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-3 items-center">
          <Edit
            className="w-4 h-4 text-yellow-500 hover:text-yellow-700 cursor-pointer"
            title="Modifier"
            onClick={() => handleEdit(row.id)}
          />
          {VISITE_INTERETS[row.interet]?.label != 'Injoignable' && (
            <Eye
              className="w-4 h-4 text-blue-500 hover:text-blue-700 cursor-pointer"
              title="Voir détails"
              onClick={() =>
                handleShow(
                  row.date,
                  row.interet,
                  row.type_appel,
                  row.nomcc,
                  row.tranche_nom,
                  row.bloc_nom,
                  row.immeuble_nom,
                  row.type_biens,
                  row.orientation,
                  row.etage,
                  row.rdv?.rdv,
                  row.relance?.date_relance,
                  row.relance?.mode_relance,
                  row.frein,
                  row.commentaire,
                  row.commentaire_rel,
                  row.commentaire_rdv
                )
              }
            />
          )}
          {row.relance != null &&
            row.relance.type_traitement == 0 &&
            row.relance.deleted_at == null &&
            row.user?.user_id_origin == user.id && (
              <CheckCircle
                className="w-4 h-4 text-green-500 hover:text-green-700 cursor-pointer"
                title="Traiter Relance"
                onClick={() => handleValider(row.relance?.id, 'Relance')}
              />
            )}
          {row.rdv != null &&
            row.rdv.type_traitement == 0 &&
            row.rdv.deleted_at == null &&
            row.user?.user_id_origin == user.id && (
              <CalendarClock
                className="w-4 h-4 text-orange-500 hover:text-orange-700 cursor-pointer"
                title="Traiter Rendez Vous"
                onClick={() => handleValider(row.rdv?.id, 'RDV')}
              />
            )}

          <Trash2
            className="w-4 h-4 text-red-500 hover:text-red-700 cursor-pointer"
            onClick={() => {
              setSelectedId(row.id);
              setShowDeleteModal(true);
            }}
            title="Supprimer appel"
          />
        </div>
      ),
    },
  ];

  {
    /* Dynamic Modals Import */
  }

  //EXPORT
  const data_to_export = () => {
    return jornaux.map((pro) => ({
      id: pro.id,
      nomcc: `${pro.user.name || ''} ${pro.user.prenom || ''}`.trim(),
      date: pro.date ? format(new Date(pro.date), 'dd/MM/yyyy ') : '',
      type_appel: getTypeAppelLabel(pro.type_appel),
      interet: VISITE_INTERETS[pro.interet]?.label,
    }));
  };

  const columns_export = [
    { key: 'date', label: 'Date' },
    { key: 'nomcc', label: 'Responsable' },
    { key: 'type_appel', label: 'Type Appel' },
    { key: 'interet', label: 'Intéret' },
  ];
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const applyFilters = () => {
    setFilters(tempFilters);
  };
  const resetFilters = () => {
    const reset = {
      responsable: '',
      type_appel: '',
      date: '',
      interet: '',
    };
    setFilters(reset);
    setTempFilters(reset);
  };
  return (
    <>
      <div className="reflative">
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'journal_appels_export'}
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
          addLink={
            isSuperAdmin(user.role) ||
            isAdmin(user.role) ||
            isCommercial(user.role)
              ? `${ENDPOINTS.APPELS}?action=add`
              : undefined
          }
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                {/* Champs de recherche */}
                <Input
                  type="date"
                  placeholder="Date"
                  value={tempFilters.date}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <input
                  type={tempFilters.date ? 'date' : 'text'}
                  placeholder="Date"
                  value={tempFilters.date}
                  onFocus={(e) => (e.target.type = 'date')}
                  onChange={(e) =>
                    handleFilterChange('date_traitement', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  placeholder="Responsable"
                  value={tempFilters.responsable}
                  onChange={(e) =>
                    handleFilterChange('responsable', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <SelectInput
                  value={tempFilters.interet}
                  onChange={(value) => handleFilterChange('interet', value)}
                  options={Object.values(VISITE_INTERETS).map((data) => ({
                    value: data.code,
                    label: data.label,
                  }))}
                  placeholder="Choisir un Intéret"
                  className="h-10 text-sm w-full"
                />

                <SelectInput
                  value={tempFilters.type_appel}
                  onChange={(value) => handleFilterChange('type_appel', value)}
                  options={Object.values(TYPES_APPELS).map((data) => ({
                    value: data.code,
                    label: data.label,
                  }))}
                  placeholder="Choisir un Type Appel"
                  className="h-10 text-sm w-full"
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
      {open_dialog && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_Dialog(false)}>
            <Modal_Show
              date={date}
              type_appel={type_appel}
              responsable={responsable}
              interet={interet}
              tranche={tranche}
              bloc={bloc}
              immeuble={immeuble}
              type_biens={types_biens}
              etage={etage}
              orientation={orientation}
              rdv={rdv}
              mode_relance={getRelance_label(mode_relance)}
              date_relance={date_relance}
              frein_tranches={frein_tranches}
              frein_etages={frein_etages}
              frein_orientations={frein_orientations}
              frein_typologies={frein_typologies}
              frein_vues={frein_vues}
              frein_prix_min={frein_prix_min}
              frein_prix_max={frein_prix_max}
              frein_superficie_min={frein_superficie_min}
              frein_superficie_max={frein_superficie_max}
              frein_avance={frein_avance}
              commentaire={commentaire}
              commentaire_rel={commentaire_rel}
              onClose={() => setOpen_Dialog(false)}
            />
          </Modal>
        </>
      )}
      {open_dialog_r && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_dialog_r(false)}>
            <Modal_Traite
              text={text}
              id={ID_rel_rdv}
              onClose={() => setOpen_dialog_r(false)}
            />
          </Modal>
        </>
      )}

      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            number={1}
            route={APIURL.T_APPELS}
            Id={selectedId}
            message={'Etes-vous sûr de vouloir supprimer cette Appel ?'}
            accessToken={accesstoken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData_table_by_id(
                entity,
                searchTerm,
                currentPage,
                rowsPerPage,
                accesstoken,
                setLoading,
                setError,
                setJournaux,
                setTotalRows
              );
            }}
          />
        </Modal>
      )}
    </>
  );
};

export default JournalTable;

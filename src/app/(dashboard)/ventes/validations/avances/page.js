'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { Euro, ThumbsUp, Eye } from 'lucide-react';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import { useAuth } from '../../../../../context/AuthContext';
import { APIURL, ENDPOINTS } from '../../../../../configs/api';
import { useRouter } from 'next/navigation';
import { formatDate } from '../../../../../utils/dateUtils';
import {
  isAdmin,
  isAgentAdministratif,
  isCommercial,
  isComptable,
  isRespoCommercial,
  isSuperAdmin,
} from '../../../../../configs/enum';
import { fetchData_table_by_id } from '../../../../../configs/api-utils';
import Link from 'next/link';
import { MODE_PAIEMENT, Avance_Statut } from '../../../../../configs/enum';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import LoadingSpin from '@/components/LoadingSpin';
import Input from '@/components/Input';
import DateRangePicker from '@/components/DateRangePicker';
import SelectInput from '@/components/SelectInput';
import Button from '@/components/Button';

import { useProjet } from '@/context/ProjetContext';
const PageTraitement_Validation_rejets_av_or_echeance = () => {
  const [etat_av, setEtatAv] = useState(null);

  useEffect(() => {
    const storedEtatAv = localStorage.getItem('etat_av');
    if (storedEtatAv !== null) {
      setEtatAv(storedEtatAv);
    }
  }, []);
  const { user, token } = useAuth();
  const userRole = user?.role;
  const accessToken =
    token ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('accessToken')
      : null);

  const [loading, setLoading] = useState({
    table: false,
    form: false,
  });

  const [error, setError] = useState('');
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [data, setData] = useState([]);
  const { selectedProjet } = useProjet();

  // Validation/Rejection dialog states
  const [open_v_r, setOpen_v_r] = useState(false);
  const [ID, setID] = useState(0);
  const [num_recu, set_num_recu] = useState(0);
  const [Commentaire_r, setCommentaire_r] = useState('');
  const [type_action, set_type_action] = useState(null);
  const [action, setAction] = useState('');
  const [date_encaissement_v, set_date_encaissement_v] = useState('');
  const [num_remise_v, set_num_remise_v] = useState(null);
  const [txt_rejete, set_txt_rejete] = useState(null);
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({
    cc: '',
    numero_paiement: '',
    date_start: '',
    date_end: '',
    montant: '',
    mode_paiement: '',
  });
  const [tempFilters, setTempFilters] = useState({ ...filters });
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
  const handleFilterChange = (field, value) => {
    setTempFilters((prev) => ({ ...prev, [field]: value }));
  };
  const idd =
    etat_av == 99
      ? `${selectedProjet?.id}`
      : `${selectedProjet?.id}/${etat_av}`;
  const API_URLL = etat_av == 99 ? 'get_echeances' : 'avances_by_etat';

  const entity = {
    id: idd,
    API_URL: API_URLL,
    dataKey: 'data',
    searchFields: [''],
  };

  useEffect(() => {
    if (etat_av === null) return; // Don't fetch until etat_av is set
    fetchData_table_by_id(
      entity,
      filters,
      null,
      currentPage,
      rowsPerPage,
      accessToken,
      setLoading,
      setError,
      setData,
      setTotalRows
    );
  }, [
    accessToken,
    currentPage,
    rowsPerPage,
    null,
    filters,
    etat_av,
    selectedProjet?.id,
  ]);
  const router = useRouter();
        useEffect(() => {
          if (
            !isAdmin(userRole) &&
            !isSuperAdmin(userRole) &&
            !isCommercial(userRole) &&
            !isComptable(userRole)&&
            !isRespoCommercial(userRole)&&
            !isAgentAdministratif(userRole)
          ) {
            router.push('/');
          }
        }, [router]);
        
  const handle_valider_rejete = (Id, n_recu, number, text) => {
    setOpen_v_r(!open_v_r);
    setAction('')
    setID(Id);
    set_num_recu(n_recu);
    set_type_action(text);
    if (number == 1) {
      setAction('1');
    }
  };

  const onSubmit_valider_rejete = async (e) => {
    setLoading({ form: true });
    e.preventDefault();
    try {
      const commentaire = Commentaire_r;
      const date_encaiss = date_encaissement_v;
      const n_remise = num_remise_v;
      const etat = action;

      await axios.put(
        `${APIURL.ROOTV1}/traiter_avance/${ID}`,
        { commentaire, date_encaiss, n_remise, etat },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast.success('Avance traitée avec succès');
      setCommentaire_r(null);
      set_date_encaissement_v(null);
      set_num_remise_v(null);
      fetchData_table_by_id(
        entity,
        {},
        null,
        currentPage,
        rowsPerPage,
        accessToken,
        setLoading,
        setError,
        setData,
        setTotalRows
      );
      setOpen_v_r(false);
      setLoading({ form: false });
    } catch (error) {
      console.error('Error processing avance:', error);
      toast.error('Erreur lors du traitement');
    }
  };

  const handle_show_comment_rejete = (msg_rejete, num_recu) => {
    set_txt_rejete(
      'Avance :' + num_recu + ' est rejeté en raison de ' + msg_rejete
    );
    setOpen(true);
  };

  const formatData = () => {
    return data.map((av) => ({
      id: av.id,
      sr: av.sr == 0 ? av.num_recu : 'SR',
      date_reglement: av.date_reglement ? formatDate(av.date_reglement) : 'N/A',
      respo: `${av.user.name} ${av.user.prenom || ''}`.trim(),
      montant: av.montant.toLocaleString() + ' DH',
      mode_pai: av.mode_paiement,
      banque: av.banque?.nom || null,
      numero_paiement: av.numero_paiement,
      echeance: av.echeance ? formatDate(av.echeance) : null,
      statut: av.last_statut?.statut || av.statut,
       statut_t:  av.statut,
      num_remise: av.last_statut?.num_remise || null,
      date_encaissement: av.last_statut?.date_encaissement
        ? formatDate(av.last_statut.date_encaissement)
        : null,
      commentaireAvance: av.commentaireAvance,
      commenataire_rejete: av.commenataire_rejete,
      recu_scanne: av.recu_scanne,
      number: av.number,
      avance: av,
      piece_jointe: av.piece_jointe,
      dossier_id_transfert: av.dossier_id_transfert,
      historiques_count: av.historiques_count,
      reservation_id: av.reservation_id,
      code_reservation: av.reservation?.code_reservation,
      last_statut: av.last_statut,
    }));
  };

  const columns = [
    { key: 'sr', label: 'N° Reçu' },
    { key: 'date_reglement', label: 'Date' },
    {
      key: 'code_reservation',
      label: 'Code Réservation',
      render: (row) => (
        <Link
          href={`/ventes/reservations/${row.reservation_id}`}
          target="_blank"
          className="text-blue-500 hover:text-blue-800"
        >
          {row.code_reservation}
        </Link>
      ),
    },
    { key: 'montant', label: 'Montant' },
    {
      key: 'mode_pai',
      label: 'Mode Paiement',
      render: (row) => {
        if (!row.mode_pai) return null;
        return (
          <span
            className={`px-2 py-1 rounded text-sm font-semibold ${
              {
                1: 'bg-purple-100 text-purple-500',
                2: 'bg-blue-100 text-blue-500',
                3: 'bg-indigo-100 text-indigo-500',
                4: 'bg-teal-100 text-teal-500',
                5: 'bg-green-100 text-green-500',
                6: 'bg-amber-100 text-amber-500',
                7: 'bg-gray-100 text-gray-500',
              }[row.mode_pai] || 'bg-gray-100 text-gray-500'
            }`}
          >
            {MODE_PAIEMENT[row.mode_pai]?.label || 'Unknown'}
          </span>
        );
      },
    },
    { key: 'banque', label: 'Banque' },
    { key: 'numero_paiement', label: 'Num paiement' },
    { key: 'echeance', label: 'Echéance' },

    ...(etat_av != 99
      ? [
          {
            key: 'actions',
            label: 'Actions',
            render: (row) => {
              const isAdminOrSuperAdmin =
                (isAdmin(userRole) || isSuperAdmin(userRole)|| isComptable(userRole)|| isAgentAdministratif(userRole)) &&
                (etat_av == 2 || etat_av == 3);

              return (
                <div className="flex gap-3 items-center">
                  {/* Validation/Encashment Buttons */}
                 
                  {isAdminOrSuperAdmin && (
                    <>
                       {(row.last_statut == null || row.statut_t=="3" )&& (
                        <button
                          className="p-1 text-green-500 hover:text-green-700"
                          onClick={() =>
                            handle_valider_rejete(
                              row.id,
                              row.sr,
                              0,
                              'validation'
                            )
                          }
                          title="Valider le paiement"
                        >
                          <ThumbsUp className="w-5 h-5" />
                        </button>
                      )}
                  

                      {Number(row.mode_pai) != 7 &&
                        parseFloat(row.montant) > 0 &&
                        Number(row.statut) == 1 &&
                        (row.date_encaissement == null ||
                          row.num_remise == null) && (
                          <button
                            className="p-1 text-blue-500 hover:text-blue-700"
                            onClick={() =>
                              handle_valider_rejete(
                                row.id,
                                row.sr,
                                1,
                                'encaissement'
                              )
                            }
                            title="Ajouter encaissement"
                          >
                            <Euro className="w-5 h-5" />
                          </button>
                        )}
                      {Number(row.statut) == 2 && (
                        <button
                          className="p-1 text-red-500 hover:text-red-700"
                          onClick={() =>
                            handle_show_comment_rejete(
                              row.last_statut?.commentaire,
                              row.sr
                            )
                          }
                          title="Voir le motif de rejet"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      )}
                    </>
                  )}

                  {/* Show Rejection Reason */}
                </div>
              );
            },
          },
        ]
      : []),
  ];

  const data_to_export = () => {
    return data.map((item) => {
      // Extraire les noms des acquéreurs et les séparer par "/"
      const acquereursNames = item?.reservation.aquereurs
        ? item.reservation.aquereurs
            .map((acq) => acq.client?.nom + ' ' + acq.client?.prenom || '')
            .join(' / ') // Sépare les noms par "/"
        : '';

      const acquereursCin = item?.reservation.aquereurs
        ? item.reservation.aquereurs
            .map((acq) => acq.client?.cin || '')
            .join(' / ') // Sépare les noms par "/"
        : '';

      const acquereursTele = item?.reservation.aquereurs
        ? item.reservation.aquereurs
            .map((acq) => acq.client?.telephone_num1 || '')
            .join(' / ') // Sépare les noms par "/"
        : '';

      return {
        num_recu: item?.sr == 0 ? item?.num_recu : 'SR',
        date_reg: formatDate(item.date_reglement),
        cc: item.user.name + ' ' + item.user.prenom || '',
        bien: item.reservation.bien.propriete_dite_bien || '',
        prix: item.reservation.prix || '',
        avance: item.montant.toLocaleString() + ' DH',
        mode_paiement: MODE_PAIEMENT[item.mode_paiement]?.label,
        banque: item?.banque?.nom || '',
        num_pai: item.numero_paiement || '',
        echeance: item.echeance != null ? formatDate(item.echeance) : null,
        date_enc: item?.last_statut?.date_encaissement
          ? formatDate(item.last_statut.date_encaissement)
          : null,
        statut:
          item.statut == 1 &&
          (item.last_statut?.date_encaissement == null ||
            item.last_statut?.num_remise == null)
            ? "Validé En Attente d'Encaissement"
            : Avance_Statut[item.statut]?.label,
        num_rem: item?.last_statut?.num_remise,
        code_res: item.reservation.code_reservation || '',
        date_res: item.reservation.date_reservation
          ? formatDate(item.reservation.date_reservation)
          : '',
        aq_names: acquereursNames || '',
        aq_cin: acquereursCin || '',
        aq_tele: acquereursTele || '',
      };
    });
  };

  const columns_export = [
    { key: 'num_recu', label: 'N° recu' },
    { key: 'date_reg', label: 'Date réglement' },
    { key: 'cc', label: 'Responsable' },
    { key: 'bien', label: 'Bien' },
    { key: 'prix', label: 'Prix de vente' },
    { key: 'avance', label: 'Avance' },
    { key: 'mode_paiement', label: 'Mode paiement' },
    { key: 'banque', label: 'Banque' },
    { key: 'num_pai', label: 'Num paiement' },
    { key: 'echeance', label: 'Echéance' },
    { key: 'statut', label: 'Etat' },
    { key: 'num_rem', label: 'N° Remise' },
    { key: 'date_enc', label: 'Date Encaiss' },
    { key: 'code_res', label: 'Code reservation' },
    { key: 'aq_names', label: 'Nom client' },
    { key: 'aq_cin', label: 'Cin client' },
    { key: 'aq_tele', label: 'Tele client' },
  ];
  if (etat_av === null) {
    return <LoadingSpin />;
  }

  return (
    <>
      <div className="relative p-4">
        {/* Filter Section */}
        <p className="text-lg font-semibold mb-4">
          {etat_av == 3
            ? 'Avances En attentes '
            : etat_av == 1
            ? 'Avances Validés'
            : etat_av == 2
            ? 'Avances Rejetés'
            : etat_av == 99
            ? 'Echéances'
            : null}
        </p>

        {/* Main Table */}
        <Table
          data_to_export={data_to_export()}
          columns_export={columns_export}
          name_file_export={'paiments_export'}
          columns={columns}
          data={formatData()}
          totalRows={totalRows}
          loading={loading}
          error={error}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={setRowsPerPage}
          enableExport={true}
          showSearch={false}
          filterComponent={
            <div className="space-y-4 p-4 rounded-lg ">
              <div
                className="grid gap-5"
                style={{
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                }}
              >
                <Input
                  type="text"
                  label="N° Paiement"
                  value={tempFilters.numero_paiement}
                  onChange={(e) =>
                    handleFilterChange('numero_paiement', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />

                <Input
                  type="text"
                  label="Montant"
                  value={tempFilters.montant}
                  onChange={(e) =>
                    handleFilterChange('montant', e.target.value)
                  }
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <Input
                  type="text"
                  label="Responsable"
                  value={tempFilters.cc}
                  onChange={(e) => handleFilterChange('cc', e.target.value)}
                  className="h-10 px-3 py-2 rounded-md border border-gray-300 w-full text-sm"
                />
                <SelectInput
                  value={tempFilters.mode_paiement}
                  onChange={(value) =>
                    handleFilterChange('mode_paiement', value)
                  }
                  options={Object.values(MODE_PAIEMENT).map((data) => ({
                    value: data.code,
                    label: data.label,
                  }))}
                  label="Mode paiement"
                  className="h-10 text-sm w-full"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <DateRangePicker
                  startName="date_start"
                  endName="date_end"
                  startValue={tempFilters.date_start}
                  endValue={tempFilters.date_end}
                  onChange={handleFilterChange}
                  placeholder="Choisir une Date"
                  label="Date"
                />
              </div>
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

        {/* Validation/Rejection Dialog */}
        {open_v_r && (
          <Modal isVisible={open_v_r} onClose={() => setOpen_v_r(false)}>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-0 rounded-lg max-w-md w-full">
                <div
                  style={{
                    backgroundColor: process.env.NEXT_PUBLIC_COLOR_Header_Modal,
                  }}
                  className=" text-white p-4 rounded-t-lg mb-3"
                >
                  <h3 className="text-lg font-bold">
                    {type_action == 'validation'
                      ? 'Traiter un Avance'
                      : 'Encaissement'}
                  </h3>
                </div>

                <form onSubmit={onSubmit_valider_rejete}>
                  <div className="space-y-4 mb-6 ml-3 mr-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        N° Reçu:
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        value={num_recu}
                        disabled
                      />
                    </div>

                    {type_action == 'validation' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Statut: <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          value={action}
                          onChange={(e) => setAction(e.target.value)}
                          required
                        >
                          <option value="">Sélectionner</option>
                          <option value="1">Valider</option>
                          <option value="2">Rejeter</option>
                        </select>
                      </div>
                    )}

                    {action == '1' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            N° Remise: 
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={num_remise_v || ''}
                            onChange={(e) => set_num_remise_v(e.target.value)}
                            
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Date encaissement:{' '}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={date_encaissement_v || ''}
                            onChange={(e) =>
                              set_date_encaissement_v(e.target.value)
                            }
                            required
                          />
                        </div>
                      </>
                    )}

                    {action == '2' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Commentaire: <span className="text-red-500">*</span>
                        </label>
                        
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows={3}
                          value={Commentaire_r || ''}  // Use empty string instead of null
                          onChange={(e) => setCommentaire_r(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-4  mr-2 mb-2">
                    <Button type="" onClick={() => setOpen_v_r(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" loading={loading.form}>
                      Enregistrer
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </Modal>
        )}

        {/* Rejection Reason Dialog */}
        {open && (
          <Modal isVisible={open} onClose={() => setOpen(false)}>
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Motif de rejet</h3>
              <p className="text-gray-700">{txt_rejete}</p>
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  onClick={() => setOpen(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default PageTraitement_Validation_rejets_av_or_echeance;

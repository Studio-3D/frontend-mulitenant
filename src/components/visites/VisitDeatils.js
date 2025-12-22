'use client';

import React, { useState } from 'react';
import { VisitCard } from './VisitCard';
import { VisitTimeline } from './VisitTimeline';
import { useAuth } from '../../context/AuthContext';
import Modal from '@/components/Modal';
import DeleteWarningModal from '@/components/visites/DeleteWarningModal';
import DeleteData from '@/components/DeleteData';
import { APIURL, ENDPOINTS } from '../../configs/api';
import Button from '@/components/Button'; // adjust the path as needed

import {
  UserIcon,
  TagIcon,
  AlertCircleIcon,
  MessageSquareIcon,
  PhoneCallIcon,
  CalendarIcon,
  HomeIcon,
  BadgeCheckIcon,
  EyeIcon,
  LayersIcon,
  AlignVerticalSpaceAroundIcon,
  CompassIcon,
  BadgeDollarSignIcon,
  AreaChartIcon,
  ImageIcon,
  WalletIcon,
  FileTextIcon,
  DownloadIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from 'lucide-react';
import format from 'date-fns/format';
import {
  VISITE_INTERETS,
  VISITE_STATUT,
  getRelance_label,
} from '../../../src/configs/enum';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Document from '../../../src/app/(dashboard)/crm/pre-reservations/bon_pre_reservation';
import { useRouter } from 'next/navigation';
import Modal_Historique_rel_rdv from './Modal_Historique_rel_rdv';
import Modal_Historique from './Modal_Historique';
import axios from 'axios';
import Modal_Traite from '../../../src/app/(dashboard)/crm/Modal_Traite';
import useClear_visite_cadre from '@/app/(dashboard)/crm/hook/useClear_visite_cadre';
export function VisitDetails({
  visites_all_show,
  visites_all,
  origin_id,
  last_related_id,
}) {
  //when reload remove item v_id_cadre
  useClear_visite_cadre();
  const cadre_selected = `${localStorage.getItem('v_id_cadre')}`;

  const router = useRouter();
  const [openH, setOpenH] = useState(false);
  const [open_rel, setOpen_rel] = useState(false);
  const [activeVisit, setActiveVisit] = useState(
    cadre_selected != 'null'
      ? cadre_selected
      : visites_all_show?.[0]?.related_show_id
  );
  const [rows_histo_rel_rdv, setrowsHisto_rel_rdv] = useState([]);
  const [loading_h_rel, setLoading_h_rel] = useState(true); // Add a loading state

  const [showDeleteModal, setShowDeleteModal] = useState(true);
  const [text_route, setText_route] = useState(true);

  const { user, token } = useAuth();
  const user_id = user?.id;
  const [show_btn_relance, setShow_btn_rel] = useState(true);
  const [show_btn_rdv, setShow_btn_rdv] = useState(true);
  const accessToken = token || localStorage.getItem('accessToken');
  const [open_D_M_warning, setOpen_D_M_warning] = useState(true);
  const [message_delete_warning, setMessage_delete_warning] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [rows, setrows] = useState([]);
  const [loading_histo, setLoading_histo] = useState(true); // Add a loading state
  const [open_dialog_r, setOpen_dialog_r] = useState(false);
  const [text, setText] = useState(' ');
  const [ID_rel_rdv, setID_rel_rdv] = useState(0);

  const handleValider = (Id, text) => {
    setOpen_dialog_r(!open_dialog_r);
    setText(text);
    setID_rel_rdv(Id);
  };

  // ✅ Get current visit's order
  const currentVisitIndex = visites_all_show.findIndex(
    (v) => v.related_show_id == activeVisit
  );
  function toTitleCase(str) {
    var lcStr = str.replace(/_/g, ' ').toLowerCase();

    return lcStr.replace(/(?:^|\s_)\w/g, function (match) {
      return match.toUpperCase();
    });
  }

  const currentVisitOrder =
    currentVisitIndex !== -1
      ? visites_all_show.length - currentVisitIndex
      : null;

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
  const getStatutBadge = (statut) => {
    const statut_info = VISITE_STATUT[statut];
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statut_info?.color}`}
      >
        {statut_info?.label}
      </span>
    );
  };
  const handleView_Reservation = (reservationId) => {
    window.open(`/ventes/reservations/${reservationId}`, '_blank');
  };

  const handleDelete = async (vId, text) => {
    setSelectedId(vId);
    setText_route(text);
    setShowDeleteModal(true);
  };

  const handleEdit = (vId) => {
    router.push(`${ENDPOINTS.VISITES}?id=${vId}&action=edit`);
  };

  const handleView_Histo_rel_rdv = async () => {
    fetch_histo_relance_rdv();
    setOpen_rel(!open_rel);
  };
  //apres traitement relance/rdv

  const fetch_histo_relance_rdv = async () => {
    if (origin_id) {
      setLoading_h_rel(true);
      axios
        .get(`${APIURL.ROOTV1}/relance_rdv_by_visite/${origin_id}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setrowsHisto_rel_rdv([]);

          for (var i = 0; i <= Number(response.data.histo.length) - 1; i++) {
            let etape = null;
            if (response.data.histo[i].description.includes('CREATION')) {
              etape = response.data.histo[i].description.replace(
                'CREATION',
                ''
              );
            } else {
              etape = response.data.histo[i].description.replace(
                'MODIFICATION',
                ''
              );
            }

            //histo relance rdv
            if (response.data.histo[i].historique_relances_rdvs.length > 0) {
              for (
                var p = 0;
                p <=
                Number(response.data.histo[i].historique_relances_rdvs.length) -
                  1;
                p++
              ) {
                let res = response.data.histo[i].historique_relances_rdvs[p];
                let type = ' ';
                if (res.type == 1) {
                  type = 'Relance';
                } else {
                  type = 'Rdv';
                }
                let mode_rel = '';
                if (res.mode_relance == 1) {
                  mode_rel = 'Sms';
                } else if (res.mode_relance == 2) {
                  mode_rel = 'Appel';
                } else if (res.mode_relance == 3) {
                  mode_rel = 'Email';
                }
                let user_traite = '';
                let date_traite = ' ';
                if (res.type_traitement != 0) {
                  user_traite =
                    res.user_traite.name + ' ' + res.user_traite.name;
                  if (res.date_traitement != null) {
                    date_traite = format(
                      new Date(res.date_traitement),
                      'dd/MM/yyyy kk:mm'
                    );
                  }
                }
                let type_traite = ' ';
                if (res.type_traitement == 0) {
                  type_traite = 'En Attente';
                } else if (res.type_traitement == 1) {
                  type_traite = 'Manuelle';
                } else if (res.type_traitement == 2) {
                  type_traite = 'Automatique';
                } else if (res.type_traitement == 3) {
                  if (type == 'Relance') {
                    type_traite = 'Nouvelle relance manuelle';
                  } else {
                    type_traite = 'Nouveau rdv manuel';
                  }
                }
                let etape_new = null;
                if (type_traite == 'Automatique') {
                  var arr = etape.split(' ');
                  etape_new = 'visite ' + (parseFloat(arr[2]) + 1);
                } else {
                  etape_new = etape;
                }

                setrowsHisto_rel_rdv((rows_histo_rel_rdv) => [
                  ...rows_histo_rel_rdv,
                  createData_histo_rel_rdv(
                    toTitleCase(etape_new),
                    type,
                    format(new Date(res.date_relance), 'dd/MM/yyyy'),
                    mode_rel,
                    format(new Date(res.rdv), 'dd/MM/yyyy kk:mm'),
                    res.commentaire,
                    type_traite,
                    date_traite,
                    res.user.name + ' ' + res.user.prenom,
                    user_traite
                  ),
                ]);

                if (type_traite != 'En Attente') {
                  setrowsHisto_rel_rdv((rows_histo_rel_rdv) => [
                    ...rows_histo_rel_rdv,
                    createData_histo_rel_rdv(
                      toTitleCase(etape),
                      type,
                      format(new Date(res.date_relance), 'dd/MM/yyyy'),
                      mode_rel,
                      format(new Date(res.rdv), 'dd/MM/yyyy kk:mm'),
                      '',
                      'Ancien ' + type,
                      '',
                      res.user.name + ' ' + res.user.prenom,
                      ''
                    ),
                  ]);
                }
              }
            }
          }
          setLoading_h_rel(false);
        })
        .catch((error) => {
          setLoading_h_rel(false);
          console.error('Error fetching projet details:', error);
        });
    }
  };

  const createData_histo_rel_rdv = (
    etape,
    type,
    date_relance,
    mode_relance,
    rdv,
    commentaire,
    type_traite,
    date_traite,
    responsable,
    responsable_traite
  ) => {
    return {
      etape,
      type,
      date_relance,
      mode_relance,
      rdv,
      commentaire,
      type_traite,
      date_traite,
      responsable,
      responsable_traite,
    };
  };

  //Historique

  const handleView_Histo = async () => {
    fetch_histo();
    setOpenH(!openH);
  };
  const fetch_histo = async () => {
    if (origin_id) {
      setLoading_histo(true);
      await axios
        .get(`${APIURL.ROOTV1}/get_historiques_visite/` + origin_id, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setrows([]);
          for (
            var k = 0;
            k <= Number(response.data.historiques.length) - 1;
            k++
          ) {
            let historique_modification =
              response.data.historiques[k].historique_modification;
            let username = response.data.historiques[k].user.name;
            let userprenom = response.data.historiques[k].user.prenom;
            let date = response.data.historiques[k].id;
            let interet = response.data.historiques[k].interet;
            let statut = null;
            if (response.data.historiques[k].interet == 1) {
              statut = response.data.historiques[k].statut;
            }
            let bien = null;
            if (response.data.historiques[k].bien != null) {
              bien = NomBienComplet(response.data.historiques[k].bien);
            }

            let etat_bien = '';
            if (response.data.historiques[k].bien != null) {
              etat_bien = response.data.historiques[k].bien.etat;
            }
            let description = response.data.historiques[k].description;
            let mode_rel = ' ';
            let date_rel = ' ';
            if (response.data.historiques[k].relance_relation != null) {
              mode_rel =
                response.data.historiques[k].relance_relation.mode_relance;
              if (
                response.data.historiques[k].relance_relation.date_relance !=
                null
              ) {
                date_rel = format(
                  new Date(
                    response.data.historiques[k].relance_relation.date_relance
                  ),
                  'dd/MM/yyyy'
                );
              } else {
                date_rel = ' ';
              }
            }

            let rdv = '';
            if (response.data.historiques[k].rdv_relation != null) {
              if (response.data.historiques[k].rdv_relation.rdv != null) {
                rdv = format(
                  new Date(response.data.historiques[k].rdv_relation.rdv),
                  'dd/MM/yyyy kk:mm'
                );
              } else {
                rdv = ' ';
              }
            }

            let fr_tr = '';
            let fr_et = '';
            let fr_tp = '';
            let fr_o = '';
            let fr_v = '';
            let prix_min = '';
            let prix_max = '';
            let sup_min = '';
            let sup_max = '';
            let avance = '';
            let fr_autre = '';

            if (interet == '3') {
              const frein = response?.data?.historiques[k]?.freins;
              fr_autre =
                response?.data?.historiques[k]?.frein?.description_autre;
              const concatNames = (array, keyPath) => {
                if (!Array.isArray(array) || array.length === 0) return '';

                return array
                  .map((item) => {
                    try {
                      // For direct properties like 'etage' or 'orientation'
                      if (keyPath.includes('.')) {
                        // For nested properties like 'tranche.nom'
                        return keyPath
                          .split('.')
                          .reduce((o, i) => o?.[i], item);
                      } else {
                        // For direct properties
                        return item[keyPath];
                      }
                    } catch (error) {
                      console.error(
                        `Error accessing ${keyPath} in item:`,
                        item,
                        error
                      );
                      return null;
                    }
                  })
                  .filter(Boolean)
                  .join(',');
              };
              fr_tr = concatNames(frein?.frein_tranche, 'tranche.nom');
              fr_o = concatNames(frein?.frein_orientation, 'orientation');
              fr_tp = concatNames(
                frein?.frein_typologie,
                'typologie.typologie'
              );
              fr_v = concatNames(frein?.frein_vue, 'vue.vue');
              //fr_et = concatNames(frein?.frein_etage, 'etage');
              // Update the frein_etage processing:
              fr_et = frein?.frein_etage
                ? frein.frein_etage.map((item) => item.etage).join(',')
                : '';

              const formatValue = (value, suffix = '') =>
                value != null && value !== 0 ? `${value}${suffix}` : '';

              prix_min = formatValue(frein?.prix_min, ' DH');
              prix_max = formatValue(frein?.prix_max, ' DH');
              sup_min = formatValue(frein?.superficie_min);
              sup_max = formatValue(frein?.superficie_max);
              avance = formatValue(frein?.avance, ' DH');
            }

            if (response.data.historiques[k].deleted_at != null) {
              let description_new = '';
              if (description.includes('CREATION')) {
                description_new = description.replace(
                  'CREATION',
                  'SUPPRESSION'
                );
              } else {
                description_new = description.replace(
                  'MODIFICATION',
                  'SUPPRESSION'
                );
              }

              setrows((rows) => [
                ...rows,
                createData(
                  toTitleCase(description_new),
                  username + ' ' + userprenom,
                  date,
                  etat_bien,
                  interet,
                  bien,
                  statut,
                  mode_rel,
                  date_rel,
                  rdv,
                  prix_min,
                  prix_max,
                  sup_min,
                  sup_max,
                  avance,
                  fr_tr,
                  fr_et,
                  fr_o,
                  fr_tp,
                  fr_v,
                  fr_autre,
                  historique_modification
                ),
              ]);
            }
            setrows((rows) => [
              ...rows,
              createData(
                toTitleCase(description),
                username + ' ' + userprenom,
                date,
                etat_bien,
                interet,
                bien,
                statut,
                mode_rel,
                date_rel,
                rdv,
                prix_min,
                prix_max,
                sup_min,
                sup_max,
                avance,
                fr_tr,
                fr_et,
                fr_o,
                fr_tp,
                fr_v,
                fr_autre,
                historique_modification
              ),
            ]);
          }
          setLoading_histo(false);
        })
        .catch((error) => {
          console.error('Error fetching projet details:', error);
          setLoading_histo(false);
        });
    }
  };

  const createData = (
    action,
    cc,
    date,
    etat_bien,
    interet,
    bien,
    statut,
    mode_rel,
    date_rel,
    rdv,
    prix_min,
    prix_max,
    sup_min,
    sup_max,
    avance,
    fr_tranches,
    fr_etages,
    fr_orientations,
    fr_typologies,
    fr_vues,
    fr_autre,
    historique_modification
  ) => {
    return {
      action,
      cc,
      date,
      etat_bien,
      interet,
      bien,
      statut,
      mode_rel,
      date_rel,
      rdv,
      prix_min,
      prix_max,
      sup_min,
      sup_max,
      avance,
      fr_tranches,
      fr_etages,
      fr_orientations,
      fr_typologies,
      fr_vues,
      fr_autre,
      historique_modification,
    };
  };

  function NomBienComplet(bien) {
    const noms = [];

    if (bien?.tranche?.nom) noms.push(bien?.tranche?.nom);
    if (bien?.bloc?.nom) noms.push(bien?.bloc?.nom);
    if (bien?.immeuble?.nom) noms.push(bien?.immeuble?.nom);

    noms.push(bien?.propriete_dite_bien);

    return noms.join(' - ');
  }
  const change_visite = (newVisitId) => {
    setActiveVisit(newVisitId);
    localStorage.removeItem('v_id_cadre');
  };
  //Traitement Frein
  const RowTraitement = ({ row }) => {
    const [open, setOpen] = useState(false);
    const hasDetails =
      row.interet == '1' || row.interet == '2' || row.interet == '3';

    return (
      <>
        <tr className="border-b hover:bg-gray-50 transition-colors duration-150">
          <td className="px-4 py-3 text-center">
            {hasDetails && (
              <button
                aria-label={open ? 'collapse row' : 'expand row'}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                onClick={() => setOpen(!open)}
              >
                {open ? (
                  <ChevronUpIcon size={18} className="text-gray-600" />
                ) : (
                  <ChevronDownIcon size={18} className="text-gray-600" />
                )}
              </button>
            )}
          </td>

          <td className="px-4 py-3 text-center font-medium">
            {format(new Date(row.date), 'dd/MM/yyyy HH:mm')}
          </td>
          <td className={`px-4 py-3 text-center`}>
            {getInteretBadge(row.interet)}
          </td>
          <td className="px-4 py-3 text-center">{NomBienComplet(row?.bien)}</td>
          <td className={`px-4 py-3 text-center`}>
            {getStatutBadge(row.statut)}
          </td>
          <td className="px-4 py-3 text-center">{row.commentaire || '-'}</td>
        </tr>

        {hasDetails && open && (
          <tr className="border-b">
            <td colSpan={6} className="p-0 bg-gray-50">
              <div className="p-4">
                <h6 className="text-md font-semibold mb-3 !text-gray-700 flex items-center">
                  <span className="w-1.5 h-5 bg-blue-600 rounded-sm mr-2"></span>
                  Détails supplémentaires
                </h6>
                <div className="overflow-hidden">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-blue-50">
                      <tr>
                        {/* Intéressé (RDV) */}
                        {row.interet == 1 && (
                          <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                            Rendez-vous
                          </th>
                        )}

                        {/* Réceptif (Relance) */}
                        {row.interet == 2 && (
                          <>
                            <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                              Mode Relance
                            </th>
                            <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                              Date Relance
                            </th>
                          </>
                        )}

                        {/* Perdu (Freins) */}
                        {row.interet == 3 && (
                          <>
                            <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                              Freins
                            </th>
                            <th className="text-center px-3 py-2 border-b border-gray-200 font-medium !text-gray-700">
                              Détails
                            </th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        {/* Intéressé (RDV) */}
                        {row.interet == 1 && (
                          <td className="text-center px-3 py-2 border-b border-gray-200">
                            {row.rdv_relation?.rdv
                              ? format(
                                  new Date(row.rdv_relation.rdv),
                                  'dd/MM/yyyy HH:mm'
                                )
                              : '-'}
                          </td>
                        )}

                        {/* Réceptif (Relance) */}
                        {row.interet == 2 && (
                          <>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {row.rdv_relation?.mode_relance == '1'
                                ? 'SMS'
                                : row.rdv_relation?.mode_relance == '2'
                                ? 'Appel'
                                : row.rdv_relation?.mode_relance == '3'
                                ? 'Email'
                                : '-'}
                            </td>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {row.rdv_relation?.date_relance
                                ? format(
                                    new Date(row.rdv_relation.date_relance),
                                    'dd/MM/yyyy'
                                  )
                                : '-'}
                            </td>
                          </>
                        )}

                        {/* Perdu (Freins) */}
                        {row.interet == 3 && (
                          <>
                            <td className="text-center px-3 py-2 border-b border-gray-200">
                              {[
                                row.frein?.frein_tranche?.length > 0 &&
                                  'Tranche',
                                row.frein?.frein_etage?.length > 0 && 'Etage',
                                row.frein?.frein_orientation?.length > 0 &&
                                  'Orientation',
                                row.frein?.frein_typologie?.length > 0 &&
                                  'Typologie',
                                row.frein?.frein_vue?.length > 0 && 'Vue',
                                (row.frein?.prix_min || row.frein?.prix_max) &&
                                  'Prix',
                                (row.frein?.superficie_min ||
                                  row.frein?.superficie_max) &&
                                  'Superficie',
                                row.frein?.avance && 'Avance',
                                row.frein?.description_autre && 'Autre',
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            </td>
                            <td className="px-3 py-2 border-b border-gray-200">
                              <div className="grid grid-cols-2 gap-2">
                                {row.frein?.frein_tranche?.length > 0 && (
                                  <div>
                                    <span className="font-medium">
                                      Tranches:{' '}
                                    </span>
                                    {row.frein.frein_tranche
                                      .map((t) => t.tranche.nom)
                                      .join(', ')}
                                  </div>
                                )}
                                {row.frein?.frein_etage?.length > 0 && (
                                  <div>
                                    <span className="font-medium">
                                      Etages:{' '}
                                    </span>
                                    {row.frein.frein_etage
                                      .map((e) => e.etage)
                                      .join(', ')}
                                  </div>
                                )}
                                {row.frein?.frein_orientation?.length > 0 && (
                                  <div>
                                    <span className="font-medium">
                                      Orientations:{' '}
                                    </span>
                                    {row.frein.frein_orientation
                                      .map((o) => o.orientation)
                                      .join(', ')}
                                  </div>
                                )}
                                {row.frein?.frein_typologie?.length > 0 && (
                                  <div>
                                    <span className="font-medium">
                                      Typologies:{' '}
                                    </span>
                                    {row.frein.frein_typologie
                                      .map((t) => t.typologie.typologie)
                                      .join(', ')}
                                  </div>
                                )}
                                {row.frein?.frein_vue?.length > 0 && (
                                  <div>
                                    <span className="font-medium">Vues: </span>
                                    {row.frein.frein_vue
                                      .map((v) => v.vue.vue)
                                      .join(', ')}
                                  </div>
                                )}
                                {(row.frein?.prix_min ||
                                  row.frein?.prix_max) && (
                                  <div>
                                    <span className="font-medium">Prix: </span>
                                    {`[${row.frein.prix_min || ''}, ${
                                      row.frein.prix_max || ''
                                    }]`}
                                  </div>
                                )}
                                {(row.frein?.superficie_min ||
                                  row.frein?.superficie_max) && (
                                  <div>
                                    <span className="font-medium">
                                      Superficie:{' '}
                                    </span>
                                    {`[${row.frein.superficie_min || ''}, ${
                                      row.frein.superficie_max || ''
                                    }]`}
                                  </div>
                                )}
                                {row.frein?.avance && (
                                  <div>
                                    <span className="font-medium">
                                      Avance:{' '}
                                    </span>
                                    {row.frein.avance}
                                  </div>
                                )}
                                {row.frein?.description_autre && (
                                  <div>
                                    <span className="font-medium">Autre: </span>
                                    {row.frein.description_autre}
                                  </div>
                                )}
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };
  return (
    <>
      <div className="relative">
        {/* Glass-morphism background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl overflow-hidden">
          <div className="absolute w-[500px] h-[500px] rounded-full bg-blue-100/50 -top-250 -right-250 blur-3xl" />
          <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-100/50 -bottom-250 -left-250 blur-3xl" />
        </div>

        {/* Main content */}
        <div className="relative backdrop-blur-sm">
          {/* Header */}
          <div className="flex justify-between items-center pl-8 pr-8 pt-2 pb-2 border-b border-white/20">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Détail Visite
            </h2>
            <div className="flex space-x-3">
              <button
                className="px-6 py-2.5 rounded-xl bg-white/80 hover:bg-white/90 backdrop-blur-sm border border-white/20 text-[#2563eb] font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-100"
                onClick={handleView_Histo_rel_rdv}
              >
                Historique Relance/RDV
              </button>
              <button
                className="px-6 py-2.5 rounded-xl bg-gray-900/80 hover:bg-gray-900/90 backdrop-blur-sm text-white font-medium transition-all duration-300 hover:shadow-lg"
                onClick={handleView_Histo}
              >
                Historique
              </button>
            </div>
          </div>

          {/* Split layout */}
          <div className="grid lg:grid-cols-12 gap-8 p-8">
            {/* Timeline section */}
            <div className="lg:col-span-4 space-y-6 mt-5">
              <VisitTimeline
                visites_all_show={visites_all_show}
                activeVisit={activeVisit}
                onVisitSelect={change_visite}
                origin_id={origin_id}
              />
            </div>

            {/* Details section */}
            <div className="lg:col-span-8">
              {visites_all?.map(
                (visite) =>
                  visite.related_show_id == activeVisit && (
                    <VisitCard key={visite.id} activeVisit={activeVisit}>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-100">
                                {currentVisitOrder}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold !text-gray-900">
                                  VISITE {currentVisitOrder}
                                </h3>
                                <p className="text-gray-500">
                                  {format(
                                    new Date(visite.created_at),
                                    'dd/MM/yyyy'
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* ... existing code ... */}
                            <div className="flex space-x-3">
                              {visite.relance_relation &&
                                visite.relance_relation.type_traitement == 0 &&
                                !visite.relance_relation.deleted_at &&
                                visite.relance_relation.user.user_id_origin ==
                                  user_id &&
                                show_btn_relance && (
                                  <Button
                                    type="traite_relance"
                                    onClick={() =>
                                      handleValider(
                                        visite.relance_relation.id,
                                        'Relance'
                                      )
                                    }
                                  >
                                    Traiter Relance
                                  </Button>
                                )}

                              {visite.rdv_relation &&
                                visite.rdv_relation.type_traitement == 0 &&
                                !visite.rdv_relation.deleted_at &&
                                visite.rdv_relation.user.user_id_origin ==
                                  user_id &&
                                visite.interet == 1 &&
                                show_btn_rdv && (
                                  <Button
                                    type="traite_rdv"
                                    onClick={() =>
                                      handleValider(
                                        visite.rdv_relation.id,
                                        'RDV'
                                      )
                                    }
                                  >
                                    Traiter Rendez Vous
                                  </Button>
                                )}
                            </div>

                            {/* Add this new row below the Traiter buttons *
                            <div className="flex items-center space-x-4 mt-3">
                              {/* Status tag 
                              {visite.interet == 1 && (
                                <div className="flex items-center">
                                  {getStatutBadge(visite.statut)}
                                </div>
                              )}

                              {/* Action buttons *
                              <div className="flex space-x-2">
                                {/* View Reservation button *
                                {visite.reservation != null && (
                                  <button
                                    title="Détail du Réservation"
                                    onClick={() =>
                                      handleView_Reservation(
                                        visite?.reservation?.id
                                      )
                                    }
                                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                  >
                                    <EyeIcon className="h-5 w-5 text-gray-700" />
                                  </button>
                                )}

                                {/* Download PDF button *
                                {(visite.statut == 1 ||
                                  visite.statut == 3 ||
                                  visite.statut == 5) && (
                                  <PDFDownloadLink
                                    document={
                                      <Document
                                        data={[
                                          visite.id,
                                          visite.pre_reservation_visite
                                            ?.code_pre_reserve,
                                          visite.rdv_relation?.rdv,
                                          visite.pre_reservation_visite
                                            ?.date_pre_reserve,
                                          visite.bien.propriete_dite_bien,
                                          visite.bien.niveau,
                                          visite.bien.superficie_architecte,
                                          visite.bien.orientation,
                                          visite.bien.prix,
                                          visite.user.name,
                                          visite.user.prenom,
                                        ]}
                                      />
                                    }
                                    fileName="bon_pre_reservation.pdf"
                                  >
                                    {({ loading }) => (
                                      <button
                                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                        disabled={loading}
                                      >
                                        {loading ? (
                                          <span>Loading...</span>
                                        ) : (
                                          <DownloadIcon className="h-5 w-5 text-gray-700" />
                                        )}
                                      </button>
                                    )}
                                  </PDFDownloadLink>
                                )}
                              </div>
                            </div>
                            {/* ... rest of the code ... */}
                          </div>
                        </div>

                        <InfoCard
                          icon={<UserIcon className="h-5 w-5" />}
                          title="CC"
                          value={
                            visite.user.name.toUpperCase() +
                            ' ' +
                            visite.user.prenom.toUpperCase()
                          }
                        />

                        <InfoCard
                          icon={<TagIcon className="h-5 w-5" />}
                          title={visite.interet == 1 ? 'Statut' : 'Intérêt'}
                          value={
                            <div className="flex items-center space-x-2">
                              {visite.interet == 1
                                ? getStatutBadge(visite.statut)
                                : getInteretBadge(visite.interet)}
                              {visite.reservation != null && (
                                <button
                                  title="Détail du Réservation"
                                  onClick={() =>
                                    handleView_Reservation(
                                      visite?.reservation?.id
                                    )
                                  }
                                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                  <EyeIcon className="h-5 w-5 text-gray-700" />
                                </button>
                              )}
                              {/* Download PDF button */}
                              {(visite.statut == 1 ||
                                visite.statut == 3 ||
                                visite.statut == 5) && (
                                <PDFDownloadLink
                                  document={
                                    <Document
                                      data={[
                                        visite.id,
                                        visite.pre_reservation_visite
                                          ?.code_pre_reserve,
                                        visite.rdv_relation?.rdv,
                                        visite.pre_reservation_visite
                                          ?.date_pre_reserve,
                                        visite.bien.propriete_dite_bien,
                                        visite.bien.niveau,
                                        visite.bien.superficie_architecte,
                                        visite.bien.orientation,
                                        visite.bien.prix,
                                        visite.user.name,
                                        visite.user.prenom,
                                        JSON.parse(
                                          localStorage.getItem('authUser')
                                        ),
                                      ]}
                                    />
                                  }
                                  fileName="bon_pre_reservation.pdf"
                                >
                                  {({ loading }) => (
                                    <button
                                      title="Télecharger Bon de Pré Réservation"
                                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                      disabled={loading}
                                    >
                                      {loading ? (
                                        <span>Loading...</span>
                                      ) : (
                                        <DownloadIcon className="h-5 w-5 text-gray-700" />
                                      )}
                                    </button>
                                  )}
                                </PDFDownloadLink>
                              )}
                              {visite.interet == 3 && (
                                <>
                                  {visite?.freins?.etat == 4 && (
                                    <b style={{ color: '#934b6a' }}>
                                      Frein Supprimé
                                    </b>
                                  )}
                                  {visite?.freins?.etat == 3 && (
                                    <b style={{ color: 'green' }}>
                                      Frein Traité
                                    </b>
                                  )}
                                  {visite?.freins?.etat == 5 && (
                                    <b style={{ color: 'orange' }}>
                                      Frein Désactivé par Appel
                                    </b>
                                  )}
                                </>
                              )}
                            </div>
                          }
                        />
                        {visite.interet == 2 && (
                          <>
                            {visite.relance_relation != null && (
                              <>
                                <InfoCard
                                  icon={<PhoneCallIcon className="h-5 w-5" />}
                                  title="Mode Relance"
                                  value={getRelance_label(
                                    visite.relance_relation.mode_relance
                                  )}
                                />
                                <InfoCard
                                  icon={<CalendarIcon className="h-5 w-5" />}
                                  title="Date de  Relance"
                                  value={
                                    visite.relance_relation.date_relance &&
                                    format(
                                      new Date(
                                        visite.relance_relation.date_relance
                                      ),
                                      'dd/MM/yyyy'
                                    )
                                  }
                                />
                              </>
                            )}
                          </>
                        )}
                        {visite.interet == 1 && (
                          <>
                            <InfoCard
                              icon={<HomeIcon className="h-5 w-5" />}
                              title="Bien"
                              value={
                                visite.bien_id != null && (
                                  <a
                                    href={`/Biens/${visite.bien_id}`} // Adjust the path as needed
                                    className="text-black"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    {visite.bien?.propriete_dite_bien}
                                  </a>
                                )
                              }
                            />

                            {/* <InfoCard
                              icon={<BadgeCheckIcon className="h-5 w-5" />}
                              title="Statut"
                              value={getStatutBadge(visite.statut)}
                              url={
                                <>
                                  {visite.reservation != null && (
                                    <button
                                      title="Détail du Réservation"
                                      onClick={() =>
                                        handleView_Reservation(
                                          visite?.reservation?.id
                                        )
                                      }
                                      className="ml-2 !text-red hover:text-red transition-colors mt-1"
                                    >
                                      <div title="Voir Réservation">
                                        <EyeIcon className="h-5 w-5" />
                                      </div>
                                    </button>
                                  )}

                                  {(visite.statut == 1 ||
                                    visite.statut == 3 ||
                                    visite.statut == 5) && (
                                    <>
                                      <PDFDownloadLink
                                        document={
                                          <Document
                                            data={[
                                              visite.id,
                                              visite.pre_reservation_visite
                                                ?.code_pre_reserve,
                                              visite.rdv_relation?.rdv,
                                              visite.pre_reservation_visite
                                                ?.date_pre_reserve,
                                              visite.bien.propriete_dite_bien,
                                              visite.bien.niveau,
                                              visite.bien.superficie_architecte,
                                              visite.bien.orientation,
                                              visite.bien.prix,
                                              visite.user.name,
                                              visite.user.prenom,
                                            ]}
                                          />
                                        }
                                        fileName="bon_pre_reservation.pdf"
                                      >
                                        {({ loading }) =>
                                          loading ? (
                                            'Loading document...'
                                          ) : (
                                            <div title="Télécharger Bon de Préservation">
                                              <DownloadIcon className="h-5 w-5" />
                                            </div>
                                          )
                                        }
                                      </PDFDownloadLink>
                                    </>
                                  )}
                                </>
                              }
                            />*/}
                            <>
                              {visite.relance_relation != null && (
                                <>
                                  <InfoCard
                                    icon={<PhoneCallIcon className="h-5 w-5" />}
                                    title="Mode Relance"
                                    value={getRelance_label(
                                      visite.relance_relation.mode_relance
                                    )}
                                  />
                                  <InfoCard
                                    icon={<CalendarIcon className="h-5 w-5" />}
                                    title="Date de  Relance"
                                    value={
                                      visite.relance_relation.date_relance &&
                                      format(
                                        new Date(
                                          visite.relance_relation.date_relance
                                        ),
                                        'dd/MM/yyyy'
                                      )
                                    }
                                  />
                                </>
                              )}
                              <>
                                {visite.rdv_relation != null && (
                                  <>
                                    <InfoCard
                                      icon={
                                        <CalendarIcon className="h-5 w-5" />
                                      }
                                      title="Rendez vous"
                                      value={
                                        visite.rdv_relation.rdv &&
                                        format(
                                          new Date(visite.rdv_relation.rdv),
                                          'dd/MM/yyyy kk:mm'
                                        )
                                      }
                                    />
                                  </>
                                )}
                              </>
                            </>
                          </>
                        )}
                        {visite.interet == 3 && (
                          <>
                            <InfoCard
                              icon={<AlertCircleIcon className="h-5 w-5" />}
                              title="Freins"
                              value={[
                                visite.freins?.frein_tranche.length > 0 &&
                                  'TRANCHE',
                                visite.freins?.frein_etage.length > 0 &&
                                  'ETAGE',
                                visite.freins?.frein_orientation.length > 0 &&
                                  'ORIENTATION',
                                visite.freins?.frein_typologie.length > 0 &&
                                  'TYPOLOGIE',
                                visite.freins?.frein_vue.length > 0 && 'VUE',
                                ((visite.freins?.prix_min &&
                                  visite.freins?.prix_min != 0) ||
                                  (visite.freins?.prix_max &&
                                    visite.freins?.prix_max != 0)) &&
                                  'PRIX',
                                ((visite.freins?.superficie_min &&
                                  visite.freins?.superficie_min != 0) ||
                                  (visite.freins?.superficie_max &&
                                    visite.freins?.superficie_max != 0)) &&
                                  'SUPERFICIE',
                                visite.freins?.avance &&
                                  visite.freins?.avance !== 0 &&
                                  'AVANCE',
                                visite.freins?.description_autre && 'AUTRE',
                              ]
                                .filter(Boolean)
                                .join(', ')}
                            />

                            {visite.freins?.frein_tranche.length > 0 && (
                              <InfoCard
                                icon={<LayersIcon className="h-5 w-5" />}
                                title="Tranche"
                                value={visite.freins?.frein_tranche?.map(
                                  (fr_tranche, i) => (
                                    <span
                                      key={fr_tranche.id}
                                      className="inline-block"
                                    >
                                      {i != 0 && (
                                        <span className="mx-1">,</span>
                                      )}
                                      <span className="uppercase tracking-wide whitespace-nowrap">
                                        {fr_tranche.tranche.nom}
                                      </span>
                                    </span>
                                  )
                                )}
                              />
                            )}
                            {visite.freins?.frein_etage.length > 0 && (
                              <InfoCard
                                icon={
                                  <AlignVerticalSpaceAroundIcon className="h-5 w-5" />
                                }
                                title="Etages"
                                value={visite.freins?.frein_etage?.map(
                                  (fr_etage, i) => (
                                    <span
                                      key={fr_etage.id}
                                      className="inline-block"
                                    >
                                      {i != 0 && (
                                        <span className="mx-1">,</span>
                                      )}
                                      <span className="uppercase tracking-wide whitespace-nowrap">
                                        {fr_etage.etage}
                                      </span>
                                    </span>
                                  )
                                )}
                              />
                            )}
                            {visite.freins?.frein_orientation.length > 0 && (
                              <InfoCard
                                icon={<CompassIcon className="h-5 w-5" />}
                                title="Orientations"
                                value={visite.freins?.frein_orientation?.map(
                                  (fr_orientation, i) => (
                                    <span
                                      key={fr_orientation.id}
                                      className="inline-block"
                                    >
                                      {i != 0 && (
                                        <span className="mx-1">,</span>
                                      )}
                                      <span className="uppercase tracking-wide whitespace-nowrap">
                                        {fr_orientation.orientation}
                                      </span>
                                    </span>
                                  )
                                )}
                              />
                            )}

                            {visite.freins?.frein_typologie.length > 0 && (
                              <InfoCard
                                icon={<CompassIcon className="h-5 w-5" />}
                                title="Typologies"
                                value={visite.freins?.frein_typologie?.map(
                                  (fr_typologie, i) => (
                                    <span
                                      key={fr_typologie.typologie.id}
                                      className="inline-block"
                                    >
                                      {i != 0 && (
                                        <span className="mx-1">,</span>
                                      )}
                                      <span className="uppercase tracking-wide whitespace-nowrap">
                                        {fr_typologie.typologie.typologie}
                                      </span>
                                    </span>
                                  )
                                )}
                              />
                            )}
                            {visite.freins?.frein_vue.length > 0 && (
                              <InfoCard
                                icon={<ImageIcon className="h-5 w-5" />}
                                title="Vues"
                                value={visite.freins?.frein_vue?.map(
                                  (fr_vue, i) => (
                                    <span
                                      key={fr_vue.vue.id}
                                      className="inline-block"
                                    >
                                      {i != 0 && (
                                        <span className="mx-1">,</span>
                                      )}
                                      <span className="uppercase tracking-wide whitespace-nowrap">
                                        {fr_vue.vue.vue}
                                      </span>
                                    </span>
                                  )
                                )}
                              />
                            )}
                            {visite.freins?.avance != null &&
                              visite.freins.avance != 0 && (
                                <InfoCard
                                  icon={<WalletIcon className="h-5 w-5" />}
                                  title="Avance"
                                  value={
                                    visite.freins?.avance?.toLocaleString() +
                                    ' DH'
                                  }
                                />
                              )}
                            {(visite.freins?.prix_min != null ||
                              visite.freins?.prix_max != null) && (
                              <InfoCard
                                icon={
                                  <BadgeDollarSignIcon className="h-5 w-5" />
                                }
                                title="Prix"
                                value={
                                  visite.freins?.prix_min &&
                                  visite.freins?.prix_max
                                    ? `Prix entre ${visite.freins?.prix_min?.toLocaleString(
                                        +' DH'
                                      )} et ${visite.freins?.prix_max?.toLocaleString(
                                        +' DH'
                                      )}`
                                    : visite.freins?.prix_min
                                    ? `Prix à partir de ${visite.freins?.prix_min?.toLocaleString(
                                        +' DH'
                                      )}`
                                    : visite.freins?.prix_max
                                    ? `Prix jusqu'à ${visite.freins?.prix_max?.toLocaleString(
                                        +' DH'
                                      )}`
                                    : null
                                }
                              />
                            )}
                            {(visite.freins?.superficie_min != null ||
                              visite.freins?.superficie_max != null) && (
                              <InfoCard
                                icon={<AreaChartIcon className="h-5 w-5" />} // You can replace this with any icon you'd like
                                title="Superficie"
                                value={
                                  visite.freins?.superficie_min &&
                                  visite.freins?.superficie_max
                                    ? `Superficie entre ${visite.freins?.superficie_min.toLocaleString()} m² et ${visite.freins?.superficie_max.toLocaleString()} m²`
                                    : visite.freins?.superficie_min
                                    ? `Superficie à partir de ${visite.freins?.superficie_min.toLocaleString()} m²`
                                    : visite.freins?.superficie_max
                                    ? `Superficie jusqu'à ${visite.freins?.superficie_max.toLocaleString()} m²`
                                    : null
                                }
                              />
                            )}
                            {visite.freins?.description_autre != null && (
                              <InfoCard
                                icon={<FileTextIcon className="h-5 w-5" />}
                                title="Autre"
                                value={visite.freins.description_autre}
                              />
                            )}
                          </>
                        )}

                        {/*<InfoCard
                        icon={<AlertCircleIcon className="h-5 w-5" />}
                        title="Freins"
                        value="FINANCEMENT"
                      />*/}
                        <div className="col-span-2">
                          <InfoCard
                            icon={<MessageSquareIcon className="h-5 w-5" />}
                            title="Commentaire"
                            value={visite.commentaire}
                          />
                        </div>
                      </div>

                      {/* Centered Action Buttons */}
                      <div className="flex justify-center space-x-3 mt-6">
                        {/**si les dernier visite creeé avant i==0 */}
                        {visite.related_show_id == last_related_id && (
                          <>
                            {visite.reservation == null && (
                              <>
                                {/* Show Modifier button if:
        - interet == 1 AND statut == 1
        OR
        - interet == 2
    */}
                                {(visite.interet == 1 && visite.statut == 1) ||
                                visite.interet == 2 ? (
                                  <Button
                                    type="edit"
                                    onClick={() => handleEdit(visite.id)}
                                    disabled={
                                      visite.statut == 3 ||
                                      visite.statut == 4 ||
                                      visite.statut == 5 ||
                                      visite.statut == 2
                                        ? 'disabled'
                                        : ''
                                    }
                                  >
                                    Modifier
                                  </Button>
                                ) : (
                                  <>
                                    {visite.interet == 3 && (
                                      <Button
                                        type="edit"
                                        onClick={() => handleEdit(visite.id)}
                                        disabled={
                                          visite?.frein?.etat == 3 ||
                                          visite?.frein?.etat == 4 ||
                                          visite?.frein?.etat == 5
                                            ? 'disabled'
                                            : ''
                                        }
                                      >
                                        Modifier
                                      </Button>
                                    )}
                                  </>
                                )}

                                {/* Hide Supprimer button if:
        - interet == 1 AND statut == 2
        OR
        - it's the first visite (origin_id) unless it's the only visite
    */}
                                {!(visite.interet == 1 && visite.statut == 2) &&
                                  (visite.id != origin_id ||
                                    (visite.id == origin_id &&
                                      visites_all.length == 1)) && (
                                    <Button
                                      type="delete"
                                      onClick={() =>
                                        handleDelete(
                                          visite.id,
                                          visite.id == origin_id &&
                                            visites_all.length == 1
                                            ? 'first_visite'
                                            : null
                                        )
                                      }
                                    >
                                      Supprimer
                                    </Button>
                                  )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                      {visite.traitement_frein.length > 0 && (
                        <>
                          <h5 style={{ marginLeft: '12px', color: 'blue' }}>
                            Historiques Traitement du Frein
                          </h5>
                          <div className="overflow-y-auto flex-1 p-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-blue-50 sticky top-0">
                                  <tr
                                    style={{
                                      background: 'black',
                                      color: 'white',
                                    }}
                                  >
                                    <th
                                      scope="col"
                                      className="px-4 py-3 w-12"
                                    ></th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-center text-xs font-medium  uppercase tracking-wider"
                                    >
                                      Date
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider"
                                    >
                                      Intérêt
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-center text-xs font-medium  uppercase tracking-wider"
                                    >
                                      Bien
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider"
                                    >
                                      Statut
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-4 py-3 text-center text-xs font-medium  uppercase tracking-wider"
                                    >
                                      Commentaire
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {visite.traitement_frein.map((row, index) => (
                                    <RowTraitement
                                      key={row.id || `row-${index}`}
                                      row={row}
                                    />
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      )}
                    </VisitCard>
                  )
              )}
            </div>
          </div>
        </div>
      </div>
      {open_dialog_r && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_dialog_r(false)}>
            <Modal_Traite
              type_menu={3} //visites
              text={text}
              id={ID_rel_rdv}
              onClose={() => setOpen_dialog_r(false)}
            />
          </Modal>
        </>
      )}
      {open_D_M_warning && message_delete_warning != null && (
        <Modal
          isVisible={open_D_M_warning}
          onClose={() => setOpen_D_M_warning(false)}
        >
          <DeleteWarningModal
            message={message_delete_warning}
            onClose={() => {
              setOpen_D_M_warning(false);
            }}
          />
        </Modal>
      )}
      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={APIURL.VISITES}
            Id={selectedId}
            type="Visite"
            message={'Etes-vous sûr de vouloir supprimer cette Visite ?'}
            accessToken={accessToken}
            onClose={() => {
              setShowDeleteModal(false);
              if (text_route == 'first_visite') {
                router.push('/visites');
              } else {
                localStorage.setItem('visite_fetch_show', 1);
                fetch_histo();
              }
            }}
          />
        </Modal>
      )}

      {open_rel && (
        <Modal isVisible={open_rel} onClose={() => setOpen_rel(false)}>
          <Modal_Historique_rel_rdv
            loading_h_rel={loading_h_rel}
            rows_histo_rel_rdv={rows_histo_rel_rdv}
            onClose={() => setOpen_rel(false)}
          />
        </Modal>
      )}
      {openH && (
        <Modal isVisible={openH} onClose={() => setOpenH(false)}>
          <Modal_Historique
            loading_histo={loading_histo}
            rows={rows}
            onClose={() => setOpenH(false)}
          />
        </Modal>
      )}
    </>
  );
}

function InfoCard(props) {
  const { icon, title, value, url } = props;
  {
    /*hover:border-blue-300 hover:border hover:shadow-lg*/
  }
  return (
    <div className="group bg-white/60 cursor-pointer   backdrop-blur-sm rounded-2xl p-6 border transition-all duration-300 ">
      <div className="flex items-center space-x-3 mb-3">
        <div className="text-[#2563eb] group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h4 className="font-medium !text-gray-600">{title}</h4>
      </div>
      <div className="text-gray-900 font-medium flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span>{value}</span>
          {url && <span>{url}</span>}
        </div>
      </div>
    </div>
  );
}

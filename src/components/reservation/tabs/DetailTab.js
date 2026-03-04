import React, { useState, memo, useEffect } from 'react';
import LoadingSpin from '@/components/LoadingSpin';
import Link from 'next/link';
import { isAdmin, isSuperAdmin,isCommercial,isRespoCommercial,isNotaire,isAgentAdministratif,isRespoLivraison, getModeFinanceLabel} from '@/configs/enum';
import { useProjet } from '@/context/ProjetContext';
import { useAuth } from '@/context/AuthContext';
import { Clock, Edit, Eye, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import Modal_Valider_Reservation from '@/app/(dashboard)/ventes/reservations/Modal_Valider_Reservation';
import Modal_Rejeter_Reservation from '@/app/(dashboard)/ventes/reservations/Modal_Rejeter_Reservation';
import Modal_show_info from '@/app/(dashboard)/ventes/reservations/Modal_show_info';
import { useRouter } from 'next/navigation';
import Modal_Relance from '../Modal_Relance';
import Modal_Affecte from '@/app/(dashboard)/ventes/reservations/Modal_Affecte';
import axios from 'axios';
import { APIURL } from '@/configs/api';

// Define the component first
const DetailTabComponent = ({
  reservationData,
  sum_avances_valides,
  onReservationUpdate,
}) => {
    const { selectedProjet } = useProjet();
  
  const [open_dialog_rejete, setOpen_dialog_rejete] = useState(false);
 const [notaires, setNotaires] = useState([]);
    const [old_notaire_id, setNoraire_id] = useState(null);
    const [open_affecte, setOpen_affecte] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const [dst_id, set_dst_id] = useState(null);
  const [ID, setID] = useState(0);
  // validation /rejet
  const [statut_dst, setStatut_des] = useState(0);
  const [first_num_recu, set_first_num_recu] = useState(null);
  const [first_av_statut, set_first_av_statut] = useState(null);
  const [av_id, setav_id] = useState(0);
  const [open_v_reservation, setOpen_v_reservation] = useState(false);
  const [open_r, setOpen_r] = useState(false);
  const [code_reservation, setCode_reservation] = useState(null);
  const [cc, setCC] = useState(null);
  const [aquereurs, setAquereurs] = useState([]);
  const [date_res, setDate_res] = useState(null);
  const [prix, setPrix] = useState(null);
  const [avance, setAvance] = useState(null);

  const [open_info, setOpen_info] = useState(false);
  const [txt_info, set_txt_info] = useState(null);
  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }
   const fetchNotaires = async () => {
        await axios
          .get(`${APIURL.ROOTV1}/projets/${selectedProjet?.id}/notaires`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          })
          .then((res) => {
            setNotaires(res.data.notaires);
          })
          .catch(() => {});
      };
    
    useEffect(() => {
      if(isSuperAdmin(user.role) ||
              isAdmin(user.role) ||
              isRespoLivraison(user.role)){
              fetchNotaires();
              }
    }, []);

  // Add null checks and default values
  if (!reservationData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <LoadingSpin />
      </div>
    );
  }

  const handleDesiste = (res_id, desistement_id, statut_dstt, msg_rejete) => {
    if (desistement_id == null) {
      //aucun desistement
      router.push(`/ventes/desistements/ajouter_desistement/${res_id}`);
    } else {
      set_dst_id(desistement_id);
      if (statut_dstt == 0) {
        //attend validation
        setStatut_des(0);
        set_txt_info('Le Désistement est en Attente de validation');
      } else {
        setStatut_des(2);
        set_txt_info('Le Désistement est rejeté en raison  de ' + msg_rejete);
      }
      setOpen_info(true);
    }
  };
  
  const handleEdit = (reservationId) => {
    window.localStorage.setItem('step_res_edit', 0);
    const editUrl = `${window.location.origin}/ventes/reservations/?id=${reservationId}&action=edit`;
    window.open(editUrl, '_blank');
  };

  const handleEdit_Prix = (reservationId) => {
    window.localStorage.setItem('step_res_edit', 2);
    const editUrl = `${window.location.origin}/ventes/reservations/?id=${reservationId}&action=edit`;
    window.open(editUrl, '_blank');
  };
  const handle_valider = (
    Id,
    code,
    num_recu,
    av_id,
    av_statut,
    cc,
    aquereurs,
    date_res,
    prix,
    avance
  ) => {
    setOpen_v_reservation(!open_v_reservation);
    setID(Id);
    setCode_reservation(code);
    set_first_num_recu(num_recu);
    set_first_av_statut(av_statut);
    setav_id(av_id);
    setCC(cc);
    setAquereurs(aquereurs);
    setDate_res(date_res);
    setPrix(prix);
    setAvance(avance);
  };

  const handle_affecte = (Id, code,old_notaire_id) => {
    setOpen_affecte(!open_affecte);
    setID(Id);
    setCode_reservation(code);
    setNoraire_id(old_notaire_id)
  };
  const handle_rejeter = (Id, code) => {
    setOpen_r(!open_r);
    setID(Id);
    setCode_reservation(code);
  };
  const handle_show_info_2 = (code) => {
    set_txt_info('La Réservation ' + code + ' est  en attente de validation !');
    setOpen_info(true);
  };

  const handle_show_comment_rejete = () => {
    setOpen_dialog_rejete(true);
  };

   
  // Destructure the nested reservation object
  const { reservation } = reservationData;

  return (
    <>
      {' '}
      <div className="space-y-6">
        <div className="flex justify-end space-x-4">
          {reservation.etat == 1 && (
            <>
              {reservation.statut == 3 ? (
                <>
                  {isSuperAdmin(user.role) || isAdmin(user.role) ? (
                    <>
                      {/* Approve Button */}
                      <Button
                        type="valider"
                        onClick={() =>
                          handle_valider(
                            reservation.id,
                            reservation.code_reservation,
                            reservation.first_avance?.num_recu,
                            reservation.first_avance?.id,
                            reservation.first_avance?.statut,
                            reservation.user.name +
                              ' ' +
                              reservation.user.prenom,
                            reservation.aquereurs,
                            reservation.date_reservation,
                            reservation.prix,
                            reservation.first_avance?.montant
                          )
                        }
                        className="px-3 py-1 text-sm"
                      >
                        Valider
                      </Button>

                      {/* Reject Button */}
                      <Button
                        type="rejeter"
                        onClick={() =>
                          handle_rejeter(
                            reservation.id,
                            reservation.code_reservation
                          )
                        }
                        className="px-3 py-1 text-sm"
                      >
                        Rejeter
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="annuler"
                      onClick={() =>
                        handle_show_info_2(reservation.code_reservation)
                      }
                      className="px-3 py-1 text-sm"
                    >
                      En Attente
                    </Button>
                  )}
                </>
              ) : reservation.statut == 2 && isCommercial(user.role) ? (
                <Button
                  type="rejeter"
                  onClick={() => handle_show_comment_rejete()}
                  className="px-3 py-1 text-sm"
                >
                  Relancer le Rejet
                </Button>
              ) : null}
              {(isSuperAdmin(user.role) ||
                isAdmin(user.role) ||
                isCommercial(user.role)) &&
                reservation.statut == 1 && (
                  <Button
                    type="desister"
                    onClick={() =>
                      reservation.desistement_att_validation_rejete != null
                        ? handleDesiste(
                            reservation.id,
                            reservation.desistement_att_validation_rejete?.id,
                            reservation.desistement_att_validation_rejete
                              ?.statut,
                            reservation.desistement_att_validation_rejete
                              ?.commentaire_rejete
                          )
                        : handleDesiste(reservation.id, null, null, null)
                    }
                    className={`px-3 py-1 text-sm ${
                      reservation.desistement_att_validation_rejete?.statut == 0
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : reservation.desistement_att_validation_rejete
                            ?.statut == 2
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                    title={
                      reservation.desistement_att_validation_rejete?.statut == 0
                        ? 'désistement en attente'
                        : reservation.desistement_att_validation_rejete
                            ?.statut == 2
                        ? 'Désistement rejeté'
                        : 'Désister la réservation'
                    }
                  >
                    {reservation.desistement_att_validation_rejete?.statut == 0
                      ? 'En Attente'
                      : reservation.desistement_att_validation_rejete?.statut ==
                        2
                      ? 'Rejeté'
                      : 'Désister'}
                  </Button>
                )}
                

              {((isSuperAdmin(user.role) || isAdmin(user.role)) &&
                reservation?.etat == 1 &&
                reservation?.contrat_vente == null) ||
                (isCommercial(user.role) &&
                  reservation?.statut == 0 &&
                  reservation?.etat == 1 &&
                  reservation?.contrat_vente == null) && (
                  <div className="flex justify-end">
                    <Button type="edit" onClick={() => handleEdit(reservation.id)}>
                      Modifier
                    </Button>
                  </div>
                )}

             {(isSuperAdmin(user.role) ||
            isAdmin(user.role) ||
            isRespoLivraison(user.role)) &&
            reservation.statut == 1 &&
            sum_avances_valides > 0 &&
            notaires?.length > 0 && (
              <Button
                type="button" // Keep as button since we'll override styles
                onClick={() => handle_affecte(
                  reservation.id,
                  reservation.code_reservation,
                  reservation.notaire_id
                )}
                className={`!px-3 !py-1 text-sm ${
                  reservation.notaire_id 
                    ? '!bg-blue-600 hover:!bg-blue-700 text-white' 
                    : '!bg-green-600 hover:!bg-green-700 text-white'
                }`}
                title={
                  reservation.notaire_id!=null
                    ? "Modifier le notaire" 
                    : "Affecter un notaire"
                }
              >
                {reservation.notaire_id ? (
                  <>
                    Modifier Notaire
                  </>
                ) : (
                  <>
                    Affecter Notaire
                  </>
                )}
              </Button>
          )}
            </>
          )}
        </div>
        {reservation.statut == 2 && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">
                  La Réservation est rejetée en raison de :{' '}
                  {reservation?.last_statut?.commentaire}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}

          <div className="space-y-4">
            {/* General Information Section */}
            <div>
              <h3 className="text-md font-medium text-gray-500">
                Informations générales
              </h3>
              <div className="mt-2 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Code</p>
                    <p className="font-medium">
                      {reservation?.code_reservation || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date Réservation</p>
                    <p className="font-medium">
                      {new Date(reservation.created_at).toLocaleDateString(
                        'fr-FR'
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Statut</p>
                    <p className="font-medium">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reservation.statut == 1
                            ? 'bg-green-100 text-green-800' // Validé
                            : reservation.statut == 2
                            ? 'bg-red-100 text-red-800' // Refusé
                            : reservation.statut == 3
                            ? 'bg-yellow-100 text-yellow-800' // En Attente
                            : reservation.statut == 4
                            ? 'bg-gray-100 text-gray-800' // Annulé
                            : 'bg-blue-100 text-blue-800' // Default case
                        }`}
                      >
                        {reservation.statut == 1 && 'Validé'}
                        {reservation.statut == 2 && 'Refusé'}
                        {reservation.statut == 3 && 'En Attente'}
                        {reservation.statut == 4 && 'Annulé'}
                      </span>
                    </p>
                  </div>
                  {reservation.statut == 1 && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Date Validation</p>
                        <p className="font-medium">
                          {reservation.last_statut != null &&
                            reservation.last_statut.statut == 1 &&
                            (reservation.last_statut.date_validation
                              ? new Date(
                                  reservation.last_statut.date_validation
                                ).toLocaleDateString('fr-FR')
                              : '')}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Responsable Validation
                        </p>
                        <p className="font-medium">
                          {' '}
                          {isSuperAdmin(user.role) || isAdmin(user.role) ? (
                            <>
                              {reservation.user && (
                                <>
                                  <Link
                                    target="_blank"
                                    href={
                                      '/utilisateurs/afficher-utilisateur/' +
                                      reservation.user.id
                                    }
                                    style={{
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <strong>
                                      {reservation.user.name}{' '}
                                      {reservation.user.prenom}
                                    </strong>
                                  </Link>
                                  <br />
                                </>
                              )}
                            </>
                          ) : (
                            reservation.user.name +
                            ' ' +
                            reservation.user.prenom
                          )}
                        </p>
                      </div>
                      {reservation.notaire_id!=null && (
                          <div>
                        <p className="text-sm text-gray-500">
                          Notaire
                        </p>
                        <p className="font-medium">
                          {' '}
                          {isSuperAdmin(user.role) || isAdmin(user.role) ? (
                            <>
                              {reservation?.notaire && (
                                <>
                                  <Link
                                    target="_blank"
                                    href={
                                      '/utilisateurs/afficher-utilisateur/' +
                                      reservation.notaire?.user_id_origin
                                    }
                                    style={{
                                      textDecoration: 'none',
                                    }}
                                  >
                                    <strong>
                                      {reservation.notaire.name}{' '}
                                      {reservation.notaire.prenom}
                                    </strong>
                                  </Link>
                                  <br />
                                </>
                              )}
                            </>
                          ) : (
                            reservation.notaire.name +
                            ' ' +
                            reservation.notaire.prenom
                          )}
                        </p>
                      </div>
                      )}
                    
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Property Information Section */}
            <div>
              <h3 className="text-md font-medium text-gray-500">Propriété</h3>
              <div className="mt-2 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Bien</p>
                    <p className="font-medium">
                      <Link
                        target="_blank"
                        href={'/biens/' + reservation?.bien_id}
                        style={{
                          textDecoration: 'none',
                        }}
                      >
                        {NomBienComplet(reservation.bien)}
                      </Link>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Projet</p>
                    <p className="font-medium">{reservation?.projet?.nom}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Financial Information Section */}
            <div>
              <h3 className="text-md font-medium text-gray-500">
                Informations financières
              </h3>
              <div className="mt-2 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Prix Unitaire</p>
                    <p className="font-medium">
                      {' '}
                      {reservation?.bien.prix_unitaire?.toLocaleString() + ' DH'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prix Remisé</p>
                    <p className="font-medium">
                      {' '}
                      {reservation?.prix_remise?.toLocaleString() + ' DH'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      {' '}
                      Remise Forfaitaire{' '}
                    </p>
                    <p className="font-medium">
                      {' '}
                      {reservation?.prix_forfetaire?.toLocaleString() + ' DH'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Prix</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-blue-500">
                        {reservation?.prix?.toLocaleString() + ' DH'}
                      </p>
                                     

                      {(isSuperAdmin(user.role) || isAdmin(user.role)) &&reservation?.etat == 1 &&
                        reservation?.contrat_vente == null && (
                          <button
                            onClick={() => handleEdit_Prix(reservation.id)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Montant Encaissé</p>
                    <p className="font-medium text-green-500">
                      {' '}
                      {sum_avances_valides?.toLocaleString() + ' DH'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500">Montant Encaissé %</p>
                    <div className="flex items-center gap-2 w-full">
                      <div className="relative w-full bg-gray-200 rounded-full h-5 flex-1">
                        {/* Progress bar */}
                        <div
                          className="bg-blue-300 h-5 rounded-full transition-all duration-300 ease-in-out"
                          style={{
                            width: `${Math.min(
                              Math.round(
                                (sum_avances_valides / reservation?.prix) * 100
                              ),
                              100
                            )}%`,
                          }}
                        ></div>

                        {/* Percentage text inside */}
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-blue-700">
                          {`${Math.round(
                            (sum_avances_valides / reservation?.prix) * 100
                          )}%`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Reste</p>
                    <p className="font-medium text-red-500">
                      {' '}
                      {(
                        reservation?.prix - sum_avances_valides
                      )?.toLocaleString() + ' DH'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Mode Paiement Reliquat
                    </p>
                    <p className="font-medium">
                      {getModeFinanceLabel(reservation?.mode_financement)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            {reservation.commentaire != null && (
              <div>
                <h3 className="text-md font-medium text-gray-500">
                  commentaire
                </h3>
                <div className="mt-2 bg-gray-50 rounded-lg p-4 h-36 overflow-y-auto">
                  <p className="text-md text-gray-700">
                    {reservation.commentaire}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {open_v_reservation && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_v_reservation(false)} maxWidth="max-w-xl">
            <Modal_Valider_Reservation
              res_show={true}
              onReservationUpdate={onReservationUpdate} // Pass the callback
              prix={prix}
              avance={avance}
              aquereurs={aquereurs}
              date_res={date_res}
              commercial={cc}
              code_reservation={code_reservation}
              first_av_statut={first_av_statut}
              first_num_recu={first_num_recu}
              id={ID}
              av_id={av_id}
              onClose={() => setOpen_v_reservation(false)}
              closeParentModal={() => setOpen_v_reservation(false)} // Add this prop
            />
          </Modal>
        </>
      )}
      {/* pour relance reservation rejete */}
      {open_dialog_rejete && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_dialog_rejete(false)}  maxWidth='max-w-lg'>
            <Modal_Relance
              id={reservation.id}
              onClose={() => setOpen_dialog_rejete(false)}
            />
          </Modal>
        </>
      )}
      {open_affecte && (
              <>
                <Modal isVisible={true} onClose={() => setOpen_r(false)}>
                  <Modal_Affecte
                    res_show={true} // Add this
                    old_notaire_id={old_notaire_id}
                    code_reservation={code_reservation}
                    id={ID}
                    notaires={notaires}
                    onReservationUpdate={onReservationUpdate} // Add this
                    onClose={() => setOpen_affecte(false)}
                  />
                </Modal>
              </>
            )}
      {open_r && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_r(false)}>
            <Modal_Rejeter_Reservation
              res_show={true} // Add this
              onReservationUpdate={onReservationUpdate} // Add this
              code_reservation={code_reservation}
              id={ID}
              onClose={() => setOpen_r(false)}
            />
          </Modal>
        </>
      )}
      {open_info && (
        <>
          <Modal isVisible={true} onClose={() => setOpen_info(false)}>
            <Modal_show_info
              dst_id={dst_id}
              text={txt_info}
              statut_dst={statut_dst}
              onClose={() => setOpen_info(false)}
            />
          </Modal>
        </>
      )}
    </>
  );
};

// Then wrap it with memo
export const DetailTab = memo(DetailTabComponent);

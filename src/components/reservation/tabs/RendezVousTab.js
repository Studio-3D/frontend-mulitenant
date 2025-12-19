import React, { forwardRef, useEffect, useState } from 'react';
import {
  CalendarIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PrinterIcon,
  XCircle,
} from 'lucide-react';
import axios from 'axios';
//import Swal from 'sweetalert2';
import format from 'date-fns/format';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReceiptDocument from '../../../app/(dashboard)/ventes/reservations/rdv/recu_rdv';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import DeleteData from '@/components/DeleteData';
import { RESOURCE_URL } from '@/configs/api';
import AddRdvModal from './AddRdvModal';
import Pusher from 'pusher-js';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Validé: {
      icon: <CheckCircleIcon className="h-4 w-4 mr-1" />,
      bgColor: 'bg-green-100 text-green-800',
    },
    Refusé: {
      icon: <XCircleIcon className="h-4 w-4 mr-1" />,
      bgColor: 'bg-red-100 text-red-800',
    },
    En_Attente: {
      icon: <ClockIcon className="h-4 w-4 mr-1" />,
      bgColor: 'bg-blue-100 text-blue-800',
    },
    Raté: {
      icon: <XCircleIcon className="h-4 w-4 mr-1" />,
      bgColor: 'bg-gray-100 text-gray-800',
    },
  };

  const config = statusConfig[status] || statusConfig['En_Attente'];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor}`}
    >
      {config.icon}
      {status.replace('_', ' ')}
    </span>
  );
};

export const RendezVousTab = ({ reservationData, user, onRdvChange }) => {
  //onRdvChange   ===> to call res show to modify count avances in tabs avances atab
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const accessToken = localStorage.getItem('accessToken');
  const reservationId = reservationData?.reservation?.id;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const pusher_key_rdv_list = process.env.NEXT_PUBLIC_PUSHER_APP_KEY_RDV_LIST;

  // State variables
  const [rdvs, setRdvs] = useState([]);
  // const [historiques, setHistoriques] = useState([]);
  const [newRdv, setNewRdv] = useState('');
  const [type, setType] = useState('');
  const [rdvId, setRdvId] = useState('');
  const [rdvEdit, setRdvEdit] = useState('');
  const [typeEdit, setTypeEdit] = useState('');
  const [commentaire, setCommentaire] = useState('');
  // const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState(null);
  const etatRes = reservationData?.reservation?.etat;
  const contratVente = reservationData?.reservation?.contrat_vente;
  const [isLoading, setIsLoading] = useState(true);
  const [listStatut, setListStatut] = useState([
    { title: 'En_Attente', value: 0 },
    { title: 'Validé', value: 1 },
    { title: 'Refusé', value: 2 },
    { title: 'Raté', value: 3 },
  ]);

  // Dialog states
  const [openAddRdv, setOpenAddRdv] = useState(false);
  const [openEditRdv, setOpenEditRdv] = useState(false);
  const [openValidation, setOpenValidation] = useState(false);
  const [openRejet, setOpenRejet] = useState(false);
  //const [openHisto, setOpenHisto] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);
  const [txtInfo, setTxtInfo] = useState('');
  const [confirmRejet, setConfirmRejet] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const types = [
    { title: 'Attestation de vente', value: 1 },
    { title: 'Contrat de vente', value: 2 },
  ];

  const imageUrl = `${RESOURCE_URL.DOCS}/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`;

  // Fetch data
  const fetchData = async () => {
    try {
      if (reservationId) {
        setIsLoading(true);
        const response = await axios.get(
          `${apiUrl}/get_rdvs_reservation/${reservationId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { page: 1, pageSize: 20 },
          }
        );

        const { data } = response;
        setRdvs(data.rdv);
        // setHistoriques(data.historiques.data);
        // Notify res show  parent of changes
        if (onRdvChange) {
          onRdvChange(data.rdv.length);
        }
        /* const clientsList =
          data.last_rdv[0]?.reservation?.aquereurs?.map((aquereur) => ({
            cin: aquereur.client.cin,
            name: aquereur.client.nom,
            prenom: aquereur.client.prenom,
          })) || [];

        setClients(clientsList);*/
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Initialize Pusher with the correct connection
    const initializePusher = () => {
      if (!pusher_key_rdv_list || !reservationId) {
        console.log('Pusher key or reservation ID missing');
        return () => {};
      }

      Pusher.logToConsole = true;
      console.log(
        'Initializing Pusher for rdv list, reservation:',
        reservationId
      );

      // Use the correct Pusher configuration that matches your backend
      const pusher = new Pusher(pusher_key_rdv_list, {
        cluster: 'eu',
        encrypted: true,
        forceTLS: true,
        wsHost: 'ws-eu.pusher.com', // Add explicit WebSocket host
        wssPort: 443,
        enabledTransports: ['ws', 'wss'], // Force WebSocket transport
      });

      // Create the EXACT channel name that matches your Laravel event
      const channelName = `rdv-list-updates-${reservationId}`;
      console.log('Subscribing to channel:', channelName);

      try {
        const channel = pusher.subscribe(channelName);

        channel.bind('RdvEvent', (data) => {
          // Always refresh when we receive an event for this channel
          console.log('Refreshing rdv data via Pusher');
          fetchData();
        });

        // Handle connection events
        channel.bind('pusher:subscription_succeeded', () => {
          console.log('✅ Successfully subscribed to channel:', channelName);
        });

        channel.bind('pusher:subscription_error', (status) => {
          console.error('❌ Pusher subscription error:', status);
        });

        // Also listen for connection state changes
        pusher.connection.bind('state_change', (states) => {
          console.log(
            'Pusher connection state changed:',
            states.previous,
            '->',
            states.current
          );
        });

        pusher.connection.bind('connected', () => {
          console.log('✅ Pusher connected successfully');
        });

        pusher.connection.bind('disconnected', () => {
          console.log('🔴 Pusher disconnected');
        });
      } catch (error) {
        console.error('Error subscribing to Pusher channel:', error);
      }

      // Return cleanup function
      return () => {
        console.log('Cleaning up Pusher subscription for:', channelName);
        if (pusher) {
          pusher.disconnect();
        }
      };
    };

    const cleanupPusher = initializePusher();

    return cleanupPusher;
  }, [reservationId, pusher_key_rdv_list]);

  const handleRdvAdded = (newRdv) => {
    // Rafraîchir la liste des rendez-vous
    fetchData();
    toast.success('Rendez-vous ajouté avec succès');
  };

  const getStatut = (statutId) => {
    const statut = listStatut.find((item) => item.value == statutId);
    return statut ? statut.title : '';
  };

  // CRUD operations with toast notifications
  const handleAddRdv = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('rdv', newRdv);
    formData.append('type', type);
    formData.append('statut', user.role == 3 ? 0 : 1);

    axios
      .post(`${apiUrl}/store_rdv_reservation/${reservationId}`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        fetchData();
        toast.success(
          <>
            {user.role == 3
              ? 'Rendez-vous enregistré (en attente de validation)'
              : 'Rendez-vous enregistré'}
          </>
        );
        setOpenAddRdv(false);
        setNewRdv('');
        setType('');
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status == 422) {
          setErrors(response.data.errors);
          toast.error('Erreur de validation');
        }
      });
  };

  const handleEditRdv = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('rdv', rdvEdit);
    formData.append('type', typeEdit);
    formData.append('statut', user.role <= 2 ? 1 : 0);

    axios
      .put(`${apiUrl}/update_rdv_reservation/${rdvId}`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        fetchData();
        toast.success(
          <>
            {user.role == 3
              ? 'Rendez-vous modifié (en attente de validation)'
              : 'Rendez-vous modifié'}
          </>
        );
        setOpenEditRdv(false);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status == 422) {
          setErrors(response.data.errors);
          toast.error('Erreur de validation');
        }
      });
  };

  const handleValiderRdv = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('statut', 1);

    axios({
      method: 'put',
      url: `${apiUrl}/traiter_rdv_reservation/${rdvId}`,
      data: formData,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        fetchData();
        toast.success('Rendez-vous validé');
        setOpenValidation(false);
      })
      .catch((err) => {
        console.error('Error validating appointment:', err);
        toast.error(' Erreur lors de la validation');
      });
  };

  const handleRejeterRdv = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('statut', 2);
    formData.append('commentaire', commentaire);

    axios({
      method: 'put',
      url: `${apiUrl}/traiter_rdv_reservation/${rdvId}`,
      data: formData,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        fetchData();
        toast.success('Rendez-vous rejeté');
        setOpenRejet(false);
        setCommentaire('');
      })
      .catch((err) => {
        console.error('Error rejecting appointment:', err);
        toast.error('Erreur lors du rejet');
      });
  };

  const handleDeleteRdv = (id, date) => {
    setSelectedId(id);
    setSelectedDate(format(new Date(date), 'dd/MM/yyyy HH:mm'));
    setShowDeleteModal(true);
  };

  // Render
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 min-h-[50vh]">
      {/* Header section */}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-blue-500" />
          Rendez-vous
        </h2>

        {etatRes == 1 && contratVente == null && (
          <button
            onClick={() => setOpenAddRdv(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Ajouter un rendez-vous
          </button>
        )}
      </div>
      {etatRes != 1 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-500">
                Le dossier est désisté. Vous ne pouvez pas ajouter un Rendez
                Vous.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Appointments grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rdvs.map((rdv) => {
          const isPastAppointment = new Date(rdv.rdv) <= new Date();
          return (
            <div
              key={rdv.id}
              className={`border border-gray-200 rounded-lg p-4 ${
                isPastAppointment ? 'bg-yellow-50' : 'bg-white'
              } hover:shadow-md transition-shadow`} // Keep all original classes
            >
              {/* Appointment header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full mr-3 ${
                      rdv.statut == 1
                        ? 'bg-green-50'
                        : rdv.statut == 0
                        ? 'bg-blue-50'
                        : 'bg-gray-50'
                    }`}
                  >
                    <CalendarIcon
                      className={`h-5 w-5 ${
                        rdv.statut == 1
                          ? 'text-green-600'
                          : rdv.statut == 0
                          ? 'text-blue-500'
                          : 'text-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {rdv.type == 1
                        ? 'Attestation de vente'
                        : 'Contrat de vente'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(rdv.rdv), 'dd/MM/yyyy')} à{' '}
                      {format(new Date(rdv.rdv), 'kk:mm')}
                    </p>
                  </div>
                </div>
                {/*<button
                        className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
                        onClick={() => {
                          setRdvId(rdv.id);
                          setRdvEdit(rdv.rdv);
                          setTypeEdit(rdv.type);
                          setOpenEditRdv(true);
                        }}
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>*/}
                <div className="flex space-x-1">
                  {etatRes == 1 && contratVente == null && (
                    <>
                      {user.role <= 2 && rdv.statut == 0 && (
                        <>
                          <button
                            className="p-2 text-gray-500 hover:text-green-500 transition-colors"
                            onClick={() => {
                              setRdvId(rdv.id);
                              setSelectedDate(rdv.rdv);
                              setOpenValidation(true);
                            }}
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                            onClick={() => {
                              setRdvId(rdv.id);
                              setSelectedDate(rdv.rdv);
                              setOpenRejet(true);
                            }}
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      <button
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                        onClick={() => handleDeleteRdv(rdv.id, rdv.rdv)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Appointment details */}
              <div className="mt-4 text-sm">
                <p className="flex items-center text-gray-600 mb-1">
                  <span className="font-medium w-24">Responsable:</span>
                  <span className="flex-1">
                    {rdv.user.name} {rdv.user.prenom}
                  </span>
                </p>
                <p className="flex items-center text-gray-600 mb-1">
                  <span className="font-medium w-24">Statut:</span>
                  <StatusBadge status={getStatut(rdv.statut)} />
                </p>
                {rdv.statut == 1 && (
                  <p className="flex items-center text-gray-600 mb-1">
                    <span className="font-medium w-24">Fiche:</span>
                    <PDFDownloadLink
                      document={
                        <ReceiptDocument
                          /* data={[
                            rdv.reservation.code_reservation,
                            rdv.reservation.bien.propriete_dite_bien,
                            clients,
                            format(new Date(rdv.rdv), "dd/MM/yyyy kk:mm"),
                            imageUrl,
                            rdv.type,
                          ]}*/
                          data={[
                            rdv.reservation.code_reservation,
                            rdv.reservation.bien.propriete_dite_bien,
                            rdv.type == 1
                              ? 'Attestation de vente'
                              : 'Contrat de vente',
                            format(new Date(rdv.rdv), 'dd/MM/yyyy kk:mm'),
                            rdv.num_recu,
                            imageUrl,
                          ]}
                        />
                      }
                      fileName="fiche_rdv.pdf"
                    >
                      {({ loading }) => (
                        <button
                          className="inline-flex items-center text-sm text-blue-500 hover:text-blue-800 disabled:opacity-50"
                          disabled={loading}
                        >
                          <PrinterIcon className="h-4 w-4 mr-1" />
                          {loading ? 'Génération...' : 'Télecharger'}
                        </button>
                      )}
                    </PDFDownloadLink>
                  </p>
                )}
                {rdv.statut == 2 && (
                  <button
                    className="inline-flex items-center text-sm text-red-500 hover:text-red-800"
                    onClick={() => {
                      setTxtInfo(
                        `Le rendez-vous du ${format(
                          new Date(rdv.rdv),
                          'dd/MM/yyyy kk:mm'
                        )} a été rejeté pour la raison suivante: ${
                          rdv.commentaire
                        }`
                      );
                      setOpenInfo(true);
                    }}
                  >
                    Voir le motif
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AddRdvModal
        open={openAddRdv}
        reservation_id={reservationId}
        onClose={() => setOpenAddRdv(false)}
        onRdvAdded={handleRdvAdded}
      />

      {/* Edit RDV Dialog */}
      {openEditRdv && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Modifier le rendez-vous
                </h3>
                <button
                  onClick={() => setOpenEditRdv(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleEditRdv}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date et heure
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={rdvEdit}
                      onChange={(e) => setRdvEdit(e.target.value)}
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={typeEdit}
                      onChange={(e) => setTypeEdit(parseInt(e.target.value))}
                      required
                    >
                      <option value="">Sélectionnez un type</option>
                      {types.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-md">
                      {Object.values(errors).map((error, index) => (
                        <p key={index}>{error[0]}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setOpenEditRdv(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Validation Dialog */}
      {openValidation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Validation du rendez-vous
                </h3>
                <button
                  onClick={() => setOpenValidation(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <p className="mb-6">
                Êtes-vous sûr de vouloir valider le rendez-vous du{' '}
                {selectedDate &&
                  format(new Date(selectedDate), 'dd/MM/yyyy kk:mm')}{' '}
                ?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setOpenValidation(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleValiderRdv}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejet Dialog */}
      {openRejet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {confirmRejet ? 'Motif du rejet' : 'Rejet du rendez-vous'}
                </h3>
                <button
                  onClick={() => setOpenRejet(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              {confirmRejet ? (
                <form onSubmit={handleRejeterRdv}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commentaire <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={commentaire}
                      onChange={(e) => setCommentaire(e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setOpenRejet(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Confirmer
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="mb-6">
                    Êtes-vous sûr de vouloir rejeter le rendez-vous du{' '}
                    {selectedDate &&
                      format(new Date(selectedDate), 'dd/MM/yyyy kk:mm')}{' '}
                    ?
                  </p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setOpenRejet(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={() => setConfirmRejet(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                    >
                      Confirmer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Dialog */}
      {openInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Information</h3>
                <button
                  onClick={() => setOpenInfo(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <p className="mb-6">{txtInfo}</p>
              <div className="flex justify-end">
                <button
                  onClick={() => setOpenInfo(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedId && (
        <Modal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        >
          <DeleteData
            route={`${apiUrl}/destroy_rdv_reservation`}
            message={`Êtes-vous sûr de vouloir supprimer le rendez-vous du ${selectedDate}`}
            Id={selectedId}
            type="Rendez-vous"
            accessToken={accessToken}
            onClose={() => {
              setShowDeleteModal(false);
              fetchData();
            }}
          />
        </Modal>
      )}
      {/* Historique Dialog */}
      {/*openHisto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Historique des rendez-vous
                </h3>
                <button
                  onClick={() => setOpenHisto(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsable
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {historiques.map((histo) => (
                      <tr key={histo.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(histo.rdv), 'dd/MM/yyyy kk:mm')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              histo.type == 1
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {histo.type == 1 ? 'Compromis' : 'Contrat'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {histo.user.name} {histo.user.prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <StatusBadge status={getStatut(histo.statut)} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {histo.statut == 1 && (
                            <PDFDownloadLink
                              document={
                                <Document
                                  data={[
                                    histo.reservation.code_reservation,
                                    histo.reservation.bien.propriete_dite_bien,
                                    clients,
                                    format(
                                      new Date(histo.rdv),
                                      'dd/MM/yyyy kk:mm'
                                    ),
                                    imageUrl,
                                  ]}
                                />
                              }
                              fileName="fiche_rdv.pdf"
                            >
                              {({ loading }) => (
                                <button
                                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                                  disabled={loading}
                                >
                                  <PrinterIcon className="h-4 w-4 mr-1" />
                                  {loading ? 'Génération...' : 'Imprimer'}
                                </button>
                              )}
                            </PDFDownloadLink>
                          )}
                          {histo.statut == 2 && (
                            <button
                              className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
                              onClick={() => {
                                setTxtInfo(
                                  `Le rendez-vous du ${format(
                                    new Date(histo.rdv),
                                    'dd/MM/yyyy kk:mm'
                                  )} a été rejeté pour la raison suivante: ${
                                    histo.commentaire
                                  }`
                                );
                                setOpenInfo(true);
                              }}
                            >
                              Voir le motif
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setOpenHisto(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )*/}
    </div>
  );
};

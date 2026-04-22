import { useState, useEffect } from 'react';
import format from 'date-fns/format';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import {
  Edit2,
  CheckCircle,
  Printer,
  Upload,
  Calendar,
  User,
  FileText,
  Check,
  X,
  File,
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Document_Contrat from '../../../app/(dashboard)/ventes/reservations/contrat_vente/recu';
import Pusher from 'pusher-js';

export const ContractTab = ({
  reservationData,
  user,
  accessToken,
  updateReservationData,
  onContratCreated, // AJOUTER CETTE PROP
}) => {
  const pusher_key_contrat_vente =
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY_CONTRAT_VENTE;
  const FileUrl = process.env.NEXT_PUBLIC_IMG_URL;
  const data_reservation = reservationData?.reservation;
  const etat_res = reservationData?.reservation?.etat;
  const [loading_btn, setLoading_btn] = useState(false);
  const reservationId = reservationData?.reservation?.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [date_sign_client, setDate_sign_client] = useState(null);
  const [date_sign_mo, setDate_sign_mo] = useState(null);
  const [date_enreg, setDate_enreg] = useState(null);
  const [commentaire, setCommentaire] = useState(null);
  const [commentaire_form, setCommentaire_form] = useState(null);
  const [date_sign_client_form, setDate_sign_client_form] = useState(null);
  const [date_sign_mo_form, setDate_sign_mo_form] = useState(null);
  const [date_enreg_form, setDate_enreg_form] = useState(null);

  const [loading, setLoading] = useState(true);
  const sum_avances_valides = reservationData?.sum_avances_valides;
  const [contrat_sign, set_contrat_signe] = useState(null);
  const [contrat_id, setContrat_id] = useState(null);
  const [num_recu, set_num_recu] = useState(null);
  const [respo, set_respo] = useState(null);

  const [errors, setErrors] = useState(null);
  const [open_edit, setOpen_edit] = useState(false);
  const [fichier_scanner, setfichier_scanner] = useState(null);
  const [popupScanner, setPopupScanner] = useState(false);
  const [loading_scann, setLoading_scann] = useState(false);

  const color_var = '#5A5FE0';

  const modifierErreur = (message) => {
    setErrors(message);
    setTimeout(() => setErrors(''), 5000);
  };

  const showToast = (message, type = 'success') => {
    toast[type](message, {
      position: 'top-right',
      duration: 3000,
    });
  };

  const onsubmit_ajouter = (e) => {
    setLoading_btn(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append('date_sign_client', date_sign_client);
    formData.append('date_sign_mo', date_sign_mo);
    formData.append('date_enreg', date_enreg);
   formData.append('commentaire', commentaire || '');

    axios
      .post(`${apiUrl}/store_contrat_vente/${reservationId}`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        fetchData();
        setLoading_btn(false);
        showToast('Contrat ajouté avec succès');
        /*// AJOUTER: Émettre l'événement vers le parent si on scanne contrat step contrat green
        if (onContratCreated) {
          onContratCreated();
        }*/
        if (updateReservationData) {
          updateReservationData({
            reservation: {
              ...reservationData.reservation,
              contrat_vente: 1, // assuming API returns the contract
            },
          });
        }
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status == 422) {
          modifierErreur(response.data.errors);
        }
        setLoading_btn(false);
      });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (reservationId) {
        axios
          .get(`${apiUrl}/get_contrat_by_reservation/${reservationId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          })
          .then((response) => {
            setCommentaire(response.data.contrat?.commentaire||'');
            setContrat_id(response.data.contrat?.id);
            set_num_recu(response.data.contrat?.num_recu);
            set_respo(
              response.data.contrat?.user.name +
                ' ' +
                response.data.contrat?.user.prenom
            );
            setDate_sign_client(response.data.contrat?.date_sign_client);
            setDate_sign_mo(response.data.contrat?.date_sign_mo);
            setDate_enreg(response.data.contrat?.date_enreg);

            setDate_sign_client_form(response.data.contrat?.date_sign_client);
            setDate_sign_mo_form(response.data.contrat?.date_sign_mo);
            setDate_enreg_form(response.data.contrat?.date_enreg);

            set_contrat_signe(response.data.contrat?.piece_jointe);
            setLoading(false);
          })
          .catch((error) => {
            console.error('Error fetching reservation details:', error);
            setLoading(false);
          });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(true);
    }
  };

  const handleFileClick = (file) => {
    window.open(
      `${FileUrl}/docs/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/contrat_vente/${reservationData?.reservation?.code_reservation}/${file}`,
      '_blank'
    );
  };

  useEffect(() => {
    fetchData();

    // Initialize Pusher with the correct connection
    const initializePusher = () => {
      if (!pusher_key_contrat_vente || !reservationId) {
        console.log('Pusher key or reservation ID missing');
        return () => {};
      }

      Pusher.logToConsole = true;
      console.log(
        'Initializing Pusher for contrat list, reservation:',
        reservationId
      );

      // Use the correct Pusher configuration that matches your backend
      const pusher = new Pusher(pusher_key_contrat_vente, {
        cluster: 'eu',
        encrypted: true,
        forceTLS: true,
        wsHost: 'ws-eu.pusher.com', // Add explicit WebSocket host
        wssPort: 443,
        enabledTransports: ['ws', 'wss'], // Force WebSocket transport
      });

      // Create the EXACT channel name that matches your Laravel event
      const channelName = `contrat-vente-updates-${reservationId}`;
      console.log('Subscribing to channel:', channelName);

      try {
        const channel = pusher.subscribe(channelName);

        channel.bind('ContratVenteEvent', (data) => {
          // Always refresh when we receive an event for this channel
          console.log('Refreshing contrat vente data via Pusher');
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
  }, [reservationId, pusher_key_contrat_vente, accessToken, apiUrl]);

  const handleEdit = () => {
    setOpen_edit(!open_edit);
  };

  const onSubmit_edit = (e) => {
    setLoading_btn(true);
    e.preventDefault();

    const formData = new FormData();
    formData.append('date_sign_client', date_sign_client_form);
    formData.append('date_sign_mo', date_sign_mo_form);
    formData.append('date_enreg', date_enreg_form);
    formData.append('comment', commentaire_form);

    axios({
      method: 'put',
      url: `${apiUrl}/update_contrat/${contrat_id}`,
      data: formData,
      headers: {
        'content-type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(() => {
        setOpen_edit(false);
        fetchData();
        showToast('Modification enregistrée avec succès');
        /* if (onContratCreated) {
          onContratCreated();
        }*/
        setLoading_btn(false);
      })
      .catch((err) => {
        const response = err.response;
        if (response && response.status == 422) {
          modifierErreur(response.data.errors);
        }
        setLoading_btn(false);
      });
  };

  const handle_Scanne_recu = () => {
    setPopupScanner(true);
  };

  const closeScannerPopup = () => {
    setPopupScanner(false);
    setfichier_scanner(null);
  };

  const scanner_file = (ev) => {
    ev.preventDefault();
    setLoading_scann(true);

    const formData = new FormData();
    formData.append('contrat_id', contrat_id);
    formData.append('fichier_scanner', fichier_scanner);

    axios
      .post(`${apiUrl}/scanner_contrat`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      .then(() => {
        showToast('Fichier scanné avec succès');
        setLoading_scann(false);
        closeScannerPopup();
        if (onContratCreated) {
          onContratCreated();
        }

        fetchData();
      })
      .catch((err) => {
        console.log('err' + err);
        setLoading_scann(false);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Chargement des détails du contrat...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Toaster />

      {contrat_id == null ? (
        <>
          {etat_res != 1 ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-500">
                    Le dossier est désisté. Vous ne pouvez pas ajouter un
                    Contrat de Vente.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full">
              {/* Add Contract Form - Now above preview */}
              <div className="bg-white rounded-xl overflow-hidden border border-gray-100 mb-8">
                <div className="bg-[#009FFF] px-6 py-4 flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-white" />
                  <h2 className="text-xl font-bold text-white flex items-center">
                    Ajouter un nouveau contrat
                  </h2>
                </div>

                <form onSubmit={onsubmit_ajouter} className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Date Signature Client
                        <span className="text-red-500 ml-1">*</span> :
                      </label>
                      <input
                        type="date"
                        required
                        onChange={(e) => setDate_sign_client(e.target.value)}
                        className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009FFF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="date-sign-mo"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Date Signature MO
                        <span className="text-red-500 ml-1">*</span> :
                      </label>

                      <input
                        id="date-sign-mo"
                        type="date"
                        required
                        onChange={(e) => setDate_sign_mo(e.target.value)}
                        className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009FFF]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Date Enregistrement
                        <span className="text-red-500 ml-1">*</span> :
                      </label>
                      <input
                        type="date"
                        required
                        onChange={(e) => setDate_enreg(e.target.value)}
                        className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009FFF]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Commentaire :
                    </label>
                    <textarea
                      rows={3}
                      onChange={(e) => setCommentaire(e.target.value)}
                      className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009FFF]"
                      placeholder="Ajoutez des notes ou détails importants..."
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="reset"
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center"
                    >
                      Annuler
                    </button>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#009FFF] text-white rounded-lg  shadow-md hover:shadow-lg flex items-center"
                      disabled={loading_btn}
                    >
                      Enregistrer le contrat
                    </button>
                  </div>
                </form>
              </div>

              {/* Contract Preview - Now below form */}
              <div className="bg-white rounded-xl  overflow-hidden border border-gray-100">
                <div className="bg-[#009FFF] px-6 py-4 ">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-white" />
                      <h2 className="text-xl font-bold text-white flex items-center">
                        Aperçu du contrat
                      </h2>
                    </div>
                    <div className="text-md font-bold text-white">
                      Bientôt généré
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white rounded-lg shadow-sm">
                  {/* Header */}
                  <div className="border-b border-gray-200 pb-4 mb-6 text-center">
                    <h3 className="text-2xl font-bold text-[#5A5FE0] mb-2">
                      Contrat de vente
                    </h3>
                    <div className="flex justify-center space-x-6">
                      <p className="text-sm text-gray-600">
                        Dossier: {data_reservation?.code_reservation || ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        N°: {data_reservation?.num_recu || 'XXXX'}
                      </p>
                    </div>
                  </div>

                  {/* Parties Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-[#5A5FE0] border-b border-[#EEEEEE] pb-2 mb-4">
                      Les parties
                    </h4>

                    {/* Vendeur */}
                    <div className="bg-[#F0F7FF] p-4 rounded-lg border-l-4 border-[#5A5FE0] mb-4">
                      <div className="flex items-center mb-2">
                        <div className="bg-[#5A5FE0] text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          V
                        </div>
                        <h5 className="font-bold text-[#5A5FE0]">Vendeur</h5>
                      </div>
                      <p className="text-sm">
                        {user?.societe?.raison_sociale}, société à
                        responsabilité limitée de droit Marocain, au capital
                        social de 100.000,00 de dirhams, ayant son siège social
                        à  {user?.societe?.adresse}.
                      </p>
                    </div>

                    {/* Acheteur */}
                    <div className="bg-[#F5F0FF] p-4 rounded-lg border-l-4 border-[#5A5FE0]">
                      <div className="flex items-center mb-2">
                        <div className="bg-[#5A5FE0] text-white w-6 h-6 rounded-full flex items-center justify-center mr-2">
                          A
                        </div>
                        <h5 className="font-bold text-[#5A5FE0]">Acheteur</h5>
                      </div>
                      {data_reservation?.aquereurs ? (
                        Object.keys(data_reservation.aquereurs).map((key) => (
                          <div key={key} className="mb-3">
                            <p className="text-sm font-semibold">
                              {data_reservation.aquereurs[key].client
                                .civilite == 1
                                ? 'Mr'
                                : data_reservation.aquereurs[key].client
                                    .civilite == 2
                                ? 'Mme'
                                : 'Mlle'}{' '}
                              {data_reservation.aquereurs[key].client.nom}{' '}
                              {data_reservation.aquereurs[key].client.prenom}
                            </p>
                            <p className="text-sm">
                              CIN:{' '}
                              {data_reservation.aquereurs[key].client.cin ||
                                'Non renseigné'}
                            </p>
                            <p className="text-sm">
                              Adresse:{' '}
                              {data_reservation.aquereurs[key].client.adresse ||
                                'Non renseigné'}
                              {data_reservation.aquereurs[key].client.ville
                                ? `, ${data_reservation.aquereurs[key].client.ville}`
                                : ''}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm">Aucun acheteur renseigné</p>
                      )}
                    </div>
                  </div>

                  {/* Détails du bien */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-[#5A5FE0] border-b border-[#EEEEEE] pb-2 mb-4">
                      Détails du bien 
                    </h4>
                    <div className="bg-[#F5F0F5] p-4 rounded-lg border-l-4 border-[#5A5FE0]">
                      <p className="text-sm mb-3">
                        Ce bien immobilier est un{' '}
                        {data_reservation?.bien?.type_bien?.type ||
                          'type non spécifié'}
                        , identifié par le numéro{' '}
                        {data_reservation?.bien?.numero || 'non renseigné'}. Il
                        est situé au{' '}
                          {data_reservation?.bien.niveau == 0
                          ? 'RDC'
                          : data_reservation?.bien.niveau == 1
                          ? '1er étage'
                          : data_reservation?.bien.niveau + 'ème étage'}
                        
                        et offre une superficie habitable de{' '}
                        {data_reservation?.bien?.superficie_habitable || '0'}{' '}
                        m².
                        {data_reservation?.bien?.superficie_balcon > 0 &&
                          ` Le bien comprend un balcon de ${data_reservation.bien.superficie_balcon} m².`}
                        {data_reservation?.bien?.superficie_terrasse > 0 &&
                          ` Il dispose également d'une terrasse de ${data_reservation.bien.superficie_terrasse} m².`}
                      </p>
                           {data_reservation?.bien?.composition_bien?.length  && (
                            <>
                                <p className="text-sm font-semibold mb-1">Composition:</p>
                                  {data_reservation?.bien?.composition_bien?.length > 0 ? (
                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                      {(() => {
                                        const summedComposition =
                                          data_reservation.bien.composition_bien.reduce(
                                            (acc, curr) => ({
                                              nbre_halls:
                                                (acc.nbre_halls || 0) +
                                                (curr.nbre_halls || 0),
                                              nbre_salons:
                                                (acc.nbre_salons || 0) +
                                                (curr.nbre_salons || 0),
                                              nbre_chambres:
                                                (acc.nbre_chambres || 0) +
                                                (curr.nbre_chambres || 0),
                                              nbre_cuisines:
                                                (acc.nbre_cuisines || 0) +
                                                (curr.nbre_cuisines || 0),
                                              nbre_sdb:
                                                (acc.nbre_sdb || 0) + (curr.nbre_sdb || 0),
                                              nbre_balcons:
                                                (acc.nbre_balcons || 0) +
                                                (curr.nbre_balcons || 0),
                                              nbre_buanderies:
                                                (acc.nbre_buanderies || 0) +
                                                (curr.nbre_buanderies || 0),
                                              nbre_placards:
                                                (acc.nbre_placards || 0) +
                                                (curr.nbre_placards || 0),
                                              nbre_receptions:
                                                (acc.nbre_receptions || 0) +
                                                (curr.nbre_receptions || 0),
                                            }),
                                            {}
                                          );

                                        return (
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {summedComposition.nbre_halls > 0 && (
                                              <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded text-xs">
                                                {summedComposition.nbre_halls} Hall
                                                {summedComposition.nbre_halls > 1
                                                  ? 's'
                                                  : ''}
                                              </span>
                                            )}
                                            {summedComposition.nbre_salons > 0 && (
                                              <span className="bg-green-50 text-green-800 px-2 py-1 rounded text-xs">
                                                {summedComposition.nbre_salons} Salon
                                              </span>
                                            )}
                                            {summedComposition.nbre_chambres > 0 && (
                                              <span className="bg-purple-50 text-purple-800 px-2 py-1 rounded text-xs">
                                                {summedComposition.nbre_chambres} Chambre
                                                {summedComposition.nbre_chambres > 1
                                                  ? 's'
                                                  : ''}
                                              </span>
                                            )}
                                            {summedComposition.nbre_cuisines > 0 && (
                                              <span className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded text-xs">
                                                {summedComposition.nbre_cuisines} Cuisine
                                              </span>
                                            )}
                                            {summedComposition.nbre_sdb > 0 && (
                                              <span className="bg-red-50 text-red-800 px-2 py-1 rounded text-xs">
                                                {summedComposition.nbre_sdb} Salle
                                                {summedComposition.nbre_sdb > 1
                                                  ? 's'
                                                  : ''}{' '}
                                                de bain
                                              </span>
                                            )}
                                            {summedComposition.nbre_balcons > 0 && (
                                              <span className="bg-indigo-50 text-indigo-800 px-2 py-1 rounded text-xs">
                                                {summedComposition.nbre_balcons} Balcon
                                                {summedComposition.nbre_balcons > 1
                                                  ? 's'
                                                  : ''}
                                              </span>
                                            )}
                                            {summedComposition.nbre_buanderies > 0 && (
                                              <span className="bg-teal-50 text-teal-800 px-2 py-1 rounded text-xs">
                                                {summedComposition.nbre_buanderies}{' '}
                                                Buanderie
                                              </span>
                                            )}
                                            {summedComposition.nbre_placards > 0 && (
                                              <span className="bg-orange-50 text-orange-800 px-2 py-1 rounded text-xs">
                                                {summedComposition.nbre_placards} Placard
                                                {summedComposition.nbre_placards > 1
                                                  ? 's'
                                                  : ''}
                                              </span>
                                            )}
                                            {summedComposition.nbre_receptions > 0 && (
                                              <span className="bg-pink-50 text-pink-800 px-2 py-1 rounded text-xs">
                                                {summedComposition.nbre_receptions}{' '}
                                                Réception
                                                {summedComposition.nbre_receptions > 1
                                                  ? 's'
                                                  : ''}
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500">Non spécifiée</p>
                                  )}
                              </>
                           )}
                      
                    </div>
                  </div>
                  {/* Conditions financières */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-[#5A5FE0] border-b border-[#EEEEEE] pb-2 mb-4">
                      Conditions financières
                    </h4>
                    <div className="bg-[#F0F7F0] p-4 rounded-lg border-l-4 border-[#5A5FE0]">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">
                          Prix global (DHS):
                        </span>
                        <span className="text-sm font-bold text-[#5A5FE0]">
                          {data_reservation?.prix
                            ? `${data_reservation.prix.toLocaleString(
                                'fr-FR'
                              )} `
                            : ''}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">
                          Acompte versé (DHS):
                        </span>
                        <span className="text-sm font-bold text-[#5A5FE0]">
                          {sum_avances_valides
                            ? `${sum_avances_valides.toLocaleString('fr-FR')}`
                            : '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold">
                          Reste à payer (DHS):
                        </span>
                        <span className="text-sm font-bold text-[#5A5FE0]">
                          {data_reservation?.prix && sum_avances_valides
                            ? `${(
                                data_reservation.prix - sum_avances_valides
                              ).toLocaleString('fr-FR')}`
                            : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates Section */}
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-[#5A5FE0] border-b border-[#EEEEEE] pb-2 mb-4">
                      Dates du contrat
                    </h4>
                    <div className="bg-[#F0F5FF] p-4 rounded-lg border-l-4 border-[#5A5FE0]">
                      <p className="text-sm">
                        Il est énoncé que le client a signé le contrat en{' '}
                        <span className="font-semibold">
                          {date_sign_client
                            ? format(new Date(date_sign_client), 'dd/MM/yyyy')
                            : 'date non renseignée'}
                        </span>{' '}
                        et le Maitre {"d' "}Ouvrage en{' '}
                        <span className="font-semibold">
                          {date_sign_mo
                            ? format(new Date(date_sign_mo), 'dd/MM/yyyy')
                            : 'date non renseignée'}
                        </span>{' '}
                        et enregistré en{' '}
                        <span className="font-semibold">
                          {date_enreg
                            ? format(new Date(date_enreg), 'dd/MM/yyyy')
                            : 'date non renseignée'}
                        </span>
                        .
                      </p>
                    </div>
                  </div>

                  {/* Signatures */}
                  <div>
                    <h4 className="text-lg font-bold text-[#5A5FE0] border-b border-[#EEEEEE] pb-2 mb-4">
                      Signatures
                    </h4>
                    <div className="flex justify-between mt-8 pt-4">
                      <div className="w-[45%] text-center">
                        <div
                          className="border-t border-black mb-2 mx-auto"
                          style={{ width: '70%' }}
                        ></div>
                        <p className="text-sm text-gray-600">
                          Signature du Client
                        </p>
                      </div>
                      <div className="w-[45%] text-center">
                        <div
                          className="border-t border-black mb-2 mx-auto"
                          style={{ width: '70%' }}
                        ></div>
                        <p className="text-sm text-gray-600">
                          Signature du Responsable
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="">
          {/* Contract Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#009FFF] rounded-t-xl px-6 py-5">
            <div>
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-white" />
                <h1 className="text-xl font-bold text-white flex items-center">
                  Contrat de Vente
                </h1>
              </div>
              <p className="text-white font-semibold">
                Dossier: {data_reservation?.code_reservation}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium text-white">
                  N°: {num_recu}
                </div>
                <div className="bg-emerald-500 px-3 py-1 rounded-full text-sm font-medium text-white">
                  {contrat_sign
                    ? 'Signé et enregistré'
                    : 'En attente de signature'}
                </div>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-white rounded-b-xl shadow-xl border border-gray-100 divide-y divide-gray-100">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                    <User className="text-blue-800 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Responsable
                    </h3>
                    <p className="text-lg font-semibold">{respo}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="flex items-center mb-3">
                  <div className="bg-indigo-100 p-2 rounded-lg mr-4">
                    <Calendar className="text-indigo-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Date {"d'"}enregistrement
                    </h3>
                    <p className="text-lg font-semibold">
                      {date_enreg
                        ? format(new Date(date_enreg), 'dd/MM/yyyy')
                        : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center mb-3">
                  <div className="bg-green-300 p-2 rounded-lg mr-4">
                    <CheckCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Statut
                    </h3>
                    <p className="text-lg font-semibold">
                      {contrat_sign
                        ? 'Signé et enregistré'
                        : 'En attente de signature'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Chronologie du contrat
              </h3>
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-4 top-0 h-full w-0.5 bg-blue-200"></div>

                <div className="relative pl-12 pb-8">
                  {/* Registration */}
                  <div className="relative mb-8">
                    <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="text-white" />
                    </div>
                    <div className="flex justify-between items-start pl-10">
                      {' '}
                      {/* Added pl-10 for padding */}
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Préparation
                        </h4>
                        <p className="text-sm text-gray-600">
                          {date_enreg
                            ? format(new Date(date_enreg), 'dd/MM/yyyy')
                            : 'Date non définie'}
                        </p>
                      </div>
                      <div className="bg-green-100 px-3 py-1 rounded-full text-green-600 text-sm font-medium">
                        Terminé
                      </div>
                    </div>
                  </div>
                  {/* Client Signature */}
                  <div className="mb-8 relative">
                    {contrat_sign && (
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="text-white" />
                      </div>
                    )}
                    <div className="flex justify-between items-start pl-10">
                      {' '}
                      {/* Added pl-10 for padding */}
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Signature du client
                        </h4>
                        <p className="text-sm text-gray-600">
                          {date_sign_client
                            ? format(new Date(date_sign_client), 'dd/MM/yyyy')
                            : 'Date non définie'}
                        </p>
                      </div>
                      <div className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 text-sm font-medium">
                        {contrat_sign ? 'Terminé' : 'En Attente'}
                      </div>
                    </div>
                  </div>

                  {/* MO Signature */}
                  <div className="mb-8 relative">
                    {contrat_sign && (
                      <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="text-white" />
                      </div>
                    )}
                    <div className="flex justify-between items-start pl-10">
                      {' '}
                      {/* Added pl-10 for padding */}
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Signature maître {"d'"}ouvrage
                        </h4>
                        <p className="text-sm text-gray-600">
                          {date_sign_mo
                            ? format(new Date(date_sign_mo), 'dd/MM/yyyy')
                            : 'Date non définie'}
                        </p>
                      </div>
                      <div className="bg-indigo-100 px-3 py-1 rounded-full text-indigo-700 text-sm font-medium">
                        {contrat_sign ? 'Terminé' : 'En Attente'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Document Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Document signé
                </h3>
                {contrat_sign == null && (
                  <div className="flex space-x-2">
                    {/*etat_res == 1 && (
                      <button
                        onClick={handle_Scanne_recu}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg flex items-center text-sm hover:from-blue-700 hover:to-indigo-800 transition-all"
                      >
                        <FiUpload className="mr-2" />
                        {contrat_sign ? 'Modifier contrat' : 'Ajouter contrat signé'}
                      </button>
                    )*/}

                    <PDFDownloadLink
                      document={
                        <Document_Contrat
                          data={{
                            ...reservationData?.reservation,
                            date_sign_client,
                            date_sign_mo,
                            date_enreg,
                            commentaire,
                            sum_avances_valides,
                            societe: user?.societe,
                            num_recu: num_recu || 'temp',
                          }}
                        />
                      }
                      fileName={`contrat_vente_${num_recu || 'temp'}.pdf`}
                    >
                      {({ loading }) => (
                        <>
                          {loading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                              Génération...
                            </>
                          ) : (
                            <>
                              <button className="px-4 py-2 bg-gray-800 text-white rounded-lg flex items-center text-sm hover:bg-gray-900 transition-colors">
                                <Printer className="mr-2" />
                                Télécharger le Pdf
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </PDFDownloadLink>
                    {etat_res == 1 && (
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center text-sm hover:bg-gray-200 transition-colors"
                      >
                        <Edit2 className="mr-2" />
                        Modifier
                      </button>
                    )}
                  </div>
                )}
              </div>

              {contrat_sign ? (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center">
                    {contrat_sign?.toLowerCase()?.endsWith('.pdf') ? (
                      <File className="text-red-500 text-3xl mr-4" />
                    ) : (
                      <img
                        src={`${FileUrl}/docs/${user?.societe?.raison_sociale_concatene}_${user.societe?.id}/contrat_vente/${reservationData?.reservation?.code_reservation}/${contrat_sign}`}
                        alt="Document preview"
                        className="w-12 h-12 object-cover rounded mr-4"
                      />
                    )}
                    <div>
                      <p className="font-medium">{contrat_sign}</p>
                      <p className="text-sm text-gray-500">Document signé</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleFileClick(contrat_sign)}
                    className="px-4 py-2 bg-white border border-blue-600 text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Voir le document
                  </button>
                </div>
              ) : (
                <>
                  {etat_res == 1 && (
                    <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                      <FileText className="mx-auto text-gray-400 text-4xl mb-3" />
                      <h4 className="text-lg font-medium text-gray-700 mb-1">
                        Aucun document signé disponible
                      </h4>
                      <p className="text-gray-500 mb-4">
                        Veuillez ajouter le contrat signé pour compléter le
                        dossier
                      </p>
                      <button
                        onClick={handle_Scanne_recu}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg flex items-center mx-auto hover:from-blue-700 hover:to-indigo-800 transition-all"
                      >
                        <Upload className="mr-2" />
                        Ajouter le document signé
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Comments Section */}
            {commentaire && (
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  Commentaires
                </h3>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <p className="text-gray-700">{commentaire}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {open_edit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
            <div className="bg-[#009FFF] px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                Modifier le contrat
              </h3>
            </div>

            <form onSubmit={onSubmit_edit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date Signature Client
                    <span className="text-red-500 ml-1">*</span> :
                  </label>
                  <input
                    type="date"
                    required
                    defaultValue={date_sign_client}
                    onChange={(e) => setDate_sign_client_form(e.target.value)}
                    className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009FFF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date Signature Maitre Ouvrage
                    <span className="text-red-500 ml-1">*</span> :
                  </label>
                  <input
                    type="date"
                    required
                    defaultValue={date_sign_mo}
                    onChange={(e) => setDate_sign_mo_form(e.target.value)}
                    className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009FFF]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Date Enregistrement
                    <span className="text-red-500 ml-1">*</span> :
                  </label>
                  <input
                    type="date"
                    required
                    defaultValue={date_enreg}
                    onChange={(e) => setDate_enreg_form(e.target.value)}
                    className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009FFF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Commentaire :
                </label>
                <textarea
                  rows={3}
                  defaultValue={commentaire}
                  onChange={(e) => setCommentaire_form(e.target.value)}
                  className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#009FFF]"
                  placeholder="Ajoutez des notes ou détails importants..."
                />
              </div>

              {errors && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                  {Object.keys(errors).map((key) => (
                    <p key={key} className="text-sm text-red-700">
                      {errors[key][0]}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleEdit}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#009FFF] text-white rounded-lg  shadow-md hover:shadow-lg flex items-center"
                  disabled={loading_btn}
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scanner Modal */}
      {popupScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {contrat_sign
                  ? 'Modifier le contrat signé'
                  : 'Ajouter le contrat signé'}
              </h3>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="mr-2 text-blue-600" />
                  Téléverser le document signé{' '}
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="space-y-1 text-center">
                    {fichier_scanner ? (
                      <div className="text-center">
                        <File className="mx-auto text-red-500 text-4xl mb-3" />
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {fichier_scanner.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(fichier_scanner.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-800 hover:text-blue-500">
                            <span>Téléverser un fichier</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="application/pdf, image/*"
                              onChange={(e) =>
                                setfichier_scanner(e.target.files[0])
                              }
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, JPG, PNG jusqu à 10MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  onClick={closeScannerPopup}
                  className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Annuler
                </button>

                <button
                  onClick={scanner_file}
                  disabled={!fichier_scanner || loading_scann}
                  className={`px-5 py-2.5 rounded-lg flex items-center ${
                    fichier_scanner && !loading_scann
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-md'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading_scann ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : (
                    <Check className="mr-2" />
                  )}
                  {contrat_sign ? 'Mettre à jour' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import axios from 'axios';
import format from 'date-fns/format';
import TextField from '@/components/Textfield';
import SelectInput from '@/components/SelectInput';
import Compromis_show from '../../../app/(dashboard)/ventes/reservations/compromis_ventes/show';
import {
  UserRound,
  FileText,
  Signature,
  Clock,
  Eye,
  XCircle,
} from 'lucide-react';
import Pusher from 'pusher-js';

export const CompromisVentesTab = ({
  reservationData,
  user,
  accessToken: propAccessToken,
  onCompromisCreated, // Ajouter cette prop
}) => {
  const pusher_key_attestation_vente =
    process.env.NEXT_PUBLIC_PUSHER_APP_KEY_ATTESTATION_VENTE;

  const accessToken = propAccessToken || localStorage.getItem('accessToken');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const reservationId = reservationData?.reservation?.id;

  function NomBienComplet(bien) {
    const noms = [];

    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);

    noms.push(bien.propriete_dite_bien);

    return noms.join(' - ');
  }
  // State management
  const [data, setData] = useState({
    compromis: null,
    loading: true,
    loadingBtn: false,
    errors: null,
    openPreview: false,
    nb_compromis_annule: 0,
    reservationDetails: reservationData?.reservation,
    bien: reservationData.reservation?.bien,
    sum_avances_valides: reservationData?.sum_avances_valides,
    clients:reservationData.reservation?.aquereurs || [],
    etat_res: reservationData.reservation?.etat,
  });

  // Form fields
  const [form, setForm] = useState({
    duree_echeance: null,
    date_echeance: null,
    date_sign_client: null,
    date_sign_mo: null,
    date_enreg: null,
    commentaire: null,
  });
  // Check if all required dates are filled
  const isFormValid =
    form.date_sign_client && form.date_sign_mo && form.date_enreg;

  // Duration options
  const durationOptions = [
    { value: '3', label: '3 Mois' },
    { value: '6', label: '6 Mois' },
    { value: '12', label: '12 Mois' },
    { value: 'Autre', label: 'Autre' },
  ];

  // Handle errors
  const handleError = (message) => {
    setData((prev) => ({ ...prev, errors: message }));
    setTimeout(() => setData((prev) => ({ ...prev, errors: null })), 5000);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setData((prev) => ({ ...prev, loadingBtn: true }));

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      await axios.post(
        `${apiUrl}/store_compromis_vente/${reservationId}`,
        formData,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
        // Émettre l'événement vers le parent si on store compromis step appttesation be green
      /*if (onCompromisCreated) {
        onCompromisCreated();
      }*/
      fetchData();
    } catch (err) {
      if (err.response?.status == 422) handleError(err.response.data.errors);
    } finally {
      setData((prev) => ({ ...prev, loadingBtn: false }));
    }
  };
  const style_p = {
    color: 'rgb(42 44 62)',
  };
  // Fetch data
const fetchData = async () => {
  setData((prev) => ({ ...prev, loading: true }));

  try {
    if (!reservationId) return;

    const response = await axios.get(
      `${apiUrl}/get_compromis_by_reservation/${reservationId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const resData = response.data;
    
    // Fix: Access the data directly from resData, not from resData.reservation.original
    setData((prev) => ({
      ...prev,
      compromis: resData.compromis,
      nb_compromis_annule: resData.compromis_annule_count,
    }));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    setData((prev) => ({ ...prev, loading: false }));
  }
};

  useEffect(() => {
    fetchData();

    // Initialize Pusher with the correct connection
    const initializePusher = () => {
      if (!pusher_key_attestation_vente || !reservationId) {
        console.log('Pusher key or reservation ID missing');
        return () => {};
      }

      Pusher.logToConsole = true;
      console.log(
        'Initializing Pusher for rdv list, reservation:',
        reservationId
      );

      // Use the correct Pusher configuration that matches your backend
      const pusher = new Pusher(pusher_key_attestation_vente, {
        cluster: 'eu',
        encrypted: true,
        forceTLS: true,
        wsHost: 'ws-eu.pusher.com', // Add explicit WebSocket host
        wssPort: 443,
        enabledTransports: ['ws', 'wss'], // Force WebSocket transport
      });

      // Create the EXACT channel name that matches your Laravel event
      const channelName = `attestation-vente-updates-${reservationId}`;
      console.log('Subscribing to channel:', channelName);

      try {
        const channel = pusher.subscribe(channelName);
        console.log('hoop');

        channel.bind('AttestationVenteEvent', (data) => {
          // Always refresh when we receive an event for this channel
          console.log('Refreshing att vente data via Pusher');
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
  }, [reservationId, pusher_key_attestation_vente]);

  if (data.loading)
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );

  if (data.compromis == null) {
    if (data.etat_res != 1) {
      return (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-500">
                Le dossier est désisté. Vous ne pouvez pas ajouter une
                attestation de Vente.
              </p>
            </div>
          </div>
        </div>
      );
    }
  } else {
    return (
      <Compromis_show
        etat_res={data.etat_res}
        user={user}
        reservationData={reservationData}
        data_c={data.compromis}
        nb_compromis_annule={data.nb_compromis_annule}
        onCompromisCreated={onCompromisCreated}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Modal */}
      {data.openPreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              onClick={() =>
                setData((prev) => ({ ...prev, openPreview: false }))
              }
            >
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
              &#8203;
            </span>
            <div className="inline-block w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all sm:my-8 sm:align-middle">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white">
                <h3 className="text-xl font-semibold">
                  Prévisualisation de {"l'"}attestation de Vente
                </h3>
              </div>

              {/* Modal Content */}
              <div className="max-h-[80vh] overflow-y-auto p-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  {/* Header */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                     <div className="flex items-center mb-4 md:mb-0">
                          {/* Logo image instead of SVG */}
                          {user?.societe?.raison_sociale_concatene && user?.societe?.id && user?.societe?.logo && (
                            <div className="mr-3">
                              <img
                                src={`/images/${user.societe.raison_sociale_concatene}_${user.societe.id}/logos/${user.societe.logo}`}
                                alt="Logo société"
                                className="h-8 w-8 object-contain"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">
                          {user?.societe?.raison_sociale}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {user?.societe?.adresse}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user?.societe?.adresse}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user?.societe?.adresse}
                        </p>
                        {user?.societe?.tel && <p className="text-sm text-gray-600">Tél: {user?.societe?.tel}</p>}
                        {user?.societe?.email && <p className="text-sm text-gray-600">Email: {user?.societe?.email}</p>}
                        {user?.societe?.rc && <p className="text-sm text-gray-600">RC: {user?.societe?.rc}</p>}
                        {user?.societe?.ice && <p className="text-sm text-gray-600">ICE: {user?.societe?.ice}</p>}

                         </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-20">
                          N°:
                        </span>
                        <span className="text-gray-800 font-medium"></span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-20">
                          Date:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {format(new Date(), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-indigo-700">
                      ATTESTATION DE VENTE
                    </h1>
                    <div className="mt-2 h-1 bg-gradient-to-r from-blue-100 via-indigo-400 to-blue-100"></div>
                  </div>

                  {/* Document Content */}
                  <div className="space-y-8">
                    {/* Parties */}
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-600 mb-3 border-b pb-1">
                        LES SOUSSIGNES
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        LA SOCIETE «{' '}
                        <span className="font-bold">
                          {user?.societe?.raison_sociale}
                        </span>{' '}
                        », société à responsabilité limitée de droit Marocain,
                        au capital social de 100.000,00 de dirhams, ayant son
                        siège social à{user?.societe?.adresse},
                        immatriculée au registre du commerce de Casablanca sous
                        n° {user?.societe?.rc} et dont le numéro de {"l'"}identifiant fiscal
                        est le n° {user?.societe?.ice}.
                      </p>
                    </div>

                    {/* Client Info */}
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-600 mb-3 border-b pb-1">
                        LE RESERVANT {"D'"}UNE PART
                      </h3>
                      <div className="space-y-4">
                        {data.clients?.map((client, idx) => (
                          <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700">
                              <span className="font-medium">
                                {client.client.civilite} {client.client.nom}{' '}
                                {client.client.prenom}
                              </span>
                              , titulaire de la carte {"d'"}identité nationale
                              n° {client.client.cin}
                              {client.client.adresse &&
                                `, domicilié à ${client.client.adresse}, ${client.client.ville}`}
                              .
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Article 1 */}
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-600 mb-3 border-b pb-1">
                        LE RESERVATAIRE{" D'"}AUTRE PART
                      </h3>
                      <h6 className="text-black font-bold underline">
                        Article 1 : OBJET
                      </h6>
                      <p
                        className="text-gray-700 leading-relaxed mt-2"
                        style={style_p}
                      >
                        Le réservant, {"s'"}engage à réserver, en {"s'"}
                        obligeant à toutes les garanties ordinaires de fait et
                        de droits les plus étendus en pareille matière ; Au
                        réservataire qui
                        {"s'"}engage {"d'"}acquérir, le bien immobilier dont la
                        désignation suit
                      </p>
                    </div>

                    {/* Article 2 */}
                    <div>
                      <h6 className="text-black font-bold underline">
                        Article 2 : Désignation
                      </h6>
                      <p
                        className="text-gray-700 leading-relaxed mt-2"
                        style={style_p}
                      >
                        le Bien est un {data.reservationDetails?.bien.type_bien?.type}
                        <b> n° {data.reservationDetails?.bien.numero}</b> sous
                        le nom :<b>{NomBienComplet(data.bien)} </b>.à distraire des propriétés dénommées
                        : -« » objet du titre foncier mère numéro {data.reservationDetails?.bien?.projet?.numero} Ce
                        Bien sera situé au{' '}
                        <b>
                         {data.reservationDetails?.bien.niveau == 0
                          ? 'RDC'
                          : data.reservationDetails?.bien.niveau == 1
                          ? '1er étage'
                          : data.reservationDetails?.bien.niveau + 'ème étage'}
                        </b>
                        , {"D'"}une superficie approximative de{' '}
                        <b>
                          {data.reservationDetails?.bien.superficie_habitable}{' '}
                          m²{' '}
                        </b>{' '}
                        dont {data.reservationDetails?.bien.superficie_balcon > 0 && (
                          
                          <p>un balcon et buanderie {"d'"}une superficie
                              approximative de{' '}
                              <b>
                                {data.reservationDetails?.bien.superficie_balcon} m²
                              </b>{' '}
                            
                        </p>)}
                      </p>
                      <p>
                        {/* Terrasse condition */}
                        {data.reservationDetails?.bien.superficie_terrasse >
                          0 && (
                          <>
                            Et une terrasse {"d'"}une superficie approximative
                            de{' '}
                            <b>
                              {
                                data.reservationDetails?.bien
                                  .superficie_terrasse
                              }{' '}
                              m²
                            </b>{' '}
                          </>
                        )}

                        {/* Composition logic (sum all entries) */}
                        {data.reservationDetails?.bien.composition_bien
                          ?.length > 0 && (
                          <>
                            Il sera composé de :
                            {(() => {
                              // Sum all values from composition_bien array
                              const summedComposition =
                                data.reservationDetails.bien.composition_bien.reduce(
                                  (acc, curr) => {
                                    return {
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
                                        (acc.nbre_sdb || 0) +
                                        (curr.nbre_sdb || 0),
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
                                    };
                                  },
                                  {}
                                );

                              // Generate parts array
                              const parts = [];
                              if (summedComposition.nbre_halls > 0)
                                parts.push(
                                  `${summedComposition.nbre_halls} hall${
                                    summedComposition.nbre_halls > 1 ? 's' : ''
                                  }`
                                );
                              if (summedComposition.nbre_salons > 0)
                                parts.push(
                                  `${summedComposition.nbre_salons} salon`
                                );
                              if (summedComposition.nbre_chambres > 0)
                                parts.push(
                                  `${summedComposition.nbre_chambres} chambre${
                                    summedComposition.nbre_chambres > 1
                                      ? 's'
                                      : ''
                                  }`
                                );
                              if (summedComposition.nbre_cuisines > 0)
                                parts.push(
                                  `${summedComposition.nbre_cuisines} cuisine`
                                );
                              if (summedComposition.nbre_sdb > 0)
                                parts.push(
                                  `${summedComposition.nbre_sdb} salle${
                                    summedComposition.nbre_sdb > 1 ? 's' : ''
                                  } de bain`
                                );
                              if (summedComposition.nbre_balcons > 0)
                                parts.push(
                                  `${summedComposition.nbre_balcons} balcon${
                                    summedComposition.nbre_balcons > 1
                                      ? 's'
                                      : ''
                                  }`
                                );
                              if (summedComposition.nbre_buanderies > 0)
                                parts.push(
                                  `${summedComposition.nbre_buanderies} buanderie`
                                );
                              if (summedComposition.nbre_placards > 0)
                                parts.push(
                                  `${summedComposition.nbre_placards} placard${
                                    summedComposition.nbre_placards > 1
                                      ? 's'
                                      : ''
                                  }`
                                );
                              if (summedComposition.nbre_receptions > 0)
                                parts.push(
                                  `${
                                    summedComposition.nbre_receptions
                                  } réception${
                                    summedComposition.nbre_receptions > 1
                                      ? 's'
                                      : ''
                                  }`
                                );

                              // Join with commas and replace last comma with "et"
                              if (parts.length > 0) {
                                let text = parts.join(', ');
                                const lastCommaIndex = text.lastIndexOf(', ');
                                if (lastCommaIndex !== -1) {
                                  text =
                                    text.substring(0, lastCommaIndex) +
                                    ' et ' +
                                    text.substring(lastCommaIndex + 2);
                                }
                                return text;
                              }
                              return null;
                            })()}
                          </>
                        )}

                        {/* Parking & Box conditions */}
                        {data.reservationDetails?.bien.num_parking != null &&
                          ` Et ${
                            data.reservationDetails.bien.num_parking
                          } place${
                            data.reservationDetails.bien.num_parking > 1
                              ? 's'
                              : ''
                          } de parking au sous-sol`}
                        {data.reservationDetails?.bien.num_box != null &&
                          ` Et ${data.reservationDetails.bien.num_box} Box`}
                      </p>
                    </div>

                    {/* Article 3 */}
                    <div>
                      <h6 className="text-black font-bold underline">
                        Article 3 : Prix
                      </h6>
                      <p
                        className="text-gray-700 leading-relaxed mt-2"
                        style={style_p}
                      >
                        Le présent contrat de réservation est consenti et
                        accepté moyennant le prix ci-après détaillé :<br />
                        *Soit un prix global estimatif de la somme{' '}
                        <b>{data.reservationDetails?.prix + ' DHS'} </b> Sur
                        lequel prix de vente ,le réservataire a versé à titre
                        {"d'"}acompte à valoir sur le prix de vente {"d'"}une
                        valeur de <b>{data.sum_avances_valides + ' DHS'}</b>
                        <br />
                        *Le reliquat soit la somme de{' '}
                        <b>
                          {data.reservationDetails?.prix -
                            data.sum_avances_valides}{' '}
                          DHS
                        </b>{' '}
                        sera réglée le jour de la réalisation de la vente
                        définitive.
                      </p>
                    </div>

                    {/* Article 4 */}
                    <div>
                      <h6 className="text-black font-bold underline">
                        Article 4 : Compromis
                      </h6>
                      <p
                        className="text-gray-700 leading-relaxed mt-2"
                        style={style_p}
                      >
                        Il est énoncé que le client a signé le comprimis en{' '}
                        <b>
                          {form.date_sign_client != null &&
                            format(
                              new Date(form.date_sign_client),
                              'dd/MM/yyyy'
                            )}
                        </b>{' '}
                        et le Maitre {"d'"}Ouvrage en{' '}
                        <b>
                          {form.date_sign_mo != null &&
                            format(new Date(form.date_sign_mo), 'dd/MM/yyyy')}
                        </b>{' '}
                        et enregistré en{' '}
                        <b>
                          {form.date_enreg != null &&
                            format(new Date(form.date_enreg), 'dd/MM/yyyy')}
                        </b>{' '}
                        avec une durée {"d'"}échéance du{' '}
                        {form.duree_echeance == '3'
                          ? '3 Mois'
                          : form.duree_echeance == '6'
                          ? '6 Mois'
                          : form.duree_echeance == '12'
                          ? '12 Mois'
                          : null}{' '}
                        correspondant le{' '}
                        <b>
                          {form.date_echeance != null &&
                            format(new Date(form.date_echeance), 'dd/MM/yyyy')}
                        </b>{' '}
                        .
                      </p>
                    </div>

                    {/* Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div>
                        <strong className="block mb-2">
                          Signature Client :
                        </strong>
                        <div className="h-24 border border-gray-300 rounded-md"></div>
                      </div>
                      <div>
                        <strong className="block mb-2">
                          Signature Responsable:
                        </strong>
                        <div className="h-24 border border-gray-300 rounded-md"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() =>
                    setData((prev) => ({ ...prev, openPreview: false }))
                  }
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="bg-[#009FFF] px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                Nouvelle attestation de Vente
              </h2>
              <p className="text-white font-normal">
                Remplissez les informations nécessaires pour établir le
                compromis
              </p>
            </div>
            <div className="hidden md:block">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-[#009FFF]">
                {reservationData.reservation?.code_reservation || 'Nouveau'}
              </span>
            </div>
          </div>
        </div>

        <div>
          {/* Client Information Section */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center space-x-2 text-gray-500">
              <UserRound className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold flex items-center">
                Information du Client
              </h3>
            </div>

            <div className="space-y-4 mt-4">
              {data.clients?.map((client, idx) => (
                <div key={idx}>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextField
                      control={false}
                      label="CIN :"
                      name="cin"
                      value={client.client.cin || ''}
                      disabled
                      errors={{}}
                      backendErrors={{}}
                      className="bg-gray-50"
                    />

                    <TextField
                      control={false}
                      label="Nom :"
                      name="nom"
                      value={client.client.nom || ''}
                      disabled
                      errors={{}}
                      backendErrors={{}}
                      className="bg-gray-50"
                    />

                    <TextField
                      control={false}
                      label="Prénom :"
                      name="prenom"
                      value={client.client.prenom || ''}
                      disabled
                      errors={{}}
                      backendErrors={{}}
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* General Information Section */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center space-x-2 text-gray-500">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold flex items-center">
                Information Générale
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              <TextField
                control={false}
                label="Code Réservation :"
                name="code_reservation"
                value={data.reservationDetails?.code_reservation || ''}
                disabled
                className="bg-gray-50"
              />
              <TextField
                control={false}
                label="Projet :"
                name="projet"
                value={data.reservationDetails?.projet?.nom || ''}
                disabled
                className="bg-gray-50"
              />
              <TextField
                control={false}
                label="Bien :"
                name="bien"
                value={NomBienComplet(data.bien)}
                disabled
                className="bg-gray-50"
              />
              <TextField
                control={false}
                label="Prix (DH) :"
                name="prix"
                value={data.reservationDetails?.prix || ''}
                disabled
                className="bg-gray-50"
              />
              <TextField
                control={false}
                label="Avances (DH) :"
                name="avances"
                value={data.sum_avances_valides}
                disabled
                className="bg-gray-50"
              />
            </div>
          </div>

          {/* Compromis Information Section */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-center space-x-2 text-gray-500">
              <Signature className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold flex items-center">
                Information Signature
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-4">
              <TextField
                control={false}
                label="Date Signature Client :"
                name="date_sign_client"
                type="date"
                value={form.date_sign_client}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    date_sign_client: e.target.value,
                  }))
                }
                required={true}
              />
              <TextField
                control={false}
                label="Date Signature MO :"
                name="date_sign_mo"
                type="date"
                value={form.date_sign_mo}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date_sign_mo: e.target.value }))
                }
                required={true}
              />
              <TextField
                control={false}
                label="Date Enregistrement :"
                name="date_enreg"
                type="date"
                value={form.date_enreg}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date_enreg: e.target.value }))
                }
                required={true}
              />
            </div>
          </div>

          {/* Échéance Section */}
          <div className="px-6 py-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold flex items-center">
                Échéance
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée Echéance :
                </label>
                <SelectInput
                  options={durationOptions}
                  value={form.duree_echeance}
                  onChange={(value) => {
                    setForm((prev) => ({ ...prev, duree_echeance: value }));
                    if (value !== 'Autre') {
                      const newDate = new Date();
                      newDate.setMonth(
                        newDate.getMonth() + parseInt(value, 10)
                      );
                      setForm((prev) => ({
                        ...prev,
                        date_echeance: format(newDate, 'yyyy-MM-dd'),
                      }));
                    } else {
                      setForm((prev) => ({ ...prev, date_echeance: null }));
                    }
                  }}
                  placeholder="Sélectionnez une durée"
                  className="w-full"
                />
              </div>
              <div>
                <TextField
                  control={false}
                  label="Date Echéance :"
                  name="date_echeance"
                  type="date"
                  value={form.date_echeance}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      date_echeance: e.target.value,
                    }))
                  }
                  disabled={form.duree_echeance !== 'Autre'}
                />
              </div>
            </div>
            <div className="mt-6">
              <TextField
                control={false}
                label="Commentaire"
                name="commentaire"
                type="textarea"
                isTextarea={true}
                height="h-24"
                rows={3}
                value={form.commentaire}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, commentaire: e.target.value }))
                }
                placeholder="Ajoutez un commentaire si nécessaire"
                className="bg-white"
              />
            </div>
          </div>

          {/* Error Display */}
          {data.errors && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-500">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  {Object.keys(data.errors).map((key) => (
                    <p key={key} className="text-sm text-red-700">
                      {data.errors[key][0]}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Footer */}
        <div className="py-4 border-t border-gray-200 flex justify-end items-center gap-4">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-3 border border-gray-300 shadow-sm  rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => setData((prev) => ({ ...prev, openPreview: true }))}
          >
            <Eye className="w-5 h-5 text-gray-700" />
            Prévisualiser
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || data.loadingBtn}
            className="inline-flex items-center justify-center px-6 py-3 rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {data.loadingBtn
              ? 'Enregistrement...'
              : "Enregistrer l'attestation"}
          </button>
        </div>
      </div>
    </div>
  );
};

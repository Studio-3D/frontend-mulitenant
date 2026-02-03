'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../../../context/AuthContext';
import { APIURL, ENDPOINTS } from '../../../../../configs/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Button from '@/components/Button'; // adjust the path as needed
import BreadCrumb from '../../../navigation/BreadCrumb';
import LoadingSpin from '@/components/LoadingSpin';
import VisiteTable from '@/app/(dashboard)/crm/visites/VisiteTable';
import EncaissementTable from '@/app/(dashboard)/encaissements/EncaissementTable';
import ReservationTable from '../../reservations/ReservationTable';
import format from 'date-fns/format';
import { getSituationLabel } from '@/components/client-utils';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ClientPDF from '../ClientImprimer';
import { useSearchParams } from 'next/navigation';
import JournalTable from '@/app/(dashboard)/crm/appels/[appelId]/JournalTable';
import HistoriquesTable from '@/app/(dashboard)/crm/prospects/[prospectId]/HistoriquesTable';
import { useProjet } from '@/context/ProjetContext';
import { isAdmin, isCommercial, isNotaire, isRespoCommercial, isRespoLivraison, isSuperAdmin } from '@/configs/enum';

const ClientDetails = () => {
  const { token, user } = useAuth();
  const { selectedProjet } = useProjet();

  const router = useRouter();
  const { clientId } = useParams(); // Use useParams() to access dynamic params
  const accessToken = token || localStorage.getItem('accessToken');
  const [loading, setLoading] = useState(false);
  const [clientDetails, setClientDetails] = useState([]);
  const [reservationDetails, setReservationDetails] = useState([]);
  const [visiteDetails, setVisiteDetails] = useState([]);
  const [activeTab, setActiveTab] = useState('encaissements'); // Default to 'historiques' if tab is not present

  const handleEdit = (id) => {
    router.push(`${ENDPOINTS.CLIENTS}?id=${id}&action=edit`);
  };
 const userRole = user?.role;
  useEffect(() => {
    if (
      !isAdmin(userRole) &&
      !isSuperAdmin(userRole) &&
      !isCommercial(userRole)&&
      !isRespoCommercial(userRole)&&
      !isNotaire(userRole)&&
      !isRespoLivraison(userRole)
    ) {
      router.push('/');
    }
  }, [router]);
  const tabs = [
    { id: 'encaissements', label: 'Encaissements', icon: '' },
    { id: 'reservations', label: 'Reservations', icon: '' },
    { id: 'historiques', label: 'Historiques', icon: '' },
    { id: 'appels', label: 'Appels', icon: '' },
    { id: 'visites', label: 'Visites', icon: '' },
  ];

  // Filtrer les onglets conditionnels
  const filteredTabs = tabs.filter((tab) => {
    if (tab.id === 'historiques' && clientDetails?.prospect == null) {
      return false;
    }
    if (tab.id === 'appels' && clientDetails?.prospect?.appels == null) {
      return false;
    }
    return true;
  });
  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

        console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/ventes/clients');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);

  useEffect(() => {
    if (clientId) {
      setLoading(true);
      axios
        .get(`${APIURL.CLIENTS}/${clientId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setClientDetails(response.data.client);
          setReservationDetails(response.data.reservations);
          setVisiteDetails(response.data.visites);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [clientId, accessToken]);

  const handleTabClick = (tab) => {
    // Set the active tab state
    setActiveTab(tab);
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpin /> {/* Use your loading spinner here */}
        </div>
      ) : (
        <>
          <div
            className="flex items-center justify-start"
            style={{ marginBottom: '8px' }}
          >
            <BreadCrumb
              baseUrl={ENDPOINTS.VENTE + '?tab=clients'}
              step={`Détail client`}
            />
          </div>
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Project Summary Card - Left Side */}
              <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
                  <h2 className="text-center font-bold text-lg text-indigo-600 mb-4">
                    Détail Client
                  </h2>

                  <div className="flex flex-col items-center mb-4">
                    {/* <div className="w-28 h-28 rounded-lg bg-indigo-100 flex items-center justify-center text-4xl font-bold text-indigo-600 mb-2">
                    {/* Initiales ou icône
                  </div> */}
                    <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold rounded px-2 py-1 mb-1">
                      CIN : {clientDetails?.cin}
                    </span>
                    <p className="text-center font-semibold text-gray-800">
                      {clientDetails?.nom} {clientDetails?.prenom}
                    </p>
                  </div>

                  {/* Section : Informations générales */}
                  <h3 className="text-indigo-600 font-semibold text-sm mb-2">
                    Informations générales
                  </h3>
                  <hr className="border-indigo-400 mb-4" />

                  <div className="space-y-2 text-sm text-gray-700">
                    {clientDetails?.profession && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Profession:</span>
                        <span>{clientDetails?.profession || '—'}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        Accepte {"d'"}être contacté:
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          clientDetails?.notifie === 1
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {clientDetails?.notifie === 1 ? 'Oui' : 'Non'}
                      </span>
                    </div>
                    {clientDetails?.partenaire?.description && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Partenaire:</span>
                        <span className="text-green-600 font-medium">
                          {clientDetails?.partenaire?.description}
                        </span>
                      </div>
                    )}
                    {clientDetails?.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span>{clientDetails?.email}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span className="text-gray-600">Téléphone 1:</span>
                      <span>{clientDetails?.telephone_num1}</span>
                    </div>
                    {clientDetails?.telephone_num2 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone 2:</span>
                        <span>{clientDetails?.telephone_num2}</span>
                      </div>
                    )}
                    {clientDetails?.adresse && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Adresse:</span>
                        <span>{clientDetails?.adresse}</span>
                      </div>
                    )}
                    {(clientDetails?.ville || clientDetails?.pays) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ville / Pays:</span>
                        <span>
                          {clientDetails?.ville} / {clientDetails?.pays}
                        </span>
                      </div>
                    )}
                    {clientDetails?.nationalite && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nationalité:</span>
                        <span>{clientDetails?.nationalite}</span>
                      </div>
                    )}
                  </div>

                  {/* Section : Infos Personnelles */}
                  {/* <h3 className="text-indigo-600 font-semibold text-sm mt-6 mb-2">Infos Personnelles</h3> */}
                  {(clientDetails?.lieu_naissance ||
                    clientDetails?.date_naissance ||
                    clientDetails?.age ||
                    clientDetails?.nom_responsable ||
                    clientDetails?.relation_familliale ||
                    clientDetails?.nom_pere ||
                    clientDetails?.nom_mere) && (
                    <hr className="border-indigo-400 mb-4" />
                  )}

                  {/* <div className="space-y-2 text-sm text-gray-700"> */}
                  {clientDetails?.lieu_naissance && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lieu Naissance:</span>
                      <span>{clientDetails?.lieu_naissance}</span>
                    </div>
                  )}
                  {clientDetails?.date_naissance && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date Naissance:</span>
                      <span>
                        {clientDetails?.date_naissance &&
                          format(
                            new Date(clientDetails?.date_naissance),
                            'dd/MM/yyyy'
                          )}
                      </span>
                    </div>
                  )}
                  {clientDetails?.age && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span>{clientDetails?.age}</span>
                    </div>
                  )}
                  {clientDetails?.age < 18 &&
                    clientDetails?.nom_responsable &&
                    clientDetails?.relation_familliale && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Nom Responsable:
                          </span>
                          <span>{clientDetails?.nom_responsable}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Relation familiale:
                          </span>
                          <span>{clientDetails?.relation_familliale}</span>
                        </div>
                      </>
                    )}
                  {/* </div> */}
                  {clientDetails?.nom_pere && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom Père:</span>
                      <span>{clientDetails?.nom_pere}</span>
                    </div>
                  )}
                  {clientDetails?.nom_mere && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nom Mère:</span>
                      <span>{clientDetails?.nom_mere}</span>
                    </div>
                  )}

                  {/* Situation familiale */}
                  <h3 className="text-indigo-600 font-semibold text-sm mt-6 mb-2">
                    Situation familiale
                  </h3>
                  <hr className="border-indigo-400 mb-4" />
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Situation:</span>
                      <span>
                        {getSituationLabel(clientDetails?.situation_familliale)}
                      </span>
                    </div>
                    {clientDetails?.situation_familliale == 2 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nom Mari:</span>
                          <span>{clientDetails?.nom_mari}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Lieu Mariage:</span>
                          <span>{clientDetails?.lieu_mariage}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date Mariage:</span>
                          <span>
                            {clientDetails?.date_mariage &&
                              format(
                                new Date(clientDetails?.date_mariage),
                                'dd/MM/yyyy'
                              )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end mt-6 gap-3">
                    <PDFDownloadLink
                      document={
                        <ClientPDF
                          client={clientDetails}
                          reservations={reservationDetails}
                          visites={visiteDetails}
                          user={user}
                        />
                      }
                      fileName={`client_${clientId}.pdf`}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                    >
                      {({ loading }) =>
                        loading ? 'Préparation...' : 'Imprimer'
                      }
                    </PDFDownloadLink>
                    {/*  <PDFDownloadLink
  document={
    <ClientPDF 
      client={clientDetails}
      reservation={reservationDetails}
      aquereur={aquereurDetails}
      payments={paymentHistory}
      visits={visitHistory}
      calls={callHistory}
      totalPayments={totalPayments}
    />
  }
  fileName={`client_${clientId}.pdf`}
>
  {({ loading }) => (loading ? 'Préparation...' : 'Imprimer')}
</PDFDownloadLink> */}
{isSuperAdmin(userRole)||isAdmin(userRole) && (
<button
                      type="button"
                      onClick={() => handleEdit(clientDetails?.id)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition text-sm"
                    >
                      Modifier
                    </button>
)}
                    
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-2/3">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          className={`px-6 py-3 flex items-center gap-2 text-sm font-medium whitespace-nowrap ${
                            activeTab === tab.id
                              ? 'border-b-2 border-[#009FFF] text-[#009FFF]'
                              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => handleTabClick(tab.id)}
                        >
                          {tab.icon}
                          {tab.label}
                          {/* Optional additional spans for some tabs */}
                          {tab.id === 'encaissements' && (
                            <span className="ml-1 text-xs"></span>
                          )}
                          {tab.id === 'historiques' &&
                            clientDetails?.prospect != null && (
                              <span className="ml-1 text-xs"></span>
                            )}
                          {tab.id === 'visites' && (
                            <span className="ml-1 text-xs"></span>
                          )}
                          {tab.id === 'appels' && (
                            <span className="ml-1 text-xs"></span>
                          )}
                          {tab.id === 'reservations' && (
                            <span className="ml-1 text-xs"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {activeTab === 'historiques' && (
                      <div className="min-h-[400px]">
                        <div className="min-h-[400px]">
                          <HistoriquesTable
                            id={
                              clientDetails?.prospect
                                ? clientDetails?.prospect?.id
                                : clientDetails?.id
                            }
                            type={
                              clientDetails?.prospect ? 'prospect' : 'client'
                            }
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'visites' && (
                      <div className="min-h-[400px]">
                        <VisiteTable
                          dataProspect={null}
                          dataClient={clientDetails}
                        />
                      </div>
                    )}
                    {activeTab === 'encaissements' && (
                      <div className="min-h-[400px]">
                        <div className="min-h-[400px]">
                          <EncaissementTable dataClient_id={clientDetails} />
                        </div>
                      </div>
                    )}
                    {activeTab === 'appels' && (
                      <div className="min-h-[400px]">
                        <div className="min-h-[400px]">
                          <JournalTable
                            id={clientDetails?.prospect?.appels?.id}
                            prospect={clientDetails?.prospect}
                            client={clientDetails}
                          />
                        </div>
                      </div>
                    )}
                    {activeTab === 'reservations' && (
                      <div className="min-h-[400px]">
                        <div className="min-h-[400px]">
                          <ReservationTable dataClient={clientDetails} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ClientDetails;

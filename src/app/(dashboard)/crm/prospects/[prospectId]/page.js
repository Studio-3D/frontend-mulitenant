'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { APIURL, ENDPOINTS } from '@/configs/api';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Button from '@/components/Button'; // adjust the path as needed
import HistoriquesTable from './HistoriquesTable';
import BreadCrumb from '../../../navigation/BreadCrumb';
import LoadingSpin from '@/components/LoadingSpin';
import Modal from '@/components/Modal';
import SelectInput from '@/components/SelectInput';
import { useProjet } from '@/context/ProjetContext';
import VisiteTable from '../../visites/VisiteTable';
import { format } from 'date-fns'; // Import format from date-fns
import JournalTable from '../../appels/[appelId]/JournalTable';
import Modal_Traite from '../Modal_Traite';
import { isAdmin, isCommercial, isRespoCommercial, isSuperAdmin } from '@/configs/enum';
import { useSociete } from '@/context/SocieteContext';

const ProspectDetails = () => {
  const [refreshHistoriques, setRefreshHistoriques] = useState(0);

  const { user, token } = useAuth();
  const router = useRouter();
  const { prospectId } = useParams(); // Use useParams() to access dynamic params
  const accessToken = token || localStorage.getItem('accessToken');
  const { projets, selectedProjet } = useProjet();
  const [showProjetModal, setShowProjetModal] = useState(false);
  const [selectedProjetId, setSelectedProjetId] = useState('');
  const [loading, setLoading] = useState(false);
  const [prospectDetails, setProspectDetails] = useState([]);
  const [activeTab, setActiveTab] = useState('historiques'); // Default to 'historiques' if tab is not present
  const [open_traite, setOpen_traite] = useState(false);
  const [traite_id, setId_traite] = useState(null);
  const [num_tel, setTel_num] = useState(null);
  const [nom_prenom, setNomPrenom] = useState(null);

  const handleraiter = (Id, num_tel, nom_prenom) => {
    setOpen_traite(!open_traite);
    setId_traite(Id);
    setTel_num(num_tel);
    setNomPrenom(nom_prenom);
  };
  // Fonction appelée quand le modal de traitement est fermé APRÈS un traitement réussi
  const handleTraiteSuccess = () => {
    setOpen_traite(false);
    // Incrémenter le compteur UNIQUEMENT après un traitement réussi
    setRefreshHistoriques((prev) => prev + 1);
  };

  // Fonction appelée quand le modal de traitement est fermé
  const handleTraiteClose = () => {
    setOpen_traite(false);
  };
  const handleEdit = (id) => {
    router.push(`${ENDPOINTS.PROSPECTS}?id=${id}&action=edit`);
  };
  const handleShowClient = (id) => {
    router.push(`/ventes/clients/`+id);
  };
useEffect(() => {
    if (
      !isAdmin(user?.role) &&
      !isSuperAdmin(user?.role) &&
      !isCommercial(user?.role)&&
      !isRespoCommercial(user?.role)
    ) {
      router.push('/');
    }
  }, [user?.role, router]);

  const tabs = [
    ...(prospectDetails?.id != null
      ? [{ id: 'historiques', label: 'Historiques', icon: '' }]
      : []),
    { id: 'visites', label: 'Visites', icon: '' },
    { id: 'journaux', label: 'Journal des Appels', icon: '' },
  ];

  // Simple cache et comparaison for return back en cas de changer projet
      const { selectedSociete } = useSociete();
      const [oldProjetId, setOldProjetId] = useState(null);
      const [oldSocieteId, setOldSocieteId] = useState(null);
  	 useEffect(() => {
  if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
    if (oldProjetId||oldSocieteId) {
      // Projet ou société a changé
      router.push('/crm');
    }
    setOldSocieteId(selectedSociete?.id)
    setOldProjetId(selectedProjet?.id);
  }
}, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);
  useEffect(() => {
    if (prospectId) {
      setLoading(true);
      axios
        .get(`${APIURL.PROSPECTS}/${prospectId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((response) => {
          setProspectDetails(response.data.prospect);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [prospectId, accessToken]);
  // If WhatsApp-origin prospect with no projet assigned, prompt user to choose projet
  useEffect(() => {
    if (
      prospectDetails &&
      prospectDetails.origin === 'whatsapp' &&
      !prospectDetails.projet_id
    ) {
      setShowProjetModal(true);
    }
  }, [prospectDetails]);

  const handleAssignProjet = async () => {
    if (!selectedProjetId) return;
    try {
      await axios.put(
        `${APIURL.PROSPECTS}/${prospectDetails.id}`,
        {
          projet_id: selectedProjetId,
          telephone: prospectDetails?.telephone,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setProspectDetails({ ...prospectDetails, projet_id: selectedProjetId });
      setShowProjetModal(false);
    } catch (e) {
      console.error('Erreur lors de la mise à jour du projet du prospect', e);
    }
  };

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
              baseUrl={ENDPOINTS.CRM + '?tab=prospects'}
              step={`Détail prospect`}
            />
          </div>
          <div className="container mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Project Summary Card - Left Side */}
              <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="text-center p-6 border-b border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-[#009FFF]">
                        {prospectDetails.nom
                          ? prospectDetails.nom.charAt(0).toUpperCase()
                          : 'P'}
                      </span>
                    </div>
                    <h1 className="text-xl font-semibold">
                      {(prospectDetails?.nom || '') +
                        ' ' +
                        (prospectDetails?.prenom || '')}
                    </h1>
                    <div className="inline-block px-3 py-1 bg-blue-100 !text-blue-700 rounded-full text-sm mt-2">
                      {`Cin: ${prospectDetails?.cin || ''}`}
                    </div>
                  </div>

                  <div className="p-6">
                    <h6
                      className=" font-semibold leading-[1.2] text-lg"
                      style={{ color: '#666CFF', marginBottom: '10px' }}
                    >
                      Informations générales
                    </h6>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Accepte {"d'"}être contacté:
                        </span>
                        <span className="font-medium">
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              prospectDetails?.notifie === 1
                                ? 'bg-[rgba(38,198,249,0.12)] text-[#26C6F9]'
                                : 'bg-[rgba(255,77,73,0.12)]  text-[#FF4D49]'
                            } `}
                          >
                            {prospectDetails?.notifie === 1 ? 'Oui' : 'Non'}
                          </span>
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">
                          {prospectDetails?.email}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone 1:</span>
                        <span className="font-medium">
                          {prospectDetails?.telephone}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Téléphone 2:</span>
                        <span className="font-medium">
                          {prospectDetails?.telephone_num2 === 'null'
                            ? ''
                            : prospectDetails?.telephone_num2 || ''}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Origine:</span>
                        <span className="font-medium">
                          {prospectDetails?.origin}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Source:</span>
                        <span className="font-medium">
                          <span
                            className={`px-2 py-1 rounded text-sm font-semibold ${
                              prospectDetails?.partenaire_id !== null
                                ? 'bg-[rgba(102,108,255,0.12)] text-[#666CFF]'
                                : 'bg-[rgba(114,225,40,0.12)] text-[#72E128]'
                            } `}
                          >
                            {prospectDetails?.partenaire_id !== null
                              ? `Partenaire(${prospectDetails?.partenaire?.description})`
                              : prospectDetails?.source?.source}
                          </span>
                        </span>
                      </div>

                      {prospectDetails?.affecte_par_admin && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Affecté par:</span>
                          <span className="font-medium">
                            {`${prospectDetails.affecte_par_admin.name || ''} ${
                              prospectDetails.affecte_par_admin.prenom || ''
                            }`}
                          </span>
                        </div>
                      )}

                      {prospectDetails?.date_affectation && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Date affectation:
                          </span>
                          <span className="font-medium">
                            {format(
                              new Date(prospectDetails.date_affectation),
                              'yyyy-MM-dd HH:mm'
                            )}
                          </span>
                        </div>
                      )}

                      {prospectDetails?.traite_par_user && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Traité par:</span>
                          <span className="font-medium">
                            {`${prospectDetails.traite_par_user.name || ''} ${
                              prospectDetails.traite_par_user.prenom || ''
                            }`}
                          </span>
                        </div>
                      )}

                      {prospectDetails?.date_traitement && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Date traitement:
                          </span>
                          <span className="font-medium">
                            {format(
                              new Date(prospectDetails.date_traitement),
                              'yyyy-MM-dd HH:mm'
                            )}
                          </span>
                        </div>
                      )}

                      {prospectDetails?.message && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Message:</span>
                          <span className="font-medium">
                            {prospectDetails?.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center gap-4 items-center mt-6 mb-6">
                    {isAdmin(user.role) ||
                      (prospectDetails?.commercial_affecte?.user_id_origin ==
                        user.id && (
                        <Button
                          type="traite_rdv"
                          onClick={() =>
                            handleraiter(
                              prospectDetails?.id,
                              prospectDetails?.telephone,
                              prospectDetails?.nom +
                                ' ' +
                                prospectDetails?.prenom
                            )
                          }
                        >
                          Traiter
                        </Button>
                      ))}
                      {prospectDetails?.client_id!=null && (
                        <Button
                        type="valider"
                        onClick={() => handleShowClient(prospectDetails?.client_id)}
                        >
                        Voir Détail Client
                        </Button>
                      )}
                     
                    <Button
                      type="edit"
                      onClick={() => handleEdit(prospectDetails?.id)}
                    >
                      Modifier
                    </Button>
                  </div>

                  <div className="flex justify-center gap-4 items-center mt-6 mb-6"></div>
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
                          {tab.id === 'historiques' && (
                            <span className="ml-1 text-xs"></span>
                          )}
                          {tab.id === 'visites' && (
                            <span className="ml-1 text-xs"></span>
                          )}
                          {tab.id === 'journaux' &&
                            prospectDetails?.appels != null && (
                              <span className="ml-1 text-xs"></span>
                            )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {activeTab === 'historiques' && prospectDetails?.id && (
                      <div className="min-h-[400px]">
                        <div className="min-h-[400px]">
                          <HistoriquesTable
                            id={prospectDetails.id}
                            refreshTrigger={refreshHistoriques}
                            type={'prospect'}
                          />
                        </div>
                      </div>
                    )}

                    {/* Modal to choose projet when WhatsApp prospect has no projet */}
                    {showProjetModal && (
                      <Modal
                        isVisible={true}
                        onClose={() => setShowProjetModal(false)}
                      >
                        <div className="p-4">
                          <h3 className="text-lg font-semibold mb-3">
                            Assigner un projet au prospect
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            Ce prospect provient de WhatsApp mais plusieurs
                            configurations partagent le même projet. Veuillez
                            choisir le projet auquel {"l'"}assigner.
                          </p>
                          <div className="mb-4">
                            <SelectInput
                              label="Projet"
                              options={(projets || []).map((p) => ({
                                label: p.nom,
                                value: p.id,
                              }))}
                              value={selectedProjetId}
                              onChange={(val) => setSelectedProjetId(val)}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              className="px-3 py-2 rounded border"
                              onClick={() => setShowProjetModal(false)}
                            >
                              Annuler
                            </button>
                            <button
                              className="px-3 py-2 rounded bg-blue-600 text-white"
                              onClick={handleAssignProjet}
                              disabled={!selectedProjetId}
                            >
                              Assigner
                            </button>
                          </div>
                        </div>
                      </Modal>
                    )}

                    {activeTab === 'visites' && (
                      <div className="min-h-[400px]">
                        <VisiteTable
                          dataProspect={prospectDetails}
                          show_prospect={true}
                        />
                      </div>
                    )}
                    {activeTab === 'journaux' && (
                      <div className="min-h-[400px]">
                        <JournalTable
                          id={prospectDetails?.appels?.id}
                          prospect={prospectDetails}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {open_traite && (
        <Modal isVisible={true} onClose={handleTraiteClose}>
          <Modal_Traite
            nom_prenom={nom_prenom}
            num_tel={num_tel}
            id={traite_id}
            from_prospect_show={true}
            onClose={handleTraiteClose}
            onSuccess={handleTraiteSuccess}
          />
        </Modal>
      )}
    </>
  );
};

export default ProspectDetails;

'use client';
import React, { useState, useEffect, useRef } from 'react';
import { SideBar } from './SideBar';
import { Desistement_Definitif } from './Desistement_Definitif';
import { Desistement_Au_Profit } from './Desistement_Au_Profit';
import { Changement_De_Bien } from './Changement_De_Bien';
import { useRouter, useParams } from 'next/navigation';
import { APIURL } from '../../../../../../configs/api';
import axios from 'axios';
import Modal_select_type_dst from './Modal_select_type_dst';
import Modal from '@/components/Modal';
import SelectInput from '@/components/SelectInput';
import { type_dst } from '@/configs/enum';
import { useAuth } from '../../../../../../context/AuthContext';
import {
  fetchData_Select,
  data_by_projet_and_params,
  fetchList_fichier_exist,
} from '../../../../../../../src/configs/api-utils';
import LoadingSpin from '@/components/LoadingSpin';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  desistementDefinitifSchema,
  desistementAuProfitSchema,
  changementDeBienSchema,
} from './schema';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const reservationId = params.reservationId;
  const accessToken = token || localStorage.getItem('accessToken');
  const selectedProjet =
    JSON.parse(localStorage.getItem('selectedProjet')) || null;

  // Refs to track initial loading
  const initialLoadComplete = useRef(false);
  const hasFetchedFiles = useRef(false);

  // State management
  const [activeModel, setActiveModel] = useState(1);
  const [defaultValues, setDefaultValues] = useState({});
  const validationSchemaRef = useRef(desistementDefinitifSchema);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [messageAlert, setMessageAlert] = useState(null);

  // Loading states
  const [loading, setLoading] = useState({
    form: true,
    submit: false,
    general: true,
  });
  const [loading_bns, setLoading_bnq] = useState();
  const [loading_dos, setLoading_dos] = useState();
  const [loading_list, setLoading_list] = useState(false);

  // Data states
  const [filesList_avc, setFilesList_avc] = useState(null);
  const [filesList_dst, setFilesList_dst] = useState(null);
  const [filesList_plt, setFilesList_plt] = useState(null);
  const [banques, setBanques] = useState([]);
  const [dossiers, setDossiers] = useState([]);
  const [files, setFiles] = useState({
    avc: null,
    dst: null,
    plt: null,
  });

  const [reservationData, setReservationData] = useState({
    bien: null,
    bienIdAncien: null,
    codeRes: null,
    respo: null,
    dateRes: null,
    sumAvances: 0,
    prix: 0,
    resteRembourse: 0,
    desisteurs: [],
    desisteursTest: [],
    desisteursProfit: [],
    inputListRemb: [],
  });

  // Form methods
  const methods = useForm({
    resolver: yupResolver(validationSchemaRef.current),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  // Set default values based on active model
  useEffect(() => {
    let newDefaultValues = {};
    switch (activeModel) {
      case 1:
        validationSchemaRef.current = desistementDefinitifSchema;
        newDefaultValues = {
          motif: '',
         /* remboursement: 'Rem.immediat',
          dateOperation: new Date(),
          modeRemboursement: 'Chèque',
          numeroPaiement: '',
          pourCompte: 'lui même',
          avecPenalite: false,
          avecPiecesJointes: false,*/
        };
        break;
      case 2:
        validationSchemaRef.current = desistementAuProfitSchema;
        newDefaultValues = {
          type_dp: '',
          /*dateOperation: new Date(),
          beneficiaireId: '',
          pourcentageTransfert: 100,*/
        };
        break;
      case 3:
        validationSchemaRef.current = changementDeBienSchema;
        newDefaultValues = {
          /*motif: '',
          dateOperation: new Date(),
          nouveauBienId: '',*/
        };
        break;
    }
    setDefaultValues(newDefaultValues);
    reset(newDefaultValues);
  }, [activeModel, reset]);

  // Fetch reservation data
  const fetchReservation = async () => {
    if (!reservationId) return;

    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/reservations/${reservationId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const { reservation, sum_avances_valides } = response.data;
      const {
        code_reservation,
        prix,
        date_reservation,
        bien,
        user: respoUser,
        aquereurs,
      } = reservation;

      if (reservation.desistements_ancien) {
        const messages = {
          1: "le Client a déjà effectué un Désistement au profit d'un proche",
          2: "le Client a déjà effectué un Désistement au profit d'un co-reservataire",
          3: 'le Client a déjà effectué un Désistement changement de bien',
        };
        setMessageAlert(messages[reservation.desistements_ancien.type_dp || 3]);
      }

      const processedAquereurs = aquereurs.map((aq) => ({
        id: aq.id,
        cl_id: aq.client.id,
        cin: aq.client.cin,
        nom: aq.client.nom,
        prenom: aq.client.prenom,
        pourcentage: aq.pourcentage,
      }));

      const rembourseList = aquereurs.map((aq) => ({
        aq_id: aq.id,
        cl_id: aq.client.id,
        nom: aq.client.nom,
        prenom: aq.client.prenom,
        pourcentage: aq.pourcentage,
        date_rembourse: null,
        mode_rembourse: null,
        num_paiement: null,
        cheque_recu: null,
        pour_le_compte: null,
        fichier_autorisation: null,
      }));

      setReservationData({
        bien: bien.propriete_dite_bien,
        bienIdAncien: bien.id,
        codeRes: code_reservation,
        respo: `${respoUser.name} ${respoUser.prenom}`,
        dateRes: date_reservation,
        sumAvances: sum_avances_valides,
        prix,
        resteRembourse: sum_avances_valides,
        desisteurs: aquereurs,
        desisteursTest: processedAquereurs,
        desisteursProfit: processedAquereurs,
        inputListRemb: rembourseList,
      });
    } catch (error) {
      console.error('Error fetching reservation:', error);
    } finally {
      setLoading((prev) => ({ ...prev, form: false }));
    }
  };

  // Fetch files
  const fetchFiles = async () => {
    if (hasFetchedFiles.current) return;
    hasFetchedFiles.current = true;

    try {
      const filesPromises = [
        !files.avc &&
          fetchList_fichier_exist(setFilesList_avc, 'avc', setLoading_list),
        !files.dst &&
          fetchList_fichier_exist(setFilesList_dst, 'dst', setLoading_list),
        !files.plt &&
          fetchList_fichier_exist(setFilesList_plt, 'plt', setLoading_list),
      ];

      await Promise.all(filesPromises);
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading((prev) => ({ ...prev, files: false }));
    }
  };

  // Fetch dossier data (only for model 1)
  const fetchDossierData = async () => {
    try {
      setLoading((prev) => ({ ...prev, dossier: true }));
      await data_by_projet_and_params(
        'getDossiers',
        setDossiers,
        setLoading_dos,
        null,

        'reservations',
        selectedProjet?.id,
        reservationId
      );
    } catch (error) {
      console.error('Error fetching dossiers:', error);
    } finally {
      setLoading((prev) => ({ ...prev, dossier: false }));
    }
  };

  // Fetch all initial data
  useEffect(() => {
    if (initialLoadComplete.current) return;
    initialLoadComplete.current = true;

    const fetchAllData = async () => {
      try {
        // First fetch reservation data
        await fetchReservation();

        // Then fetch other data in parallel
        await Promise.all([
          banques.length === 0 &&
            fetchData_Select('banques', setBanques, setLoading_bnq),
          activeModel === 1 && fetchDossierData(),
          fetchFiles(),
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading((prev) => ({ ...prev, general: false }));
      }
    };

    fetchAllData();
  }, [reservationId, activeModel]);

  // Handlers
  const handleTypeSelect = (selectedType) => {
    setActiveModel(selectedType);
    setShowTypeModal(false);
  };

  const onSubmit = async (data) => {

    try {
      setLoading((prev) => ({ ...prev, submit: true }));
      const formData = new FormData();
      formData.append('reservationId', reservationId);

      let processedData = data;
      if (activeModel == 1) {
        processedData = processDefinitifData(data);
      } else if (activeModel == 2) {
        processedData = processAuProfitData(data);
      } else if (activeModel == 3) {
        processedData = processChangementBienData(data);
      }


      Object.entries(processedData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
                console.log('data=>'+JSON.stringify(formData))

      const response = await axios.post(APIURL.DESISTEMENT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 201) {
        router.push('/ventes/desistements?success=created');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Data processing functions
  const processDefinitifData = (data) => {
    return {
      type: 1,
      motif: data.motif,
      /*date_operation: data.dateOperation,
      type_remboursement: data.remboursement,
      mode_remboursement: data.modeRemboursement,
      numero_paiement: data.numeroPaiement,
      pour_compte: data.pourCompte,
      montant_rembourse: calculateRemboursementAmount(
        reservationData.sumAvances,
        data
      ),
      avec_penalite: data.avecPenalite,
      penalite_amount: data.avecPenalite
        ? calculatePenalite(reservationData.prix)
        : 0,
      cheque_file: data.chequeFile,
      autorisation_file: data.fichierAutorisation,
      client_id: reservationData.desisteurs[0]?.cl_id,
      reservation_id: reservationId,
      created_by: JSON.parse(localStorage.getItem('user')).id,*/
      projet_id: selectedProjet?.id,
    };
  };

  const processAuProfitData = (data) => {
    return {
      type: 2,
      type_dp: data.type_dp,
     /* date_operation: data.dateOperation,
      beneficiaire_id: data.beneficiaireId,
      pourcentage_transfert: data.pourcentageTransfert,
      client_id: reservationData.desisteurs[0]?.cl_id,
      reservation_id: reservationId,
      autorisation_file: data.fichierAutorisation,
      contrat_file: data.contratFile,
      created_by: JSON.parse(localStorage.getItem('user')).id,*/
      projet_id: selectedProjet?.id,
    };
  };

  const processChangementBienData = (data) => {
    return {
      type: 3,
     
     /* date_operation: data.dateOperation,
      ancien_bien_id: reservationData.bienIdAncien,
      nouveau_bien_id: data.nouveauBienId,
      client_id: reservationData.desisteurs[0]?.cl_id,
      reservation_id: reservationId,
      contrat_file: data.contratFile,
      autorisation_file: data.fichierAutorisation,
      created_by: JSON.parse(localStorage.getItem('user')).id,*/
      projet_id: selectedProjet?.id,
    };
  };

  // Helper functions
  const calculateRemboursementAmount = (totalAvances, formData) => {
    return formData.avecPenalite ? totalAvances * 0.9 : totalAvances;
  };

  const calculatePenalite = (prixBien) => {
    return prixBien * 0.1;
  };

  const handleModelChange = (selectedId) => {
    setActiveModel(selectedId);
  };

  if (loading.form || loading.general) {
    return <LoadingSpin />;
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-100 p-4">
      {showTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Modal isVisible={true} onClose={() => router.back()}>
            <Modal_select_type_dst
              onSelect={handleTypeSelect}
              onClose={() => router.back()}
            />
          </Modal>
        </div>
      )}

      {!showTypeModal && activeModel && (
        <>
          <div className="w-full bg-white shadow-lg rounded-lg mb-4">
            <SideBar
              code_reservation={reservationData.codeRes}
              bien={reservationData.bien}
              prix={reservationData.prix}
              sum_avances_valides={reservationData.sumAvances}
              date_reservation={reservationData.dateRes}
              respo={reservationData.respo}
              desisteurs={reservationData.desisteurs}
              reservationId={reservationId}
              bien_id={reservationData.bienIdAncien}
            />
          </div>

          {messageAlert && (
            <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 p-4 rounded text-center">
              {messageAlert}
            </div>
          )}

          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <div className="max-w-[600px] mx-auto flex items-center gap-4">
              <label className="whitespace-nowrap">
                Veuillez Choisir un Type de désistement :
              </label>
              <div className="flex-1 min-w-0">
                <SelectInput
                  options={Object.values(type_dst).map(({ id, label }) => ({
                    value: id,
                    label,
                  }))}
                  value={activeModel}
                  onChange={(value) => {
                    const selected = Object.values(type_dst).find(
                      (opt) => opt.id == value
                    );
                    handleModelChange(selected?.id);
                  }}
                  placeholder="Sélectionnez un type de désistement"
                  className="text-base w-full"
                  menuClassName="min-w-full"
                  menuPlacement="auto"
                />
              </div>
            </div>
          </div>

          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="bg-white rounded-lg shadow mt-4"
            >
              {activeModel == 3 && (
                <Changement_De_Bien formData={formData} isEditing={false} />
              )}
              {activeModel == 2 && (
                <Desistement_Au_Profit formData={formData} isEditing={false} />
              )}
              {activeModel == 1 && (
                <Desistement_Definitif formData={formData} isEditing={false} />
              )}

              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 mr-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading.submit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading.submit ? (
                    <span className="flex items-center">
                      <LoadingSpin small white />
                      Enregistrer
                    </span>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </FormProvider>
        </>
      )}
    </div>
  );
}

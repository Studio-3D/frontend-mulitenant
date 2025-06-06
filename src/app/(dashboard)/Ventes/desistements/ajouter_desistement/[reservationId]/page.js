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
  fetchList_fichier_exist,
} from '../../../../../../../src/configs/api-utils';
import LoadingSpin from '@/components/LoadingSpin';
import { useForm, FormProvider } from 'react-hook-form';
import TextField from '@/components/Textfield';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';

export default function Page() {
  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const reservationId = params.reservationId;
  const accessToken = token || localStorage.getItem('accessToken');
  const selectedProjet_id = 1;
  //JSON.parse(localStorage.getItem('selectedProjet'))?.id ;
  const [selectedFiles_dst, setSelectedFiles_dst] = useState([]);
  const [selectedFiles_plt, setSelectedFiles_plt] = useState([]);

  // Refs to track initial loading
  const initialLoadComplete = useRef(false);
  const hasFetchedFiles = useRef(false);

  // State management
  const [activeModel, setActiveModel] = useState(0);
  const [defaultValues, setDefaultValues] = useState({});
  const [showTypeModal, setShowTypeModal] = useState(true);
  const [formData, setFormData] = useState({});
  const [messageAlert, setMessageAlert] = useState(null);

  // Loading states
  const [loading, setLoading] = useState({
    form: true,
    submit: false,
    general: true,
  });
  const [loading_bns, setLoading_bnq] = useState();
  const [loading_list, setLoading_list] = useState(false);

  // Data states
  const [filesList_avc, setFilesList_avc] = useState(null);
  const [filesList_dst, setFilesList_dst] = useState(null);
  const [filesList_plt, setFilesList_plt] = useState(null);
  const [banques, setBanques] = useState([]);
  const [files, setFiles] = useState({
    avc: null,
    dst: null,
    plt: null,
  });

  const modes_penalites = [
    { value: '10%' },
    { value: '15% (gros oeuvre)' },
    { value: '20% (Finition)' },
    { value: '25%' },
    { value: '30%' },
    { value: '40%' },
    { value: '50%' },
    { value: '60%' },
    { value: '70%' },
    { value: '80%' },
    { value: '90%' },
    { value: '100%' },
    { value: 'Montant' },
  ];
  const [avecPenalite, setAvecPenalite] = useState(false);
  const [avecPiecesJointes, setAvecPiecesJointes] = useState(false);
  const [penaliteAmount, setPenaliteAmount] = useState(0);

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
    defaultValues, // Just use defaultValues without resolver
  });

  const {
    control,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    console.log('Form values updated:', methods.getValues());
  }, [methods.watch()]);

  // Set default values based on active model
  useEffect(() => {
    if (!reservationData.inputListRemb) return; // Wait for data to load
    if (!reservationData.bien) return; // Wait for bien data to load
    console.log('im here ');
    let newDefaultValues = {};

    switch (activeModel) {
      case 1:
        newDefaultValues = {
          motif: '',
          type_remb: '',
          sum_avances_valides: reservationData.sumAvances || 0,
          inputList_remb: reservationData.inputListRemb || [],
          dossier_id: '',
          reservationId: reservationId,
        };
        break;
      case 2:
        newDefaultValues = {
          type_dp: '',
          desisteurs: reservationData.desisteurs,
          desisteurs_testt: reservationData.desisteursTest,
          desisteutrs_profit_dp_partiel: reservationData.desisteursProfit,
        };
        break;
      case 3:
        newDefaultValues = {
          bien_ancien: reservationData.bien || '',
          sum_avances_valides: reservationData.sumAvances || 0,
          banques: banques,
          filesList_avc: filesList_avc,
        };
        break;
      default:
        return;
    }

    setDefaultValues(newDefaultValues);
    reset(newDefaultValues);
  }, [activeModel, reset, reservationData]);

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

      const transformAquereur = (aq, suffix = '') => ({
        id: aq.id,
        cl_id: aq.client.id,
        cin: aq.client.cin,
        nom: aq.client.nom,
        prenom: aq.client.prenom,
        [`pourcentage${suffix}`]: aq.pourcentage,
      });

      const processedAquereurs = aquereurs.map((aq) => transformAquereur(aq));
      const processedAquereurs_part = aquereurs.map((aq) =>
        transformAquereur(aq, '_')
      );
      const rembourseList = aquereurs.map((aq) => ({
        aq_id: aq.id,
        cl_id: aq.client.id,
        nom: aq.client.nom,
        prenom: aq.client.prenom,
        pourcentage: aq.pourcentage,
        date_rembourse: '',
        mode_rembourse: '',
        num_paiement: '',
        cheque_recu: null,
        pour_le_compte: '',
        fichier_autorisation: null,
      }));
      console.log('Fetched rembourseList:', rembourseList); // Should show your array

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
        desisteursProfit: processedAquereurs_part,
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
          banques.length == 0 &&
            fetchData_Select('banques', setBanques, setLoading_bnq),
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
      formData.append('reservation_id', reservationId);
      formData.append('projet_id', selectedProjet_id);
      formData.append('bien_id_ancien', reservationData.bienIdAncien);

      // Ajoutez les fichiers globaux
      if (files.avc) formData.append('autorisation_file', files.avc);
      if (files.dst) formData.append('contrat_file', files.dst);

      // Ajoutez les données globales
      formData.append('avec_penalite', avecPenalite);
      formData.append('penalite_amount', penaliteAmount);
      formData.append('avec_pieces_jointes', avecPiecesJointes);
      //on utiliser pour store desistement premier fois
      formData.append('desistement_id_rejete', null);
      formData.append('sum_avances_valides', reservationData.sumAvances);
      if (data.type == 1) {
        data.inputList_remb.forEach((item, index) => {
          if (item.fichier_autorisation) {
            formData.append(
              `fichier_autorisation_${index}`,
              item.fichier_autorisation
            );
          }
        });
        data.inputList_remb.forEach((item, index) => {
          if (item.cheque_recu) {
            formData.append(`cheque_recu_${index}`, item.cheque_recu);
          }
        });
      }

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
      console.log('data=>' + JSON.stringify(formData));

      const response = await axios.post(APIURL.DESISTEMENT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      /* if (response.status == 201) {
        router.push('/ventes/desistements?success=created');
      }*/
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
      type_remb: data.type_remb,
      inputList_remb: JSON.stringify(data.inputList_remb),
      dossier_id: data.dossier_id,
      montant_transferer: data.montant_transferer,
      reste_a_rembourse: data.reste_a_rembourse,
      type_remb_transfere: data.type_remb_transfere,
    };
  };

  const processAuProfitData = (data) => {
    return {
      type: 2,
      type_dp: data.type_dp,
      lien_parente: data.lien_parente,
      //dp_proche // et dp_co
      desisteur_dp_proche_co: JSON.stringify(data.desisteur_dp_proche),
      new_clients_dp_proche: JSON.stringify(data.inputList),
      //dp_co
      profit_dp_co_reser: JSON.stringify(data.profit_dp_co_reser),
      //dp_partiel
      desisteutrs_profit_dp_partiel: JSON.stringify(
        data.desisteutrs_profit_dp_partiel
      ),
      new_clients_dp_partiel: JSON.stringify(data.new_clients_dp_partiel),
    };
  };

  const processChangementBienData = (data) => {
    return {
      type: 3,
      bien_id_new: data.new_bien_id,
      /* date_operation: data.dateOperation,
      ancien_bien_id: reservationData.bienIdAncien,
      nouveau_bien_id: data.nouveauBienId,
      client_id: reservationData.desisteurs[0]?.cl_id,
      reservation_id: reservationId,
      contrat_file: data.contratFile,
      autorisation_file: data.fichierAutorisation,
      created_by: JSON.parse(localStorage.getItem('user')).id,*/
    };
  };

  // Helper functions
  const calculateRemboursementAmount = (totalAvances, formData) => {
    return formData.avecPenalite ? totalAvances * 0.9 : totalAvances;
  };

  // Ajoutez cette fonction pour calculer la pénalité
  const calculatePenalite = (prixBien) => {
    const amount = prixBien * 0.1;
    setPenaliteAmount(amount);
    return amount;
  };
  const handleModelChange = (selectedId) => {
    setActiveModel(selectedId);
  };

  if (loading.form || loading.general) {
    return <LoadingSpin />;
  }

  const isFormValid = () => {
    const formValues = methods.getValues();

    if (activeModel == 1) {
      // Désistement Définitif
      // Validation de base
      if (!formValues.motif || !formValues.type_remb) {
        return false;
      }

      // Validation selon le type de remboursement
      if (formValues.type_remb == 'direct') {
        if (
          !formValues.inputList_remb ||
          formValues.inputList_remb.length == 0
        ) {
          return false;
        }

        // Valider chaque élément de inputList_remb
        for (const item of formValues.inputList_remb) {
          if (
            !item.date_rembourse ||
            !item.num_paiement ||
            !item.mode_rembourse ||
            !item.pour_le_compte ||
            (item.mode_rembourse == 'cheque' && !item.cheque_recu) ||
            (item.pour_le_compte == 'autre' && !item.fichier_autorisation)
          ) {
            return false;
          }
        }
      } else if (formValues.type_remb == 'transfert_remb') {
        if (!formValues.dossier_id) {
          return false;
        }
        if (formValues.montant_transferer == '') {
          return false;
        }
        if (formValues.reste_a_rembourse < 0) {
          return false;
        }

        if (formValues.type_remb_transfere == undefined) {
          return false;
        } else if (formValues.type_remb_transfere == 'immediat') {
          if (
            !formValues.inputList_remb ||
            formValues.inputList_remb.length == 0
          ) {
            return false;
          }

          for (const item of formValues.inputList_remb) {
            if (
              !item.num_paiement ||
              !item.date_rembourse ||
              !item.mode_rembourse ||
              !item.pour_le_compte ||
              (item.mode_rembourse == 'cheque' && !item.cheque_recu) ||
              (item.pour_le_compte == 'autre' && !item.fichier_autorisation)
            ) {
              return false;
            }
          }
        }
        // No validation needed for 'apres_vente' case
      } else if (['transfert'].includes(formValues.type_remb)) {
        if (!formValues.dossier_id) {
          return false;
        }
      }
    } else if (activeModel == 2) {
      // Désistement au Profit
      if (!formValues.type_dp) {
        return false;
      }
      // Validate based on type_dp
      if (formValues.type_dp == 1) {
        // Désistement au profit d'un proche
        // Check if new clients are added
        if (!formValues.inputList || formValues.inputList.length == 0)
          return false;

        // Check each new client's information
        for (const client of formValues.inputList) {
          if (
            !client.cin ||
            !client.nom ||
            !client.prenom ||
            !client.telephone_num1 ||
            !client.pourcentage
          ) {
            return false;
          }

          // Validate telephone length
          if (
            client.telephone_num1.length < 10 ||
            client.telephone_num1.length > 14
          ) {
            return false;
          }

          // Validate percentage
          const percent = parseInt(client.pourcentage);
          if (isNaN(percent)) return false;
          if (percent <= 0 || percent > 100) return false;
        }

        // Validate total percentage matches somme_percent
        const totalPercentage = formValues.inputList.reduce((sum, client) => {
          return sum + (parseInt(client.pourcentage) || 0);
        }, 0);

        if (totalPercentage !== parseInt(formValues.somme_percent)) {
          return false;
        }
      } else if (formValues.type_dp == 2) {
        // Désistement au profit d'un co-réservataire
        // Désistement au profit d'un co-réservataire
        if (
          !formValues.profit_dp_co_reser ||
          formValues.profit_dp_co_reser.length == 0
        ) {
          return false;
        }

        // Check each beneficiary's percentage
        let totalPercentage = 0;
        for (const beneficiary of formValues.profit_dp_co_reser) {
          const percent = parseInt(beneficiary.pourcentage);

          // Validate percentage is a number between 0 and 100
          if (isNaN(percent)) return false;
          if (percent < 0 || percent > 100) return false;

          totalPercentage += percent;
        }

        // Validate total percentage matches somme_percent
        if (totalPercentage != parseInt(formValues.somme_percent || 0)) {
          return false;
        }
      } else if (formValues.type_dp == 3) {
        // Désistement Partiel

        // Validate desisteurs are selected
        if (
          !formValues.desisteutrs_profit_dp_partiel ||
          formValues.desisteutrs_profit_dp_partiel.length == 0
        ) {
          return false;
        }

        // Validate each desisteur's percentage
        let totalOldPercentage = 0;
        for (const desisteur of formValues.desisteutrs_profit_dp_partiel) {
          const percent = parseFloat(desisteur.pourcentage_);

          // Validate percentage is a number between 0 and 100
          if (isNaN(percent)) return false;
          if (percent < 0 || percent > 100) return false;

          totalOldPercentage += percent;
        }

        // Validate new clients if any
        if (
          formValues.new_clients_dp_partiel &&
          formValues.new_clients_dp_partiel.length > 0
        ) {
          let totalNewPercentage = 0;

          for (const client of formValues.new_clients_dp_partiel) {
            // Validate required fields for new clients
            if (
              !client.cin ||
              !client.nom ||
              !client.prenom ||
              !client.telephone_num1 ||
              client.pourcentage == undefined
            ) {
              return false;
            }

            // Validate telephone length
            if (
              client.telephone_num1.length < 10 ||
              client.telephone_num1.length > 14
            ) {
              return false;
            }

            // Validate percentage
            const percent = parseFloat(client.pourcentage);
            if (isNaN(percent)) return false;
            if (percent < 0 || percent > 100) return false;

            totalNewPercentage += percent;
          }

          // Validate combined percentages equal 100%
          const combinedPercentage = totalOldPercentage + totalNewPercentage;
          if (Math.abs(combinedPercentage - 100) > 0.01) {
            return false;
          }
        } else {
          // If no new clients, old percentages must equal 100%
          if (Math.abs(totalOldPercentage - 100) > 0.01) {
            return false;
          }
        }
      }
    } else if (activeModel == 3) {
      // Changement de Bien
      if (!formValues.bien_ancien) {
        return false;
      }
    }

    return true;
  };

  const getFormErrors = () => {
    const formValues = methods.getValues();
    const errors = [];

    /* console.log('Form values:', formValues);
    console.log('inputList exists:', !!formValues.inputList);
    console.log('inputList length:', formValues.inputList?.length);
    console.log('inputList content:', formValues.inputList);*/

    if (activeModel == 1) {
      // Désistement Définitif
      if (!formValues.motif) errors.push('Le motif est requis');
      if (!formValues.type_remb)
        errors.push('Le type de remboursement est requis');

      if (formValues.type_remb == 'direct') {
        if (
          !formValues.inputList_remb ||
          formValues.inputList_remb.length == 0
        ) {
          errors.push('Au moins un remboursement direct doit être ajouté');
        } else {
          formValues.inputList_remb.forEach((item, index) => {
            if (!item.date_rembourse)
              errors.push(`Remboursement ${index + 1}: La date est requise`);
            if (!item.num_paiement)
              errors.push(
                `Remboursement ${index + 1}: Le numéro de paiement est requis`
              );
            if (!item.mode_rembourse)
              errors.push(
                `Remboursement ${
                  index + 1
                }: Le mode de remboursement est requis`
              );
            if (!item.pour_le_compte)
              errors.push(`Remboursement ${index + 1}: Le compte est requis`);
            if (item.mode_rembourse == 'cheque' && !item.cheque_recu) {
              errors.push(
                `Remboursement ${index + 1}: Le reçu de chèque est requis`
              );
            }
            if (item.pour_le_compte == 'autre' && !item.fichier_autorisation) {
              errors.push(
                `Remboursement ${
                  index + 1
                }: Le fichier d'autorisation est requis`
              );
            }
          });
        }
      } else if (formValues.type_remb == 'transfert_remb') {
        if (!formValues.dossier_id) errors.push('Le dossier ID est requis');
        if (formValues.montant_transferer == '')
          errors.push('Le montant à transférer est requis');
        if (formValues.reste_a_rembourse < 0)
          errors.push('Le reste à rembourser ne peut pas être négatif');

        if (formValues.type_remb_transfere == undefined) {
          errors.push('Le type de transfert est requis');
        } else if (formValues.type_remb_transfere == 'immediat') {
          if (
            !formValues.inputList_remb ||
            formValues.inputList_remb.length == 0
          ) {
            errors.push('Au moins un remboursement immédiat doit être ajouté');
          } else {
            formValues.inputList_remb.forEach((item, index) => {
              if (!item.num_paiement)
                errors.push(
                  `Remboursement immédiat ${
                    index + 1
                  }: Le numéro de paiement est requis`
                );
              if (!item.date_rembourse)
                errors.push(
                  `Remboursement immédiat ${index + 1}: La date est requise`
                );
              if (!item.mode_rembourse)
                errors.push(
                  `Remboursement immédiat ${
                    index + 1
                  }: Le mode de remboursement est requis`
                );
              if (!item.pour_le_compte)
                errors.push(
                  `Remboursement immédiat ${index + 1}: Le compte est requis`
                );
              if (item.mode_rembourse == 'cheque' && !item.cheque_recu) {
                errors.push(
                  `Remboursement immédiat ${
                    index + 1
                  }: Le reçu de chèque est requis`
                );
              }
              if (
                item.pour_le_compte == 'autre' &&
                !item.fichier_autorisation
              ) {
                errors.push(
                  `Remboursement immédiat ${
                    index + 1
                  }: Le fichier d'autorisation est requis`
                );
              }
            });
          }
        }
      } else if (['transfert'].includes(formValues.type_remb)) {
        if (!formValues.dossier_id) errors.push('Le dossier ID est requis');
      }
    } else if (activeModel == 2) {
      // Désistement au Profit
      if (!formValues.type_dp) {
        errors.push('Le type de désistement au profit est requis');
      } else if (formValues.type_dp == 1) {
        // Désistement au profit d'un proche
        const inputList = formValues.inputList || [];

        if (
          inputList.length == 0 ||
          inputList.some(
            (item) =>
              !item ||
              Object.keys(item).length == 0 ||
              Object.values(item).every((val) => val == '' || val == 0)
          )
        ) {
          errors.push('Au moins un nouveau client doit être ajouté');
        } else {
          inputList.forEach((client, index) => {
            if (!client || typeof client !== 'object') {
              errors.push(
                `Client ${index + 1}: Les données du client sont invalides`
              );
              return;
            }

            if (!client.cin)
              errors.push(`Client ${index + 1}: Le CIN est requis`);
            if (!client.nom)
              errors.push(`Client ${index + 1}: Le nom est requis`);
            if (!client.prenom)
              errors.push(`Client ${index + 1}: Le prénom est requis`);
            if (!client.telephone_num1) {
              errors.push(`Client ${index + 1}: Le téléphone est requis`);
            } else if (
              client.telephone_num1.length < 10 ||
              client.telephone_num1.length > 14
            ) {
              errors.push(
                `Client ${
                  index + 1
                }: Le téléphone doit contenir entre 10 et 14 caractères`
              );
            }

            const percent = parseInt(client.pourcentage);
            if (isNaN(percent)) {
              errors.push(
                `Client ${index + 1}: Le pourcentage doit être un nombre valide`
              );
            } else if (percent <= 0 || percent > 100) {
              errors.push(
                `Client ${index + 1}: Le pourcentage doit être entre 1 et 100`
              );
            }
          });

          const totalPercentage = inputList.reduce((sum, client) => {
            return sum + parseInt(client.pourcentage) || 0;
          }, 0);

          if (totalPercentage !== parseInt(formValues.somme_percent || 0)) {
            errors.push(
              `La somme des pourcentages (${totalPercentage}%) doit être égale à ${formValues.somme_percent}%`
            );
          }
        }
      } else if (formValues.type_dp == 2) {
        // Désistement au profit d'un co-réservataire
        console.log('dp_co_r==>' + formValues.profit_dp_co_reser);
        if (
          !formValues.profit_dp_co_reser ||
          formValues.profit_dp_co_reser.length == 0
        ) {
          errors.push('Au moins un bénéficiaire doit être sélectionné');
        } else {
          let totalPercentage = 0;
          formValues.profit_dp_co_reser.forEach((beneficiary, index) => {
            const percent = parseInt(beneficiary.new_pourcentage);

            if (isNaN(percent)) {
              errors.push(
                `Bénéficiaire ${
                  index + 1
                }: Le pourcentage doit être un nombre valide`
              );
            } else if (percent < 0 || percent > 100) {
              errors.push(
                `Bénéficiaire ${
                  index + 1
                }: Le pourcentage doit être entre 0 et 100`
              );
            }

            totalPercentage += percent || 0;
          });

          const expectedTotal = parseInt(formValues.somme_percent || 0);
          if (totalPercentage != expectedTotal) {
            errors.push(
              `La somme des pourcentages (${totalPercentage}%) doit être égale à ${expectedTotal}%`
            );
          }
          console.log(
            'total==>' + totalPercentage + 'expet==>' + expectedTotal
          );
        }
      } else if (formValues.type_dp == 3) {
        // Désistement Partiel

        // Validate desisteurs are selected
        if (
          !formValues.desisteutrs_profit_dp_partiel ||
          formValues.desisteutrs_profit_dp_partiel.length == 0
        ) {
          errors.push('Au moins un désisteur doit être sélectionné');
        } else {
          // Validate each desisteur's percentage
          let totalOldPercentage = 0;
          formValues.desisteutrs_profit_dp_partiel.forEach(
            (desisteur, index) => {
              const percent = parseFloat(desisteur.pourcentage_);

              if (isNaN(percent)) {
                errors.push(
                  `Désisteur ${
                    index + 1
                  }: Le pourcentage doit être un nombre valide`
                );
              } else if (percent < 0 || percent > 100) {
                errors.push(
                  `Désisteur ${
                    index + 1
                  }: Le pourcentage doit être entre 0 et 100`
                );
              }

              totalOldPercentage += percent || 0;
            }
          );

          // Validate new clients if any
          if (
            formValues.new_clients_dp_partiel &&
            formValues.new_clients_dp_partiel.length > 0
          ) {
            let totalNewPercentage = 0;

            formValues.new_clients_dp_partiel.forEach((client, index) => {
              // Validate required fields for new clients
              if (!client.cin) {
                errors.push(`Nouveau client ${index + 1}: Le CIN est requis`);
              }
              if (!client.nom) {
                errors.push(`Nouveau client ${index + 1}: Le nom est requis`);
              }
              if (!client.prenom) {
                errors.push(
                  `Nouveau client ${index + 1}: Le prénom est requis`
                );
              }
              if (!client.telephone_num1) {
                errors.push(
                  `Nouveau client ${index + 1}: Le téléphone est requis`
                );
              } else if (
                client.telephone_num1.length < 10 ||
                client.telephone_num1.length > 14
              ) {
                errors.push(
                  `Nouveau client ${
                    index + 1
                  }: Le téléphone doit contenir entre 10 et 14 caractères`
                );
              }

              const percent = parseFloat(client.pourcentage);
              if (isNaN(percent)) {
                errors.push(
                  `Nouveau client ${
                    index + 1
                  }: Le pourcentage doit être un nombre valide`
                );
              } else if (percent < 0 || percent > 100) {
                errors.push(
                  `Nouveau client ${
                    index + 1
                  }: Le pourcentage doit être entre 0 et 100`
                );
              }

              totalNewPercentage += percent || 0;
            });

            // Validate combined percentages equal 100%
            const combinedPercentage = totalOldPercentage + totalNewPercentage;
            if (Math.abs(combinedPercentage - 100) > 0.01) {
              errors.push(
                `La somme des pourcentages (${combinedPercentage.toFixed(
                  2
                )}%) doit être égale à 100%`
              );
            }
          } else {
            // If no new clients, old percentages must equal 100%
            if (Math.abs(totalOldPercentage - 100) > 0.01) {
              errors.push(
                `La somme des pourcentages (${totalOldPercentage.toFixed(
                  2
                )}%) doit être égale à 100%`
              );
            }
          }
        }
      }
    } else if (activeModel == 3) {
      // Changement de Bien
      if (!formValues.bien_ancien) {
        errors.push("L'ancien bien est requis");
      }
    }

    return errors;
  };

  const errors_s = getFormErrors();

  const handleFileChange = (event, param) => {
    const files = Array.from(event.target.files);
    event.target.value = null; // Reset input to allow selecting same file again

    // Early return if no files selected
    if (files.length === 0) return;

    const updatedFiles = [...selectedFiles_dst];
    const existingFileNames = new Set(Object.values(filesList_dst));
    const existingSelectedNames = new Set(
      selectedFiles_dst.map((f) => f.name || f.fichier)
    );

    for (const file of files) {
      const fileName = file.name;
      const [baseName, extension] = fileName.split(/(?<=.)(?=[^.]+$)/); // Better split for filename and extension

      // Check if file exists in file list (needs renaming)
      if (existingFileNames.has(fileName)) {
        let newFileName = fileName;
        let counter = 1;

        while (
          existingFileNames.has(newFileName) ||
          existingSelectedNames.has(newFileName)
        ) {
          newFileName = `${baseName} (${counter}).${extension}`;
          counter++;
        }

        const renamedFile = new File([file], newFileName, { type: file.type });
        updatedFiles.push(renamedFile);
        existingSelectedNames.add(newFileName); // Track the new name
      } else {
        updatedFiles.push(file);
        existingSelectedNames.add(fileName);
      }
    }

    // Only update state once at the end
    if (updatedFiles.length > selectedFiles_dst.length) {
      setSelectedFiles_dst(updatedFiles);
      setValue('files_desistement', updatedFiles);
    }
  };

  const handleDownloadFile = (file) => {
    const fileURL = URL.createObjectURL(file);

    window.open(fileURL);
  };

  const handleDeleteFile = async (index) => {
    const updatedFiles = selectedFiles_dst.filter((_, i) => i !== index);
    setSelectedFiles_dst(updatedFiles);
    await Promise.resolve(); // Ensures state is updated
    setValue('files_desistement', updatedFiles);
  };
  // Helper functions (add these outside your component)
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const iconClass = 'w-5 h-5 flex-shrink-0 text-gray-400';

    switch (extension) {
      case 'pdf':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'doc':
      case 'docx':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

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
                <Changement_De_Bien
                  formData={formData}
                  isEditing={false}
                  selectedProjet_id={selectedProjet_id}
                  bien_ancien={reservationData.bien}
                  sum_avances_valides={reservationData.sumAvances}
                  banques={banques}
                  filesList_avc={filesList_avc}
                />
              )}
              {activeModel == 2 && (
                <Desistement_Au_Profit formData={formData} isEditing={false} />
              )}
              {activeModel == 1 && (
                <Desistement_Definitif
                  formData={formData}
                  isEditing={false}
                  accessToken={accessToken}
                  selectedProjet_id={selectedProjet_id}
                />
              )}

              {/* Section Pénalité */}
              <div className="border-t border-gray-200 py-4 px-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-medium">Ajouter Pénalité</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={avecPenalite}
                      onChange={() => setAvecPenalite(!avecPenalite)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
              {avecPenalite && (
                <div className="border-t border-gray-200 py-4 px-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Mode Pénalité */}
                    <div>
                      <AutocompleteSelectComponent
                        label="Mode Pénalité:"
                        name="mode_penalite"
                        control={control}
                        options={modes_penalites.map((mode) => ({
                          value: mode.value,
                          label: mode.value.toUpperCase(),
                        }))}
                        errors={errors}
                        required
                        onChange={(value) => setValue('mode_penalite', value)}
                      />
                    </div>

                    {watch('mode_penalite') && (
                      <>
                        {watch('mode_penalite') == 'Montant' ? (
                          <div>
                            <TextField
                              label="Pénalité Montant:"
                              name="penalite_montant"
                              type="number"
                              control={control}
                              errors={errors}
                              required
                              onChange={(e) =>
                                setValue('penalite_montant', e.target.value)
                              }
                              disabled={watch('mode_penalite') !== 'Montant'}
                            />
                          </div>
                        ) : (
                          <>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pénalité Par:{' '}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="flex gap-4">
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name="penalite_par"
                                    value="prix"
                                    checked={watch('penalite_par') == 'prix'}
                                    onChange={(e) =>
                                      setValue('penalite_par', e.target.value)
                                    }
                                    className="text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="ml-2">Prix</span>
                                </label>
                                <label className="inline-flex items-center">
                                  <input
                                    type="radio"
                                    name="penalite_par"
                                    value="avance"
                                    checked={watch('penalite_par') == 'avance'}
                                    onChange={(e) =>
                                      setValue('penalite_par', e.target.value)
                                    }
                                    className="text-purple-600 focus:ring-purple-500"
                                  />
                                  <span className="ml-2">Avance</span>
                                </label>
                              </div>
                              {errors.penalite_par && (
                                <p className="mt-1 text-sm text-red-600">
                                  {errors.penalite_par.message}
                                </p>
                              )}
                            </div>
                            <div>
                              <TextField
                                label="Pénalité Montant:"
                                name="penalite_montant"
                                type="number"
                                control={control}
                                errors={errors}
                                required
                                onChange={(e) =>
                                  setValue('penalite_montant', e.target.value)
                                }
                                disabled={watch('mode_penalite') === 'Montant'}
                              />
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {watch('penalite_montant') && (
                    <>
                      <div className="mt-4">
                        <h3 className="text-md font-medium text-gray-900">
                          Mode Paiement Pénalité:
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="inline-flex items-center">
                            <input
                              type="checkbox"
                              name="sr_pen"
                              checked={watch('sr_pen') || false}
                              onChange={(e) =>
                                setValue('sr_pen', e.target.checked)
                              }
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2">Sr</span>
                          </label>
                        </div>

                        <div>
                          <AutocompleteSelectComponent
                            label="Modalité de Paiement:"
                            name="mode_paiement_pen"
                            control={control}
                            options={list_mode_paiement.map((mode) => ({
                              value: mode.id,
                              label: toTitleCase(mode.title),
                            }))}
                            errors={errors}
                            required
                            onChange={(value) =>
                              setValue('mode_paiement_pen', value)
                            }
                          />
                        </div>
                      </div>

                      {watch('mode_paiement_pen') &&
                        watch('mode_paiement_pen') !== 1 && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <AutocompleteSelectComponent
                                label="Banque:"
                                name="banque_pen"
                                control={control}
                                options={banques.map((banque) => ({
                                  value: banque.id,
                                  label: banque.nom,
                                }))}
                                errors={errors}
                                required
                                onChange={(value) => {
                                  setValue('banque_id_pen', value);
                                  setValue(
                                    'banque_pen',
                                    banques.find((b) => b.id === value)
                                  );
                                }}
                                loading={loading_bnqu}
                              />
                            </div>

                            <div>
                              <TextField
                                label="N° Paiement:"
                                name="numero_paiement_pen"
                                type="number"
                                control={control}
                                errors={errors}
                                required
                                onChange={(e) =>
                                  setValue(
                                    'numero_paiement_pen',
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        )}

                      {watch('mode_paiement_pen') &&
                        watch('mode_paiement_pen') !== 1 &&
                        watch('mode_paiement_pen') !== '6' &&
                        watch('mode_paiement_pen') !== '5' && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div>
                              <TextField
                                label="Echéance:"
                                name="echeance_pen"
                                type="date"
                                control={control}
                                errors={errors}
                                required
                                onChange={(e) =>
                                  setValue('echeance_pen', e.target.value)
                                }
                                InputLabelProps={{ shrink: true }}
                              />
                            </div>
                          </div>
                        )}

                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fichiers de pénalité:
                        </label>
                        <div className="space-y-4">
                          <TextField
                            fullWidth
                            type="file"
                            inputProps={{
                              accept: 'image/*, application/pdf',
                              multiple: true,
                            }}
                            onChange={(event) => handleFileChange(event, 3)}
                            size="small"
                            variant="outlined"
                          />

                          {selectedFiles_plt.length > 0 && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2 text-primary-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                Fichiers sélectionnés (
                                {selectedFiles_plt.length})
                              </h3>

                              <div className="space-y-2">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                  {selectedFiles_plt.map((data, index) => (
                                    <div
                                      key={data.id || data.name || index}
                                      className="flex flex-col p-3 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-colors h-full"
                                    >
                                      <div className="flex items-center mb-2">
                                        {getFileIcon(data.name || data.fichier)}
                                        <button
                                          onClick={() =>
                                            data.fichier
                                              ? handleFileClick(data.fichier)
                                              : handleDownloadFile(data)
                                          }
                                          className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600 truncate flex-1 text-left"
                                          title={data.fichier || data.name}
                                        >
                                          {data.fichier || data.name}
                                        </button>
                                      </div>

                                      <div className="flex items-center justify-between mt-auto">
                                        <span className="text-xs text-gray-500">
                                          {formatFileSize(data.size)}
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleDeleteFile(index, 3)
                                          }
                                          className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                                          title="Supprimer"
                                        >
                                          <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth={2}
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              {/* Section Pénalité */}
              <div className="border-t border-gray-200 py-4 px-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-medium">
                      {' '}
                      Ajouter Pièces Jointes
                    </h3>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={avecPiecesJointes}
                      onChange={() => setAvecPiecesJointes(!avecPiecesJointes)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
              <div className="border-t border-gray-200 py-4 px-6">
                {avecPiecesJointes && (
                  <div>
                    <div className="space-y-4">
                      {/* File Input */}
                      <div className="relative">
                        <TextField
                          label="Fichiers de désistements:"
                          control={control}
                          errors={{}}
                          backendErrors={{}}
                          defaultValues={{}}
                          name=""
                          type="file"
                          onChange={(e) => handleFileChange(e, 1)}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" // Specify accepted file types
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Formats acceptés: PDF, JPG, PNG, DOC (Taille max:
                          10MB)
                        </p>
                      </div>

                      {/* Selected Files Preview */}
                      {selectedFiles_dst.length > 0 && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-primary-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Fichiers sélectionnés ({selectedFiles_dst.length})
                          </h3>

                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                              {selectedFiles_dst.map((data, index) => (
                                <div
                                  key={data.id || data.name || index}
                                  className="flex flex-col p-3 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-colors h-full"
                                >
                                  <div className="flex items-center mb-2">
                                    {/* File icon based on type */}
                                    {getFileIcon(data.name || data.fichier)}

                                    <button
                                      onClick={() =>
                                        data.fichier
                                          ? handleFileClick(data.fichier)
                                          : handleDownloadFile(data)
                                      }
                                      className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600 truncate flex-1 text-left"
                                      title={data.fichier || data.name}
                                    >
                                      {data.fichier || data.name}
                                    </button>
                                  </div>

                                  <div className="flex items-center justify-between mt-auto">
                                    <span className="text-xs text-gray-500">
                                      {formatFileSize(data.size)}
                                    </span>
                                    <button
                                      onClick={() => handleDeleteFile(index)}
                                      className="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-50 transition-colors"
                                      title="Supprimer"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                {errors_s.length > 0 && (
                  <div className="error-messages">
                    <p>Veuillez corriger les erreurs suivantes :</p>
                    <ul>
                      {errors_s.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 mr-3 border border-gray-300 rounded-md !text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading.submit || errors_s.length > 0}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    loading.submit || errors_s.length > 0
                      ? 'bg-indigo-100 text-indigo-600 cursor-not-allowed' // Transparent indigo when disabled
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500' // Normal state
                  }`}
                >
                  {loading.submit ? (
                    <span className="flex items-center">
                      <LoadingSpin />{' '}
                      {/* Adjust spinner color based on state */}
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

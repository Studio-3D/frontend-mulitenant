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
  fetchList_fichier_exist_by_Code,
} from '../../../../../../../src/configs/api-utils';

import LoadingSpin from '@/components/LoadingSpin';
import { useForm, FormProvider } from 'react-hook-form';
import TextField from '@/components/Textfield';
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import { modes_penalites } from '@/configs/enum';
import { MODE_PAIEMENT } from '@/configs/enum';
import Autocomplete from '@/components/Autocomplete';

export default function Page() {
  const [dossierInfos, setDossierInfos] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

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
  const files = [
    {
      avc: null,
      dst: null,
      plt: null,
    },
  ];

  const [avecPenalite, setAvecPenalite] = useState(false);
  const [avecPiecesJointes, setAvecPiecesJointes] = useState(false);

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
    defaultValues: {
      mode_penalite: '',
      penalite_montant: 0, // or your preferred default value
      penalite_par: 'avance',
      sr_pen: false,
      commentaire: '',
      // other default values...
    },
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
          /*sum_avances_valides: reservationData.sumAvances || 0,
          inputList_remb: reservationData.inputListRemb || [],*/
          dossier_id: '',
          // reservationId: reservationId,
        };
        break;
      case 2:
        newDefaultValues = {
          type_dp: '',
          desisteurs: reservationData.desisteurs,
          desisteurs_testt: reservationData.desisteursTest,
          desisteutrs_profit_dp_partiel: reservationData.desisteursProfit || [],
        };
        break;
      case 3:
        newDefaultValues = {
          /*  bien_ancien: reservationData.bien || '',
          sum_avances_valides: reservationData.sumAvances || 0,
          banques: banques,
          filesList_avc: filesList_avc,*/
        };
        break;
      default:
        return;
    }

    setDefaultValues(newDefaultValues);
    reset(newDefaultValues);
  }, [activeModel, reset, reservationData]);

  const codeResRef = useRef();

  // Fetch reservation data
  const fetchReservation = async () => {
    if (!reservationId) return;

    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/reservations/${reservationId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
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

      codeResRef.current = code_reservation; // Update the ref

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
        type_remb: 'direct',
        dossier_id: '',
        montant_transferer: '',
        reste_a_rembourse: (
          sum_avances_valides *
          (aq.pourcentage / 100)
        ).toFixed(2),
        num_paiement: '',
        cheque_recu: null,
        pour_le_compte: '',
        fichier_autorisation: null,
      }));
      console.log('Fetched rembourseList:', rembourseList); // Should show your array

      setReservationData({
        bien: bien,
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
  console.log('code ress==>' + reservationData?.codeRes);
  // Fetch files
  const fetchFiles = async () => {
    if (hasFetchedFiles.current) return;
    hasFetchedFiles.current = true;
    if (!codeResRef.current) return; // Check the ref instead of reservationData

    try {
      const filesPromises = [
        !files.avc &&
          fetchList_fichier_exist_by_Code(
            setFilesList_avc,
            'avc',
            codeResRef.current,
            setLoading_list
          ),
        !files.dst &&
          fetchList_fichier_exist_by_Code(
            setFilesList_dst,
            'dst',
            codeResRef.current,
            setLoading_list
          ),
        !files.plt &&
          fetchList_fichier_exist_by_Code(
            setFilesList_plt,
            'plt',
            codeResRef.current,
            setLoading_list
          ),
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
    setFormSubmitted(true); // Set form as submitted
    const errors = getFormErrors();

    if (errors.length > 0) {
      return; // Don't proceed with submission if there are errors
    }
    try {
      setLoading((prev) => ({ ...prev, submit: true }));
      const formData = new FormData();
      formData.append('reservation_id', reservationId);
      formData.append('projet_id', selectedProjet_id);
      formData.append('bien_id_ancien', reservationData.bienIdAncien);

      // Ajoutez les données globales
      formData.append('avec_pieces_jointes', avecPiecesJointes);
      //on utiliser pour store desistement premier fois
      formData.append('desistement_id_rejete', null);
      formData.append('sum_avances_valides', reservationData.sumAvances);
      formData.append('commentaire', watch('commentaire'));

      //penalite
      if (avecPenalite) {
        formData.append('sr_pen', watch('sr_pen'));
        formData.append('checked_penalite', avecPenalite);
        formData.append('penalite_par', watch('penalite_par'));
        formData.append('mode_penalite', watch('mode_penalite'));
        formData.append('penalite_montant', watch('penalite_montant'));
        formData.append('mode_paiement_pen', watch('mode_paiement_pen'));
        formData.append('banque_id_pen', watch('banque_pen'));
        formData.append('numero_paiement_pen', watch('numero_paiement_pen'));
        formData.append('echeance_pen', watch('echeance_pen'));
      }
      // Append files as binary data with array notation
      selectedFiles_dst.forEach((file, index) => {
        formData.append(`files_desistement[${index}]`, file);
      });

      selectedFiles_plt.forEach((file, index) => {
        formData.append(`files_penalite[${index}]`, file);
      });

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

      // Handle files for type 3 (Changement de Bien)

      let processedData = data;
      if (activeModel == 1) {
        processedData = processDefinitifData(data);
        // Append remboursement files with correct field names
        data.inputList_remb.forEach((item, index) => {
          if (item.fichier_autorisation instanceof File) {
            formData.append(
              `fichier_autorisation_${index}`,
              item.fichier_autorisation
            );
          }
          if (item.cheque_recu instanceof File) {
            formData.append(`cheque_recu_${index}`, item.cheque_recu);
          }
        });

        // Append the remboursement list as JSON
        formData.append('inputlist_remb', JSON.stringify(data.inputList_remb));
      } else if (activeModel == 2) {
        processedData = processAuProfitData(data);
      } else if (activeModel == 3) {
        processedData = processChangementBienData(data);
        // DATA TYPE 3
        for (let i = 0; i < data?.files_avance?.length; i++) {
          formData.append(`files_avance[${i}]`, data.files_avance[i]);
        }
      }

      Object.entries(processedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && !(value instanceof File)) {
          formData.append(
            key,
            typeof value === 'object' ? JSON.stringify(value) : value
          );
        }
      });

      const response = await axios.post(APIURL.DESISTEMENT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status == 201 || response.status == 200) {
        if (user.role <= 2) {
          localStorage.setItem('etat_dst', '1');
          router.push('/ventes/desistements');
        } else {
          //commercial
          localStorage.setItem('etat_dst', '5');
          router.push('/ventes/desistements/attente_encours');
        }
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
      type_remb: data.type_remb,
    };
  };

  const processAuProfitData = (data) => {
    return {
      type: 2,
      type_dp: data.type_dp,
      lien_parente: data.lien_parente,
      //dp_proche // et dp_co
      desisteur_dp_proche_co: JSON.stringify(data.desisteur_dp_proche_co),
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
      bien_ancien: data.bien_ancien,
      //new_avance: data.new_avance,
      montant_a_ajouter: data.montant_a_ajouter,
      // Payment information (if montant_a_ajouter > 0)
      ...(data.montant_a_ajouter > 0 && {
        sr: data.sr || false,
        mode_paiement: data.mode_paiement,
        banque_id: data.banque_id,
        numero_paiement: data.numero_paiement,
        echeance: data.echeance,
        files_avance: data.files_avance, // Array of files
      }),
    };
  };

  const handleModelChange = (selectedId) => {
    setActiveModel(selectedId);
  };

  if (loading.form || loading.general) {
    return <LoadingSpin />;
  }

  const handleDossierInfosChange = (index, info) => {
    setDossierInfos((prev) => ({
      ...prev,
      [index]: info,
    }));
  };

  const getFormErrors = () => {
    const formValues = methods.getValues();
    const errors = [];

    if (activeModel == 1) {
      // Basic form validations
      if (!formValues.motif) errors.push('Le motif est requis');
      if (reservationData.sumAvances > 0) {
        if (!formValues.type_remb)
          errors.push('Le type de remboursement est requis');

        // Validate based on remboursement type
        if (formValues.type_remb === 'direct') {
          if (
            !formValues.inputList_remb ||
            formValues.inputList_remb.length === 0
          ) {
            errors.push('Au moins un remboursement doit être configuré');
          } else {
            formValues.inputList_remb.forEach((item, index) => {
              const clientPrefix = `Client ${index + 1}:`;
              const currentMode = item.type_remb;

              // Common validations for all modes
              if (!currentMode) {
                errors.push(
                  `${clientPrefix} Le mode de remboursement est requis`
                );
              }

              // Validate transfer section if mode is transfert or transfert_remb
              if (
                currentMode === 'transfert' ||
                currentMode === 'transfert_remb'
              ) {
                if (!item.dossier_id) {
                  errors.push(
                    `${clientPrefix} Le dossier de transfert est requis`
                  );
                }

                // Additional validation for transfert_remb mode
                if (currentMode === 'transfert_remb') {
                  const sum_avance_by_aq_percent =
                    (item.pourcentage / 100) * reservationData.sumAvances;

                  // Validate montant_transferer
                  if (
                    item.montant_transferer === '' ||
                    item.montant_transferer === null
                  ) {
                    errors.push(
                      `${clientPrefix} Le montant à transférer est requis`
                    );
                  } else if (isNaN(parseFloat(item.montant_transferer))) {
                    errors.push(
                      `${clientPrefix} Le montant à transférer doit être un nombre valide`
                    );
                  } else if (parseFloat(item.montant_transferer) <= 0) {
                    errors.push(
                      `${clientPrefix} Le montant à transférer doit être positif`
                    );
                  } else if (item.dossier_info) {
                    // Check if dossier info exists
                    if (
                      parseFloat(item.montant_transferer) >
                        sum_avance_by_aq_percent &&
                      parseFloat(item.montant_transferer) >
                        item.dossier_info.reste
                    ) {
                      errors.push(
                        `${clientPrefix} Le montant transféré ne doit pas dépasser le reste de dossier (${item.dossier_info.reste.toFixed(
                          2
                        )} DH) ni le reste à rembourser (${sum_avance_by_aq_percent.toFixed(
                          2
                        )} DH)`
                      );
                    } else if (
                      parseFloat(item.montant_transferer) >
                      sum_avance_by_aq_percent
                    ) {
                      errors.push(
                        `${clientPrefix} Le montant transféré ne doit pas dépasser le reste à rembourser (${sum_avance_by_aq_percent.toFixed(
                          2
                        )} DH)`
                      );
                    } else if (
                      parseFloat(item.montant_transferer) >
                      item.dossier_info.reste
                    ) {
                      errors.push(
                        `${clientPrefix} Le montant transféré ne doit pas dépasser le reste de dossier (${item.dossier_info.reste.toFixed(
                          2
                        )} DH)`
                      );
                    }
                  }

                  // Validate reste_a_rembourse
                  if (
                    item.reste_a_rembourse === '' ||
                    item.reste_a_rembourse === null
                  ) {
                    errors.push(
                      `${clientPrefix} Le reste à rembourser est requis`
                    );
                  } else if (isNaN(parseFloat(item.reste_a_rembourse))) {
                    errors.push(
                      `${clientPrefix} Le reste à rembourser doit être un nombre valide`
                    );
                  } else if (parseFloat(item.reste_a_rembourse) < 0) {
                    errors.push(
                      `${clientPrefix} Le reste à rembourser ne peut pas être négatif`
                    );
                  }

                  // Validate type_remb_transfere if there's a remaining amount
                  if (
                    parseFloat(item.reste_a_rembourse) > 0 &&
                    !item.type_remb_transfere
                  ) {
                    errors.push(
                      `${clientPrefix} Le type de remboursement du transfert est requis`
                    );
                  }

                  // Validate direct remboursement fields if type_remb_transfere is immediat
                  if (item.type_remb_transfere === 'immediat') {
                    if (!item.date_rembourse) {
                      errors.push(
                        `${clientPrefix} La date de remboursement est requise pour le remboursement immédiat`
                      );
                    }
                    if (!item.mode_rembourse) {
                      errors.push(
                        `${clientPrefix} Le mode de remboursement est requis pour le remboursement immédiat`
                      );
                    }
                    if (item.mode_rembourse && !item.num_paiement) {
                      errors.push(
                        `${clientPrefix} Le numéro de paiement est requis pour le remboursement immédiat`
                      );
                    }
                    if (!item.pour_le_compte) {
                      errors.push(
                        `${clientPrefix} Le compte bénéficiaire est requis pour le remboursement immédiat`
                      );
                    }
                    if (item.mode_rembourse === 'cheque' && !item.cheque_recu) {
                      errors.push(
                        `${clientPrefix} Le reçu de chèque est requis pour le remboursement immédiat`
                      );
                    }
                    if (
                      item.pour_le_compte === 'autre' &&
                      !item.fichier_autorisation
                    ) {
                      errors.push(
                        `${clientPrefix} Le fichier d'autorisation est requis pour le remboursement immédiat`
                      );
                    }
                  }
                }
              }

              // Validate direct remboursement fields if mode is direct
              if (currentMode === 'direct') {
                if (!item.date_rembourse) {
                  errors.push(
                    `${clientPrefix} La date de remboursement est requise`
                  );
                }
                if (!item.mode_rembourse) {
                  errors.push(
                    `${clientPrefix} Le mode de remboursement est requis`
                  );
                }
                if (item.mode_rembourse && !item.num_paiement) {
                  errors.push(
                    `${clientPrefix} Le numéro de paiement est requis`
                  );
                }
                if (!item.pour_le_compte) {
                  errors.push(
                    `${clientPrefix} Le compte bénéficiaire est requis`
                  );
                }
                if (item.mode_rembourse === 'cheque' && !item.cheque_recu) {
                  errors.push(`${clientPrefix} Le reçu de chèque est requis`);
                }
                if (
                  item.pour_le_compte === 'autre' &&
                  !item.fichier_autorisation
                ) {
                  errors.push(
                    `${clientPrefix} Le fichier d'autorisation est requis`
                  );
                }
              }

              // Validate the sum makes sense for transfert_remb
              if (currentMode === 'transfert_remb') {
                const montantTransferer =
                  parseFloat(item.montant_transferer) || 0;
                const resteARembourser =
                  parseFloat(item.reste_a_rembourse) || 0;
                const expectedTotal =
                  (item.pourcentage / 100) * reservationData.sumAvances;
                const actualTotal = montantTransferer + resteARembourser;

                if (Math.abs(actualTotal - expectedTotal) > 0.01) {
                  errors.push(
                    `${clientPrefix} La somme du montant transféré (${montantTransferer.toFixed(
                      2
                    )} DH) ` +
                      `et du reste à rembourser (${resteARembourser.toFixed(
                        2
                      )} DH) doit être égale ` +
                      `à ${expectedTotal.toFixed(2)} DH`
                  );
                }
              }
            });
          }
        }
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
    }
    // Validation for Changement de Bien (activeModel == 3)
    else if (activeModel == 3) {
      // Basic validation
      if (!formValues.bien_ancien) {
        errors.push("L'ancien bien est requis");
      }
      if (!formValues.new_bien_id) {
        errors.push('Le nouveau bien est requis');
      }

      // Validate payment section if montant_a_ajouter > 0
      if (formValues.montant_a_ajouter > 0) {
        if (!formValues.mode_paiement) {
          errors.push('Le mode de paiement est requis');
        } else {
          // Validate payment details based on payment method
          if (formValues.mode_paiement != 1) {
            // If not cash
            if (!formValues.banque_id) {
              errors.push('La banque est requise pour ce mode de paiement');
            }
            if (!formValues.numero_paiement) {
              errors.push('Le numéro de paiement est requis');
            }

            // Validate echeance for certain payment methods
            if (
              formValues.mode_paiement != 5 &&
              formValues.mode_paiement != 6 &&
              !formValues.echeance
            ) {
              errors.push("L'échéance est requise pour ce mode de paiement");
            }
          }
        }
      }
    }
    // Penalty validation (applies to all activeModel cases if avecPenalite is true)
    if (avecPenalite) {
      if (!formValues.mode_penalite) {
        errors.push('Le mode de pénalité est requis');
      } else {
        if (!formValues.penalite_montant || formValues.penalite_montant <= 0) {
          errors.push('Le montant de la pénalité doit être supérieur à 0');
        }

        if (formValues.mode_penalite !== 'Montant') {
          if (!formValues.penalite_par) {
            errors.push(
              'Le type de calcul de pénalité est requis (Prix/Avance)'
            );
          }
        }

        // Payment method validation if penalty amount is set
        if (formValues.penalite_montant > 0) {
          if (!formValues.mode_paiement_pen) {
            errors.push('Le mode de paiement de la pénalité est requis');
          } else {
            if (formValues.mode_paiement_pen != 1) {
              // If not cash
              if (!formValues.banque_pen) {
                errors.push(
                  'La banque pour le paiement de la pénalité est requise'
                );
              }
              if (!formValues.numero_paiement_pen) {
                errors.push('Le numéro de paiement de la pénalité est requis');
              }

              // Validate echeance for certain payment methods
              if (
                formValues.mode_paiement_pen != 5 &&
                formValues.mode_paiement_pen != 6 &&
                !formValues.echeance_pen
              ) {
                errors.push(
                  "L'échéance pour le paiement de la pénalité est requise"
                );
              }
            }
          }
        }
      }
    }

    return errors;
  };

  const errors_s = getFormErrors();

  const handleFileChange = (event, fileType) => {
    const files = Array.from(event.target.files);
    event.target.value = null; // Reset input

    if (files.length == 0) return;

    // Determine which state variables to use based on fileType
    const isDst = fileType == 1;
    const selectedFiles = isDst ? selectedFiles_dst : selectedFiles_plt;
    const filesList = isDst ? filesList_dst : filesList_plt;
    const setSelectedFiles = isDst
      ? setSelectedFiles_dst
      : setSelectedFiles_plt;
    const formField = isDst ? 'files_desistement' : 'files_penalite';

    const updatedFiles = [...selectedFiles];
    const existingFileNames = new Set(Object.values(filesList));
    const existingSelectedNames = new Set(
      selectedFiles.map((f) => f.name || f.fichier)
    );

    for (const file of files) {
      const fileName = file.name;
      const lastDotIndex = fileName.lastIndexOf('.');
      const baseName =
        lastDotIndex == -1 ? fileName : fileName.substring(0, lastDotIndex);
      const extension =
        lastDotIndex == -1 ? '' : fileName.substring(lastDotIndex + 1);

      let finalFileName = fileName;

      if (
        existingFileNames.has(fileName) ||
        existingSelectedNames.has(fileName)
      ) {
        let counter = 1;
        while (true) {
          finalFileName = extension
            ? `${baseName} (${counter}).${extension}`
            : `${baseName} (${counter})`;

          if (
            !existingFileNames.has(finalFileName) &&
            !existingSelectedNames.has(finalFileName)
          ) {
            break;
          }
          counter++;
        }
      }

      const finalFile =
        finalFileName == fileName
          ? file
          : new File([file], finalFileName, { type: file.type });

      updatedFiles.push(finalFile);
      existingSelectedNames.add(finalFileName);
    }

    if (updatedFiles.length > selectedFiles.length) {
      setSelectedFiles(updatedFiles);
      setValue(formField, updatedFiles);
    }
  };

  const handleDownloadFile = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };

  const handleDeleteFile = async (index, fileType) => {
    const isDst = fileType == 1;
    const selectedFiles = isDst ? selectedFiles_dst : selectedFiles_plt;
    const setSelectedFiles = isDst
      ? setSelectedFiles_dst
      : setSelectedFiles_plt;
    const formField = isDst ? 'files_desistement' : 'files_penalite';

    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    await Promise.resolve(); // Ensures state is updated
    setValue(formField, updatedFiles);
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

  const handlechange_penalite = (event) => {
    const selectedType = event.target.value; // "prix" or "avance"
    setValue('penalite_par', selectedType);

    // Recalculate only if a penalty mode is selected and it's not "Montant"
    const currentMode = watch('mode_penalite');
    if (currentMode && currentMode != 'Montant') {
      const percentage = parseFloat(currentMode);
      const amount =
        selectedType == 'prix'
          ? reservationData.prix
          : reservationData.sumAvances;

      setValue('penalite_montant', (amount * percentage) / 100);
    }
  };

  const handlechange_mode_penalite = (code) => {
    const selectedMode = modes_penalites[code];
    if (selectedMode) {
      console.log('Selected Mode:', selectedMode.label);
      setValue('mode_penalite', selectedMode.label);

      // Calculate penalty amount
      if (selectedMode.label != 'Montant') {
        const percentage = parseFloat(selectedMode.label);
        if (watch('penalite_par') == 'prix') {
          setValue(
            'penalite_montant',
            (reservationData.prix * percentage) / 100
          );
        } else {
          setValue(
            'penalite_montant',
            (reservationData.sumAvances * percentage) / 100
          );
        }
      }
    }
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
                Veuillez Choisir un Type de Désistement :
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
                  isEditing={false}
                  selectedProjet_id={selectedProjet_id}
                  bien_ancien={reservationData.bien?.propriete_dite_bien}
                  sum_avances_valides={reservationData.sumAvances}
                  banques={banques}
                  filesList_avc={filesList_avc}
                />
              )}
              {activeModel == 2 && (
                <Desistement_Au_Profit
                  isEditing={false}
                  desisteurs_testt={reservationData.desisteursTest}
                  desisteurs={reservationData.desisteurs}
                  desisteutrs_profit_dp_partiell={
                    reservationData.desisteursProfit
                  }
                />
              )}
              {activeModel == 1 && (
                <Desistement_Definitif
                  isEditing={false}
                  accessToken={accessToken}
                  selectedProjet_id={selectedProjet_id}
                  sum_avances_valides={reservationData.sumAvances}
                  inputListRemb_get={reservationData.inputListRemb}
                  reservationId={reservationId}
                  onDossierInfosChange={handleDossierInfosChange}
                />
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
                                      onClick={() => handleDeleteFile(index, 1)}
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
                <div className="flex-1 mt-4">
                  <TextField
                    label="Commentaire:"
                    name="commentaire"
                    type="text"
                    multi={true} // Set this to true if you want a multi-line textarea, else leave it out or false
                    control={control} // Passed from useForm hook
                    errors={errors} // Validation errors from React Hook Form
                    backendErrors={{}} // Backend error messages if any
                    defaultValues={{}} // Default values for the form
                    width="w-full" // Optionally set width, default is 'w-80'
                    height="h-full" // Optionally set height, default is 'h-10'
                  />
                </div>
              </div>

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
                      onChange={() => {
                        setAvecPenalite(!avecPenalite);
                        if (watch('penalite_montant') != null) {
                          setValue('penalite_montant', 0);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
              {avecPenalite && (
                <div className="border-t border-gray-200 py-4 px-6 space-y-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    {' '}
                    {/* Ensures alignment */}
                    {/* Mode Pénalité Dropdown */}
                    <div className="w-[600px] mt-1">
                      <SelectInput
                        label="Mode Pénalité :"
                        name="mode_penalite"
                        value={watch('mode_penalite')}
                        required={true}
                        options={
                          // Handle both array and object formats
                          !modes_penalites ? [] :
                          Array.isArray(modes_penalites) ? modes_penalites :
                          typeof modes_penalites === 'object' ? Object.entries(modes_penalites).map(([key, value]) => ({
                            value: key,
                            label: typeof value === 'object' ? value.label || value.name || String(value) : String(value)
                          })) :
                          []
                        }
                        onChange={(value) => {
                          setValue('mode_penalite', value);
                          handlechange_mode_penalite(value);
                        }}
                        error={errors.mode_penalite?.message}
                        placeholder="Sélectionnez un mode de pénalité"
                      />
                  </div>
                    {/* Conditional Fields (aligned at the same height) */}
                    {watch('mode_penalite') && (
                      <>
                        {watch('mode_penalite') == 'Montant' ? (
                          /* Manual Penalty Amount Input (same height as other fields) */
                          <div className="flex-1 min-w-[180px]">
                            <TextField
                              label="Pénalité Montant"
                              name="penalite_montant"
                              type="number"
                              control={control}
                              errors={{}}
                              backendErrors={{}}
                              required
                              onChange={(e) =>
                                setValue('penalite_montant', e.target.value)
                              }
                            />
                          </div>
                        ) : (
                          /* Percentage-based Penalty (keeps same height) */
                          <div className="flex flex-1 flex-col md:flex-row gap-4 items-center">
                            {' '}
                            {/* Ensures inner alignment */}
                            {/* Radio Buttons (Prix/Avance) */}
                            <div className="min-w-[220px]">
                              <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                  Pénalité Par
                                </label>
                                <div className="flex space-x-4">
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name="penalite_par"
                                      value="prix"
                                      checked={watch('penalite_par') == 'prix'}
                                      onChange={handlechange_penalite}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="ml-2">Prix</span>
                                  </label>
                                  <label className="inline-flex items-center">
                                    <input
                                      type="radio"
                                      name="penalite_par"
                                      value="avance"
                                      checked={
                                        watch('penalite_par') == 'avance'
                                      }
                                      onChange={handlechange_penalite}
                                      className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                    />
                                    <span className="ml-2">Avance</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                            {/* Auto-Calculated Penalty Amount (same height) */}
                            <div className="min-w-[180px]">
                              <TextField
                                label="Montant"
                                name="penalite_montant"
                                type="number"
                                control={control}
                                errors={errors}
                                backendErrors={{}}
                                required
                                disabled
                                value={watch('penalite_montant') || ''}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="border-t border-gray-200 py-4">
                    {/* Only show penalty payment section if mode_penalite is selected AND penalite_montant has a valid value */}
                    {watch('mode_penalite') &&
                      watch('penalite_montant') &&
                      watch('penalite_montant') > 0 && (
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
                                <span className="ml-2">SR</span>
                              </label>
                            </div>

                            <div>
                              <SelectInput
                                  label="Mode de Paiement"
                                  name="mode_paiement_pen"
                                  value={watch('mode_paiement_pen')}
                                  required={true}
                                  options={
                                    // Handle both array and object formats for MODE_PAIEMENT
                                    !MODE_PAIEMENT ? [] :
                                    Array.isArray(MODE_PAIEMENT) ? MODE_PAIEMENT :
                                    typeof MODE_PAIEMENT === 'object' ? Object.entries(MODE_PAIEMENT).map(([key, value]) => ({
                                      value: key,
                                      label: typeof value === 'object' ? value.label || value.name || String(value) : String(value)
                                    })) :
                                    []
                                  }
                                  onChange={(value) => {
                                    console.log('Selected payment mode:', value);
                                    setValue('mode_paiement_pen', value);
                                  }}
                                  error={errors.mode_paiement_pen?.message}
                                  placeholder="Sélectionnez un mode de paiement"
                                />
                            </div>
                          </div>

                          {watch('mode_paiement_pen') &&
                            watch('mode_paiement_pen') != 1 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <SelectInput
                                    label="Banque:"
                                    name="banque_pen"
                                    value={watch('banque_pen')}
                                    required={watch('mode_paiement_pen') != '1'}
                                    options={
                                      Array.isArray(banques) 
                                        ? banques.map(banque => ({
                                            value: banque.id || banque.value || banque.code,
                                            label: banque.nom || banque.label || banque.name || 'Banque sans nom'
                                          }))
                                        : []
                                    }
                                    onChange={(value) => {
                                      setValue('banque_pen', value);
                                    }}
                                    error={errors.banque_pen?.message}
                                    placeholder="Sélectionnez une banque"
                                  />
                                </div>

                                <div>
                                  <TextField
                                    label="N° Paiement:"
                                    name="numero_paiement_pen"
                                    type="number"
                                    control={control}
                                    errors={errors}
                                    backendErrors={{}}
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
                            watch('mode_paiement_pen') != 1 &&
                            watch('mode_paiement_pen') != 5 &&
                            watch('mode_paiement_pen') != 6 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <TextField
                                    label="Echéance:"
                                    name="echeance_pen"
                                    type="date"
                                    control={control}
                                    errors={errors}
                                    backendErrors={{}}
                                    required
                                    onChange={(e) =>
                                      setValue('echeance_pen', e.target.value)
                                    }
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </div>
                              </div>
                            )}

                          <div className="border-t border-gray-200 py-4 mt-2">
                            <div className="mt-6">
                              <div className="space-y-4">
                                <TextField
                                  label="Fichiers de Pénalités:"
                                  control={control}
                                  errors={{}}
                                  backendErrors={{}}
                                  defaultValues={{}}
                                  name=""
                                  type="file"
                                  onChange={(e) => handleFileChange(e, 3)}
                                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
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
                                        {selectedFiles_plt.map(
                                          (data, index) => (
                                            <div
                                              key={
                                                data.id || data.name || index
                                              }
                                              className="flex flex-col p-3 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-colors h-full"
                                            >
                                              <div className="flex items-center mb-2">
                                                {getFileIcon(
                                                  data.name || data.fichier
                                                )}
                                                <button
                                                  onClick={() =>
                                                    data.fichier
                                                      ? handleFileClick(
                                                          data.fichier
                                                        )
                                                      : handleDownloadFile(data)
                                                  }
                                                  className="ml-2 text-sm font-medium text-gray-700 hover:text-blue-600 truncate flex-1 text-left"
                                                  title={
                                                    data.fichier || data.name
                                                  }
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
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                  </div>
                </div>
              )}

              {formSubmitted && errors_s.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-500 p-4 mb-4">
                  <p className="font-semibold">
                    Veuillez corriger les erreurs suivantes :
                  </p>
                  <ul className="list-disc pl-5 mt-2">
                    {errors_s.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
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
                  disabled={
                    loading.submit || (formSubmitted && errors_s.length > 0)
                  }
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    loading.submit || (formSubmitted && errors_s.length > 0)
                      ? 'bg-indigo-100 text-indigo-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
                  }`}
                >
                  {loading.submit ? (
                    <span className="flex items-center">
                      <LoadingSpin />
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

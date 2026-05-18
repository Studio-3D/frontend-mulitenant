'use client';
import React, { useState, useEffect, useRef } from 'react';
import { SideBar } from '../../../desistements/ajouter_desistement/[reservationId]/SideBar';
import { Desistement_Definitif } from '../../../desistements/ajouter_desistement/[reservationId]/Desistement_Definitif';
import { Desistement_Au_Profit } from '../../../desistements/ajouter_desistement/[reservationId]/Desistement_Au_Profit';
import { Changement_De_Bien } from '../../../desistements/ajouter_desistement/[reservationId]/Changement_De_Bien';
import { useRouter, useParams } from 'next/navigation';
import { APIURL } from '../../../../../../configs/api';
import axios from 'axios';
import { isAdmin, isAgentAdministratif, isCommercial, isRespoCommercial, isSuperAdmin, type_dst } from '@/configs/enum';
import { useAuth } from '../../../../../../context/AuthContext';
import {
  fetchData_Select,
  fetchList_fichier_exist_by_Code,
} from '../../../../../../../src/configs/api-utils';
import { type_dst_dp } from '@/configs/enum';
import SelectInput from '@/components/SelectInput';

import LoadingSpin from '@/components/LoadingSpin';
import { useForm, FormProvider } from 'react-hook-form';
import TextField from '@/components/Textfield';
import { MODE_PAIEMENT, modes_penalites } from '@/configs/enum';
import { useProjet } from '@/context/ProjetContext';
import BreadCrumb from '../../../../navigation/BreadCrumb';
import { useSociete } from '@/context/SocieteContext';

export default function Page() {
  // Ajoutez ces states au début de votre composant
  const [isPenaliteToggling, setIsPenaliteToggling] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const hasFetchedFiles = useRef(false);
  const codeResRef = useRef();
  const [dossierInfos, setDossierInfos] = useState({});

  const router = useRouter();
  const params = useParams();
  const { user, token } = useAuth();
  const desistementId = params.desistementId;
  const accessToken = token || localStorage.getItem('accessToken');
  const { selectedProjet } = useProjet();
  const selectedProjet_id = selectedProjet?.id;
  //JSON.parse(localStorage.getItem('selectedProjet'))?.id ;
  // Refs and state
  const initialLoadComplete = useRef(false);
  const [loading, setLoading] = useState({
    form: true,
    submit: false,
    general: true,
  });
  const [loading_bns, setLoading_bnq] = useState();
  const [loading_list, setLoading_list] = useState(false);
  const [desistementData, setDesistementData] = useState(null);
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
  const files = [
    {
      avc: null,
      dst: null,
      plt: null,
    },
  ];
  const [activeModel, setActiveModel] = useState(null);
  const [avecPenalite, setAvecPenalite] = useState(false);
  const [avecPiecesJointes, setAvecPiecesJointes] = useState(false);
  const [banques, setBanques] = useState([]);
  const [filesList_dst, setFilesList_dst] = useState(null);
  const [filesList_plt, setFilesList_plt] = useState(null);
  const [selectedFiles_dst, setSelectedFiles_dst] = useState([]);
  const [originalFiles_dst, setOriginalFiles_dst] = useState([]); // Add this
  const [selectedFiles_plt, setSelectedFiles_plt] = useState([]);
  const [originalFiles_plt, setOriginalFiles_plt] = useState([]);

  const [filesList_avc, setFilesList_avc] = useState(null);

  // Form methods
  const methods = useForm({
    defaultValues: {
      mode_penalite: '',
      penalite_montant: 0,
      penalite_par: 'avance',
      sr_pen: false,
      commentaire: '',
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

  const userRole = user?.role;
      useEffect(() => {
        if (
          !isAdmin(userRole) &&
          !isSuperAdmin(userRole) &&
          !isCommercial(userRole)&&
          !isRespoCommercial(userRole)&&
          !isAgentAdministratif(userRole)
        ) {
          router.push('/');
        }
      }, [router]);
      
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Ajoutez cet useEffect pour gérer le toggle de pénalité
  useEffect(() => {
    if (isPenaliteToggling) {
      const timer = setTimeout(() => {
        setIsPenaliteToggling(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isPenaliteToggling]);
  // Modifiez l'effet pour calculer automatiquement la pénalité
  useEffect(() => {
    if (
      avecPenalite &&
      watch('mode_penalite') &&
      watch('mode_penalite') !== 'Montant'
    ) {
      const percentage = parseFloat(watch('mode_penalite').replace('%', ''));
      const penalitePar = watch('penalite_par') || 'avance';
      const amount =
        penalitePar === 'prix'
          ? reservationData.prix || 0
          : reservationData.sumAvances || 0;

      const calculatedAmount = (amount * percentage) / 100;
      setValue('penalite_montant', calculatedAmount.toFixed(2));
    }
  }, [watch('mode_penalite'), watch('penalite_par'), avecPenalite, setValue]);
  // Simple cache et comparaison for return back en cas de changer projet
  const { selectedSociete } = useSociete();
      const [oldProjetId, setOldProjetId] = useState(null);
      const [oldSocieteId, setOldSocieteId] = useState(null);
    

  	 useEffect(() => {
  if ((selectedProjet?.id && selectedProjet?.id !== oldProjetId)||(selectedSociete?.id && selectedSociete?.id !== oldSocieteId)) {
    if (oldProjetId||oldSocieteId) {
      // Projet ou société a changé
      //  console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet?.id}`);
      router.push('/administration/types-biens');
    }
    setOldSocieteId(selectedSociete?.id)
    setOldProjetId(selectedProjet?.id);
  }
}, [selectedProjet?.id, selectedSociete?.id, oldProjetId, oldSocieteId, router]);
  // Fetch desistement data
  const fetchDesistementData = async () => {
    try {
      setLoading((prev) => ({ ...prev, form: true }));
      setIsFormInitialized(false); // Reset initialization flag

      const response = await axios.get(
        `${APIURL.ROOTV1}/desistements/${desistementId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const desistement = response.data.desistement;
      setDesistementData(desistement);
      setActiveModel(desistement.type); // Set the active model based on desistement type

      // Fetch associated reservation data
      await fetchReservationData(desistement.reservation_id);
      setIsFormInitialized(true); // Mark form as initialized

      // Set penalty flag if penalty exists
      setValue('commentaire', desistement.commentaire);
      if (response.data.penalite != null) {
        setAvecPenalite(true);
        setValue('mode_penalite', response.data.penalite?.mode_penalite);
        /* setValue(
          'mode_penalite_value',
          getModePenaliteCode(response.data.penalite?.mode_penalite)
        );*/
        setValue('penalite_montant', response.data.penalite?.montant);
        setValue('penalite_par', response.data.penalite?.penalite_par);
        setValue('sr_pen', response.data.penalite?.sr == 0 ? false : true);
        setValue('mode_paiement_pen', response.data.penalite?.mode_paiement);

        setValue('banque_pen', response.data.penalite?.banque_id);
        setValue(
          'numero_paiement_pen',
          response.data.penalite?.numero_paiement
        );
        setValue('echeance_pen', response.data.penalite?.echeance);

        /*setSelectedFiles_plt(
          response.data.penalite?.piece_jointes
            ? response.data.penalite?.piece_jointes
            : []
        );
        setValue(
          'files_penalite',
          response.data.penalite?.piece_jointes
            ? response.data.penalite?.piece_jointes
            : []
        );
      }*/
        if (response.data.penalite?.piece_jointes) {
          const penaltyFiles = response.data.penalite.piece_jointes;
          setOriginalFiles_plt(penaltyFiles);
          setSelectedFiles_plt(penaltyFiles);
          setValue('files_penalite', penaltyFiles);
        }
      }
      // Set files flag if files exist
      if (desistement.piece_jointes && desistement.piece_jointes.length > 0) {
        setAvecPiecesJointes(true);
        const originalFiles = desistement.piece_jointes || [];
        setOriginalFiles_dst(originalFiles); // Store original files
        setSelectedFiles_dst(originalFiles); // Initialize with original files
        setValue('files_desistement', originalFiles);
      }
      // Add similar blocks for other types (2 and 3) if needed
    } catch (error) {
      console.error('Error fetching desistement:', error);
    } finally {
      setLoading((prev) => ({ ...prev, form: false, general: false }));
    }
  };

  useEffect(() => {
    if (isFormInitialized) {
      console.log('Form values after initialization:', methods.getValues());
    }
  }, [isFormInitialized, methods]);

  // Fetch reservation data
  const fetchReservationData = async (reservationId) => {
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
      codeResRef.current = code_reservation; // Update the ref

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
        mode_rembourse_2: 'direct',
        dossier_id: '',
        montant_transferer: '',
        num_paiement: '',
        reste_a_rembourse: '',
        cheque_recu: null,
        pour_le_compte: '',
        fichier_autorisation: null,
      }));
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
    }
  };
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
        await fetchDesistementData();
        await fetchData_Select('banques', setBanques, setLoading_bnq);
        await fetchFiles();
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    fetchAllData();
  }, [desistementId]);

  useEffect(() => {
    console.log('Form values updated:', methods.getValues());
  }, [methods.watch()]);

  // Handle form submission
  const onSubmit = async (data) => {
    setFormSubmitted(true); // Set form as submitted
    const errors = getErrors(); // Utilisez getErrors() au lieu de errors_g

    if (errors.length > 0) {
      return; // Don't proceed with submission if there are errors
    }
    try {
      setLoading((prev) => ({ ...prev, submit: true }));

      const formData = new FormData();
      formData.append('desistement_id_rejete', desistementId);
      formData.append('reservation_id', desistementData.reservation_id);
      formData.append('projet_id', selectedProjet_id);
      formData.append('bien_id_ancien', reservationData.bienIdAncien);

      // Add common fields
      formData.append('avec_pieces_jointes', avecPiecesJointes);
      formData.append('commentaire', watch('commentaire'));
      formData.append('sum_avances_valides', reservationData.sumAvances);

      // Add penalty data if exists
      formData.append('checked_penalite', avecPenalite);
      if (avecPenalite) {
        formData.append('mode_penalite', watch('mode_penalite'));
        formData.append('penalite_montant', watch('penalite_montant'));
        formData.append('penalite_par', watch('penalite_par'));
        formData.append('sr_pen', watch('sr_pen'));
        formData.append('mode_paiement_pen', watch('mode_paiement_pen'));
        formData.append('banque_id_pen', watch('banque_pen'));
        formData.append('numero_paiement_pen', watch('numero_paiement_pen'));
        formData.append('echeance_pen', watch('echeance_pen'));
      }

      // Handle files - separate original file names and new files
      const { originalFileNames, newFiles } = selectedFiles_dst.reduce(
        (acc, file) => {
          if (file.id && file.fichier) {
            // This is an original file that wasn't modified
            acc.originalFileNames.push(file.fichier);
          } else {
            // This is a new file or modified file
            acc.newFiles.push(file);
          }
          return acc;
        },
        { originalFileNames: [], newFiles: [] }
      );

      // Add original file names as array
      originalFileNames.forEach((fileName, index) => {
        formData.append(`original_files_desistement[${index}]`, fileName);
      });

      // Add new files
      newFiles.forEach((file, index) => {
        formData.append(`new_files_desistement[${index}]`, file);
      });
      // Add files
      // Handle penalty files - separate original file names and new files
      const { originalFileNames: originalFileNamesPlt, newFiles: newFilesPlt } =
        selectedFiles_plt.reduce(
          (acc, file) => {
            if (file.id && file.fichier) {
              // This is an original file that wasn't modified
              acc.originalFileNames.push(file.fichier);
            } else {
              // This is a new file or modified file
              acc.newFiles.push(file);
            }
            return acc;
          },
          { originalFileNames: [], newFiles: [] }
        );

      // Add original penalty file names as array
      originalFileNamesPlt.forEach((fileName, index) => {
        formData.append(`original_files_penalite[${index}]`, fileName);
      });

      // Add new penalty files
      newFilesPlt.forEach((file, index) => {
        formData.append(`new_files_penalite[${index}]`, file);
      });

      // Add type-specific data
      if (activeModel == 1) {
        // Désistement Définitif
        formData.append('type', 1);
        formData.append('motif', data.motif);
        formData.append('type_remb', data.type_remb);
        formData.append('inputlist_remb', JSON.stringify(data.inputList_remb));
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
      } else if (activeModel == 2) {
        // Add type-specific data based on subtype
        formData.append('type', 2);
        formData.append('type_dp', data.type_dp);
        switch (data.type_dp) {
          case '1': // Proche
            formData.append(
              'desisteur_dp_proche_co',
              JSON.stringify(data.desisteur_dp_proche_co)
            );
            formData.append(
              'new_clients_dp_proche',
              JSON.stringify(data.inputList)
            );
            formData.append('lien_parente', data.lien_parente);
            break;

          case '2': // Co-réservataire
            formData.append(
              'desisteur_dp_proche_co',
              JSON.stringify(data.desisteur_dp_proche_co)
            );
            formData.append(
              'profit_dp_co_reser',
              JSON.stringify(data.profit_dp_co_reser)
            );
            formData.append('lien_parente', data.lien_parente);
            break;

          case '3': // Partiel
            formData.append(
              'desisteutrs_profit_dp_partiel',
              JSON.stringify(data.desisteutrs_profit_dp_partiel)
            );
            formData.append(
              'new_clients_dp_partiel',
              JSON.stringify(data.new_clients_dp_partiel)
            );
            formData.append('lien_parente', data.lien_parente);
            break;
        }
      } else if (activeModel == 3) {
        // DATA TYPE 3
        //REMboursement
        formData.append('type_remb', data.type_remb);
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

        formData.append('inputlist_remb', JSON.stringify(data.inputList_remb));
        //////
        formData.append('type', 3);
        formData.append('bien_id_new', data.new_bien_id);
        formData.append('montant_a_ajouter', data.montant_a_ajouter);
        if (data.montant_a_ajouter > 0) {
          formData.append('sr', data.sr || false);
          formData.append('mode_paiement', data.mode_paiement);
          formData.append('banque_id', data.banque_id);
          formData.append('numero_paiement', data.numero_paiement);
          formData.append('echeance', data.echeance);
          for (let i = 0; i < data?.files_avance?.length; i++) {
            formData.append(`files_avance[${i}]`, data.files_avance[i]);
          }
        }
      }
      // Add similar for other types if needed

      const response = await axios.post(APIURL.DESISTEMENT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status == 201 || response.status == 200) {
        if (user?.role <= 2||user?.role == 10) {
          router.push('/ventes/desistements/show' + desistementId);
          /* localStorage.setItem('etat_dst', '1');
          router.push('/ventes?tab=desistements');*/
        } else {
          //commercial
          localStorage.setItem('etat_dst', '5');
          router.push(
            '/ventes?tab=validation&subtab=desistements-attente-encours'
          );
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  if (loading.form || loading.general || !desistementData || !reservationData) {
    return <LoadingSpin />;
  }

  const getErrors = () => {
    // Skip validation if we're just toggling penalty
    if (isPenaliteToggling) {
      return [];
    }
    const formValues = methods.getValues();
    const errors = [];

    if (activeModel == 1) {
      // Basic form validations
      if (!formValues.motif) {
        errors.push('Le motif est requis');
      }

      if (reservationData.sumAvances > 0) {
        if (!formValues.type_remb) {
          errors.push('Le type de remboursement est requis');
        }

        // Validate based on remboursement type
        if (formValues.type_remb == 'direct') {
          if (
            !formValues.inputList_remb ||
            formValues.inputList_remb.length == 0
          ) {
            errors.push('Au moins un remboursement doit être configuré');
          } else {
            formValues.inputList_remb.forEach((item, index) => {
              const clientPrefix = `Client ${item.nom} ${item.prenom}:`;

              // Common validations for all modes
              if (!item.type_remb) {
                errors.push(
                  `${clientPrefix} Le mode de remboursement est requis`
                );
              }

              // Validate transfer section if mode is transfert or transfert_remb
              if (
                item.type_remb == 'transfert' ||
                item.type_remb == 'transfert_remb'
              ) {
                if (!item.dossier_id) {
                  errors.push(
                    `${clientPrefix} Le dossier de transfert est requis`
                  );
                }

                // Additional validation for transfert_remb mode
                if (item.type_remb == 'transfert_remb') {
                  const sum_avance_by_aq_percent =
                    (item.pourcentage / 100) * reservationData.sumAvances;

                  // Validate montant_transferer
                  if (
                    item.montant_transferer == '' ||
                    item.montant_transferer == null
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
                  } else if (dossierInfos[index]) {
                    // Check if dossier info exists
                    if (
                      parseFloat(item.montant_transferer) >
                        sum_avance_by_aq_percent &&
                      parseFloat(item.montant_transferer) >
                        dossierInfos[index].reste
                    ) {
                      errors.push(
                        `${clientPrefix} Le montant transféré ne doit pas dépasser le reste de dossier (${dossierInfos[
                          index
                        ].reste.toFixed(
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
                      dossierInfos[index].reste
                    ) {
                      errors.push(
                        `${clientPrefix} Le montant transféré ne doit pas dépasser le reste de dossier (${dossierInfos[
                          index
                        ].reste.toFixed(2)} DH)`
                      );
                    }
                  }

                  // Validate reste_a_rembourse
                  if (
                    item.reste_a_rembourse == '' ||
                    item.reste_a_rembourse == null
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
                  if (
                    item.type_remb_transfere == 'immediat' &&
                    parseFloat(item.reste_a_rembourse) > 0
                  ) {
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
                    if (item.mode_rembourse) {
                      if (!item.num_paiement) {
                        errors.push(
                          `${clientPrefix} Le numéro de paiement est requis`
                        );
                      } else {
                        const cleanedNum = String(item.num_paiement)
                          .trim()
                          .replace(/\s/g, '');

                        if (!/^\d+$/.test(cleanedNum)) {
                          errors.push(
                            `${clientPrefix} Le numéro de paiement doit contenir uniquement des chiffres`
                          );
                        } else if (cleanedNum.length !== 16) {
                          errors.push(
                            `${clientPrefix} Le numéro de paiement doit contenir 16 chiffres`
                          );
                        }
                      }
                    }

                    if (!item.pour_le_compte) {
                      errors.push(
                        `${clientPrefix} Le compte bénéficiaire est requis pour le remboursement immédiat`
                      );
                    }
                    if (item.mode_rembourse == 'cheque' && !item.cheque_recu) {
                      errors.push(
                        `${clientPrefix} Le reçu de chèque est requis pour le remboursement immédiat`
                      );
                    }
                    if (
                      item.pour_le_compte == 'autre' &&
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
              if (item.type_remb == 'direct') {
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
                if (item.mode_rembourse) {
                  if (!item.num_paiement) {
                    errors.push(
                      `${clientPrefix} Le numéro de paiement est requis`
                    );
                  } else {
                    const cleanedNum = String(item.num_paiement)
                      .trim()
                      .replace(/\s/g, '');

                    if (!/^\d+$/.test(cleanedNum)) {
                      errors.push(
                        `${clientPrefix} Le numéro de paiement doit contenir uniquement des chiffres`
                      );
                    } else if (cleanedNum.length !== 16) {
                      errors.push(
                        `${clientPrefix} Le numéro de paiement doit contenir 16 chiffres`
                      );
                    }
                  }
                }
              }
              if (!item.pour_le_compte) {
                errors.push(
                  `${clientPrefix} Le compte bénéficiaire est requis`
                );
              }
              if (item.mode_rembourse == 'cheque' && !item.cheque_recu) {
                errors.push(`${clientPrefix} Le reçu de chèque est requis`);
              }
              if (
                item.pour_le_compte == 'autre' &&
                !item.fichier_autorisation
              ) {
                errors.push(
                  `${clientPrefix} Le fichier d'autorisation est requis`
                );
              }

              // Validate the sum makes sense for transfert_remb
              if (item.type_remb == 'transfert_remb') {
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
      // Common validation for all types
      if (!formValues.type_dp) {
        errors.push('Le type de désistement au profit est requis');
      }

      // Validate based on the selected type
      const type_dp = formValues.type_dp;

      if (type_dp == 1) {
        // ADD THIS VALIDATION:
        if (
          !formValues.nb_aquereurs_dp_proche ||
          formValues.nb_aquereurs_dp_proche <= 0
        ) {
          errors.push(
            'Le nombre des nouveaux acquéreurs doit être supérieur à 0'
          );
        }
        // Désistement au profit d'un proche
        if (
          !formValues.desisteur_dp_proche_co ||
          formValues.desisteur_dp_proche_co.length == 0
        ) {
          errors.push('Au moins un désisteur doit être sélectionné');
        }

        if (!formValues.inputList || formValues.inputList.length == 0) {
          errors.push('Au moins un nouveau client doit être ajouté');
        } else {
          formValues.inputList.forEach((client, index) => {
            if (!client.cin) {
              errors.push(`Client ${index + 1}: Le CIN est requis`);
            }
            if (!client.nom) {
              errors.push(`Client ${index + 1}: Le nom est requis`);
            }
            if (!client.prenom) {
              errors.push(`Client ${index + 1}: Le prénom est requis`);
            }
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

            const percent = parseFloat(client.pourcentage);
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

          // Validate total percentage matches sum of desisteur percentages
          const totalPercentage = formValues.inputList.reduce((sum, client) => {
            return sum + (parseFloat(client.pourcentage) || 0);
          }, 0);

          const desisteurTotal =
            formValues.desisteur_dp_proche_co?.reduce((sum, desisteur) => {
              return sum + (parseFloat(desisteur.pourcentage) || 0);
            }, 0) || 0;

          if (Math.abs(totalPercentage - desisteurTotal) > 0.01) {
            errors.push(
              `La somme des pourcentages (${totalPercentage}%) doit être égale à ${desisteurTotal}%`
            );
          }
        }

        if (!formValues.lien_parente) {
          errors.push('Le lien de parenté est requis');
        }
      } else if (type_dp == 2) {
        // Désistement au profit d'un co-réservataire
        if (
          !formValues.desisteur_dp_proche_co ||
          formValues.desisteur_dp_proche_co.length == 0
        ) {
          errors.push('Au moins un désisteur doit être sélectionné');
        }

        if (
          !formValues.profit_dp_co_reser ||
          formValues.profit_dp_co_reser.length == 0
        ) {
          errors.push('Au moins un bénéficiaire doit être sélectionné');
        } else {
          let totalPercentage = 0;
          formValues.profit_dp_co_reser.forEach((beneficiary, index) => {
            const percent = parseFloat(beneficiary.new_pourcentage);

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

          const desisteurTotal =
            formValues.desisteur_dp_proche_co?.reduce((sum, desisteur) => {
              return sum + (parseFloat(desisteur.pourcentage) || 0);
            }, 0) || 0;

          if (Math.abs(totalPercentage - desisteurTotal) > 0.01) {
            errors.push(
              `La somme des pourcentages (${totalPercentage}%) doit être égale à ${desisteurTotal}%`
            );
          }
        }
      } else if (type_dp == 3) {
        // Désistement partiel
        // ADD THIS VALIDATION:
        if (!formValues.nb_aquereurs_dp || formValues.nb_aquereurs_dp <= 0) {
          errors.push(
            'Le nombre des nouveaux acquéreurs doit être supérieur à 0'
          );
        }
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

        if (!formValues.lien_parente) {
          errors.push('Le lien de parenté est requis');
        }
      }
    } else if (activeModel == 3) {
      // Validation for Changement de Bien
      if (!formValues.new_bien_id) {
        errors.push("La sélection d'un nouveau bien est obligatoire");
      }

      // Validate montant à ajouter if needed
      if (formValues.montant_a_ajouter < 0) {
        errors.push('Le montant à ajouter ne peut pas être négatif');
      }

      // Validate montant à ajouter doesn't exceed new bien price
      const prixNouveauBien = formValues.prix_nouveau_bien || 0;
      if (reservationData.sumAvances > prixNouveauBien) {
        const diff = reservationData.sumAvances - prixNouveauBien;
        // Validate based on remboursement type
        if (formValues.type_remb == 'direct') {
          if (
            !formValues.inputList_remb ||
            formValues.inputList_remb.length == 0
          ) {
            errors.push('Au moins un remboursement doit être configuré');
          } else {
            formValues.inputList_remb.forEach((item, index) => {
              const clientPrefix = `Client ${item.nom} ${item.prenom}:`;

              // Common validations for all modes
              if (!item.type_remb) {
                errors.push(
                  `${clientPrefix} Le mode de remboursement est requis`
                );
              }

              // Validate transfer section if mode is transfert or transfert_remb
              if (
                item.type_remb == 'transfert' ||
                item.type_remb == 'transfert_remb'
              ) {
                if (!item.dossier_id) {
                  errors.push(
                    `${clientPrefix} Le dossier de transfert est requis`
                  );
                }

                // Additional validation for transfert_remb mode
                if (item.type_remb == 'transfert_remb') {
                  const sum_avance_by_aq_percent =
                    (item.pourcentage / 100) * diff;

                  // Validate montant_transferer
                  if (
                    item.montant_transferer == '' ||
                    item.montant_transferer == null
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
                  } else if (dossierInfos[index]) {
                    // Check if dossier info exists
                    if (
                      parseFloat(item.montant_transferer) >
                        sum_avance_by_aq_percent &&
                      parseFloat(item.montant_transferer) >
                        dossierInfos[index].reste
                    ) {
                      errors.push(
                        `${clientPrefix} Le montant transféré ne doit pas dépasser le reste de dossier (${dossierInfos[
                          index
                        ].reste.toFixed(
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
                      dossierInfos[index].reste
                    ) {
                      errors.push(
                        `${clientPrefix} Le montant transféré ne doit pas dépasser le reste de dossier (${dossierInfos[
                          index
                        ].reste.toFixed(2)} DH)`
                      );
                    }
                  }

                  // Validate reste_a_rembourse
                  if (
                    item.reste_a_rembourse == '' ||
                    item.reste_a_rembourse == null
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
                  if (
                    item.type_remb_transfere == 'immediat' &&
                    parseFloat(item.reste_a_rembourse) > 0
                  ) {
                    if (!item.date_rembourse) {
                      errors.push(
                        `${clientPrefix} La date de remboursement est requise pour le remboursement immédiat`
                      );
                    }
                    if (!item.mode_rembourse) {
                      errors.push(
                        `${clientPrefix} Le mode de remboursement est requis pour le remboursement immédiat`
                      );
                    } else if (item.mode_rembourse && item.num_paiement) {
                      // First check if it's a valid string
                      if (
                        typeof item.num_paiement !== 'string' &&
                        typeof item.num_paiement !== 'number'
                      ) {
                        errors.push(
                          `${clientPrefix} Le numéro de paiement doit être une valeur valide`
                        );
                      } else {
                        const numStr = String(item.num_paiement)
                          .trim()
                          .replace(/\s/g, '');

                        if (!/^\d+$/.test(numStr)) {
                          errors.push(
                            `${clientPrefix} Le numéro de paiement doit contenir uniquement des chiffres`
                          );
                        } else if (numStr.length !== 16) {
                          errors.push(
                            `${clientPrefix} Le numéro de paiement doit contenir 16 chiffres (actuel: ${numStr.length})`
                          );
                        }
                      }
                    }

                    if (!item.pour_le_compte) {
                      errors.push(
                        `${clientPrefix} Le compte bénéficiaire est requis pour le remboursement immédiat`
                      );
                    }
                    if (item.mode_rembourse == 'cheque' && !item.cheque_recu) {
                      errors.push(
                        `${clientPrefix} Le reçu de chèque est requis pour le remboursement immédiat`
                      );
                    }
                    if (
                      item.pour_le_compte == 'autre' &&
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
              if (item.type_remb == 'direct') {
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
                if (item.mode_rembourse) {
                  if (!item.num_paiement) {
                    errors.push(
                      `${clientPrefix} Le numéro de paiement est requis`
                    );
                  } else {
                    const numStr = String(item.num_paiement)
                      .trim()
                      .replace(/\s/g, '');

                    if (!/^\d+$/.test(numStr)) {
                      errors.push(
                        `${clientPrefix} Le numéro de paiement doit contenir uniquement des chiffres`
                      );
                    } else if (numStr.length !== 16) {
                      errors.push(
                        `${clientPrefix} Le numéro de paiement doit contenir 16 chiffres`
                      );
                    }
                  }
                }
                if (!item.pour_le_compte) {
                  errors.push(
                    `${clientPrefix} Le compte bénéficiaire est requis`
                  );
                }
                if (item.mode_rembourse == 'cheque' && !item.cheque_recu) {
                  errors.push(`${clientPrefix} Le reçu de chèque est requis`);
                }
                if (
                  item.pour_le_compte == 'autre' &&
                  !item.fichier_autorisation
                ) {
                  errors.push(
                    `${clientPrefix} Le fichier d'autorisation est requis`
                  );
                }
              }

              // Validate the sum makes sense for transfert_remb
              if (item.type_remb == 'transfert_remb') {
                const montantTransferer =
                  parseFloat(item.montant_transferer) || 0;
                const resteARembourser =
                  parseFloat(item.reste_a_rembourse) || 0;
                const expectedTotal = (item.pourcentage / 100) * diff;
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
      } else {
        if (formValues.montant_a_ajouter > prixNouveauBien) {
          errors.push(
            `Le montant à ajouter (${formValues.montant_a_ajouter} DH) ne peut pas dépasser le prix du nouveau bien (${prixNouveauBien} DH)`
          );
        }

        // Validate payment details if montant_a_ajouter > 0
        if (formValues.montant_a_ajouter > 0) {
          if (!formValues.mode_paiement) {
            errors.push(
              'Le mode de paiement est requis pour le montant à ajouter'
            );
          }

          // Validate non-cash payment details
          if (formValues.mode_paiement && formValues.mode_paiement != 1) {
            if (!formValues.banque_id) {
              errors.push('La banque est requise pour ce mode de paiement');
            }
            if (!formValues.numero_paiement) {
              errors.push('Le numéro de paiement est requis');
            } else {
              const cleanedNum = String(formValues.numero_paiement)
                .trim()
                .replace(/\s/g, '');

              if (!/^\d+$/.test(cleanedNum)) {
                errors.push(
                  'Le numéro de paiement doit contenir uniquement des chiffres'
                );
              } else if (cleanedNum.length !== 16) {
                errors.push('Le numéro de paiement doit contenir 16 chiffres');
              }
            }

            // Validate echeance for certain payment methods
            if (
              !['1', '5', '6'].includes(formValues.mode_paiement) &&
              !formValues.echeance
            ) {
              errors.push("L'échéance est requise pour ce mode de paiement");
            }
          }

          // Validate files if required
          /*if (
          (!formValues.files_avance || formValues.files_avance.length == 0) &&
          formValues.montant_a_ajouter > 0
        ) {
          errors.push('Veuillez joindre les fichiers de paiement');
        }*/
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

        if (formValues.mode_penalite != 'Montant') {
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
              } else {
                // Nettoyer le numéro
                const cleanedNum = String(formValues.numero_paiement_pen)
                  .trim()
                  .replace(/\s/g, '');

                if (!/^\d+$/.test(cleanedNum)) {
                  errors.push(
                    'Le numéro de paiement de la pénalité doit contenir uniquement des chiffres'
                  );
                } else if (cleanedNum.length !== 16) {
                  errors.push(
                    'Le numéro de paiement de la pénalité doit contenir 16 chiffres'
                  );
                }
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
  const errors_g = getErrors();

  const handleFileChange = (event, fileType) => {
    const files = Array.from(event.target.files);
    event.target.value = null;

    if (files.length === 0) return;

    // Determine file type configuration
    const fileConfig = {
      1: {
        // dst - Desistement files
        selectedFiles: selectedFiles_dst,
        setSelectedFiles: setSelectedFiles_dst,
        originalFiles: originalFiles_dst,
        filesList: filesList_dst,
        formField: 'files_desistement',
      },
      2: {
        // plt - Penalty files
        selectedFiles: selectedFiles_plt,
        setSelectedFiles: setSelectedFiles_plt,
        originalFiles: originalFiles_plt,
        filesList: filesList_plt,
        formField: 'files_penalite',
      },
    };

    const config = fileConfig[fileType];
    if (!config) return;

    const {
      selectedFiles,
      setSelectedFiles,
      originalFiles,
      filesList,
      formField,
    } = config;

    const updatedFiles = [...selectedFiles];
    const existingFileNames = new Set(Object.values(filesList || {}));
    const existingSelectedNames = new Set(
      selectedFiles.map((f) => f.name || f.fichier)
    );

    for (const file of files) {
      const fileName = file.name;
      const lastDotIndex = fileName.lastIndexOf('.');
      const baseName =
        lastDotIndex === -1 ? fileName : fileName.substring(0, lastDotIndex);
      const extension =
        lastDotIndex === -1 ? '' : fileName.substring(lastDotIndex + 1);

      let finalFileName = fileName;

      // Check if file already exists in original files or selected files
      const isOriginalFile = originalFiles.some(
        (originalFile) =>
          originalFile.fichier === fileName || originalFile.name === fileName
      );

      const isSelectedFile = existingSelectedNames.has(fileName);

      if (
        (existingFileNames.has(fileName) && !isOriginalFile) ||
        (isSelectedFile && !isOriginalFile)
      ) {
        let counter = 1;
        while (true) {
          finalFileName = extension
            ? `${baseName} (${counter}).${extension}`
            : `${baseName} (${counter})`;

          if (
            !existingFileNames.has(finalFileName) &&
            !existingSelectedNames.has(finalFileName) &&
            !originalFiles.some(
              (originalFile) => originalFile.fichier === finalFileName
            )
          ) {
            break;
          }
          counter++;
        }
      }

      const finalFile =
        finalFileName === fileName
          ? file
          : new File([file], finalFileName, { type: file.type });

      // Replace if it's an original file with same name, otherwise add
      const existingIndex = updatedFiles.findIndex(
        (f) => f.fichier === fileName || (f.name === fileName && f.id)
      );

      if (existingIndex >= 0) {
        updatedFiles[existingIndex] = finalFile;
      } else {
        updatedFiles.push(finalFile);
      }

      existingSelectedNames.add(finalFileName);
    }

    if (
      updatedFiles.length != selectedFiles.length ||
      JSON.stringify(updatedFiles.map((f) => f.name || f.fichier)) !=
        JSON.stringify(selectedFiles.map((f) => f.name || f.fichier))
    ) {
      setSelectedFiles(updatedFiles);
      setValue(formField, updatedFiles);
    }
  };

  const handleDownloadFile = (file) => {
    const fileURL = URL.createObjectURL(file);
    window.open(fileURL);
  };

  const handleDeleteFile = (index, fileType, event) => {
    // Empêcher la propagation d'événement
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const fileConfig = {
      1: {
        selectedFiles: selectedFiles_dst,
        setSelectedFiles: setSelectedFiles_dst,
        formField: 'files_desistement',
      },
      2: {
        selectedFiles: selectedFiles_plt,
        setSelectedFiles: setSelectedFiles_plt,
        formField: 'files_penalite',
      },
    };

    const config = fileConfig[fileType];
    if (!config) return;

    const { selectedFiles, setSelectedFiles, formField } = config;
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);

    // Mettre à jour l'état
    setSelectedFiles(updatedFiles);

    // Utiliser setTimeout pour éviter les conflits avec le cycle de rendu
    setTimeout(() => {
      setValue(formField, updatedFiles);
    }, 10);
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

  // Modifiez la fonction handlechange_mode_penalite
  const handlechange_mode_penalite = (code) => {
    const selectedMode = modes_penalites[code];
    if (selectedMode) {
      setValue('mode_penalite', selectedMode.label);

      // Calculate penalty amount
      if (selectedMode.label !== 'Montant') {
        const percentage = parseFloat(selectedMode.label.replace('%', ''));
        const penalitePar = watch('penalite_par') || 'avance';

        const amount =
          penalitePar === 'prix'
            ? reservationData.prix || 0
            : reservationData.sumAvances || 0;

        const calculatedAmount = (amount * percentage) / 100;
        setValue('penalite_montant', calculatedAmount.toFixed(2));
      } else {
        // Reset to 0 for Montant mode if not already set
        if (!watch('penalite_montant')) {
          setValue('penalite_montant', 0);
        }
      }
    }
  };

  return (
    <>
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={`/ventes/desistements/show/${desistementId}`}
          step={`Corriger Désistement`}
        />
      </div>

      <div className="flex flex-col w-full min-h-screen bg-gray-100 p-4">
        <div className="w-full bg-white shadow-lg rounded-lg mb-4">
          <SideBar
            code_reservation={reservationData.codeRes}
            bien={reservationData.bien}
            prix={reservationData.prix}
            sum_avances_valides={reservationData.sumAvances}
            date_reservation={reservationData.dateRes}
            respo={reservationData.respo}
            desisteurs={reservationData.desisteurs}
            reservationId={desistementData.reservation_id}
            bien_id={reservationData.bienIdAncien}
          />
        </div>
        <div
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 
                hover:shadow-md transition-all duration-200"
        >
          {/* Main Header - Centered with Accent Color */}
          <div className="text-center mb-3">
            <h2 className="text-2xl font-semibold">
              <span className="text-blue-500">Corriger Désistement:</span>
            </h2>
          </div>

          {/* Type & Subtype - Centered with Colored Badge */}
          <div className="flex justify-center">
            <div
              className="inline-flex items-center bg-blue-50/60 px-4 py-2 rounded-lg 
                    border border-blue-100 shadow-inner"
            >
              <span className="font-medium text-blue-700">Type:</span>
              <span className="ml-1 text-gray-800">
                {type_dst[desistementData.type]?.label || 'Inconnu'}
              </span>
              {desistementData.type == 2 && desistementData.type_dp && (
                <span className="text-blue-500/90 ml-1.5">
                  (
                  {type_dst_dp[desistementData.type_dp]?.label ||
                    'Sous-type inconnu'}
                  )
                </span>
              )}
            </div>
          </div>
        </div>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="bg-white rounded-lg shadow mt-4"
          >
            {activeModel == 1 && (
              <Desistement_Definitif
                isEditing={true}
                formData={desistementData}
                accessToken={accessToken}
                selectedProjet_id={selectedProjet_id}
                sum_avances_valides={reservationData.sumAvances}
                reservationId={desistementData.reservation_id}
                type_remb_get={desistementData.type_remb}
                inputListRemb_get={reservationData.inputListRemb}
                dossierInfos={dossierInfos}
                setDossierInfos={setDossierInfos}
              />
            )}

            {activeModel == 2 && (
              <Desistement_Au_Profit
                isEditing={true}
                formData={desistementData}
                desisteurs_testt={reservationData.desisteursTest}
                desisteurs={reservationData.desisteurs.map((aq) => ({
                  id: aq.id,
                  nom: aq.client.nom,
                  prenom: aq.client.prenom,
                  cin: aq.client.cin,
                  pourcentage: aq.pourcentage,
                }))}
                desisteutrs_profit_dp_partiell={
                  reservationData.desisteursProfit
                }
                desisteur_dp_proche_co={
                  desistementData?.aquereurs_desisteurs?.map((aq) => ({
                    id: aq.aq_id,
                    cl_id: aq.aquereur?.client?.id,
                    nom: aq.aquereur?.client?.nom,
                    prenom: aq.aquereur?.client?.prenom,
                    pourcentage: aq.aquereur?.pourcentage,
                  })) || []
                }
              />
            )}
            {activeModel == 3 && (
              <Changement_De_Bien
                formData={desistementData}
                isEditing={true}
                selectedProjet_id={selectedProjet_id}
                bien_ancien={reservationData.bien?.propriete_dite_bien}
                sum_avances_valides={reservationData.sumAvances}
                banques={banques}
                filesList_avc={filesList_avc}
                // remboursement
                accessToken={accessToken}
                reservationId={desistementData.reservation_id}
                type_remb_get={desistementData.type_remb}
                inputListRemb_get={reservationData.inputListRemb}
                dossierInfos={dossierInfos}
                setDossierInfos={setDossierInfos}
              />
            )}

            {/* Add similar sections for other types if needed */}

            {/* Penalty section (same as in your original code) */}

            <div className="border-t border-gray-200 py-4 px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-md font-medium">Ajouter Pénalité</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={avecPenalite}
                    onChange={(e) => {
                      setIsPenaliteToggling(true);
                      setAvecPenalite(!avecPenalite);
                      if (!e.target.checked) {
                        // Reset penalty values when turning off
                        setValue('penalite_montant', 0);
                        setValue('mode_penalite', '');
                        setValue('penalite_par', 'avance');
                        setValue('sr_pen', false);
                        setValue('mode_paiement_pen', '');
                        setValue('banque_pen', '');
                        setValue('numero_paiement_pen', '');
                        setValue('echeance_pen', '');
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
                  {/* Mode Pénalité Dropdown */}
                  <div className="w-[600px] mt-1">
                    <SelectInput
                      label="Mode Pénalité :"
                      name="mode_penalite"
                      value={watch('mode_penalite')}
                      required={true}
                      options={Object.entries(modes_penalites).map(
                        ([key, value]) => ({
                          value: value.label,
                          label: value.label,
                        })
                      )}
                      onChange={(value) => {
                        const entry = Object.entries(modes_penalites).find(
                          ([key, val]) => val.label === value
                        );
                        if (entry) {
                          handlechange_mode_penalite(entry[0]);
                        }
                      }}
                      error={errors.mode_penalite?.message}
                      placeholder="Sélectionnez un mode de pénalité"
                    />
                  </div>
                  {watch('mode_penalite') &&
                  watch('mode_penalite') !== 'Montant' ? (
                    <div className="flex flex-1 flex-col md:flex-row gap-4 items-center">
                      {/* Radio Buttons (Prix/Avance) */}
                      <div className="min-w-[220px]">
                        <div className="flex flex-col">
                          <label className="text-sm font-medium text-gray-700 mb-1">
                            Pénalité Sur <span className="text-red-500">*</span>
                          </label>
                          <div className="flex space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name="penalite_par"
                                value="prix"
                                checked={watch('penalite_par') === 'prix'}
                                onChange={handlechange_penalite}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                disabled={!avecPenalite}
                              />
                              <span className="ml-2">
                                Prix ({reservationData.prix?.toFixed(2) || 0}{' '}
                                DH)
                              </span>
                            </label>
                            <label className="inline-flex items-center">
                              <input
                                type="radio"
                                name="penalite_par"
                                value="avance"
                                checked={watch('penalite_par') === 'avance'}
                                onChange={handlechange_penalite}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                disabled={!avecPenalite}
                              />
                              <span className="ml-2">
                                Avance (
                                {reservationData.sumAvances?.toFixed(2) || 0}{' '}
                                DH)
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                      {/* Auto-Calculated Penalty Amount */}
                      <div className="min-w-[180px]">
                        <TextField
                          label="Montant Calculé"
                          name="penalite_montant"
                          type="number"
                          control={control}
                          errors={errors}
                          backendErrors={{}}
                          required
                          disabled
                          value={watch('penalite_montant') || ''}
                          placeholder="Calculé automatiquement"
                        />
                      </div>
                    </div>
                  ) : (
                    /* Manual Penalty Amount Input */
                    <div className="flex-1 min-w-[180px] mt-2">
                      <TextField
                        label="Pénalité Montant"
                        name="penalite_montant"
                        type="number"
                        control={control}
                        errors={errors}
                        backendErrors={{}}
                        required
                        disabled={
                          !avecPenalite ||
                          (watch('mode_penalite') &&
                            watch('mode_penalite') !== 'Montant')
                        }
                        onChange={(e) => {
                          const value = parseFloat(e.target.value) || 0;
                          setValue('penalite_montant', value);
                        }}
                        value={watch('penalite_montant') || ''}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 py-4">
                  {/* Only show penalty payment section if mode_penalite is selected AND penalite_montant has a valid value */}
                  {watch('mode_penalite') && watch('penalite_montant') > 0 && (
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
                                setValue('sr_pen', e.target.checked ? 1 : 0)
                              } // Sets to 1 when checked, 0 when unchecked
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
                              !MODE_PAIEMENT
                                ? []
                                : Array.isArray(MODE_PAIEMENT)
                                ? MODE_PAIEMENT
                                : typeof MODE_PAIEMENT === 'object'
                                ? Object.entries(MODE_PAIEMENT).map(
                                    ([key, value]) => ({
                                      value: key,
                                      label:
                                        typeof value === 'object'
                                          ? value.label ||
                                            value.name ||
                                            String(value)
                                          : String(value),
                                    })
                                  )
                                : []
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
                                    ? banques.map((banque) => ({
                                        value: banque.id,

                                        label: banque.nom || 'Banque sans nom',
                                      }))
                                    : []
                                }
                                onChange={(value) => {
                                  setValue('banque_pen', value);
                                }}
                                error={errors.banque_pen?.message||''}
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
                              onChange={(e) => handleFileChange(e, 2)}
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
                                    {selectedFiles_plt.map((data, index) => (
                                      <div
                                        key={data.id || data.name || index}
                                        className="flex flex-col p-3 bg-white rounded-md border border-gray-200 hover:border-blue-200 transition-colors h-full"
                                      >
                                        <div className="flex items-center mb-2">
                                          {getFileIcon(
                                            data.name || data.fichier
                                          )}
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
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Attachments section (same as in your original code) */}
            <div className="border-t border-gray-200 py-4 px-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-md font-medium">
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
                        Formats acceptés: PDF, JPG, PNG, DOC (Taille max: 10MB)
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
                                    onClick={(e) =>
                                      handleDeleteFile(index, 1, e)
                                    }
                                    type="button" // Important: spécifier type="button"
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

            {/* Comment field */}
            <div className="border-t border-gray-200 py-4 px-6">
              <TextField
                label="Commentaire:"
                name="commentaire"
                type="text"
                multi={true}
                control={control}
                errors={errors}
                backendErrors={{}}
                defaultValues={{}}
                width="w-full"
                height="h-full"
              />
            </div>

            {formSubmitted && errors_g.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-500 p-4 mb-4">
                <p className="font-semibold">
                  Veuillez corriger les erreurs suivantes :
                </p>
                <ul className="list-disc pl-5 mt-2">
                  {errors_g.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {/* Form actions */}
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
                  loading.submit || (formSubmitted && errors_g.length > 0)
                }
                className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  loading.submit || (formSubmitted && errors_g.length > 0)
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
      </div>
    </>
  );
}

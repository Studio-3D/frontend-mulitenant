'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { APIURL } from '@/configs/api';
import ProjectStepper from '@/components/ProjectStepper';
import toast from 'react-hot-toast';
import { ORIENTATIONS } from '@/components/bien-utils';
import { fetchDataByProjet_params } from '@/configs/api-utils';
import SelectInput from '../SelectInput';
import LoadingSpin from '@/components/LoadingSpin';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';
import InputSelect from '../inputSelect';
import Button from '../Button';
import { useProjet } from '@/context/ProjetContext';
import { useParams } from 'next/navigation';
import { Switch } from '@headlessui/react'; // ou votre composant Switch habituel

import Input from '../Input';
import Modal from '../Modal';
import Composition from '@/app/(dashboard)/compositionBien/CompositionTable';
export default function BienForm() {
  const [hasJardin, setHasJardin] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasBox, setHasBox] = useState(false);
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [fetchingData, setFetchingData] = useState(false);
  const searchParams = useSearchParams();
  const { id } = useParams();
  const { selectProjet, selectedProjet } = useProjet();
  const [trancheHasNoBlocs, setTrancheHasNoBlocs] = useState(false);
  const [blocHasNoImmeubles, setBlocHasNoImmeubles] = useState(false);
  const projetId = searchParams.get('projet');
  const blocId = searchParams.get('bloc');
  const trancheId = searchParams.get('tranche');
  const immeubleId = searchParams.get('immeuble');

  // Reference data
  const [typeBiens, setTypeBiens] = useState([]);
  const [vues, setVues] = useState([]);
  const [typologies, setTypologies] = useState([]);
  const projet = JSON.parse(localStorage.getItem('selectedProjet') || '{}');
  const token = localStorage.getItem('accessToken');
  const [compositionModalMessage, setCompositionModalMessage] = useState(
    'Voulez-vous ajouter une composition pour ce bien?'
  );
  // States for cascade dropdowns
  const [tranches, setTranches] = useState([]);
  const [blocs, setBlocs] = useState([]);
  const [immeubles, setImmeubles] = useState([]);
  const [selectedTranche, setSelectedTranche] = useState(null);
  const [selectedBloc, setSelectedBloc] = useState(null);
  const [selectedImmeuble, setSelectedImmeuble] = useState(null);
  const etages = [];

  if (projet?.max_etages !== undefined) {
    for (let i = 0; i <= projet.max_etages; i++) {
      etages.push({
        label: i === 0 ? 'Rez-de-chaussée' : `Étage ${i}`,
        value: i,
      });
    }
  }

  // Loading states
  const [loadingTranches, setLoadingTranches] = useState(false);
  const [loadingBlocs, setLoadingBlocs] = useState(false);
  const [loadingImmeubles, setLoadingImmeubles] = useState(false);
  const [showCompositionModal, setShowCompositionModal] = useState(false);
  const [bienCreeId, setBienCreeId] = useState(null); // Pour stocker l'id du bien créé
  const [dataReloadTrigger, setDataReloadTrigger] = useState(0);

  // Refs for preventing multiple submissions and redirects
  // Read breadcrumb context for names without fetching
  useEffect(() => {
    try {
      const raw = localStorage.getItem('bienBreadcrumbContext');
      if (!raw) return;
      const ctx = JSON.parse(raw);

      // Set project name in context (won't navigate on this route)
      if (ctx?.projet && (!selectedProjet || !selectedProjet?.nom)) {
        try {
          selectProjet(ctx.projet);
        } catch (e) {}
      }

      // Always hydrate names from context when present (no need to match query ids)
      if (ctx?.tranche && !selectedTranche?.nom) {
        setSelectedTranche(
          (prev) => prev || { id: ctx.tranche.id, nom: ctx.tranche.nom }
        );
      }
      if (ctx?.bloc && !selectedBloc?.nom) {
        setSelectedBloc(
          (prev) => prev || { id: ctx.bloc.id, nom: ctx.bloc.nom }
        );
      }
      if (ctx?.immeuble && !selectedImmeuble?.nom) {
        setSelectedImmeuble(
          (prev) => prev || { id: ctx.immeuble.id, nom: ctx.immeuble.nom }
        );
      }
    } catch (e) {
      // ignore
    }
  }, [
    selectProjet,
    selectedProjet,
    selectedTranche?.nom,
    selectedBloc?.nom,
    selectedImmeuble?.nom,
  ]);
  const hasFetchedInitialData = useRef(false);
  const isSubmittingRef = useRef(false);
  const isNavigatingRef = useRef(false);

  // Steps
  const steps = [
    'Détails du bien',
    'Superficies du bien',
    'Composition du bien',
  ];

  // Form state with default values
  const [formData, setFormData] = useState({
    // Basic details
    projet_id: projet?.id || id || '',
    propriete_dite_bien: '',
    numero: '',
    niveau: '',
    orientation: '',
    conventionne: false,
    prix_unitaire: 0,
    prix: 0,
    tranche_id: '',
    bloc_id: blocId || '',
    immeuble_id: immeubleId || '',
    etat: 'DISPONIBLE',
    num_box: '',
    superficie_jardin: '',
    prix_box: '',
    prix_parking: '',
    num_parking: '',
    superficie_box: '',
    superficie_parking: '',
    superficie_balcon_calculer: '',
    superficie_jardin_calculer: '',
    superficie_terrasse_calculer: '',
    superficie_balcon: '',
  });

  const [formDataComp, setFormDataComp] = useState({
    nbre_chambres: 0,
    nbre_salons: 0,
    nbre_sdb: 0,
    nbre_cuisines: 0,
    nbre_terasses: 0,
    nbre_balcons: 0,
    nbre_halls: 0,
    nbre_receptions: 0,
    nbre_buanderies: 0,
    nbre_placards: 0,
  });

  const resetFormDataComp = () => {
    setFormDataComp({
      nbre_chambres: 0,
      nbre_salons: 0,
      nbre_sdb: 0,
      nbre_cuisines: 0,
      nbre_terasses: 0,
      nbre_balcons: 0,
      nbre_halls: 0,
      nbre_receptions: 0,
      nbre_buanderies: 0,
      nbre_placards: 0,
    });
  };

  const handleselectChange = (field, value) => {
    // Update form data first
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Use the new value directly instead of formData which hasn't updated yet
    if (field === 'tranche_id') {
      const currentTrancheId = value;

      // If project has blocs but no blocs selected yet, fetch blocs for this tranche

      if (projet.nbre_blocs !== 0 && !blocId) {
        fetchDataByProjet_params('blocs', setBlocs, setLoadingBlocs, {
          tranche_id: currentTrancheId || trancheId,
        }).then(() => {
          // Check if blocs array is empty after fetching
          setTrancheHasNoBlocs(blocs.length === 0);
        });
      }

      // If project has no blocs but has buildings, fetch buildings directly
      if (
        projet.nbre_blocs === 0 &&
        projet.nbre_immeubles !== 0 &&
        !immeubleId
      ) {
        fetchDataByProjet_params(
          'immeubles',
          setImmeubles,
          setLoadingImmeubles,
          {
            tranche_id: currentTrancheId || trancheId,
          }
        ).then(() => {
          // Check if immeubles array is empty after fetching
          setTrancheHasNoBlocs(immeubles.length === 0);
        });
      }
    }

    if (field == 'bloc_id') {
      const currentBlocId = value;

      // If project has buildings and a bloc is selected, fetch buildings for that bloc
      if (projet.nbre_immeubles !== 0 && currentBlocId && !immeubleId) {
        fetchDataByProjet_params(
          'immeubles',
          setImmeubles,
          setLoadingImmeubles,
          {
            bloc_id: currentBlocId || blocId,
          }
        ).then(() => {
          // Check if immeubles array is empty after fetching
          setBlocHasNoImmeubles(immeubles.length === 0);
        });
      }
    }
  };
  // Fonction générique pour vider des champs et relancer les calculs
  const clearFieldsAndRecalculate = (fieldsToClear) => {
    const updatedForm = { ...formData };

    fieldsToClear.forEach((field) => {
      updatedForm[field] = '';
    });

    setFormData(updatedForm);
    updateVendableAndTotalArea(updatedForm);
  };

  // Vider les champs si hasJardin est désactivé
  useEffect(() => {
    if (!hasJardin) {
      clearFieldsAndRecalculate([
        'superficie_jardin',
        'superficie_jardin_calculer',
      ]);
    }
  }, [hasJardin]);

  // Vider les champs si hasParking est désactivé
  useEffect(() => {
    if (!hasParking) {
      clearFieldsAndRecalculate([
        'num_parking',
        'prix_parking',
        'superficie_parking',
      ]);
    }
  }, [hasParking]);

  // Vider les champs si hasBox est désactivé
  useEffect(() => {
    if (!hasBox) {
      clearFieldsAndRecalculate(['num_box', 'prix_box', 'superficie_box']);
    }
  }, [hasBox]);

  // Fetch reference data and initial data on component mount
  useEffect(() => {
    if (id && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      fetchBienData(id);
    }
    if (!id && !hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      if (
        projet.nbre_tranches !== 0 &&
        !trancheId &&
        !blocId &&
        !immeubleId &&
        tranches.length === 0 &&
        !formData.tranche_id
      ) {
        fetchDataByProjet_params('tranches', setTranches, setLoadingTranches);
      }

      if (
        projet.nbre_tranches === 0 &&
        projet.nbre_blocs !== 0 &&
        !blocId &&
        !immeubleId &&
        !formData.bloc_id
      ) {
        fetchDataByProjet_params('blocs', setBlocs, setLoadingBlocs);
      }

      if (
        projet.nbre_blocs === 0 &&
        projet.nbre_tranches === 0 &&
        projet.nbre_immeubles !== 0 &&
        !immeubleId &&
        !trancheId &&
        !blocId &&
        !formData.immeuble_id
      ) {
        fetchDataByProjet_params(
          'immeubles',
          setImmeubles,
          setLoadingImmeubles
        );
      }

      /*  if (projet.nbre_tranches !== 0 && projet.nbre_blocs !== 0 && !blocId && trancheId) {
        fetchDataByProjet_params('blocs', setBlocs, setLoadingBlocs, { tranche_id: trancheId });
      }

      if (projet.nbre_blocs !== 0 && projet.nbre_immeubles !== 0 && !immeubleId && blocId) {
        fetchDataByProjet_params('immeubles', setImmeubles, setLoadingBlocs, { bloc_id: blocId });
      }*/

      if (
        projet.nbre_tranches !== 0 &&
        projet.nbre_blocs !== 0 &&
        !blocId &&
        trancheId &&
        !immeubleId
      ) {
        fetchDataByProjet_params('immeubles', setImmeubles, setLoadingBlocs, {
          tranche_id: trancheId,
        });
      }
      if (
        projet.nbre_blocs !== 0 &&
        (formData.tranche_id || trancheId) &&
        !blocId
      ) {
        fetchDataByProjet_params('blocs', setBlocs, setLoadingBlocs, {
          tranche_id: formData.tranche_id ? formData.tranche_id : trancheId,
        });
      }
      if (
        projet.nbre_tranches !== 0 &&
        projet.nbre_immeubles != 0 &&
        (formData.tranche_id || trancheId) &&
        projet.nbre_blocs == 0 &&
        !immeubleId
      ) {
        fetchDataByProjet_params('immeubles', setImmeubles, setLoadingBlocs, {
          tranche_id: formData.tranche_id ? formData.tranche_id : trancheId,
        });
      }
      if (
        projet.nbre_blocs !== 0 &&
        projet.nbre_immeubles != 0 &&
        (formData.bloc_id || blocId) &&
        !immeubleId
      ) {
        fetchDataByProjet_params('immeubles', setImmeubles, setLoadingBlocs, {
          bloc_id: formData.bloc_id ? formData.bloc_id : blocId,
        });
      }

      if (typeBiens.length === 0) {
        fetchDataByProjet_params('typeBiens', setTypeBiens, setLoading);
      }
      if (vues.length === 0) {
        fetchDataByProjet_params('vues', setVues, setLoading);
      }
      if (typologies.length === 0) {
        fetchDataByProjet_params('typologies', setTypologies, setLoading);
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    blocId,
    immeubleId,
    trancheId,
    id,
    formData.bloc_id,
    formData.tranche_id,
    formData.immeuble_id,
  ]);

  // If blocId is provided, fetch its details and set tranche_id accordingly
  useEffect(() => {
    if (blocId && !id && !selectedBloc?.nom) {
      const fetchBlocDetails = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.get(`${APIURL.BLOCS}/${blocId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data && response.data.bloc) {
            const bloc = response.data.bloc;
            setSelectedBloc(bloc);

            // If bloc has a tranche, select it
            if (bloc.tranche_id) {
              setFormData((prev) => ({
                ...prev,
                tranche_id: bloc.tranche_id,
              }));

              // Load the bloc's tranche
              const trancheResponse = await axios.get(
                `${APIURL.TRANCHES}/${bloc.tranche_id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (trancheResponse.data && trancheResponse.data.tranche) {
                setSelectedTranche(trancheResponse.data.tranche);
              }
            }
          }
        } catch (error) {
          console.log('Error fetching bloc details:', error);
        }
      };

      fetchBlocDetails();
    }
  }, [blocId, id]);

  // If immeubleId is provided, fetch its details and set bloc_id and tranche_id
  useEffect(() => {
    if (immeubleId && !id && !selectedImmeuble?.nom) {
      const fetchImmeubleDetails = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await axios.get(
            `${APIURL.IMMEUBLES}/${immeubleId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (response.data && response.data.immeuble) {
            const immeuble = response.data.immeuble;
            setSelectedImmeuble(immeuble);

            // If immeuble has a bloc, select it
            if (immeuble.bloc_id) {
              setFormData((prev) => ({
                ...prev,
                bloc_id: immeuble.bloc_id,
              }));

              // Load the immeuble's bloc
              const blocResponse = await axios.get(
                `${APIURL.BLOCS}/${immeuble.bloc_id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              if (blocResponse.data && blocResponse.data.bloc) {
                const bloc = blocResponse.data.bloc;
                setSelectedBloc(bloc);

                // If bloc has a tranche, select it too
                if (bloc.tranche_id) {
                  setFormData((prev) => ({
                    ...prev,
                    tranche_id: bloc.tranche_id,
                  }));

                  // Load the bloc's tranche
                  const trancheResponse = await axios.get(
                    `${APIURL.TRANCHES}/${bloc.tranche_id}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );

                  if (trancheResponse.data && trancheResponse.data.tranche) {
                    setSelectedTranche(trancheResponse.data.tranche);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.log('Error fetching immeuble details:', error);
        }
      };

      fetchImmeubleDetails();
    }
  }, [immeubleId, id]);

  // Fetch property data for editing
  // Fetch property data for editing
  const fetchBienData = useCallback(async (bienId) => {
    setFetchingData(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.BIENS}/${bienId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.bien) {
        const bienData = response.data.bien;
        console.log('Bien data loaded:', bienData);

        // Convert checkbox values from 0/1 to boolean
        bienData.conventionne = !!bienData.conventionne;

        // Format nested objects to their IDs for form fields
        if (bienData.immeuble) {
          setSelectedImmeuble(bienData.immeuble);
        }

        if (bienData.bloc) {
          setSelectedBloc(bienData.bloc);
        }

        if (bienData.tranche) {
          setSelectedTranche(bienData.tranche);
        }
        if (bienData.num_parking != null) {
          setHasParking(true);
        }
        if (bienData.superficie_jardin != 0) {
          setHasJardin(true);
        }
        if (bienData.num_box != null) {
          setHasBox(true);
        }

        // Set form data with proper null/undefined handling
        const formattedData = {
          ...bienData,
          // Convert nulls to empty strings for form fields
          ...Object.fromEntries(
            Object.entries(bienData).map(([key, value]) => [
              key,
              value === null ? '' : value,
            ])
          ),
          // Explicitly set these IDs for dropdowns
          tranche_id: bienData.tranche_id || '',
          bloc_id: bienData.bloc_id || '',
          immeuble_id: bienData.immeuble_id || '',
          type_id: bienData.type_id || '',
          vue_id: bienData.vue_id || '',
          typologie_id: bienData.typologie_id || '',
          // Ensure etat has a valid value
          etat: bienData.etat || 'DISPONIBLE',
        };

        setFormData(formattedData);

        // After setting basic form data, also trigger area calculations
        // Use setTimeout to ensure formData is updated first
        setTimeout(() => {
          if (bienData.superficie_terrasse) {
            handleTerraceChange(bienData.superficie_terrasse, formattedData);
          }

          if (bienData.superficie_balcon) {
            handleBalconChange(bienData.superficie_balcon, formattedData);
          }

          if (bienData.superficie_jardin) {
            handleJardinChange(bienData.superficie_jardin, formattedData);
          }
        }, 100);
      }
    } catch (error) {
      console.log('Error fetching bien data:', error);
      toast.error('Erreur lors du chargement des données du bien');
    } finally {
      setFetchingData(false);
    }
  }, []);

  const handleTerraceChange = (value, currentFormData = formData) => {
    const terraceValue = parseFloat(value) || 0;
    const terraceCalculated = terraceValue * 0.5;

    const updatedForm = {
      ...currentFormData,
      superficie_terrasse: terraceValue,
      superficie_terrasse_calculer: terraceCalculated,
    };

    setFormData(updatedForm);
    updateVendableAndTotalArea(updatedForm);
  };

  const handleBalconChange = (value, currentFormData = formData) => {
    const balconValue = parseFloat(value) || 0;
    const balconCalculated = balconValue * 0.5;

    const updatedForm = {
      ...currentFormData,
      superficie_balcon: balconValue,
      superficie_balcon_calculer: balconCalculated,
    };

    setFormData(updatedForm);
    updateVendableAndTotalArea(updatedForm);
  };

  const handleJardinChange = (value, currentFormData = formData) => {
    const jardinValue = parseFloat(value) || 0;
    const jardinCalculated = jardinValue * 0.25;

    const updatedForm = {
      ...currentFormData,
      superficie_jardin: jardinValue,
      superficie_jardin_calculer: jardinCalculated,
    };

    setFormData(updatedForm);
    updateVendableAndTotalArea(updatedForm);
  };

  useEffect(() => {
    if (id && formData.propriete_dite_bien) {
      // Trigger area calculations after form data is set
      if (formData.superficie_terrasse) {
        handleTerraceChange(formData.superficie_terrasse);
      }
      if (formData.superficie_balcon) {
        handleBalconChange(formData.superficie_balcon);
      }
      if (formData.superficie_jardin) {
        handleJardinChange(formData.superficie_jardin);
      }
      if (formData.superficie_habitable) {
        updateVendableAndTotalArea(formData);
      }
    }
  }, [id, formData.propriete_dite_bien]); // Watch for when the form data is actually loaded

  // Calculate vendable and total areas based on all fields
  const updateVendableAndTotalArea = (data) => {
    const habitable = parseFloat(data.superficie_habitable) || 0;
    const terraceCalc = parseFloat(data.superficie_terrasse_calculer) || 0;
    const balconCalc = parseFloat(data.superficie_balcon_calculer) || 0;
    const jardinCalc = parseFloat(data.superficie_jardin_calculer) || 0;

    // Calculate vendable area
    const vendable = habitable + terraceCalc + balconCalc + jardinCalc;

    // Calculate total area - this needs to match the backend's expectation
    // According to BienController.php and database schema, superficie_total exists
    const total =
      habitable +
      (parseFloat(data.superficie_terrasse) || 0) +
      (parseFloat(data.superficie_balcon) || 0) +
      (parseFloat(data.superficie_jardin) || 0);

    setFormData((prev) => ({
      ...prev,
      superficie_vendable: vendable,
      superficie_total: total,
    }));

    // Also recalculate price when areas change
    if (data.prix_unitaire) {
      recalculatePrice(data.prix_unitaire, vendable);
    }
  };

  const recalculatePrice = (unitPrice, vendableArea) => {
    const unitPriceValue = parseFloat(unitPrice) || 0;
    const superficieVendable = parseFloat(vendableArea) || 0;
    const calculatedPrice = unitPriceValue * superficieVendable;
    setFormData((prev) => ({ ...prev, prix: calculatedPrice }));
  };

  // Handle form input changes with special calculations
  const handleChange = (field, value, context = 'main') => {
    if (context === 'comp') {
      setFormDataComp((prev) => ({
        ...prev,
        [field]: value,
      }));
    } else {
      setFormData((prev) => {
        const updated = { ...prev, [field]: value };
        // Special field handlers
        if (field === 'superficie_terrasse') {
          handleTerraceChange(value, updated);
        } else if (field === 'superficie_balcon') {
          handleBalconChange(value, updated);
        } else if (field === 'superficie_jardin') {
          handleJardinChange(value, updated);
        } else if (field === 'superficie_habitable') {
          updateVendableAndTotalArea({
            ...updated,
            superficie_habitable: value,
          });
        } else if (field === 'prix_unitaire') {
          recalculatePrice(value, updated.superficie_vendable);
        }
        // Cascade dropdown logic

        return updated;
      });
    }
  };

  // Step navigation
  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateStep0 = () => {
    const errors = {};
    if (!formData.propriete_dite_bien) {
      errors.propriete_dite_bien = ['La propriété dite bien est requise'];
    }
    if (!formData.numero) {
      errors.numero = ['Le numéro est requis'];
    }
    if (
      projet?.nbre_tranches > 0 ||
      projet?.nbre_blocs > 0 ||
      projet?.nbre_immeubles > 0
    ) {
      if (formData.niveau === null || formData.niveau === undefined) {
        errors.niveau = ['Le niveau est requis'];
      }
    }

    if (!formData.type_id) {
      errors.type_id = ['Le type de bien est requis'];
    }

    if (!formData.nbre_facades) {
      errors.nbre_facades = ['Le nombre de façades est requis'];
    }
    if (formData.prix_unitaire == null) {
      // teste null ou undefined
      errors.prix_unitaire = ['Le prix unitaire est requis'];
    }

    if (!formData.avance_minimale) {
      errors.avance_minimale = ["L'avance minimale est requise"];
    }
    if (!formData.etat) {
      errors.etat = ["L'état est requis"];
    }
    return errors;
  };

  const validateStep1 = () => {
    const errors = {};
    if (
      formData.superficie_habitable === null ||
      formData.superficie_habitable === undefined
    ) {
      errors.superficie_habitable = ['La  superficie habitable est requise'];
    }
    if (
      formData.superficie_architecte === null ||
      formData.superficie_architecte === undefined
    ) {
      errors.superficie_architecte = ['La  superficie architecte est requise'];
    }
    // Si jardin activé
    if (hasJardin) {
      if (!formData.superficie_jardin) {
        errors.superficie_jardin = ['La superficie du jardin est requise'];
      }
    }

    // Si parking activé
    if (hasParking) {
      if (!formData.num_parking) {
        errors.num_parking = ['Le numéro de parking est requis'];
      }
      if (!formData.prix_parking) {
        errors.prix_parking = ['Le prix du parking est requis'];
      }
      if (!formData.superficie_parking) {
        errors.superficie_parking = ['La superficie du parking est requise'];
      }
    }

    // Si box activé
    if (hasBox) {
      if (!formData.num_box) {
        errors.num_box = ['Le numéro du box est requis'];
      }
      if (!formData.prix_box) {
        errors.prix_box = ['Le prix du box est requis'];
      }
      if (!formData.superficie_box) {
        errors.superficie_box = ['La superficie du box est requise'];
      }
    }
    return errors;
  };

  const validateCurrentStep = () => {
    let newErrors = {};
    if (activeStep === 0) {
      newErrors = validateStep0();
    } else if (activeStep === 1) {
      newErrors = validateStep1();
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);

      // Faire disparaître les erreurs après 3 secondes
      setTimeout(() => {
        setErrors({});
      }, 3000);

      // Afficher un toast global uniquement pour la première erreur
      //toast.error(Object.values(newErrors)[0][0]);
      return false;
    }

    setErrors({});
    return true;
  };

  // Form submission
  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    // Prevent multiple submissions
    if (isSubmittingRef.current) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      // 'niveau',
      const requiredFields = [
        'id',
        'projet_id',
        'propriete_dite_bien',
        'numero',

        'orientation',
        'conventionne',
        'prix_unitaire',
        'prix',
        'tranche_id',
        'bloc_id',
        'immeuble_id',
        'etat',
        'nbre_facades',
        'avance_minimale',
        'titre_foncier',
        'type_id',
        'vue_id',
        'typologie_id',
        'superficie_habitable',
        'superficie_architecte',
        'superficie_terrasse',
        'superficie_terrasse_calculer',
        'superficie_balcon',
        'superficie_balcon_calculer',
        'superficie_jardin',
        'superficie_jardin_calculer',
        'superficie_vendable',
        'superficie_total',
        'num_parking',
        'prix_parking',
        'superficie_parking',
        'num_box',
        'prix_box',
        'superficie_box',
        'nbre_chambres',
        'nbre_salons',
        'nbre_sdb',
        'nbre_cuisines',
        'nbre_terasses',
        'nbre_balcons',
        'nbre_halls',
        'nbre_receptions',
        'nbre_buanderies',
        'nbre_placards',
      ];

      // Ajouter conditionnellement 'etage' si project.nbre_tranches > 0  || blocs || immeubles
      if (
        projet &&
        (projet.nbre_tranches > 0 ||
          projet.nbre_blocs > 0 ||
          projet.nbre_immeubles)
      ) {
        requiredFields.push('niveau');
      }
      const dataToSubmit = {};
      requiredFields.forEach((field) => {
        if (formData[field] !== undefined) {
          dataToSubmit[field] = formData[field];
        }
      });

      dataToSubmit.conventionne = dataToSubmit.conventionne ? 1 : 0;

      const numericFields = [
        'prix_unitaire',
        'prix',
        'superficie_habitable',
        'superficie_architecte',
        'superficie_terrasse',
        'superficie_terrasse_calculer',
        'superficie_balcon',
        'superficie_balcon_calculer',
        'superficie_jardin',
        'superficie_jardin_calculer',
        'superficie_vendable',
        'superficie_total',
        'prix_parking',
        'superficie_parking',
        'prix_box',
        'superficie_box',
        'avance_minimale',
      ];

      numericFields.forEach((field) => {
        if (dataToSubmit[field] !== undefined) {
          dataToSubmit[field] = parseFloat(dataToSubmit[field]) || 0;
        }
      });

      if (dataToSubmit.etat) {
        dataToSubmit.etat = dataToSubmit.etat.toLowerCase();
      } else {
        dataToSubmit.etat = 'disponible';
      }

      const urlBase = APIURL.BIENS;
      const url = id ? `${urlBase}/${id}` : urlBase;
      const method = id ? 'put' : 'post';

      const response = await axios({
        method: method,
        url: url,
        data: dataToSubmit,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success(
        id ? 'Bien mis à jour avec succès' : 'Bien créé avec succès'
      );
      if (!id) {
        setBienCreeId(response.data.bien.id);
        setShowCompositionModal(true);
      } else {
        setTimeout(() => {
          if (immeubleId) {
            localStorage.setItem(
              `immeuble-${immeubleId}-activeTab`,
              'bien'
            );
            router.push(`/Immeubles/${immeubleId}`);
          } else if (blocId) {
            localStorage.setItem(`bloc-${blocId}-activeTab`, 'bien');
            router.push(`/Blocs/${blocId}`);
          } else if (trancheId) {
            localStorage.setItem(
              `tranche-${trancheId}-activeTab`,
              'bien'
            );
            router.push(`/Tranches/${trancheId}`);
          } else if (projet.id) {
            localStorage.setItem(`project-${projet.id}-activeTab`, 'bien');
            router.push(`/Projets/${projet.id}`);
          } else {
            router.push('/Projets');
          }
        }, 100);
      }
      console.log('Bien créé ou mis à jour avec succès:', bienCreeId);
    } catch (error) {
      console.log('Error submitting property:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      if (error.response?.data?.message) {
        console.log('Backend error message:', error.response.data.message);
        if (error.response.data.message.includes('Unknown column')) {
          const columnMatch = error.response.data.message.match(
            /Unknown column '([^']+)'/
          );
          if (columnMatch && columnMatch[1]) {
            toast.error(
              `Erreur: La colonne "${columnMatch[1]}" n'existe pas dans la base de données`
            );
            return;
          }
        }
      }
      //toast.error("Erreur lors de l'enregistrement du bien");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit_comp = () => {
    //setBackendErrors({});

    const allZero = Object.values(formDataComp).every(
      (value) => parseInt(value, 10) === 0
    );

    if (allZero) {
      setCompositionModalMessage(
        'Veuillez renseigner la composition du bien avant de continuer.'
      );
      setShowCompositionModal(true);
      return;
    }

    const dataToSend = new FormData();
    const url = APIURL.COMPOSITIONBIENS;

    // Ajout de l'identifiant du bien
    dataToSend.append('bien_id', bienCreeId);

    // Ajout des champs de composition
    Object.entries(formDataComp).forEach(([key, value]) => {
      dataToSend.append(key, value);
    });
    setLoading(true);

    axios
      .post(url, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          setLoading(false);

          toast.success('Composition créée avec succès');
          console.log('Bien créé avec succès:', res.data.message);

          resetFormDataComp();
          setShowCompositionModal(true);
          setCompositionModalMessage(
            "Voulez-vous ajouter d'autre composition pour ce bien?"
          );
          setDataReloadTrigger((prev) => prev + 1);
        } else if (res.status === 422) {
        }
      })
      .catch((error) => {
        setLoading(false);

        const response = error.response;
        if (response?.status === 422) {
        } else {
          toast.error("Une erreur s'est produite lors de la soumission.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const stepsToShow = id ? steps.slice(0, 2) : steps;

  // Render form content based on active step
  const renderStepContent = () => {
    if (id) {
      // Si modification : seulement 2 étapes
      switch (activeStep) {
        case 0:
          return renderDetailsStep();
        case 1:
          return renderAreasStep();
        default:
          return null;
      }
    } else {
      // Sinon création complète avec 3 étapes
      switch (activeStep) {
        case 0:
          return renderDetailsStep();
        case 1:
          return renderAreasStep();
        case 2:
          return renderCompositionStep();
        default:
          return null;
      }
    }
  };

  if (id && fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }
  // Render details step with corrected bloc dropdown
  const renderDetailsStep = () => (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {id && projet.nbre_tranches !== 0 && (
          <Input
            label="Tranche"
            value={selectedTranche?.nom || ''}
            fullWidth
            size="small"
            variant="outlined"
            disabled={true}
          />
        )}
        {id && projet.nbre_blocs !== 0 && (
          <Input
            label="Bloc"
            value={selectedBloc?.nom}
            fullWidth
            size="small"
            variant="outlined"
            disabled={true}
          />
        )}
        {id && projet.nbre_immeubles !== 0 && (
          <Input
            label="Immeuble"
            value={selectedImmeuble?.nom}
            fullWidth
            size="small"
            variant="outlined"
            disabled={true}
          />
        )}
        {!id &&
          projet.nbre_tranches !== 0 &&
          !trancheId &&
          !blocId &&
          !immeubleId && (
            <InputSelect
              label="Tranche"
              options={tranches.map((t) => ({ label: t.nom, value: t.id }))}
              value={formData.tranche_id}
              onChange={(option) => {
                handleselectChange('tranche_id', option?.value || null);
              }}
              error={errors.tranche_id}
              isLoading={loadingTranches}
              required
            />
          )}

        {!id &&
          (!formData.tranche_id &&
          projet.nbre_tranches !== 0 &&
          projet.nbre_blocs !== 0 &&
          !trancheId &&
          !blocId &&
          !immeubleId ? (
            <div>
              <Input
                label="Bloc"
                placeholder="Veuillez d'abord sélectionner une tranche"
                value={selectedBloc?.nom}
                fullWidth
                size="small"
                variant="outlined"
                disabled={true}
              />
            </div>
          ) : (formData.tranche_id || trancheId) &&
            projet.nbre_tranches !== 0 &&
            projet.nbre_blocs !== 0 &&
            !blocId &&
            !immeubleId ? (
            <div>
              <InputSelect
                label="Bloc"
                options={blocs.map((t) => ({ label: t.nom, value: t.id }))}
                value={formData.bloc_id}
                onChange={(option) =>
                  handleselectChange('bloc_id', option?.value || null)
                }
                error={errors.bloc_id}
                isLoading={loadingBlocs}
                required
              />
              {trancheHasNoBlocs && blocs.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Cette tranche ne contient aucun bloc
                </p>
              )}
            </div>
          ) : projet.nbre_tranches === 0 &&
            projet.nbre_blocs !== 0 &&
            !blocId &&
            !immeubleId ? (
            <div>
              <InputSelect
                label="Bloc"
                options={blocs.map((t) => ({ label: t.nom, value: t.id }))}
                value={formData.bloc_id}
                onChange={(option) =>
                  handleselectChange('bloc_id', option?.value || null)
                }
                error={errors.bloc_id}
                isLoading={loadingBlocs}
                required
              />
              {trancheHasNoBlocs && blocs.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Aucun bloc disponible pour ce projet
                </p>
              )}
            </div>
          ) : null)}

        {!id &&
          (!formData.bloc_id &&
          projet.nbre_blocs !== 0 &&
          projet.nbre_immeubles !== 0 &&
          !blocId &&
          !immeubleId ? (
            <div>
              <Input
                label="Immeuble"
                placeholder="Veuillez d'abord sélectionner un bloc"
                value={selectedImmeuble?.nom}
                fullWidth
                size="small"
                variant="outlined"
                disabled={true}
              />
            </div>
          ) : (formData.bloc_id || blocId) &&
            projet.nbre_blocs !== 0 &&
            projet.nbre_immeubles !== 0 &&
            !immeubleId ? (
            <div>
              <InputSelect
                label="Immeuble"
                options={immeubles.map((t) => ({ label: t.nom, value: t.id }))}
                value={formData.immeuble_id}
                onChange={(option) =>
                  handleselectChange('immeuble_id', option?.value || null)
                }
                error={errors.immeuble_id}
                isLoading={loadingImmeubles}
                required
              />
              {blocHasNoImmeubles && immeubles.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Ce bloc ne contient aucun immeuble
                </p>
              )}
            </div>
          ) : projet.nbre_blocs === 0 &&
            projet.nbre_tranches === 0 &&
            projet.nbre_immeubles !== 0 &&
            !blocId &&
            !trancheId &&
            !immeubleId ? (
            <div>
              <InputSelect
                label="Immeuble"
                options={immeubles.map((t) => ({ label: t.nom, value: t.id }))}
                value={formData.immeuble_id}
                onChange={(option) =>
                  handleselectChange('immeuble_id', option?.value || null)
                }
                error={errors.immeuble_id}
                isLoading={loadingImmeubles}
                required
              />
              {blocHasNoImmeubles && immeubles.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Aucun immeuble disponible pour ce projet
                </p>
              )}
            </div>
          ) : !formData.tranche_id &&
            projet.nbre_blocs === 0 &&
            projet.nbre_tranches !== 0 &&
            projet.nbre_immeubles !== 0 &&
            !trancheId &&
            !immeubleId ? (
            <div>
              <Input
                label="Immeuble"
                placeholder="Veuillez d'abord sélectionner une tranche"
                value={selectedImmeuble?.nom}
                fullWidth
                size="small"
                variant="outlined"
                disabled={true}
              />
            </div>
          ) : (formData.tranche_id || trancheId) &&
            projet.nbre_blocs === 0 &&
            projet.nbre_tranches !== 0 &&
            projet.nbre_immeubles !== 0 &&
            !immeubleId ? (
            <div>
              <InputSelect
                label="Immeuble"
                options={immeubles.map((t) => ({ label: t.nom, value: t.id }))}
                value={formData.immeuble_id}
                onChange={(option) =>
                  handleselectChange('immeuble_id', option?.value || null)
                }
                error={errors.immeuble_id}
                isLoading={loadingImmeubles}
                required
              />
              {trancheHasNoBlocs && immeubles.length === 0 && (
                <p className="text-red-500 text-sm mt-1">
                  Cette tranche ne contient aucun immeuble
                </p>
              )}
            </div>
          ) : null)}

        <Input
          label="Propriété dite bien"
          type="text"
          name="propriete_dite_bien"
          value={formData.propriete_dite_bien}
          onChange={(e) => handleChange('propriete_dite_bien', e.target.value)}
          error={errors.propriete_dite_bien}
          required
        />
        <Input
          label="Numéro"
          type="text"
          name="numero"
          value={formData.numero}
          onChange={(e) => handleChange('numero', e.target.value)}
          error={errors.numero}
          required
        />
        {(projet.nbre_tranches > 0 ||
          projet.nbre_bocs > 0 ||
          projet.nbre_immeubles > 0) && (
          <SelectInput
            label="Niveau"
            name="niveau"
            value={formData.niveau}
            options={etages.map((t) => ({ label: t.label, value: t.value }))}
            onChange={(selected) => handleChange('niveau', selected)}
            required
          />
        )}

        <div>
          <SelectInput
            label="Orientation"
            name="orientation"
            value={formData.orientation}
            options={Object.entries(ORIENTATIONS).map(([key, val]) => ({
              label: val.label,
              value: key,
            }))}
            onChange={(value) => handleChange('orientation', value)}
            required
          />
          {errors.orientation && (
            <p className="mt-1 text-sm text-red-600">{errors.orientation[0]}</p>
          )}
        </div>

        <InputSelect
          label="Type de bien"
          options={typeBiens.map((t) => ({ label: t.type, value: t.id }))}
          value={formData.type_id}
          onChange={(option) =>
            handleselectChange('type_id', option?.value || null)
          }
          error={errors.type_id}
          isLoading={loading}
          required
        />

        <InputSelect
          label="Vue"
          options={vues.map((t) => ({ label: t.vue, value: t.id }))}
          value={formData.vue_id}
          onChange={(option) =>
            handleselectChange('vue_id', option?.value || null)
          }
          error={errors.vue_id}
          isLoading={loading}
        />
        <InputSelect
          label="Typologie"
          options={typologies.map((t) => ({ label: t.typologie, value: t.id }))}
          value={formData.typologie_id}
          onChange={(option) =>
            handleselectChange('typologie_id', option?.value || null)
          }
          error={errors.typologie_id}
          isLoading={loading}
        />

        <Input
          label="Nombre de façades"
          name="nbre_facades"
          value={formData.nbre_facades}
          onChange={(e) => handleChange('nbre_facades', e.target.value)}
          error={errors.nbre_facades}
          required
          type="number"
        />
        <Input
          label="Prix unitaire (Dhs)"
          type="number"
          name="prix_unitaire"
          value={formData.prix_unitaire}
          onChange={(e) => handleChange('prix_unitaire', e.target.value)}
          error={errors.prix_unitaire}
          required
        />

        <Input
          label="Avance minimale (Dhs)"
          type="number"
          name="avance_minimale"
          value={formData.avance_minimale}
          onChange={(e) => handleChange('avance_minimale', e.target.value)}
          error={errors.avance_minimale}
          required
        />

        <Input
          label="Titre foncier"
          type="text"
          name="titre_foncier"
          value={formData.titre_foncier}
          onChange={(e) => handleChange('titre_foncier', e.target.value)}
          error={errors.titre_foncier}
        />

        <SelectInput
          label="État"
          name="etat"
          value={formData.etat}
          options={[
            { label: 'Disponible', value: 'DISPONIBLE' },
            { label: 'Bloqué', value: 'BLOQUE' },
            ...(id
              ? [
                  { label: 'Réservé', value: 'RESERVATION' },
                  { label: 'Pré-réservé', value: 'PRE_RESERVATION' },
                  { label: 'Vendu', value: 'VENDU' },
                ]
              : []),
          ]}
          onChange={(value) => handleChange('etat', value)}
        />
        {errors.etat && (
          <p className="mt-1 text-sm text-red-600">{errors.etat[0]}</p>
        )}

        {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Superficie habitable (m²) <span className="text-red-500">*</span>
        </label>
      <input
  type="checkbox"
  id="conventionne"
  checked={formData.conventionne || false}
  onChange={(e) => handleChange("conventionne", e.target.checked)}
  className="h-4 w-4 mt-1 scale-150 text-[#009FFF] border-gray-300 rounded focus:ring-blue-500"
/>
</div> */}
        <div className="flex items-center w-full mt-5">
          <input
            type="checkbox"
            id="conventionne"
            checked={formData.conventionne || false}
            onChange={(e) => handleChange('conventionne', e.target.checked)}
            className="h-6 w-6 text-[#009FFF] border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="conventionne"
            className="ml-2 font-medium text-gray-700 select-none"
          >
            Conventionné
          </label>
        </div>
      </div>
    </div>
  );

  const renderAreasStep = () => (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Superficie habitable (m²)"
          name="superficie_habitable"
          type="number"
          value={formData.superficie_habitable}
          onChange={(e) => handleChange('superficie_habitable', e.target.value)}
          error={errors.superficie_habitable}
          required
        />

        <Input
          label="Superficie architecte (m²)"
          name="superficie_architecte"
          type="number"
          value={formData.superficie_architecte}
          onChange={(e) =>
            handleChange('superficie_architecte', e.target.value)
          }
          error={errors.superficie_architecte}
          required
        />

        {/* Terrasse */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Superficie terrasse (m²)"
            name="superficie_terrasse"
            type="number"
            value={formData.superficie_terrasse}
            onChange={(e) =>
              handleChange('superficie_terrasse', e.target.value)
            }
          />
          <Input
            label="Terrasse calculée (m²)"
            name="superficie_terrasse_calculer"
            type="number"
            value={formData.superficie_terrasse_calculer}
            onChange={(e) =>
              handleChange('superficie_terrasse_calculer', e.target.value)
            }
          />
        </div>

        {/* Balcon */}
        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Superficie balcon (m²)"
            name="superficie_balcon"
            type="number"
            value={formData.superficie_balcon}
            onChange={(e) => handleChange('superficie_balcon', e.target.value)}
          />
          <Input
            label="Balcon calculée (m²)"
            name="superficie_balcon_calculer"
            type="number"
            value={formData.superficie_balcon_calculer}
            onChange={(e) =>
              handleChange('superficie_balcon_calculer', e.target.value)
            }
          />
        </div>

        {/* Titre général + Switchs sur une ligne */}
        <div className="col-span-2 mb-4">
          <div className="flex flex-col md:flex-row md:items-center ">
            <label className="font-medium text-lg whitespace-nowrap">
              Le bien contient :
            </label>

            <div className="flex flex-wrap items-center gap-8">
              {/* Switch Jardin */}
              <div className="flex items-center space-x-3">
                <label className="font-medium">Jardin ?</label>
                <Switch
                  checked={hasJardin}
                  onChange={setHasJardin}
                  className={`${
                    hasJardin ? 'bg-green-500' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Jardin</span>
                  <span
                    className={`${
                      hasJardin ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>

              {/* Switch Parking */}
              <div className="flex items-center space-x-3">
                <label className="font-medium">Parking ?</label>
                <Switch
                  checked={hasParking}
                  onChange={setHasParking}
                  className={`${
                    hasParking ? 'bg-green-500' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Parking</span>
                  <span
                    className={`${
                      hasParking ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>

              {/* Switch Box */}
              <div className="flex items-center space-x-3">
                <label className="font-medium">Box ?</label>
                <Switch
                  checked={hasBox}
                  onChange={setHasBox}
                  className={`${
                    hasBox ? 'bg-green-500' : 'bg-gray-300'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Box</span>
                  <span
                    className={`${
                      hasBox ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </div>

        {/* Inputs Jardin */}
        {hasJardin && (
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <Input
              label="Superficie jardin (m²)"
              name="superficie_jardin"
              type="number"
              value={formData.superficie_jardin}
              onChange={(e) =>
                handleChange('superficie_jardin', e.target.value)
              }
              error={errors.superficie_jardin}
            />
            <Input
              label="Jardin calculé (m²)"
              name="superficie_jardin_calculer"
              type="number"
              value={formData.superficie_jardin_calculer}
              onChange={(e) =>
                handleChange('superficie_jardin_calculer', e.target.value)
              }
            />
          </div>
        )}

        {/* Inputs Parking */}
        {hasParking && (
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <Input
              label="Numéro parking"
              name="num_parking"
              type="number"
              value={formData.num_parking}
              onChange={(e) => handleChange('num_parking', e.target.value)}
              error={errors.num_parking}
            />
            <Input
              label="Prix parking (Dhs)"
              name="prix_parking"
              type="number"
              value={formData.prix_parking}
              onChange={(e) => handleChange('prix_parking', e.target.value)}
              error={errors.prix_parking}
            />
            <Input
              label="Superficie parking (m²)"
              name="superficie_parking"
              type="number"
              value={formData.superficie_parking}
              onChange={(e) =>
                handleChange('superficie_parking', e.target.value)
              }
              error={errors.superficie_parking}
            />
          </div>
        )}

        {/* Inputs Box */}
        {hasBox && (
          <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
            <Input
              label="Numéro box"
              name="num_box"
              type="number"
              value={formData.num_box}
              onChange={(e) => handleChange('num_box', e.target.value)}
              error={errors.num_box}
            />
            <Input
              label="Prix box (Dhs)"
              name="prix_box"
              type="number"
              value={formData.prix_box}
              onChange={(e) => handleChange('prix_box', e.target.value)}
              error={errors.prix_box}
            />
            <Input
              label="Superficie box (m²)"
              name="superficie_box"
              type="number"
              value={formData.superficie_box}
              onChange={(e) => handleChange('superficie_box', e.target.value)}
              error={errors.superficie_box}
            />
          </div>
        )}

        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Input
            label="Superficie vendable (m²)"
            name="superficie_vendable"
            type="number"
            value={formData.superficie_vendable}
            readOnly
          />
          <Input
            label="Superficie totale (m²)"
            name="superficie_total"
            type="number"
            value={formData.superficie_total}
            readOnly
          />
          <Input
            label="Prix (Dhs)"
            type="number"
            name="prix"
            value={formData.prix}
            onChange={(e) => handleChange('prix', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderCompositionStep = () => (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Nombre de chambres"
          name="nbre_chambres"
          type="number"
          min={0}
          value={formDataComp.nbre_chambres || 0}
          onChange={(e) =>
            handleChange('nbre_chambres', e.target.value, 'comp')
          }
        />

        <Input
          label="Nombre de salons"
          name="nbre_salons"
          type="number"
          min={0}
          value={formDataComp.nbre_salons || 0}
          onChange={(e) => handleChange('nbre_salons', e.target.value, 'comp')}
        />

        <Input
          label="Nombre de salles de bain"
          name="nbre_sdb"
          type="number"
          min={0}
          value={formDataComp.nbre_sdb || 0}
          onChange={(e) => handleChange('nbre_sdb', e.target.value, 'comp')}
        />

        <Input
          label="Nombre de cuisines"
          name="nbre_cuisines"
          type="number"
          min={0}
          value={formDataComp.nbre_cuisines || 0}
          onChange={(e) =>
            handleChange('nbre_cuisines', e.target.value, 'comp')
          }
        />

        <Input
          label="Nombre de terrasses"
          name="nbre_terasses"
          type="number"
          min={0}
          value={formDataComp.nbre_terasses || 0}
          onChange={(e) =>
            handleChange('nbre_terasses', e.target.value, 'comp')
          }
        />

        <Input
          label="Nombre de balcons"
          name="nbre_balcons"
          type="number"
          min={0}
          value={formDataComp.nbre_balcons || 0}
          onChange={(e) => handleChange('nbre_balcons', e.target.value, 'comp')}
        />

        <Input
          label="Nombre de halls"
          name="nbre_halls"
          type="number"
          min={0}
          value={formDataComp.nbre_halls || 0}
          onChange={(e) => handleChange('nbre_halls', e.target.value, 'comp')}
        />

        <Input
          label="Nombre de réceptions"
          name="nbre_receptions"
          type="number"
          min={0}
          value={formDataComp.nbre_receptions || 0}
          onChange={(e) =>
            handleChange('nbre_receptions', e.target.value, 'comp')
          }
        />

        <Input
          label="Nombre de buanderies"
          name="nbre_buanderies"
          type="number"
          min={0}
          value={formDataComp.nbre_buanderies || 0}
          onChange={(e) =>
            handleChange('nbre_buanderies', e.target.value, 'comp')
          }
        />

        <Input
          label="Nombre de placards"
          name="nbre_placards"
          type="number"
          min={0}
          value={formDataComp.nbre_placards || 0}
          onChange={(e) =>
            handleChange('nbre_placards', e.target.value, 'comp')
          }
        />
      </div>
    </div>
  );

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          onRoot={{ href: '/Projets' }}
          items={[
            projetId || selectedProjet?.id
              ? {
                  label: selectedProjet?.nom || 'Projet',
                  href: `/Projets/${projetId || selectedProjet.id}`,
                }
              : { label: 'Projets', href: '/Projets' },
            selectedTranche?.nom
              ? {
                  label: selectedTranche.nom,
                  href: `/Tranches/${trancheId || selectedTranche?.id}`,
                }
              : null,
            selectedBloc?.nom
              ? {
                  label: selectedBloc.nom,
                  href: `/Blocs/${blocId || selectedBloc?.id}`,
                }
              : null,
            selectedImmeuble?.nom
              ? {
                  label: selectedImmeuble.nom,
                  href: `/Immeubles/${immeubleId || selectedImmeuble?.id}`,
                }
              : null,
            { label: `${id ? 'Modifier' : 'Ajouter'} un bien` },
          ].filter(Boolean)}
        />
      </div>

      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        <ProjectStepper steps={stepsToShow} activeStep={activeStep} />

        <div className="mt-8">{renderStepContent()}</div>

        {/* Boutons navigation */}
        <div className="flex justify-between mt-6 items-center">
          {/* Bouton "Annuler" ou "Précédent" */}
          {activeStep === 0 ? (
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Annuler
            </button>
          ) : activeStep === 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Précédent
            </button>
          ) : activeStep === 2 ? (
            <button
              type="button"
              onClick={() => router.back()} // <-- Redirection personnalisée
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Annuler
            </button>
          ) : null}

          {/* Étape 1 : Soumettre bien */}
          {activeStep === 1 && (
            <>
              {Object.keys(errors).length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <h3 className="text-red-800 font-medium mb-2">
                    Erreurs de validation:
                  </h3>
                  <ul className="list-disc list-inside text-red-700 text-sm">
                    {Object.entries(errors).map(([field, errors]) => (
                      <li key={field}>
                        {Array.isArray(errors) ? errors.join(', ') : errors}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button type="submit" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? id
                    ? 'Modification en cours...'
                    : 'Enregistrement...'
                  : id
                  ? 'Modifier le bien'
                  : 'Enregistrer le bien'}
              </Button>
            </>
          )}

          {/* Étape 2 : Soumettre composition (si pas d'id) */}
          {!id && activeStep === 2 && (
            <Button
              type="submit"
              onClick={() => onSubmit_comp()}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la composition'}
            </Button>
          )}

          {/* Autres étapes : bouton Suivant */}
          {!(activeStep === 1 || (activeStep === 2 && !id)) && (
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Suivant
            </button>
          )}
        </div>

        {/* Étape 2 : affichage de la composition */}
        {!id && activeStep === 2 && (
          <div className="mt-6">
            <Composition bien={bienCreeId} reloadTrigger={dataReloadTrigger} />
          </div>
        )}
      </div>

      {/* Modal de composition */}
      {showCompositionModal && (
        <Modal isVisible={true} onClose={() => setShowCompositionModal(false)}>
          <div className="p-6 rounded-lg">
            <p className="mb-4 font-semibold">{compositionModalMessage}</p>
            <div className="flex gap-4 justify-end">
              {compositionModalMessage ===
              'Voulez-vous ajouter une composition pour ce bien?' ? (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCompositionModal(false);
                      router.back();
                    }}
                  >
                    Non
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white"
                    onClick={() => {
                      setShowCompositionModal(false);
                      setActiveStep(2);
                    }}
                  >
                    Oui
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={() => {
                      setShowCompositionModal(false);
                      router.back();
                    }}
                  >
                    Quitter
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 text-white"
                    onClick={() => {
                      setShowCompositionModal(false);
                      // reste sur la même page pour remplir
                    }}
                  >
                    Remplir
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

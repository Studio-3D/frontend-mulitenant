'use client';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ProjectTypeStep } from './steps/ProjectTypeStep';
import { GeneralInfoStep } from './steps/GeneralInfoStep';
import { GeneralParametersStep } from './steps/GeneralParametersStep';
import { StepIndicator } from './StepIndicator';
import toast from 'react-hot-toast';
import { APIURL } from '@/configs/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export const MultiStepForm = ({
  editMode = false,
  initialData = null,
  projetId = null,
}) => {
  const { token } = useAuth();
  const router = useRouter();

  // Always start at step 1
  const [currentStep, setCurrentStep] = useState(1);

  const initialValues = {
    projectType: '',
    composition: {
      tranche: { enabled: false, value: 0 },
      blocs: { enabled: false, value: 0 },
      immeuble: { enabled: false, value: 0 },
      bien: { enabled: true, value: 0 },
    },
    projectInfo: {
      nomProjet: '',
      codeProjet: '',
      adresse: '',
      titreFoncier: '',
      dateAutorisationConstruction: '',
      datePermisHabiter: '',
      surfaceTerrain: 0,
      prixAcquisition: 0,
      limiteAnnulationReservation: 0,
      prolongationReservation: 0,
      nombreEtagesMaximum: 0,
    },
    parameters: {
      typesDeBien: [],
      vues: [],
      typologies: [],
      partenaires: [],
      utilisateursAcces: [],
    },
  };

  // Initialize formData - use initialValues for new projects or transformed data for edit mode
  const [formData, setFormData] = useState(initialValues);

  const [typeOptions, setTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Track if we've initialized from API in edit mode
  const initializedFromApi = useRef(false);

  // Load initial data when in edit mode
  useEffect(() => {
    if (editMode && initialData && !initializedFromApi.current) {
      const transformedData = {
        projectType: initialData.projet?.type_id?.toString() || '',
        composition: {
          tranche: {
            enabled: initialData.projet?.nbre_tranches > 0,
            value: initialData.projet?.nbre_tranches || 0,
          },
          blocs: {
            enabled: initialData.projet?.nbre_blocs > 0,
            value: initialData.projet?.nbre_blocs || 0,
          },
          immeuble: {
            enabled: initialData.projet?.nbre_immeubles > 0,
            value: initialData.projet?.nbre_immeubles || 0,
          },
          bien: {
            enabled: initialData.projet?.nbre_biens > 0,
            value: initialData.projet?.nbre_biens || 0,
          },
        },
        projectInfo: {
          nomProjet: initialData.projet?.nom || '',
          codeProjet: initialData.projet?.code || '',
          adresse: initialData.projet?.adresse || '',
          titreFoncier: initialData.projet?.titre_foncier || '',
          dateAutorisationConstruction:
            initialData.projet?.date_autorisation_construction || '',
          datePermisHabiter: initialData.projet?.date_permis_habiter || '',
          surfaceTerrain: initialData.projet?.surface_terrain || '',
          prixAcquisition: initialData.projet?.prix_acquisition || '',
          limiteAnnulationReservation:
            initialData.projet?.limite_annulation_reservation || '',
          prolongationReservation:
            initialData.projet?.prolongation_reservation || '',
          nombreEtagesMaximum: initialData.projet?.max_etages || '',
        },
        parameters: {
          typesDeBien: initialData.projet?.types_bien || [],
          vues: initialData.projet?.vues || [],
          typologies: initialData.projet?.typologies || [],
          partenaires: initialData.projet?.partenaires || [],
          utilisateursAcces:
            initialData.projet?.user_projet?.map((up) =>
              up.user_id.toString()
            ) || [],
        },
      };
      setFormData(transformedData);
      initializedFromApi.current = true;
    }
  }, [editMode, initialData]);

  const steps = [
    { id: 1, name: 'Type de projet et Composition' },
    { id: 2, name: 'Information general' },
    { id: 3, name: 'Parametres generaux' },
  ];

  const next = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.projectType) {
        newErrors.projectType = 'Veuillez sélectionner un type de projet';
      } else if (isNaN(Number(formData.projectType))) {
        newErrors.projectType = 'le Type de Projet Selectionné est invalide';
      }
      if (
        formData.composition.bien.enabled &&
        !formData.composition.bien.value
      ) {
        newErrors.composition = {
          bien: { value: 'Mininum 1 ' },
        };
      }
    }

    if (step === 2) {
      if (!formData.projectInfo.nomProjet) {
        newErrors.projectInfo = {
          ...newErrors.projectInfo,
          nomProjet: 'Le nom du projet est requis',
        };
      }
      if (!formData.projectInfo.codeProjet) {
        newErrors.projectInfo = {
          ...newErrors.projectInfo,
          codeProjet: 'Le code du projet est requis',
        };
      }

      if (!formData.projectInfo.adresse) {
        newErrors.projectInfo = {
          ...newErrors.projectInfo,
          adresse: "L'adresse du projet est requise",
        };
      }
      if (
        !formData.projectInfo.surfaceTerrain ||
        formData.projectInfo.surfaceTerrain == 0
      ) {
        newErrors.projectInfo = {
          ...newErrors.projectInfo,
          surfaceTerrain: 'Surface terrain est requise',
        };
      }
      if (
        !formData.projectInfo.limiteAnnulationReservation ||
        formData.projectInfo.limiteAnnulationReservation == 0
      ) {
        newErrors.projectInfo = {
          ...newErrors.projectInfo,
          limiteAnnulationReservation:
            'Limite annulation réservation est requise',
        };
      }
      if (
        !formData.projectInfo.prixAcquisition ||
        formData.projectInfo.prixAcquisition == 0
      ) {
        newErrors.projectInfo = {
          ...newErrors.projectInfo,
          prixAcquisition: 'Prix acquisition est requis',
        };
      }
      if (
        !formData.projectInfo.nombreEtagesMaximum ||
        formData.projectInfo.nombreEtagesMaximum == 0
      ) {
        newErrors.projectInfo = {
          ...newErrors.projectInfo,
          nombreEtagesMaximum: 'Max étages est requis',
        };
      }
    }

    if (step === 3) {
      if (formData.parameters.utilisateursAcces.length === 0) {
        newErrors.parameters = {
          utilisateursAcces: 'At least one user must have access',
        };
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // fetch users
  useEffect(() => {
    async function fetchUsers() {
      setFetchingUsers(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${APIURL.ROOT}/get_users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const fetchedUsers = response.data.users || [];
        const newUsers = fetchedUsers.map((user, index) => ({
          ...user,
          localId: index + 1,
        }));
        setUsers(newUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setFetchingUsers(false);
      }
    }
    fetchUsers();
  }, []);

  // Fetch project types
  const fetchTypeProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(APIURL.TYPEPROJETS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTypeOptions(response.data.typeProjets || []);
    } catch (error) {
      console.error('Error fetching project types:', error);
      toast.error('Failed to load project types');
    } finally {
      setLoading(false);
    }
  };

  // Add new project type
  const handleAddNewType = async (typeName) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.post(
        APIURL.TYPEPROJETS,
        { type: typeName },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.typeProjet) {
        await fetchTypeProjects();
        return response.data.typeProjet;
      }
    } catch (error) {
      console.error('Error adding project type:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTypeProjects();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const accessToken = token || localStorage.getItem('accessToken');

    if (!accessToken) {
      toast.error('User not authenticated');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        nom: formData.projectInfo.nomProjet,
        code: formData.projectInfo.codeProjet,
        adresse: formData.projectInfo.adresse,
        date_autorisation_construction:
          formData.projectInfo.dateAutorisationConstruction,
        date_permis_habiter: formData.projectInfo.datePermisHabiter,
        titre_foncier: formData.projectInfo.titreFoncier,
        surface_terrain: formData.projectInfo.surfaceTerrain,
        prix_acquisition: formData.projectInfo.prixAcquisition,
        limite_annulation_reservation:
          formData.projectInfo.limiteAnnulationReservation,
        type_id: Number(formData.projectType),
        prolongation_reservation:
          formData.projectInfo.prolongationReservation || 0,
        nbre_tranches: formData.composition.tranche.enabled
          ? formData.composition.tranche.value
          : 0,
        nbre_blocs: formData.composition.blocs.enabled
          ? formData.composition.blocs.value
          : 0,
        nbre_immeubles: formData.composition.immeuble.enabled
          ? formData.composition.immeuble.value
          : 0,
        max_etages: formData.projectInfo.nombreEtagesMaximum,
        nbre_biens: formData.composition.bien.enabled
          ? formData.composition.bien.value
          : 0,
        donneesTypeBien: JSON.stringify(formData.parameters.typesDeBien),
        donneesVue: JSON.stringify(formData.parameters.vues),
        donneesTypologie: JSON.stringify(formData.parameters.typologies),
        partenaires: JSON.stringify(formData.parameters.partenaires),
        selectedUsers: JSON.stringify(formData.parameters.utilisateursAcces),
      };

      if (editMode) {
        // PUT request for update
        await axios.put(`${APIURL.PROJETS}/${projetId}`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        toast.success('Project updated successfully');
      } else {
        // POST request for create
        await axios.post(`${APIURL.PROJETS}`, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        toast.success('Projet ajouté avec succès');
      }

      router.push('/Projets');
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = editMode
        ? 'Failed to update the project. Please try again.'
        : 'Failed to create the project. Please try again.';

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && error.response.data.errors) {
          errorMessage = Object.values(error.response.data.errors).join('\n');
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    if (typeof field === 'string') {
      // Handle nested paths like 'projectInfo.nomProjet'
      const fields = field.split('.');
      setFormData((prev) => {
        const newData = { ...prev };
        let current = newData;

        for (let i = 0; i < fields.length - 1; i++) {
          current = current[fields[i]];
        }

        current[fields[fields.length - 1]] = value;
        return newData;
      });
    } else if (typeof field === 'object') {
      // Handle direct object updates
      setFormData((prev) => ({ ...prev, ...field }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 min-h-[89vh]">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        {editMode ? 'Modifier le projet' : 'Ajouter un projet'}
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div>
          <StepIndicator steps={steps} currentStep={currentStep} />

          <div className="mt-8">
            {currentStep === 1 && (
              <ProjectTypeStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={next}
                errors={errors}
                touched={touched}
                typeOptions={typeOptions}
                loading={loading}
                onAddNewType={handleAddNewType}
              />
            )}

            {currentStep === 2 && (
              <GeneralInfoStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={next}
                onPrevious={prev}
                errors={errors}
                touched={touched}
                handleBlur={handleBlur}
              />
            )}

            {currentStep === 3 && (
              <GeneralParametersStep
                formData={formData}
                updateFormData={updateFormData}
                onPrevious={prev}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                errors={errors}
                touched={touched}
                users={users}
                fetchingUsers={fetchingUsers}
                editMode={editMode}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

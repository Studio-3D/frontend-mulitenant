'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProjectTypeStep } from './steps/ProjectTypeStep';
import { GeneralInfoStep } from './steps/GeneralInfoStep';
import { GeneralParametersStep } from './steps/GeneralParametersStep';
import { StepIndicator } from './StepIndicator';
import toast from 'react-hot-toast';
import { APIURL } from '@/configs/api';
import { useAuth } from '@/context/AuthContext';


export const MultiStepForm = () => {
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [typeOptions, setTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [users, setUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);

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
      surfaceTerrain: '',
      prixAcquisition: '',
      limiteAnnulationReservation: '',
      prolongationReservation: '',
      nombreEtagesMaximum: '',
    },
    parameters: {
      typesDeBien: [],
      vues: [],
      typologies: [],
      partenaires: [],
      utilisateursAcces: [],
    },
  };

  const [formData, setFormData] = useState(initialValues);

  const steps = [
    { id: 1, name: 'Type de projet et Composition' },
    { id: 2, name: 'Information general' },
    { id: 3, name: 'Parametres generaux' },
  ];

  const next = () => {
    // Validate current step before proceeding
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prev = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.projectType) {
        newErrors.projectType = 'Project type is required';
      }
      if (formData.composition.bien.enabled && !formData.composition.bien.value) {
        newErrors.composition = {
          bien: { value: 'Must be at least 1' }
        };
      }
    }
    
    if (step === 2) {
      if (!formData.projectInfo.nomProjet) {
        newErrors.projectInfo = {
          ...newErrors.projectInfo,
          nomProjet: 'Project name is required'
        };
      }
      if (!formData.projectInfo.codeProjet) {
        newErrors.projectInfo = {
          ...newErrors.projectInfo,
          codeProjet: 'Project code is required'
        };
      }
    }
    
    if (step === 3) {
      if (formData.parameters.utilisateursAcces.length === 0) {
        newErrors.parameters = {
          utilisateursAcces: 'At least one user must have access'
        };
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  // fetch users
    useEffect(() => {
    async function fetchUsers() {
      setFetchingUsers(true)
      try {
        const token = localStorage.getItem("accessToken")
        const response = await axios.get(`${APIURL.ROOT}/get_users`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log("API response for users:", response.data)

        const fetchedUsers = response.data.users || []

        const newUsers = fetchedUsers.map((user, index) => ({
    ...user,
    localId: index + 1, // uniquement pour clé React
  }))
  setUsers(newUsers)
        console.log("Created user ID mapping:", newUsers) // Affiche bien les users avec localId

      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setFetchingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  // Fetch project types on component mount
  useEffect(() => {
    async function fetchTypeProjects() {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(APIURL.TYPEPROJETS, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Type projects response:", response.data);
        const typesData = response.data.typeProjets || [];
        setTypeOptions(typesData);
      } catch (error) {
        console.error("Error fetching project types:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTypeProjects();
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const accessToken = token || localStorage.getItem("accessToken");
    
    if (!accessToken) {
      toast.error('User not authenticated');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${APIURL.PROJETS}`, formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      toast.success('Project added successfully');
      setFormData(initialValues);
      setCurrentStep(1);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Failed to submit the form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field, value) => {
    if (typeof field === 'string') {
      // Handle nested paths like 'projectInfo.nomProjet'
      const fields = field.split('.');
      setFormData(prev => {
        const newData = {...prev};
        let current = newData;
        
        for (let i = 0; i < fields.length - 1; i++) {
          current = current[fields[i]];
        }
        
        current[fields[fields.length - 1]] = value;
        return newData;
      });
    } else if (typeof field === 'object') {
      // Handle direct object updates
      setFormData(prev => ({ ...prev, ...field }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 min-h-[89vh]">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Ajouter un projets
      </h1>
      
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
            />
          )}
        </div>
      </div>
    </div>
  );
};
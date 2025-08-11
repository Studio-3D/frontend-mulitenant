"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format, addMonths } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useSociete } from '@/context/SocieteContext';
import ProjectStepper from '@/components/ProjectStepper';
import CompositionForm from '@/components/projects/CompositionForm';
import GeneralInformationForm from '@/components/projects/GeneralInformationForm';
import GeneralParameterForm from '@/components/projects/GeneralParameterForm';
import { APIURL } from '@/configs/api';

export default function AddProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedSociete } = useSociete();
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formState, setFormState] = useState({
    type: '',
    typeId: null,
    building: 0,
    tranches: 0,
    blocks: 0,
    bienCount: 0, // Add bienCount to form state

    // General Information
    nom: '',
    adresse: '',
    code: '',
    date_autorisation_construction: format(new Date(), 'yyyy-MM-dd'),
    date_permis_habiter: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
    titre_foncier: '',
    surface_terrain: 0,
    max_etages: 0,
    prix_acquisition: 0,
    limite_annulation_reservation: 0,
    prolongation_reservation: 0,
    
    // Users access
    selectedUsers: [],
    
    // New fields from old frontend
    biens: [],
    vues: [],
    typologies: [],
    partenaires: []
  });

  // Check if user has permission to create projects
  useEffect(() => {
    if (user && user.role !== 1 && user.role !== 2) {
      toast.error('Vous n\'avez pas la permission de créer des projets');
      router.push('/Projets');
    }
    
    // Ensure société is selected
    if (!selectedSociete) {
      toast.error('Veuillez sélectionner une société d\'abord');
      router.push('/Projets');
    }
  }, [user, selectedSociete, router]);

  const steps = [
    {
      title: "Type de projet et Composition",
      component: <CompositionForm 
        state={formState} 
        setState={setFormState} 
        onNext={() => handleNext()}
        errors={errors}
      />
    },
    {
      title: "Informations générales",
      component: <GeneralInformationForm 
        state={formState} 
        setState={setFormState} 
        onNext={() => handleNext()} 
        onBack={() => handleBack()}
        errors={errors}
      />
    },
    {
      title: "Paramètres généraux",
      component: <GeneralParameterForm 
        state={formState} 
        setState={setFormState} 
        onNext={() => handleSubmit()} 
        onBack={() => handleBack()}
        errors={errors}
        loading={loading}
      />
    }
  ];

  const handleNext = () => {
    // Validate the current step
    if (validateCurrentStep()) {
      setActiveStep((prevStep) => prevStep + 1);
      setErrors(null);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setErrors(null);
  };

  const validateCurrentStep = () => {
  const newErrors = {};

  if (activeStep === 0) {
    if (!formState.typeId) {
      newErrors.type_id = ['Veuillez sélectionner un type de projet'];
    }
  } else if (activeStep === 1) {
    if (!formState.nom) {
      newErrors.nom = ['Le nom du projet est requis'];
    }
    if (!formState.code) {
      newErrors.code = ['Le code du projet est requis'];
    }
    if (!formState.adresse) {
      newErrors.adresse = ['L\'adresse du projet est requise'];
    }
    if (formState.surface_terrain === 0) {
      newErrors.surface_terrain = ['Surface terrain est requise'];
    }
    if (formState.limite_annulation_reservation === 0) {
      newErrors.limite_annulation_reservation = ['Limite annulation réservation est requise'];
    }
    if (formState.prix_acquisition === 0) {
      newErrors.prix_acquisition = ['Prix acquisition est requis'];
    }
    if (formState.max_etages === 0) {
      newErrors.max_etages = ['Max étages est requis'];
    }
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }

  return true;
};


  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    
    try {
      // Format data for submission with all arrays properly stringified
      const requestData = {
        // Basic project information
        nom: formState.nom,
        code: formState.code,
        adresse: formState.adresse,
        date_autorisation_construction: formState.date_autorisation_construction,
        date_permis_habiter: formState.date_permis_habiter || null,
        titre_foncier: formState.titre_foncier || null,
        surface_terrain: Number(formState.surface_terrain),
        prix_acquisition: Number(formState.prix_acquisition),
        limite_annulation_reservation: Number(formState.limite_annulation_reservation),
        prolongation_reservation: Number(formState.prolongation_reservation) || null,
        type_id: formState.typeId,
        societe_id: selectedSociete.id,
        nbre_tranches: Number(formState.tranches) || null,
        nbre_blocs: Number(formState.blocks) || null,
        nbre_immeubles: Number(formState.building) || null,
        nbre_biens: Number(formState.bienCount) || 0, // Add bienCount to request
        max_etages: Number(formState.max_etages),
        
        // IMPORTANT: Stringify all arrays
        selectedUsers: JSON.stringify(formState.selectedUsers.map(user => user.id)),
        
        donneesTypeBien: JSON.stringify((formState.biens || []).map(x => x.value)),
        donneesVue: JSON.stringify((formState.vues || []).map(x => x.value)),
        donneesTypologie: JSON.stringify((formState.typologies || []).map(x => x.value)),
        partenaires: JSON.stringify(formState.partenaires || []),
        
        nbre_biens: (formState.biens || []).length
      };
      
      const response = await axios.post(APIURL.PROJETS, requestData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Projet créé avec succès');
      
      const { projet } = response.data;
      localStorage.setItem('selectedProjet', JSON.stringify(projet));
      
      router.push(`/Projets/${projet.id}`);
      
    } catch (err) {
      console.error('Error creating project:', err);
      
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || { general: ['Une erreur est survenue'] });
      } else {
        setErrors({ general: ['Une erreur est survenue lors de la création du projet'] });
      }
      
      if (err.response?.data?.step) {
        setActiveStep(err.response.data.step - 1);
      }
      
      toast.error('Erreur lors de la création du projet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-white rounded-lg shadow-md">
      <div className="p-6">
        <h1 className="text-2xl items-center text-center font-semibold">Ajouter un projet</h1>
        <div className=" mx-8 mt-4">
          <ProjectStepper 
            steps={steps.map(step => step.title)}
            activeStep={activeStep} 
            activeColor="#009FFF"
          />
        </div>
        
        <div className="">
          {steps[activeStep].component}
        </div>
        
        {errors && errors.general && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 !text-red-700">
            {errors.general.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

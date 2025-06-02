"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';
import { format, addMonths, parseISO } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useSociete } from '@/context/SocieteContext';
import ProjectStepper from '@/components/ProjectStepper';
import CompositionForm from '@/components/projects/CompositionForm';
import GeneralInformationForm from '@/components/projects/GeneralInformationForm';
import GeneralParameterForm from '@/components/projects/GeneralParameterForm';
import { APIURL } from '@/configs/api';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import LoadingSpin from '@/components/LoadingSpin';

export default function EditProjectPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuth();
  const { selectedSociete } = useSociete();
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [originalProject, setOriginalProject] = useState(null);
  
  // Form state
  const [formState, setFormState] = useState({
    type: '',
    typeId: null,
    building: 0,
    tranches: 0,
    blocks: 0,
    bienCount: 0,

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
    
    // Autres champs
    biens: [],
    vues: [],
    typologies: [],
    partenaires: []
  });

  // Check if user has permission to edit projects
  useEffect(() => {
    if (user && user.role !== 1 && user.role !== 2) {
      toast.error('Vous n\'avez pas la permission de modifier des projets');
      router.push('/Projets');
    }
    
    // Ensure société is selected
    if (!selectedSociete) {
      toast.error('Veuillez sélectionner une société d\'abord');
      router.push('/Projets');
    }
  }, [user, selectedSociete, router]);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      setFetching(true);
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${APIURL.PROJETS}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const projectData = response.data.projet;
        setOriginalProject(projectData);
        
        // Map the project data to the form state
        setFormState({
          type: projectData.type_projet?.type || '',
          typeId: projectData.type_projet?.id || null,
          building: projectData.nbre_immeubles || 0,
          tranches: projectData.nbre_tranches || 0,
          blocks: projectData.nbre_blocs || 0,
          bienCount: projectData.nbre_biens || 0,

          // General Information
          nom: projectData.nom || '',
          adresse: projectData.adresse || '',
          code: projectData.code || '',
          date_autorisation_construction: projectData.date_autorisation_construction ? 
            format(parseISO(projectData.date_autorisation_construction), 'yyyy-MM-dd') : 
            format(new Date(), 'yyyy-MM-dd'),
          date_permis_habiter: projectData.date_permis_habiter ? 
            format(parseISO(projectData.date_permis_habiter), 'yyyy-MM-dd') : 
            format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
          titre_foncier: projectData.titre_foncier || '',
          surface_terrain: projectData.surface_terrain || 0,
          max_etages: projectData.max_etages || 0,
          prix_acquisition: projectData.prix_acquisition || 0,
          limite_annulation_reservation: projectData.limite_annulation_reservation || 0,
          prolongation_reservation: projectData.prolongation_reservation || 0,
          
          // Selected users - map user_projet to the expected format
          selectedUsers: projectData.user_projet?.map(up => up.user) || [],
          
          // Parse JSON strings if they exist
          biens: (projectData.donneesTypeBien && typeof projectData.donneesTypeBien === 'string')
            ? JSON.parse(projectData.donneesTypeBien).map(value => ({ value }))
            : [],
          vues: (projectData.donneesVue && typeof projectData.donneesVue === 'string')
            ? JSON.parse(projectData.donneesVue).map(value => ({ value }))
            : [],
          typologies: (projectData.donneesTypologie && typeof projectData.donneesTypologie === 'string')
            ? JSON.parse(projectData.donneesTypologie).map(value => ({ value }))
            : [],
          partenaires: (projectData.partenaires && typeof projectData.partenaires === 'string')
            ? JSON.parse(projectData.partenaires)
            : []
        });
      } catch (error) {
        console.error('Error fetching project data:', error);
        toast.error('Erreur lors du chargement des données du projet');
        router.push(`/Projets/${id}`);
      } finally {
        setFetching(false);
      }
    };
    
    if (id) {
      fetchProjectData();
    }
  }, [id, router]);

  const steps = [
    {
      title: "Type de projet et Composition",
      component: <CompositionForm 
        state={formState} 
        setState={setFormState} 
        onNext={() => handleNext()}
        errors={errors}
        isEdit={true}
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
    // Step-specific validation
    if (activeStep === 0) {
      if (!formState.typeId) {
        setErrors({ type_id: ['Veuillez sélectionner un type de projet'] });
        return false;
      }
    } 
    else if (activeStep === 1) {
      if (!formState.nom) {
        setErrors({ nom: ['Le nom du projet est requis'] });
        return false;
      }
      if (!formState.code) {
        setErrors({ code: ['Le code du projet est requis'] });
        return false;
      }
      if (!formState.adresse) {
        setErrors({ adresse: ['L\'adresse du projet est requise'] });
        return false;
      }
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
        nbre_biens: Number(formState.bienCount) || 0,
        max_etages: Number(formState.max_etages),
        
        // IMPORTANT: Stringify all arrays
        selectedUsers: JSON.stringify(formState.selectedUsers.map(user => user.localId || user.id)),
        
        donneesTypeBien: JSON.stringify((formState.biens || []).map(x => x.value)),
        donneesVue: JSON.stringify((formState.vues || []).map(x => x.value)),
        donneesTypologie: JSON.stringify((formState.typologies || []).map(x => x.value)),
        partenaires: JSON.stringify(formState.partenaires || []),
      };
      
      // Send update request
      const response = await axios.put(`${APIURL.PROJETS}/${id}`, requestData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Projet mis à jour avec succès');
      
      // Update the selected project in localStorage if it's the current project
      const savedProjectStr = localStorage.getItem('selectedProjet');
      if (savedProjectStr) {
        const savedProject = JSON.parse(savedProjectStr);
        if (savedProject && savedProject.id == id) {
          localStorage.setItem('selectedProjet', JSON.stringify(response.data.projet));
        }
      }
      
      router.push(`/Projets/${id}`);
      
    } catch (err) {
      console.error('Error updating project:', err);
      
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || { general: ['Une erreur est survenue'] });
      } else {
        setErrors({ general: ['Une erreur est survenue lors de la mise à jour du projet'] });
      }
      
      if (err.response?.data?.step) {
        setActiveStep(err.response.data.step - 1);
      }
      
      toast.error('Erreur lors de la mise à jour du projet');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin /> 
      </div>
    );
  }

  if (!originalProject) {
    return (
      <div className="bg-red-50 p-4 rounded-md border-l-4 border-red-500">
        <p className="text-red-700">Projet non trouvé ou erreur lors du chargement.</p>
        <Link href={`/Projets/${id}`} className="text-blue-600 hover:underline mt-2 inline-block">
          Retour au projet
        </Link>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg shadow-md">
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Link href={`/Projets/${id}`} className="mr-4">
            <ArrowLeft className="h-5 w-5 text-gray-500 hover:text-gray-700" />
          </Link>
          <h1 className="text-2xl font-semibold">Modifier le projet: {originalProject.nom}</h1>
        </div>
        
        <ProjectStepper 
          steps={steps.map(step => step.title)}
          activeStep={activeStep} 
          activeColor="#009FFF"
        />
        
        <div className="mt-8">
          {steps[activeStep].component}
        </div>
        
        {errors && errors.general && (
          <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            {errors.general.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { APIURL, ENDPOINTS } from "@/configs/api";
import toast from "react-hot-toast";
import Link from "next/link";
import LoadingSpin from '@/components/LoadingSpin';
import BreadCrumb from "@/app/(dashboard)/navigation/BreadCrumb";
import { format, addMonths, parseISO } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useSociete } from '@/context/SocieteContext';
import { useParams } from 'next/navigation';
import Input from "@/components/Input";
import Button from "@/components/Button";
import InputSelect from "@/components/inputSelect";
import { fetchData_Select } from "@/configs/api-utils";

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
  const [validationErrors, setValidationErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState({});
  const [users, setUsers] = useState([]);
  const [state, setState] = useState({ selectedUsers: [] });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const [selectAllUsers, setSelectAllUsers] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false)
  const [Typeprojets, setTypeProjets] = useState([]);

 
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

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter(user =>
    `${user.name} ${user.prenom}`.toLowerCase().includes(searchUser.toLowerCase())
  );

  // Vérifie si un utilisateur est sélectionné
  const isUserSelected = (userId) => {
    return state.selectedUsers.some(u => u.id === userId);
  };

  // Gère la sélection/désélection d’un utilisateur
  const handleUserChange = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    if (isUserSelected(userId)) {
      setState(prev => ({
        ...prev,
        selectedUsers: prev.selectedUsers.filter(u => u.id !== userId),
      }));
    } else {
      setState(prev => ({
        ...prev,
        selectedUsers: [...prev.selectedUsers, user],
      }));
    }
  };

  // Gère la sélection/désélection de tous les utilisateurs
  const toggleSelectAllUsers = () => {
    if (selectAllUsers) {
      setState(prev => ({ ...prev, selectedUsers: [] }));
      setSelectAllUsers(false);
    } else {
      setState(prev => ({ ...prev, selectedUsers: [...users] }));
      setSelectAllUsers(true);
    }
  };

  // Met à jour le statut "selectAllUsers" quand selectedUsers change
  useEffect(() => {
    if (users.length > 0 && state.selectedUsers.length === users.length) {
      setSelectAllUsers(true);
    } else {
      setSelectAllUsers(false);
    }
  }, [state.selectedUsers, users]);
  // Form state
  const [formState, setFormState] = useState({
    nbre_biens: 0,
    nbre_blocs: 0,
    nbre_tranches: 0,
    nbre_immeubles: 0,

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
    
    selectedUsers: [],
    type_id:'',
    
   
  });

  const handleselectChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
    
    
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  
  
   
  // Check if user has permission to edit projects
  useEffect(() => {
    if (user && user.role !== 1 && user.role !== 2) {
      toast.error('Vous n\'avez pas la permission de modifier des projets');
      router.push('/Projets');
    }
    fetchData_Select('typeProjets', setTypeProjets, setLoading);
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
        if (projectData?.user_projet) {
            const selectedUsersFromProject = projectData.user_projet.map(up => up.user);
            setState(prev => ({ ...prev, selectedUsers: selectedUsersFromProject }));
          }


        // Map the project data to the form state
        setFormState({
          type_id: projectData.type_id || null,
          nbre_biens: projectData?.nbre_biens || 0,
          nbre_blocs: projectData?.nbre_blocs || 0,
          nbre_immeubles: projectData?.nbre_immeubles || 0,
          nbre_tranches: projectData?.nbre_tranches || 0,
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


  // Form submission handler
 const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  const token = localStorage.getItem('accessToken');
   const selectedUserIds = state.selectedUsers ? state.selectedUsers.map(user => user.id) : [];


  try {
    const requestData = {
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
      type_id: formState.type_id || null,
      societe_id: selectedSociete.id,
      nbre_tranches: Number(formState.nbre_tranches) || 0,
      nbre_blocs: formState.nbre_blocs || 0,
      nbre_immeubles: Number(formState.nbre_immeubles) || 0,
      nbre_biens: Number(formState.nbre_biens) || 0,
      max_etages: Number(formState.max_etages),
      // Si selectedUsers est un tableau d’objets utilisateurs :
      selectedUsers: JSON.stringify(selectedUserIds),

      
    };

    const response = await axios.put(`${APIURL.PROJETS}/${id}`, requestData, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        //'Content-Type': 'application/json'
      }
    });

    toast.success('Projet mis à jour avec succès');

    const savedProjectStr = localStorage.getItem('selectedProjet');
    if (savedProjectStr) {
      const savedProject = JSON.parse(savedProjectStr);
      if (savedProject && savedProject.id == id) {
        localStorage.setItem('selectedProjet', JSON.stringify(response.data.projet));
      }
    }

    router.push(router.back());

  } catch (err) {
    const response = error.response
      if (response && response.status === 422) {
        setBackendErrors(response.data.errors)
        setValidationErrors(response.data.errors);
        console.error('Validation errors:', response.data.errors);
        // Effacer les erreurs après 5 secondes
        setTimeout(() => setBackendErrors({}), 5000)
      } else {
        toast.error('Une erreur s\'est produite lors de la soumission du formulaire.')
      }
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
      <div className="p-3">
        <div className="flex items-center justify-start">
          <BreadCrumb
            baseUrl={"/Projets"}
            step={`${id ? "Modifier" : "Ajouter"} un projet`}
          />

        </div>
        <div className="p-6 mt-4 bg-white shadow-md rounded-md">
    
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <Input
            label="Nom du projet"
            name="nom"
            value={formState.nom}
            onChange={handleChange}
            required
            error={validationErrors.nom || backendErrors.nom}
          />

  

        <Input
          label="Code du projet"
          name="code"
          value={formState.code}
          onChange={handleChange}
          required
          error={validationErrors.code || backendErrors.code}
        />
        <Input
          label="Nombre de tranche"
          type="number"
          name="nbre_tranches"
          value={formState.nbre_tranches}
          onChange={handleChange}
          required
          error={validationErrors.nbre_tranches || backendErrors.nbre_tranches}
        />
        <Input
        type="number"
        label="Nombre de blocs"
        name="nbre_blocs"
        value={formState.nbre_blocs}
        onChange={handleChange}
        required
        error={validationErrors.nbre_blocs || backendErrors.nbre_blocs}
      />

        <Input
          label="Nombre d'immeubles"
          type="number"
          name="nbre_immeubles"
          value={formState.nbre_immeubles}
          onChange={handleChange}
          required
          error={validationErrors.nbre_immeubles || backendErrors.nbre_immeubles}
        />
        <Input
          label="Nombre de biens"
          type="number"
          name="nbre_biens"
          value={formState.nbre_biens}
          onChange={handleChange}
          required
          error={validationErrors.nbre_biens || backendErrors.nbre_biens}
        />

      <Input
        label="Adresse"
        name="adresse"
        value={formState.adresse}
        onChange={handleChange}
        required
        error={validationErrors.adresse || backendErrors.adresse}
      />

    <Input
      label="Titre foncier"
      name="titre_foncier"
      value={formState.titre_foncier}
      onChange={handleChange}
      error={validationErrors.titre_foncier || backendErrors.titre_foncier}
    />
    <InputSelect
      label="Type de projet"
      name="type_id"
      value={formState.type_id}
      onChange={(option) => handleselectChange("type_id", option?.value || null)}

      options={Typeprojets.map(s => ({ value: s.id, label: s.type }))}
      placeholder="Choisir un type..."
      isLoading={loading}
      error={errors?.type_id}
      required
    />

  <Input
    label="Date autorisation construction"
    name="date_autorisation_construction"
    type="date"
    value={formState.date_autorisation_construction}
    onChange={handleChange}
    required
    error={validationErrors.date_autorisation_construction || backendErrors.date_autorisation_construction}
  />

  <Input
    label="Date permis habiter"
    name="date_permis_habiter"
    type="date"
    value={formState.date_permis_habiter}
    onChange={handleChange}
    error={validationErrors.date_permis_habiter || backendErrors.date_permis_habiter}
  />

  <Input
    label="Surface terrain (m²)"
    name="surface_terrain"
    type="number"
    min="0"
    value={formState.surface_terrain}
    onChange={handleChange}
    required
    error={validationErrors.surface_terrain || backendErrors.surface_terrain}
  />

  <Input
    label="Prix acquisition"
    name="prix_acquisition"
    type="number"
    min="0"
    value={formState.prix_acquisition}
    onChange={handleChange}
    required
    error={validationErrors.prix_acquisition || backendErrors.prix_acquisition}
  />

  <Input
    label="Limite annulation réservation (jours)"
    name="limite_annulation_reservation"
    type="number"
    min="0"
    value={formState.limite_annulation_reservation}
    onChange={handleChange}
    required
    error={validationErrors.limite_annulation_reservation || backendErrors.limite_annulation_reservation}
  />

  <Input
    label="Prolongation réservation (jours)"
    name="prolongation_reservation"
    type="number"
    min="0"
    value={formState.prolongation_reservation}
    onChange={handleChange}
    error={validationErrors.prolongation_reservation || backendErrors.prolongation_reservation}
  />

  <Input
    label="Nombre d'étages maximum"
    name="max_etages"
    type="number"
    min="0"
    value={formState.max_etages}
    onChange={handleChange}
    required
    error={validationErrors.max_etages || backendErrors.max_etages}

  />
  </div>
  <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
  <div className="mt-8 border-t pt-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Utilisateurs avec accès au projet <span className="text-red-500">*</span>
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex justify-between items-center w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>
            {state.selectedUsers.length > 0
              ? `${state.selectedUsers.length} utilisateur(s) sélectionné(s)`
              : "Sélectionner les utilisateurs"}
          </span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={showUserDropdown ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
          </svg>
        </button>

        {showUserDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-200 sticky top-0 bg-white">
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Rechercher un utilisateur..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="p-2 border-b border-gray-200 sticky top-10 bg-white">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectAllUsers}
                  onChange={toggleSelectAllUsers}
                  className="h-4 w-4 text-[#009FFF] border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium">Sélectionner tout</span>
              </label>
            </div>

            <div className="py-1">
              {filteredUsers.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-500">Aucun utilisateur trouvé</div>
              ) : (
                filteredUsers.map(user => (
                  <div key={user.id} className="px-2 py-1">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isUserSelected(user.id)}
                        onChange={() => handleUserChange(user.id)}
                        className="h-4 w-4 text-[#009FFF] border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 block text-sm">{user.name} {user.prenom}</span>
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {state.selectedUsers.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {state.selectedUsers.map(user => (
            <div key={user.id} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
              <span>{user.name} {user.prenom}</span>
              <button
                type="button"
                onClick={() => handleUserChange(user.id)}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {errors?.selectedUsers && <p className="mt-1 text-sm text-red-600">{errors.selectedUsers[0]}</p>}
    </div>
    </div>
  
       

        {/* Form actions */}
        <div className="flex justify-center gap-4 items-center mt-8 mb-6">
          <Button type="button" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit"  loading={loading}>
            {loading ? "Chargement..." : id ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </div>
    </div>
  );
}

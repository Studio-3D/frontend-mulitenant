'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { APIURL, ENDPOINTS } from '@/configs/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import LoadingSpin from '@/components/LoadingSpin';
import BreadCrumb from '@/app/(dashboard)/navigation/BreadCrumb';
import { fetchDataByProjet_params } from '@/configs/api-utils';
import Button from '@/components/Button';
import Input from '@/components/Input';
import SelectInput from '@/components/SelectInput';
import { CIVILITES, SITUATION_FAMILIALLE } from '@/components/client-utils';
import InputSelect from '@/components/inputSelect';
import { TYPE_CLIENT } from '@/configs/enum';
import { useProjet } from '@/context/ProjetContext';
export default function ClientForm({ id, projetId, trancheId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [backendErrors, setBackendErrors] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [prospect_id, setProspect_id] = useState(null);
  const [info_client, setInfo_client] = useState('');
  const [info_prospect, setInfo_prospect] = useState('');
  const token = localStorage.getItem('accessToken');
  const [disabled_var, setDisabled_var] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get selected project from localStorage if not provided via props

  const { selectedProjet } = useProjet();
  const [partenaires, setPartenaires] = useState([]);

  const defaultValues = {
    nom: '',
    prenom: '',
    telephone_num1: '',
    telephone_num2: '',
    email: '',
    adresse: '',
    cin: '',
    civilite: '',
    type_client: '',
    notifie: 0,
    ville: '',
    pays: '',
    profession: '',
    lieu_naissance: '',
    date_naissance: '',
    age: '',
    nom_responsable: '',
    relation_familliale: '',
    situation_familliale: '',
    nom_pere: '',
    nom_mere: '',
    partenaire_id: '',
    prospect_id: '',
    nom_mari: '',
    lieu_mariage: '',
    date_mariage: '',
    nationalite: '',
    projet_id: selectedProjet?.id,
  };

  const [formData, setFormData] = useState(defaultValues);
  const isEditing = !!id;

  // Simple cache et comparaison for return back en cas de changer projet
  const [oldProjetId, setOldProjetId] = useState(null);

  useEffect(() => {
    if (selectedProjet?.id && selectedProjet.id !== oldProjetId) {
      if (oldProjetId) {
        // Projet a changé

       // console.log(`Projet changé: ${oldProjetId} -> ${selectedProjet.id}`);
        router.push('/ventes/clients');
      }
      setOldProjetId(selectedProjet.id);
    }
  }, [selectedProjet?.id, oldProjetId, router]);
  // Fetch client data if editing
  useEffect(() => {
    if (partenaires.length == 0) {
      fetchDataByProjet_params('partenaires', setPartenaires, setLoading);
    }
    if (isEditing) {
      setLoading(true);
      const fetchClientData = async () => {
        try {
          const response = await axios.get(`${APIURL.ROOTV1}/show_client/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data && response.data.client) {
            setLoading(false);
            const client = response.data.client;
            setFormData({
              nom: client.nom || '',
              prenom: client.prenom || '',
              telephone_num1: client.telephone_num1 || '',
              telephone_num2: client.telephone_num2 || '',
              email: client.email || '',
              notifie: client.notifie || 0,
              cin: client.cin || '',
              adresse: client.adresse || '',
              partenaire_id: client.partenaire_id || '',
              civilite: client.civilite || '',
              type_client: client.type_client || '',
              ville: client.ville || '',
              pays: client.pays || '',
              profession: client.profession || '',
              lieu_naissance: client.lieu_naissance || '',
              date_naissance: client.date_naissance || '',
              age:
                client.age !== undefined && client.age !== null
                  ? client.age
                  : '', // This line ensures 0 is not replaced by ''
              nom_responsable: client.nom_responsable || '',
              relation_familliale: client.relation_familliale || '',
              situation_familliale: client.situation_familliale || '',
              nom_pere: client.nom_pere || '',
              nom_mere: client.nom_mere || '',
              nom_mari: client.nom_mari || '',
              lieu_mariage: client.lieu_mariage || '',
              date_mariage: client.date_mariage || '',
              nationalite: client.nationalite || '',
            });

            console.log(client.situation_familliale, 'situation_familliale');
          }
        } catch (error) {
          setLoading(false);
          console.error('Failed to fetch client:', error);
          toast.error('Erreur lors du chargement du client');
        }
      };

      fetchClientData();
    } else if (trancheId) {
      // If creating a new client with a pre-selected tranche, set it in form data
      setFormData((prev) => ({
        ...prev,
        tranche_id: trancheId,
      }));
    }
  }, [id, isEditing, selectedProjet?.id, trancheId]);

  const handleChange_event = (type) => {
    let timeoutId;

    return (event) => {
      const inputText = event.target.value || '';

      if (
        (type == 'cin' && inputText.length >= 3) ||
        (type == 'telephone' && inputText.length >= 10) ||
        (type == 'email' && inputText.length >= 3)
      ) {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(
          () => {
            fetch_cin_tel_email(inputText, type);
          },
          type == 'telephone' ? 1000 : 1000
        );
      }
    };
  };

  const fetch_cin_tel_email = async (value, type) => {
  // Déterminer la route en fonction du type de recherche
  let route = '';
  if (type == 'cin') {
    route = 'search_client_by_cin';
  } else if (type == 'telephone') {
    route = 'search_client_by_phone';
  } else if (type == 'email') {
    route = 'search_client_by_email';
  } else {
    console.error('Type de recherche non valide');
    return;
  }

  // Vérifier que la valeur n'est pas vide
  if (!value || value.trim() == '') {
    setInfo_client('');
    setInfo_prospect('');
    setDisabled_var(false);
    return;
  }

  try {
    // Faire la requête API
    const res = await axios.get(`${APIURL.ROOTV1}/${route}/${value}/${selectedProjet?.id}`, {
      headers: { Authorization: `Bearer ${token}` },

    });

    // Extraire les données de la réponse
    const { client, prospect } = res.data;

    // Réinitialiser les états avant de traiter la réponse
    setInfo_client('');
    setInfo_prospect('');
    setDisabled_var(false);

    // 1. Vérifier d'abord si c'est un client existant
    if (client) {
      setInfo_client(
        `${type}: ${value} appartient au Client ${client.nom} ${client.prenom}. Veuillez changer ce ${type}!`
      );
      setDisabled_var(true);
    }
    // 2. Si pas de client, vérifier si c'est un prospect
    else if (prospect) {
      setInfo_prospect(
        `${type}: ${value} appartient au Prospect ${prospect.nom} ${prospect.prenom}`
      );
      setProspect_id(prospect.id);
    }
    // 3. Si ni client ni prospect trouvé - NE PAS RÉINITIALISER LES AUTRES CHAMPS
    /*else {
      // Seulement mettre à jour le champ spécifique sans affecter les autres champs
      if (type == 'cin') {
        setFormData((prev) => ({
          ...prev,
          cin: value, // Seulement mettre à jour le CIN
          // Ne pas réinitialiser nom et prenom
        }));
      }
      // Pour les autres types, ne rien faire ou seulement mettre à jour le champ concerné
      else if (type == 'telephone') {
        setFormData((prev) => ({
          ...prev,
          telephone_num1: value,
        }));
      }
      else if (type == 'email') {
        setFormData((prev) => ({
          ...prev,
          email: value,
        }));
      }
    }*/
  } catch (error) {
    console.error('Erreur lors de la vérification du client/prospect', error);

    // Gestion spécifique des différents types d'erreurs
    if (error.response) {
      // Erreur de réponse du serveur (4xx, 5xx)
      if (error.response.status == 404) {
        // Aucun client/prospect trouvé - ce n'est pas vraiment une erreur
        setInfo_client('');
        setInfo_prospect('');
      } else {
        setInfo_client('Erreur lors de la vérification');
      }
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      setInfo_client('Problème de connexion au serveur');
    } else {
      // Erreur lors de la configuration de la requête
      setInfo_client('Erreur de configuration');
    }

    // Réinitialiser les états en cas d'erreur
    setInfo_prospect('');
    setDisabled_var(false);
  }
};

  const calculate_age = (dobString) => {
    const today = new Date();
    const birthDate = new Date(dobString);
    let age_now = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m == 0 && today.getDate() < birthDate.getDate())) {
      age_now--;
    }

    setFormData((prev) => ({
      ...prev,
      age: age_now,
    }));
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    const newValue = type == 'checkbox' ? (checked ? 1 : 0) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    if (!formData.nom) {
      errors.nom = 'Le nom du client est requis';
    }
    if (!formData.situation_familliale) {
      errors.situation_familliale =
        'La situation familliale du client est requise';
    }
    if (!formData.civilite) {
      // Ajout de la validation pour la civilité
      errors.civilite = 'La civilité est requise';
    }
    if (!formData.type_client) {
      // Ajout de la validation pour la civilité
      errors.type_client = 'Le type de client est requis';
    }
    if (!formData.telephone_num1) {
      errors.telephone_num1 = 'Le téléphone 1 est requis.';
    } else if (!/^\d{10,14}$/.test(formData.telephone_num1)) {
      errors.telephone_num1 =
        'Le téléphone 1 doit contenir entre 10 et 14 chiffres.';
    }

    // Validation pour telephone_num2 (facultatif)
    if (
      formData.telephone_num2 &&
      !/^\d{10,14}$/.test(formData.telephone_num2)
    ) {
      errors.telephone_num2 =
        'Le téléphone 2 doit contenir entre 10 et 14 chiffres.';
    }

    // Only require tranche if there are tranches available

    setValidationErrors(errors);
    return Object.keys(errors).length == 0;
  };

  // Form submission handler
// Form submission handler
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitted(true);

  if (!validateForm()) return;

  setLoading(true);
  setBackendErrors({});

  // Convertir en STRINGS (pas en nombres)
  const submissionData = {
    ...formData,
    situation_familliale: String(formData.situation_familliale),
    civilite: String(formData.civilite),
    type_client: String(formData.type_client),
    notifie: String(formData.notifie),
  };

  try {
    const url = isEditing ? `${APIURL.CLIENTS}/${id}` : APIURL.CLIENTS;
    const method = isEditing ? 'put' : 'post';

    await axios({ method, url, data: submissionData, headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    }});

    toast.success(`Client ${isEditing ? 'modifié' : 'créé'}`);
    router.push(ENDPOINTS.VENTE+'?tab=clients');
  } catch (error) {
    if (error.response?.status === 422) {
      setBackendErrors(error.response.data.errors || {});
    } else {
      toast.error("Erreur lors de la soumission");
    }
  } finally {
    setLoading(false);
  }
};
  if (isEditing && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpin />
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-start">
        <BreadCrumb
          baseUrl={ENDPOINTS.VENTE+'?tab=clients'}
          step={`${id ? 'Modifier' : 'Ajouter'} un client`}
        />
      </div>
      <div className="p-6 mt-4 bg-white shadow-md rounded-md">
        {info_client != '' && (
                            <div className="bg-[rgba(253,181,40,0.12)] border-l-4 border-yellow-500 text-[rgb(227,162,36)] p-4 text-center rounded">

            <p >{info_client}</p>
          </div>
        )}
 {info_prospect != '' && (
  <div className="bg-blue-100 !text-blue-700 border-l-4 border-blue-500 p-4 text-center rounded">
    <div className="flex justify-between items-center">
      <span>{info_prospect}</span>
      <Button
        size="small"
        color="inherit"
        onClick={() => {
          setFormData((prev) => ({
            ...prev,
            prospect_id: prospect_id,
          }));
          setInfo_prospect('');
        }}
      >
        Convertir en client
      </Button>
    </div>
  </div>
)}

        <form onSubmit={handleSubmit} className="space-y-6">
          <h4 className="text-xl font-bold text-blue-700 mb-4 border-b-2 border-blue-300 pb-2 flex items-center gap-2 bg-white px-2 rounded-sm shadow-sm">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A13.937 13.937 0 0112 15c2.21 0 4-1.79 4-4s-1.79-4-4-4a4 4 0 00-4 4c0 1.502.805 2.823 2.012 3.54"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 21h2a2 2 0 002-2v-2a4 4 0 00-4-4h-2a4 4 0 00-4 4v2a2 2 0 002 2h2z"
              />
            </svg>
            Coordonnées et identité
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SelectInput
              label="Type client"
              name="type_client"
              required
              placeholder="Sélectionner un type"
              options={Object.values(TYPE_CLIENT).map((item) => ({
                value: item.code,
                label: item.label,
              }))}
              value={formData.type_client}
              onChange={(value) =>
                handleChange({ target: { name: 'type_client', value } })
              }
              error={validationErrors.type_client || backendErrors.type_client}
              submitted={isSubmitted}
            />

            {formData.type_client == 2 && (
              <InputSelect
                label="Partenaire"
                name="partenaire_id"
                options={partenaires.map((p) => ({
                  label: p.description,
                  value: p.id,
                }))}
                value={formData.partenaire_id}
                onChange={(option) => {
                  const partenaireSelected = partenaires.find(
                    (p) => p.id == option?.value
                  );
                  handleSelectChange('partenaire_id', option?.value || null);
                }}
                error={
                  validationErrors.partenaire_id || backendErrors.partenaire_id
                }
                isLoading={loading}
                required
              />
            )}

            <Input
              label="Cin"
              type="text"
              name="cin"
              value={formData.cin}
              onChange={(e) => {
                handleChange(e); // met à jour formData
                handleChange_event('cin')(e);
              }}
              //disabled={disabled_var}
              error={validationErrors.cin || backendErrors.cin}
              required
            />

            <Input
              label="Nom"
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              error={validationErrors.nom || backendErrors.nom}
              required
            />

            <Input
              label="Prénom"
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              error={validationErrors.prenom || backendErrors.prenom}
              required
            />

            <Input
              label="Téléphone 1"
              type="number"
              name="telephone_num1"
              value={formData.telephone_num1}
              onChange={(e) => {
                handleChange(e);
                handleChange_event('telephone')(e);
              }}
              required
              error={
                validationErrors.telephone_num1 || backendErrors.telephone_num1
              }
            />

            <Input
              label="Téléphone 2"
              type="number"
              name="telephone_num2"
              value={formData.telephone_num2}
              onChange={(e) => {
                handleChange(e);
                handleChange_event('telephone')(e);
              }}
              error={
                validationErrors.telephone_num2 || backendErrors.telephone_num2
              }
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                handleChange(e);
                handleChange_event('email')(e);
              }}
              error={validationErrors.email || backendErrors.email}
            />
            <SelectInput
              label="Civilité "
              name="civilite"
              required
              placeholder="Sélectionner une civilité"
              options={Object.values(CIVILITES).map((item) => ({
                value: item.code,
                label: item.label,
              }))}
              value={formData.civilite}
              onChange={(value) =>
                handleChange({ target: { name: 'civilite', value } })
              }
              error={validationErrors.civilite || backendErrors.civilite}
              submitted={isSubmitted}
            />
            <Input
              label="Adresse"
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              error={validationErrors.adresse || backendErrors.adresse}
            />

            <Input
              label="Ville"
              type="text"
              name="ville"
              value={formData.ville}
              onChange={handleChange}
              error={validationErrors.ville || backendErrors.ville}
            />

            <Input
              label="Pays"
              type="text"
              name="pays"
              value={formData.pays}
              onChange={handleChange}
              error={validationErrors.pays || backendErrors.pays}
            />

            <Input
              label="Profession"
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              error={validationErrors.profession || backendErrors.profession}
            />
            <div className="flex items-center w-full mt-5">
              <input
                type="checkbox"
                id="notifie"
                name="notifie"
                checked={formData.notifie == 1}
                onChange={(e) => handleChange(e)}
                className="h-6 w-6 text-[#009FFF] border-gray-300 rounded focus:ring-blue-500"
              />

              <label
                htmlFor="notifie"
                className="ml-2 font-medium text-gray-700 select-none"
              >
                Accepte {"d'"}être contacté:
              </label>
            </div>
          </div>

          <h4 className="text-xl font-bold text-blue-700 mb-4 border-b-2 border-blue-300 pb-2 flex items-center gap-2 bg-white px-2 rounded-sm shadow-sm">
            <svg
              className="w-7 h-7 text-blue-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 20v-1a6 6 0 0112 0v1"
              />
            </svg>
            Informations personnelles
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Input
              label="Lieu de naissance"
              type="text"
              name="lieu_naissance"
              value={formData.lieu_naissance}
              onChange={handleChange}
              error={
                validationErrors.lieu_naissance || backendErrors.lieu_naissance
              }
            />

            <Input
              label="Nationalité"
              type="text"
              name="nationalite"
              value={formData.nationalite}
              onChange={handleChange}
              error={validationErrors.nationalite || backendErrors.nationalite}
            />

            <Input
              label="Date de naissance"
              type="date"
              name="date_naissance"
              value={formData.date_naissance}
              onChange={(e) => {
                handleChange(e);
                calculate_age(e.target.value);
              }}
              error={
                validationErrors.date_naissance || backendErrors.date_naissance
              }
            />

            <Input
              label="Âge"
              type="number"
              name="age"
              value={formData.age}
              disabled
            />

            {formData.age !== '' &&
              (formData.age < 18 || formData.age == 0) && (
                <>
                  <Input
                    label="Nom Responsable"
                    type="text"
                    name="nom_responsable"
                    value={formData.nom_responsable}
                    onChange={handleChange}
                    error={
                      validationErrors.nom_responsable ||
                      backendErrors.nom_responsable
                    }
                    required
                  />

                  <Input
                    label="Relation Familiale"
                    type="text"
                    name="relation_familliale"
                    value={formData.relation_familliale}
                    onChange={handleChange}
                    error={
                      validationErrors.relation_familliale ||
                      backendErrors.relation_familliale
                    }
                    required
                  />
                </>
              )}
          </div>

          <h4 className="text-xl font-bold text-blue-700 mb-4 border-b-2 border-blue-300 pb-2 flex items-center gap-2">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.121 17.804A6.994 6.994 0 0012 21a6.994 6.994 0 006.879-3.196M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Situation familiale
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SelectInput
              label="Situation familiale"
              name="situation_familliale"
              placeholder="Sélectionner une situation"
              options={Object.values(SITUATION_FAMILIALLE).map((item) => ({
                value: item.code,
                label: item.label,
              }))}
              value={formData.situation_familliale}
              onChange={(value) =>
                handleChange({
                  target: { name: 'situation_familliale', value },
                })
              }
              error={
                validationErrors.situation_familliale ||
                backendErrors.situation_familliale
              }
              required
              submitted={isSubmitted}
            />

            {formData.situation_familliale == 2 && (
              <>
                <Input
                  label="Marié(e) à M./Mme"
                  name="nom_mari"
                  type="text"
                  value={formData.nom_mari}
                  onChange={handleChange}
                  error={validationErrors.nom_mari || backendErrors.nom_mari}
                  required
                />
                <Input
                  label="Date de mariage"
                  name="date_mariage"
                  type="date"
                  value={formData.date_mariage}
                  onChange={handleChange}
                  error={
                    validationErrors.date_mariage || backendErrors.date_mariage
                  }
                  required
                />
                <Input
                  label="Lieu de mariage"
                  name="lieu_mariage"
                  type="text"
                  value={formData.lieu_mariage}
                  onChange={handleChange}
                  error={
                    validationErrors.lieu_mariage || backendErrors.lieu_mariage
                  }
                  required
                />
              </>
            )}

            <Input
              label="Nom du père"
              name="nom_pere"
              type="text"
              value={formData.nom_pere}
              onChange={handleChange}
              error={validationErrors.nom_pere || backendErrors.nom_pere}
            />

            <Input
              label="Nom de la mère"
              name="nom_mere"
              type="text"
              value={formData.nom_mere}
              onChange={handleChange}
              error={validationErrors.nom_mere || backendErrors.nom_mere}
            />
          </div>

          {/* Form actions */}
          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={() => router.back()}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || disabled_var}
              loading={loading}
            >
              {loading ? 'Chargement...' : id ? 'Modifier' : 'Ajouter'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

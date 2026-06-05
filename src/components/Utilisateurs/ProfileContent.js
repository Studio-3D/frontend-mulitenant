'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { APIURL, RESOURCE_URL } from '../../configs/api';
import Image from 'next/image';
import { useSociete } from '@/context/SocieteContext';
import Input from '../Input';
import toast from 'react-hot-toast';
import { Edit, XIcon, Eye, EyeOff } from 'lucide-react';
import LoadingSpin from '../LoadingSpin';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import SelectInput from '../SelectInput';
import DateInput from '../DateInput';

const ProfileContent = ({ userId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [originalEmail, setOriginalEmail] = useState('');
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [projetOptions, setProjetsOptions] = useState([]);
  const [selectedProjetIds, setSelectedProjetIds] = useState([]);
  const [display_errors_projets, setDisplay_Errors_projets] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(
    searchParams.get('edit') === 'true'
  );
  const accessToken = localStorage.getItem('accessToken');
  const { selectedSociete } = useSociete();
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fonction pour récupérer les rôles disponibles
  const fetchRoles = async (societeId) => {
    setLoadingRoles(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get(`${APIURL.GESTION_ROLES_ACTIVES}/${societeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  // Récupérer les options de rôles
  const getRoleOptions = () => {
    // Rôles par défaut
    const defaultRoles = [
      { label: "Admin", value: "2" },
      { label: "Commercial", value: "3" },
    ];

    // Si l'utilisateur connecté est Super Admin (role 1), ajouter Super Admin
    if (user?.role === 1) {
      defaultRoles.unshift({ label: "Super Admin", value: "1" });
    }

    // Si aucun rôle supplémentaire n'est configuré, retourner seulement les rôles par défaut
    if (!roles || roles.length === 0) {
      return defaultRoles;
    }

    // Mapper les rôles dynamiques depuis l'API
    const dynamicRoles = roles
      .filter(role => {
        const roleValue = parseInt(role.role);
        return ![1, 2, 3].includes(roleValue);
      })
      .map(role => {
        const roleValue = parseInt(role.role);
        let label = '';
        
        switch(roleValue) {
          case 5:
            label = 'Notaire';
            break;
          case 6:
            label = 'Responsable Livraison';
            break;
          case 7:
            label = 'Comptable';
            break;
          case 8:
            label = 'SAV';
            break;
          case 9:
            label = 'Responsable Commercial';
            break;
          case 10:
            label = 'Agent de saisie';
            break;
          default:
            label = `Rôle ${roleValue}`;
        }
        
        return {
          label,
          value: role.role.toString(),
        };
      });

    return [...defaultRoles, ...dynamicRoles];
  };

  const validationSchema = Yup.object().shape({
  name: Yup.string()
    .typeError('Le nom doit être une chaîne de caractères')
    .required('Le nom est requis')
    .min(3, 'Le nom doit comporter au moins 3 caractères'),
  prenom: Yup.string()
    .typeError('Le prénom doit être une chaîne de caractères')
    .required('Le prénom est requis')
    .min(3, 'Le prénom doit comporter au moins 3 caractères'),
  email: Yup.string()
    .trim()
    .required("L'email est requis")
    .max(254, "L'email ne doit pas dépasser 254 caractères")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Veuillez entrer une adresse email valide'
    ),
  phone: Yup.string()
    .typeError('Le numéro de téléphone doit être une chaîne de caractères')
    .min(10, 'Le numéro de téléphone doit contenir au moins 10 caractères')
    .max(14, 'Le numéro de téléphone ne peut pas dépasser 14 caractères')
    .matches(/^[0-9]+$/, 'Le numéro de téléphone ne doit contenir que des chiffres'),
  cin: Yup.string(),
  cnss: Yup.number()
    .typeError('Le numéro CNSS doit être un nombre entier')
    .integer('Le numéro CNSS doit être un nombre entier')
    .nullable(),
  gender: Yup.string().required('Le genre est requis'),
  role: Yup.string().required('Le rôle est requis'),
  fonction: Yup.string(),
  date_embauche: Yup.date()
    .typeError('La date d\'embauche doit être une date valide')
    .nullable(),
  solde_conge: Yup.number()
    .typeError('Le solde de congé doit être un nombre entier')
    .integer('Le solde de congé doit être un nombre entier')
    .nullable(),
  is_actif: Yup.string().nullable(),
  // Champs de mot de passe conditionnels
  password: Yup.string().when('$emailChanged', {
    is: true,
    then: (schema) => schema
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
      .required('Le mot de passe est requis lorsque vous changez l\'email'),
    otherwise: (schema) => schema.notRequired(),
  }),
  password_confirmation: Yup.string().when('$emailChanged', {
    is: true,
    then: (schema) => schema
      .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas')
      .required('La confirmation du mot de passe est requise'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

  const formik = useFormik({
    initialValues: {
      name: '',
      prenom: '',
      email: '',
      phone: '',
      adresse: '',
      gender: '',
      role: '',
      is_actif: '',
      fonction: '',
      date_embauche: '',
      cin: '',
      cnss: '',
      solde_conge: '',
      selected_projets: [],
      password: '',
      password_confirmation: '',
    },
    validationSchema,
    validateOnChange: true,
    validateOnBlur: false,
    context: { emailChanged },
   onSubmit: async (values) => {
    console.log('fadwa')
  setIsSubmitting(true);

  const formToSend = new FormData();

  // Add all form values
  for (const key in values) {
    const value = values[key];
    if (value !== undefined && value !== null && value !== '') {
      // Ne pas envoyer les champs de mot de passe si l'email n'a pas changé
      if ((key === 'password' || key === 'password_confirmation') && !emailChanged) {
        continue;
      }
      formToSend.append(key, value);
    }
  }

  // Add selected projects
  const selectedProjetsString = selectedProjetIds.join(',');
  formToSend.append('selectedProjets', selectedProjetsString);
  
  // Add the image file if selected
  if (selectedFile) {
    formToSend.append('photo', selectedFile);
  }

  // Ajouter la méthode PUT pour Laravel
  formToSend.append('_method', 'PUT');

  try {
    const response = await axios.post(`${APIURL.UTILISATEURS}/${userId}`, formToSend, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    toast.success('Profil modifié avec succès');
    setIsEditing(false);
    setEmailChanged(false);

    if (searchParams.get('edit')) {
      router.push('/utilisateurs');
    }
    
    // Rafraîchir les données
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
  } catch (error) {
    // Gestion des erreurs de validation Laravel (status 422)
    if (error.response?.status === 422 && error.response?.data?.errors) {
      const validationErrors = error.response.data.errors;
      
      // Parcourir et définir chaque erreur dans formik
      Object.keys(validationErrors).forEach((field) => {
        const errorMessage = validationErrors[field][0];
        
        // Mapper les noms de champs Laravel vers les noms formik
        let formikField = field;
        
        // Si le champ est 'photo', c'est déjà le bon nom
        // Les autres champs sont déjà alignés
        formik.setFieldError(formikField, errorMessage);
        formik.setFieldTouched(formikField, true, false);
      });
      
      // Afficher un toast récapitulatif
      const errorCount = Object.keys(validationErrors).length;
      toast.error(`${errorCount} erreur${errorCount > 1 ? 's' : ''} à corriger`);
      
      // Scroll au premier champ en erreur
      const firstErrorField = Object.keys(validationErrors)[0];
      setTimeout(() => {
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        if (errorElement) {
          errorElement.focus();
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } 
    // Erreur unique CIN ou Email depuis le contrôleur (status 422 aussi)
    else if (error.response?.status === 422 && error.response?.data?.errors) {
      // Même traitement que ci-dessus
      const validationErrors = error.response.data.errors;
      Object.keys(validationErrors).forEach((field) => {
        formik.setFieldError(field, validationErrors[field][0]);
        formik.setFieldTouched(field, true, false);
      });
      toast.error('Veuillez corriger les erreurs dans le formulaire');
    }
    // Erreur 401 - Non autorisé
    else if (error.response?.status === 401) {
      toast.error('Session expirée. Veuillez vous reconnecter.');
      // Optionnel: rediriger vers login
      // router.push('/login');
    }
    // Autres erreurs
    else {
      toast.error(error.response?.data?.message || "Une erreur s'est produite, veuillez réessayer.");
    }
    
    console.error('Update error:', error);
  } finally {
    setIsSubmitting(false);
  }
},
  });

  // Détecter le changement d'email
  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    formik.setFieldValue('email', newEmail);
    if (newEmail !== originalEmail) {
      setEmailChanged(true);
    } else {
      setEmailChanged(false);
      // Réinitialiser les champs de mot de passe
      formik.setFieldValue('password', '');
      formik.setFieldValue('password_confirmation', '');
    }
  };

  // Charger les rôles quand la société change
  useEffect(() => {
    if (selectedSociete?.id) {
      fetchRoles(selectedSociete.id);
    }
  }, [selectedSociete?.id]);

  useEffect(() => {
    if (!userId || !accessToken) {
      setError('Authentication required.');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${APIURL.UTILISATEURS}/${userId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = response.data.user || response.data;
        setUserData(data);
        setOriginalEmail(data.email || '');

        // Get all available projects (not just user's projects)
        const allProjects = response.data.projets || [];
        const projectOptions = allProjects.map((projet) => ({
          value: projet.id.toString(),
          label: projet.nom || 'Projet sans nom',
        }));

        setProjetsOptions(projectOptions);
        const projetIds = response.data.projets_de_user.map((projet) =>
          projet.id.toString()
        );
        setSelectedProjetIds(projetIds);

        // Set Formik initial values
        formik.setValues({
          name: data.name || '',
          prenom: data.prenom || '',
          email: data.email || '',
          phone: data.phone || '',
          adresse: data.adresse || '',
          gender: data.gender || '',
          role: data.role?.toString() || '',
          is_actif: data.is_actif?.toString() || '1',
          fonction: data.fonction || '',
          date_embauche: data.date_embauche || '',
          cin: data.cin || '',
          cnss: data.cnss || '',
          solde_conge: data.solde_conge?.toString() || '',
          selected_projets: data.projets_de_user || [],
          password: '',
          password_confirmation: '',
        });
      } catch (err) {
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to fetch user data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, accessToken]);

  // Handle project selection from dropdown
  const handleProjetSelection = (selectedValues) => {
    setSelectedProjetIds(selectedValues || []);
  };

  // Get the full project objects for display
  const getSelectedProjects = () => {
    return selectedProjetIds
      .map((id) => {
        const option = projetOptions.find((opt) => opt.value === id.toString());
        return option ? { id: id, nom: option.label } : null;
      })
      .filter(Boolean);
  };

  const resetForm = () => {
    if (searchParams.get('edit')) {
      router.push('/utilisateurs');
    } else {
      formik.resetForm();
      setIsEditing(false);
      setEmailChanged(false);
      setOriginalEmail(userData?.email || '');

      // Reset selected projects to original values
      if (userData && userData.projets_de_user) {
        const projetIds = userData.projets_de_user.map((projet) =>
          projet.id.toString()
        );
        setSelectedProjetIds(projetIds);
      }
    }
  };

  if (loading)
    return (
      <div className="absolute inset-0 flex justify-center items-center">
        <LoadingSpin />
      </div>
    );
  if (error) return <div>{error}</div>;
  if (!userData) return <div>Aucune donnée utilisateur trouvée.</div>;

  const selectedProjects = getSelectedProjects();

  // Vérifier si l'utilisateur connecté peut modifier le rôle (role <= 2)
  const canEditRole = user?.role <= 2 && isEditing;

  return (
    <div className="relative">
      {/* Background Image */}
      <div className="w-full h-[20vh] relative">
        <Image
          src="/images/banners/background3.jpg"
          alt="Profile background"
          fill
          className="rounded-tr-lg object-cover"
          quality={80}
        />
      </div>

      {/* Profile Avatar Section */}
      <div className="flex items-center absolute top-[15vh] left-4 w-full pr-20">
        <div className="flex items-center flex-grow">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedFile(file);
                setPreviewUrl(URL.createObjectURL(file));
              }
            }}
          />

          <div className="relative w-32 h-32 cursor-pointer">
            <img
              src={
                previewUrl
                  ? previewUrl
                  : userData.photo
                  ? `${RESOURCE_URL.DOCS}/${
                      userData.societe
                        ? userData.societe.raison_sociale_concatene
                        : user?.societe?.raison_sociale_concatene
                    }_${userData.societe_id || user.societe_id}/users/${
                      userData.photo
                    }`
                  : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'
              }
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
            />
                      {/* Erreur pour la photo */}
          {formik.errors.photo && (formik.touched.photo || formik.submitCount > 0) && (
            <div className="text-red-500 text-sm mt-1">{formik.errors.photo}</div>
          )}
              
              {user?.role <= 2 && (
              <div
                className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Edit className="text-gray-600 text-lg" />
              </div>
            )}
          </div>
          <div className="flex flex-col p-4 mt-8">
            <div className="font-bold text-2xl !text-gray-900">
              {`${userData.name} ${userData.prenom}`}
            </div>
            <div className="text-gray-400 text-md font-medium">
              {userData.role === 1
                ? 'Super Admin'
                : userData.role === 2
                ? 'Admin'
                : userData.role === 3
                ? 'Commercial'
                : userData.role === 5
                ? 'Notaire'
                : userData.role === 6
                ? 'Responsable Livraison'
                : userData.role === 7
                ? 'Comptable'
                : userData.role === 8
                ? 'Service Après-Vente'
                : userData.role === 9
                ? 'Responsable Commercial'
                : userData.role === 10
                ? 'Agent de saisie'
                : 'Utilisateur'}
            </div>
          </div>
        </div>

        {/* Top Modifier Button */}
        {!isEditing && !searchParams.get('edit') && user?.role <= 2 && (
          <div className="mt-8">
            <button
              className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => setIsEditing(true)}
            >
              Modifier
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col p-4 mt-24 ml-4 rounded-lg">
        <div className="flex items-center gap-8">
          <button className="text-lg font-medium !text-blue-500 border-b-2 border-blue-500">
            Informations Personnelles
          </button>
        </div>
        <div className="border-b border-[#b7daf6] mr-8"></div>
      </div>

      {/* Profile Information Form */}
      <form
        onSubmit={formik.handleSubmit}
        className="flex flex-col p-8 ml-4 py-2"
      >
        <div className="w-full grid grid-cols-1 md:grid-cols-1 xl:grid-cols-3 md:gap-8 xl:gap-x-16 xl:gap-y-4">
          <Input
            label="Nom:"
            name="name"
            value={formik.values.name}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldTouched('name', true, false);
            }}
            readOnly={!isEditing}
            required={false}
            error={
              formik.touched.name || formik.submitCount > 0
                ? formik.errors.name
                : null
            }
          />
          <Input
            label="Prénom:"
            name="prenom"
            value={formik.values.prenom}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldTouched('prenom', true, false);
            }}
            readOnly={!isEditing}
            required={false}
            error={
              formik.touched.prenom || formik.submitCount > 0
                ? formik.errors.prenom
                : null
            }
          />
          <Input
            label="Email:"
            name="email"
            value={formik.values.email}
            onChange={handleEmailChange}
            type="email"
            readOnly={!isEditing}
            required={isEditing}
            error={
              formik.touched.email || formik.submitCount > 0
                ? formik.errors.email
                : null
            }
          />
          
          {/* Message d'avertissement pour changement d'email */}
          {isEditing && emailChanged && (
            <div className="col-span-1 md:col-span-2 xl:col-span-3 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
              <p className="text-sm text-yellow-700">
                ⚠️ Vous avez changé votre adresse email. Veuillez saisir votre nouveau mot de passe ci-dessous.
              </p>
            </div>
          )}
          
          {/* Champs de mot de passe - affichés uniquement si email changé */}
          {isEditing && emailChanged && (
            <>
              <div className="relative">
                <Input
                  label="Nouveau mot de passe:"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password || formik.submitCount > 0 ? formik.errors.password : null}
                  required={emailChanged}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <div className="relative">
                <Input
                  label="Confirmer le mot de passe:"
                  name="password_confirmation"
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={formik.values.password_confirmation}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password_confirmation || formik.submitCount > 0 ? formik.errors.password_confirmation : null}
                  required={emailChanged}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                >
                  {showPasswordConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </>
          )}
          
          <Input
            label="Téléphone:"
            name="phone"
            value={formik.values.phone}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/[^0-9]/g, '');
              formik.setFieldValue('phone', numericValue);
              formik.setFieldTouched('phone', true, false);
            }}
            type="tel"
            readOnly={!isEditing}
            required={false}
            error={
              formik.touched.phone || formik.submitCount > 0
                ? formik.errors.phone
                : null
            }
          />
          
          <Input
            label="Adresse:"
            name="adresse"
            value={formik.values.adresse}
            onChange={formik.handleChange}
            readOnly={!isEditing}
          />
          
          {/* Sélecteur de Rôle - comme dans le formulaire d'ajout */}
          {canEditRole ? (
            <SelectInput
              label="Rôle"
              name="role"
              loading={loadingRoles}
              placeholder="Sélectionnez un rôle"
              options={getRoleOptions()}
              value={formik.values.role}
              onChange={(value) => formik.setFieldValue('role', value)}
              onBlur={() => formik.setFieldTouched('role', true)}
              error={
                formik.touched.role || formik.submitCount > 0
                  ? formik.errors.role
                  : null
              }
              submitted={formik.submitCount > 0}
              disabled={!isEditing}
            />
          ) : (
            <Input
              label="Rôle:"
              name="role"
              value={
                formik.values.role == 1
                  ? 'Super Admin'
                  : formik.values.role == 2
                  ? 'Admin'
                  : formik.values.role == 3
                  ? 'Commercial'
                  : formik.values.role == 5 
                  ? 'Notaire'
                  : formik.values.role == 6
                  ? 'Responsable Livraison'
                  : formik.values.role == 7
                  ? 'Comptable'
                  : formik.values.role == 8
                  ? 'Service Après-Vente'
                  : formik.values.role === 9
                  ? 'Responsable Commercial'
                  : formik.values.role === 10
                  ? 'Agent de saisie'
                  : 'Utilisateur' 
              }
              readOnly
            />
          )}
          
          {/* Le reste de vos champs (Genre, Statut, Fonction, etc.) */}
          <SelectInput
            label="Genre"
            name="gender"
            options={[
              { label: 'Homme', value: 'homme' },
              { label: 'Femme', value: 'femme' },
            ]}
            value={formik.values.gender}
            onChange={(value) => formik.setFieldValue('gender', value)}
            disabled={!isEditing}
            required={isEditing}
            error={
              formik.touched.gender || formik.submitCount > 0
                ? formik.errors.gender
                : null
            }
          />
          <SelectInput
            label="Statut"
            name="is_actif"
            options={[
              { label: 'Actif', value: '1' },
              { label: 'Inactif', value: '0' },
            ]}
            value={formik.values.is_actif}
            onChange={(value) => formik.setFieldValue('is_actif', value)}
            disabled={!isEditing}
          />
          <Input
            label="Fonction:"
            name="fonction"
            value={formik.values.fonction}
            onChange={formik.handleChange}
            readOnly={!isEditing}
          />
          <Input
            label="Date embauche:"
            type='date'
            name="date_embauche"
            value={formik.values.date_embauche}
            onChange={formik.handleChange}
            readOnly={!isEditing}
          />
          <Input
            label="CIN:"
            name="cin"
            value={formik.values.cin}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldTouched('cin', true, false);
            }}
            readOnly={!isEditing}
            required={false}
            error={
              formik.touched.cin || formik.submitCount > 0
                ? formik.errors.cin
                : null
            }
          />
          <Input
            label="CNSS:"
            name="cnss"
            value={formik.values.cnss}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldTouched('cnss', true, false);
            }}
            readOnly={!isEditing}
            required={false}
            error={
              formik.touched.cnss || formik.submitCount > 0
                ? formik.errors.cnss
                : null
            }
          />
          <Input
            label="Solde Congé:"
            name="solde_conge"
            value={formik.values.solde_conge}
            onChange={formik.handleChange}
            type="number"
            readOnly={!isEditing}
          />

          {/* Projects Selection Section */}
          <div className="space-y-3 mb-6 col-span-1 md:col-span-2 xl:col-span-3">
            <label className="block text-sm font-medium text-gray-700">
              Projets 
            </label>
            <SelectInput
              disabled={!isEditing}
              isMulti
              label=""
              placeholder="Sélectionnez des projets"
              options={projetOptions}
              value={selectedProjetIds}
              onChange={handleProjetSelection}
            />

            {/* Display selected projects */}
            {selectedProjects.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Projets sélectionnés ({selectedProjects.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProjects.map((projet) => (
                    <div
                      key={projet.id}
                      className="flex items-center bg-blue-50 rounded-full px-3 py-1 border border-blue-100"
                    >
                      <span className="text-sm text-blue-800">
                        {projet.nom}
                      </span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const updatedIds = selectedProjetIds.filter(
                              (id) => id !== projet.id.toString()
                            );
                            handleProjetSelection(updatedIds);
                          }}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          aria-label={`Retirer ${projet.nom}`}
                        >
                          <XIcon size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-4 mt-8 mr-10">
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-200 !text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-500 text-white py-2 px-6 rounded-lg transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
           
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileContent;
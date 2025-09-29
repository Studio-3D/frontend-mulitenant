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
import { Edit, XIcon } from 'lucide-react';
import LoadingSpin from '../LoadingSpin';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import SelectInput from '../SelectInput';
import DateInput from '../DateInput';

const ProfileContent = ({ userId }) => {
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

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Le nom est requis')
      .min(3, 'Le nom doit comporter au moins 3 caractères'),
    prenom: Yup.string()
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
    phone: Yup.string().matches(
      /^[0-9]{10}$/,
      'Le numéro doit contenir exactement 10 chiffres'
    ),
    cin: Yup.string(),
    cnss: Yup.string(),
    gender: Yup.string().required('Le genre est requis'),
    fonction: Yup.string(),
    date_embauche: Yup.date(),
    solde_conge: Yup.number(),
  });

  // Initialize selected projects from user data when projects are available
 /* useEffect(() => {
    console.log('mmmmm=>')
    if (
      !isInitialized &&
      userData &&
      userData.projets_de_user &&
      projetOptions.length > 0
    ) {
        console.log('=>')
      // Extract project IDs from the full project objects
      const projetIds = userData.projets_de_user.map((projet) =>
        projet.id.toString()
      );
      console.log('fadwaaa==>'+projetIds)
    //  setSelectedProjetIds(projetIds);

      setIsInitialized(true);
    }
  }, [userData, projetOptions, isInitialized]);*/

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
    },
    validationSchema,
    onSubmit: async (values) => {
      // Validate that at least one project is selected
      /*if (selectedProjetIds.length === 0) {
        setDisplay_Errors_projets(true);
        return;
      } else {
        setDisplay_Errors_projets(false);
      }*/

      const formToSend = new FormData();

      // Add all form values
      for (const key in values) {
        const value = values[key];
        if (value !== undefined && value !== null && value !== '') {
          formToSend.append(key, value);
        }
      }

      // Add selected projects
     // Create a comma-separated string of project IDs
      const selectedProjetsString = selectedProjetIds.join(',');
      formToSend.append('selectedProjets', selectedProjetsString);
      // Add the image file if selected
      if (selectedFile) {
        formToSend.append('photo', selectedFile);
      }

      try {
        await axios.post(`${APIURL.UTILISATEURS}/${userId}`, formToSend, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        toast.success('Profil modifié avec succès');
        setIsEditing(false);

       if (searchParams.get('edit')) {
          router.push('/Utilisateurs');
        }
      } catch (error) {
        toast.error("Une erreur s'est produite, Veuillez réessayer.");
        console.error(error);
      }
    },
    validateOnChange: true,
    validateOnBlur: false,
  });

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
          role: data.role || '',
          is_actif: data.is_actif?.toString() || '1',
          fonction: data.fonction || '',
          date_embauche: data.date_embauche || '',
          cin: data.cin || '',
          cnss: data.cnss || '',
          solde_conge: data.solde_conge?.toString() || '',
          selected_projets: data.projets_de_user || [],
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
    /*if (display_errors_projets) {
      setDisplay_Errors_projets(false);
    }*/
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
      router.push('/Utilisateurs');
    } else {
      formik.resetForm();
      setIsEditing(false);

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

  // Get selected projects for display
  const selectedProjects = getSelectedProjects();

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

            <div
              className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Edit className="text-gray-600 text-lg" />
            </div>
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
                : 'Utilisateur'}
            </div>
          </div>
        </div>

        {/* Top Modifier Button */}
        {!isEditing && !searchParams.get('edit') && (
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
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldTouched('email', true, false);
            }}
            type="email"
            readOnly={!isEditing}
            required={isEditing}
            error={
              formik.touched.email || formik.submitCount > 0
                ? formik.errors.email
                : null
            }
          />
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
          <Input
            label="Role:"
            name="role"
            value={
              formik.values.role === 1
                ? 'Super Admin'
                : formik.values.role === 2
                ? 'Admin'
                : formik.values.role === 3
                ? 'Commercial'
                : 'Utilisateur'
            }
            readOnly
          />
          <SelectInput
            label="Genre"
            name="gender"
            options={[
              { label: 'Homme', value: 'homme' },
              { label: 'Femme', value: 'femme' },
            ]}
            value={formik.values.gender}
            onChange={(value) => formik.setFieldValue('gender', value)}
            readOnly={!isEditing}
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
            readOnly={!isEditing}
          />
          <Input
            label="Fonction:"
            name="fonction"
            value={formik.values.fonction}
            onChange={formik.handleChange}
            readOnly={!isEditing}
          />
          <DateInput
            label="Date embauche:"
            name="date_embauche"
            value={formik.values.date_embauche}
            onChange={(date) => formik.setFieldValue('date_embauche', date)}
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
              isMulti
              label=""
              placeholder="Sélectionnez des projets"
              options={projetOptions}
              value={selectedProjetIds}
              onChange={handleProjetSelection}
              /*error={
                display_errors_projets
                  ? 'Veuillez sélectionner au moins un projet'
                  : null
              }
              submitted={display_errors_projets}*/
              
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
            {/*display_errors_projets && (
              <div className="text-red-500 text-sm mt-1">
                {'Veuillez sélectionner au moins un projet'}
              </div>
            )*/}
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
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ProfileContent;

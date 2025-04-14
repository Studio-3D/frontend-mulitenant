'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { APIURL } from '../../../../configs/api';
import { useSociete } from "../../../../context/SocieteContext";
import { useAuth } from "../../../../context/AuthContext";
import { RiEditLine } from "react-icons/ri";
import Input from "../../../../components/Input";
import SelectInput from "../../../../components/SelectInput";
import DateInput from "../../../../components/DateInput";
import { GrFormView, GrFormViewHide} from "react-icons/gr";



const Page = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedSociete } = useSociete();
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  useEffect(() => {
    if (user?.role === 1) {
      fetchSocietes();
    }
  }, [user]);

  const fetchSocietes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(APIURL.SOCIETES, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSocietes(response.data.societes || []);
    } catch (error) {
      toast.error("Erreur lors de la récupération des sociétés");
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Le nom est requis'),
    prenom: Yup.string().required('Le prénom est requis'),
    email: Yup.string()
      .trim()
      .email("Email invalide")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Format d'email invalide"
      )
      .notOneOf(["test@test.com", "example@example.com"], "Cet email est interdit")
      .required("L'email est requis"),
    role: Yup.string().required('Le rôle est requis'),
    gender: Yup.string().required('Le genre est requis'),
    phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Le numéro doit contenir exactement 10 chiffres') // Match exactly 10 digits
    .required('Le téléphone est requis'),
    cin: Yup.string().required('CIN est requis'),
    fonction: Yup.string(),
    date_embauche: Yup.date(),
    password: Yup.string()
    .min(8, '• Au moins 8 caractères')
    .matches(/^(?=.*[A-Z])/, '• Au moins une majuscule')
    .matches(/^(?=.*[0-9])/, '• Au moins un chiffre')
    .matches(/^(?=.*[@$!%*?&])/, '• Au moins un caractère spécial')
    .required('Mot de passe requis'),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Les mots de passe ne correspondent pas')
      .required('Confirmation du mot de passe requise'),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      prenom: '',
      email: '',
      adresse: '',
      photo: null,
      role: '',
      password: '',
      password_confirmation: '',
      societe_id: selectedSociete?.id || '',
      gender: '',
      phone: '',
      cin: '',
      fonction: '',
      date_embauche: '',
      niveau_etude: '',
      cnss: '',
      is_actif: '1',
      solde_conge: '',
    },
    validationSchema, // Your Yup validation schema
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          toast.error("Token manquant. Veuillez vous reconnecter.");
          setLoading(false);
          return;
        }
  
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          if (values[key] !== null && values[key] !== "") {
            formData.append(key, values[key]);
          }
        });
  
        const response = await axios.post(APIURL.UTILISATEURS, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Utilisateur ajouté avec succès");
        router.push("/Utilisateurs");
      } catch (error) {
        toast.error(error.response?.data?.message || "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    },
    validateOnChange: false, // Disable validation on input changes
    validateOnBlur: false,   // Disable validation on blur events
  });
  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux. Taille maximale : 5 Mo");
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error("Type de fichier invalide. Formats acceptés : JPEG ou PNG");
        return;
      }
      setImageFileUrl(URL.createObjectURL(file));
      formik.setFieldValue('photo', file);
    }
  };

  return (
    <div className='flex justify-center mt-2 bg-white h-[89vh] shadow-md rounded-lg p-4 overflow-auto'>
      <div className='flex flex-col gap-4 items-center w-full'>
        <h1 className='text-2xl font-semibold mt-2'>Ajouter un utilisateur</h1>
        <form onSubmit={formik.handleSubmit} className='flex flex-col items-center w-full'>
          <input type='file' accept='image/*' onChange={handleImageChange} ref={fileInputRef} className='hidden' />
          <div className='relative w-32 h-32 mt-6 cursor-pointer' onClick={() => fileInputRef.current?.click()}>
            <img
              src={imageFileUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
              alt="User avatar"
              className="w-full h-full rounded-full object-cover border-8 border-gray-100 shadow-md"
            />
            <div className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md">
              <RiEditLine className="text-gray-600 text-lg" />
            </div>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 md:gap-y-3 gap-y-4 p-4 '>
            <Input label='Nom :' type='text' name="name" required value={formik.values.name} onChange={formik.handleChange} {...formik.getFieldProps('name')} error={formik.errors.name} />
            <Input label='Prénom :' type='text' name="prenom" required value={formik.values.prenom} onChange={formik.handleChange} {...formik.getFieldProps('prenom')} error={formik.errors.prenom}/>
            <Input label='Email :' type='email' name="email" required value={formik.values.email} onChange={formik.handleChange} {...formik.getFieldProps('email')} error={formik.errors.email}/>
            <SelectInput 
              label="Rôle" 
              name="role"
              placeholder="Sélectionnez un rôle"
              options={[
                ...(user?.role === 1 && !selectedSociete ? [{ label: 'Super Admin', value: '1' }] : []),
                { label: 'Admin', value: '2' },
                { label: 'Commercial', value: '3' }
              ]}
              value={formik.values.role} // Directly link the value from Formik
              onChange={(value) => formik.setFieldValue("role", value)} // Handle change via setFieldValue
              error={formik.errors.role} // Show validation error
            />

            <SelectInput
              label="Société"
              name="societe_id"
              placeholder="Sélectionnez une société"
              options={societes.map(societe => ({ label: societe.raison_sociale, value: societe.id }))}
              value={formik.values.societe_id}
              onChange={(value) => formik.setFieldValue("societe_id", value)}
            />
            <SelectInput 
              label="Genre" 
              name="gender"
              placeholder="Sélectionnez un genre"
              options={[{ label: 'Homme', value: '1' }, { label: 'Femme', value: '2' }]}
              value={formik.values.gender} // Explicitly set the value
              onChange={(value) => formik.setFieldValue("gender", value)} // Handle change with Formik
              error={formik.errors.gender} // Show error if validation fails
            />
            <Input label='Téléphone' type='text' name="phone" value={formik.values.phone} onChange={formik.handleChange} {...formik.getFieldProps('phone')} error={formik.errors.phone} />
            <Input label="CIN" type="text" name="cin" value={formik.values.cin} onChange={formik.handleChange} {...formik.getFieldProps('cin')} error={formik.errors.cin}/>
            <DateInput
              label="Date d'embauche"
              name="date_embauche"
              value={formik.values.date_embauche} // Pass Formik's value
              onChange={(date) => formik.setFieldValue("date_embauche", date)} // Update Formik value
              error={formik.errors.date_embauche} // Pass validation error
            />
            <SelectInput
              label="Niveau d'étude"
              name="niveau_etude"
              placeholder="Sélectionnez un niveau d'étude"
              options={[
                { label: 'Bac', value: '1' },
                { label: 'Bac+2', value: '2' },
                { label: 'Bac+3', value: '3' },
                { label: 'Bac+5', value: '4' },
                { label: 'Bac+8', value: '5' }
              ]}
              value={formik.values.niveau_etude}
              onChange={(value) => formik.setFieldValue("niveau_etude", value)}
            />
            <Input label='Adresse' type='text' name="adresse" value={formik.values.adresse} onChange={formik.handleChange} />
            <Input label='CNSS' type='text' name="cnss" value={formik.values.cnss} onChange={formik.handleChange} />
            <SelectInput
              label="Actif"
              name="is_actif"
              placeholder="Sélectionnez un statut"
              options={[
                { label: 'Actif', value: '1' },
                { label: 'Inactif', value: '0' }
              ]}
              value={formik.values.is_actif} // Use formik.values.is_actif
              onChange={(value) => formik.setFieldValue("is_actif", value)} // Use formik.setFieldValue
              error={formik.errors.is_actif} // Add error for validation
            />
            <Input label="Fonction" type="text" name="fonction" 
            value={formik.values.fonction}
            onChange={formik.handleChange}
            error={formik.errors.fonction} />
            <Input label="Solde de congé" type="number" name="solde_conge" value={formik.values.solde_conge} onChange={formik.handleChange} />
            {/* password input with toggle view hide */}
            <Input label="Mot de passe" type={showPassword ? "text" : "password"} name="password" 
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.errors.password}>
            {showPassword ? (
                <GrFormViewHide
                  className="w-6 h-6 text-gray-600"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <GrFormView
                  className="w-6 h-6 text-gray-500"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </Input>
            {/* confirm password input with toggle view hide */}
            <Input label="Confirmer le mot de passe" type={showPasswordConfirmation ? "text" : "password"} name="password_confirmation" 
            value={formik.values.password_confirmation}
            onChange={formik.handleChange}
            error={formik.errors.password_confirmation}>
            {showPasswordConfirmation ? (
                <GrFormViewHide
                  className="w-6 h-6 text-gray-600"
                  onClick={() => setShowPasswordConfirmation(false)}
                />
              ) : (
                <GrFormView
                  className="w-6 h-6 text-gray-500"
                  onClick={() => setShowPasswordConfirmation(true)}
                />
              )}
            </Input>
            
          </div>
          <div className="flex gap-4 items-center mt-6 mb-6">
            <button type="button" className="bg-gray-400 text-white font-medium rounded-lg px-6 py-2" onClick={() => router.push('/Utilisateurs')}>Annuler</button>
            <button type="submit" className={`bg-[#2D8548] text-white font-medium rounded-lg px-6 py-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={loading}>
              {loading ? 'Ajout en cours...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
);

};

export default Page;
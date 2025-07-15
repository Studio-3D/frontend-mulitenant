'use client';
import React, { useState, useRef } from 'react';
import axios from "axios";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Pencil } from "lucide-react";
import Input from "../../../../components/Input";
import { APIURL } from '../../../../configs/api';
import { useSociete } from "../../../../context/SocieteContext"; 

const Page = () => {
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { refreshSocietes } = useSociete();

  // Formik configuration
  const formik = useFormik({
    initialValues: {
      raison_sociale: '',
      nom_contact: '',
      prenom_contact: '',
      email: '',
      tel: '',
      adresse: '',
      registre_commerce: '',
      id_fiscal: '',
      capital: '',
      logo: null, // expecting the file to be stored under 'logo'
    },
    validationSchema: Yup.object({
      raison_sociale: Yup.string().required("Raison sociale est obligatoire"),
      nom_contact: Yup.string().required("Nom est obligatoire").min(3, "Nom doit contenir au moins 3 caractères"),
      prenom_contact: Yup.string().required("Prénom est obligatoire").min(3, "Prénom doit contenir au moins 3 caractères"),
      email: Yup.string().email("Email invalide").required("Email est obligatoire"),
      tel: Yup.string().required("Téléphone est obligatoire").min(10, "Téléphone doit contenir au moins 10 caractères").max(15, "Téléphone ne doit pas dépasser 15 caractères"),
      adresse: Yup.string().required("Adresse est obligatoire"),
      registre_commerce: Yup.number().required("Registre de commerce est obligatoire"),
      id_fiscal: Yup.number().required("ID Fiscal est obligatoire"),
      capital: Yup.number().required("Capital est obligatoire"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const formData = new FormData();
        for (const key in values) {
          if (values[key]) {
            formData.append(key, values[key]);
          }
        }

        const token = window.localStorage.getItem('accessToken');
        await axios.post(`${APIURL.SOCIETES}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Société ajoutée avec succès");
        resetForm();
        setImageFileUrl(null);
        refreshSocietes();
        router.push('/Societes');
      } catch (error) {
        toast.error("Une erreur s'est produite");
      } finally {
        setLoading(false);
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Handle image upload
  const handleImageChange = (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux. Taille maximale : 5 Mo");
        return;
      }
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        toast.error("Type de fichier invalide. Formats acceptés : JPEG ou PNG");
        return;
      }

      setImageFileUrl(URL.createObjectURL(file));
      // Use the same key as defined in initialValues
      formik.setFieldValue('logo', file);
    } catch (error) {
      toast.error("Une erreur s'est produite lors de l'upload de l'image.");
    }
  };

  return (
    <div className='flex justify-center mt-2 bg-white h-[89vh] rounded-lg p-4 overflow-auto'>
      <div className='flex flex-col gap-4 items-center w-full'>
        <h1 className='text-2xl font-semibold mt-2'>Ajouter une Société</h1>
        <form className='flex flex-col items-center w-[400px] md:w-[800px] gap-4' onSubmit={formik.handleSubmit}>
          {/* Image Upload */}
          <input type='file' accept='image/*' onChange={handleImageChange} ref={fileInputRef} className='hidden' />
          <div className='relative w-32 h-32 mt-2 cursor-pointer' onClick={() => fileInputRef.current?.click()}>
            <img
              src={imageFileUrl || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
              alt="User avatar"
              className="w-full h-full rounded-full object-cover border-8 border-gray-100 shadow-md"
            />
            <div className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md">
              <Pencil className="text-gray-600 w-5 h-5" />
            </div>
          </div>
  
          {/* Separator */}
          <div className='w-full border-t-2 border-gray-300 mt-1'></div>
  
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-center gap-y-4 md:gap-y-4">
            <Input
              label="Raison Sociale"
              name="raison_sociale"
              type="text"
              value={formik.values.raison_sociale}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.raison_sociale && formik.errors.raison_sociale}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && formik.errors.email}
              required
            />
            <Input
              label="Nom"
              name="nom_contact"
              type="text"
              value={formik.values.nom_contact}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.nom_contact && formik.errors.nom_contact}
              required
            />
            <Input
              label="Prénom"
              name="prenom_contact"
              type="text"
              value={formik.values.prenom_contact}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.prenom_contact && formik.errors.prenom_contact}
              required
            />
            <Input
              label="Téléphone"
              name="tel"
              type="text"
              value={formik.values.tel}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.tel && formik.errors.tel}
            />
            <Input
              label="Adresse"
              name="adresse"
              type="text"
              value={formik.values.adresse}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.adresse && formik.errors.adresse}
            />
            <Input
              label="Registre de Commerce"
              name="registre_commerce"
              type="text"
              value={formik.values.registre_commerce}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.registre_commerce && formik.errors.registre_commerce}
            />
            <Input
              label="ID Fiscal"
              name="id_fiscal"
              type="text"
              value={formik.values.id_fiscal}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.id_fiscal && formik.errors.id_fiscal}
            />
            <Input
              label="Capital"
              name="capital"
              type="text"
              value={formik.values.capital}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.capital && formik.errors.capital}
            />
          </div>
  
          {/* Buttons */}
          <div className='flex gap-4 mt-2'>
            <button
              type="button"
              className='bg-gray-400 text-white px-4 py-2 rounded-md'
              onClick={() => router.push('/Societes')}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`bg-[#2D8548] text-white font-medium rounded-lg px-6 py-2 ${
                loading || !formik.dirty ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={loading || !formik.dirty}
            >
              {loading ? 'Ajout en cours...' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;

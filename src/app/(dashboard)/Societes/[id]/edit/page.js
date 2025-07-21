'use client';

import { useState, useEffect } from "react";
import { APIURL, RESOURCE_URL } from '@/configs/api';
import axios from 'axios';
import { AvatarUpload } from "@/components/Societes/AvatarUpload";
import { BuildingIcon, SparklesIcon } from 'lucide-react';
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import ButtonSpinner from "@/components/ButtonSpinner";
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function UpdateSociete() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const [societe, setSociete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedLogo, setSelectedLogo] = useState(null);

    // Formik configuration with validation
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
            logo: null,
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
        onSubmit: async (values) => {
            if (!hasChanges(values)) {
                toast.error("Aucune modification détectée.");
                return;
            }

            setIsSubmitting(true);
            const accessToken = localStorage.getItem('accessToken');

            const formToSend = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    formToSend.append(key, value);
                }
            });

            if (selectedLogo) {
                formToSend.append('logo', selectedLogo);
            }

            try {
                await axios.post(`${APIURL.SOCIETES}/${id}?_method=PUT`, formToSend, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'multipart/form-data',
                    },
                });

                toast.success("Informations de l'entreprise mises à jour avec succès.");
                router.push('/Societes');
            } catch (error) {
                toast.error("Erreur lors de la mise à jour des informations de l'entreprise.");
            } finally {
                setIsSubmitting(false);
            }
        },
        validateOnChange: true,
        validateOnBlur: true,
    });

    const hasChanges = (values) => {
        const logoChanged = selectedLogo !== null;
        const fieldsChanged = Object.keys(formik.initialValues).some(
            key => values[key] !== formik.initialValues[key]
        );
        return logoChanged || fieldsChanged;
    };

    useEffect(() => {
        const fetchSocieteById = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                toast.error("Aucun jeton d'accès trouvé.");
                return;
            }

            try {
                const response = await axios.get(`${APIURL.SOCIETES}/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                
                const societeData = response.data.societe;
                setSociete(societeData);
                
                formik.setValues({
                    raison_sociale: societeData.raison_sociale,
                    nom_contact: societeData.nom_contact,
                    prenom_contact: societeData.prenom_contact,
                    email: societeData.email,
                    tel: societeData.tel,
                    adresse: societeData.adresse,
                    registre_commerce: societeData.registre_commerce,
                    id_fiscal: societeData.id_fiscal,
                    capital: societeData.capital,
                    logo: null
                });
            } catch (error) {
                toast.error("Erreur lors de la récupération des informations de l'entreprise.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchSocieteById();
    }, [id]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className='bg-gradient-to-br from-white to-blue-50 w-full mt-2 min-h-[89vh] shadow-md rounded-lg p-12 relative overflow-hidden'>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-50 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-50" />

            <div className="flex items-center gap-3 mb-8">
                <BuildingIcon className="w-8 h-8 !text-blue-500" />
                <h1 className="xl:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Modifier les informations de l'entreprise
                </h1>
            </div>

            <form onSubmit={formik.handleSubmit} className="grid xl:grid-cols-[500px_1fr] gap-12">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-transform hover:scale-[1.02] duration-300">
                        <AvatarUpload
                            currentLogo={
                                societe?.logo
                                ? `${RESOURCE_URL.DOCS}/${societe.raison_sociale_concatene}_${societe.id}/logos/${societe.logo}`
                                : null
                            }
                            onFileChange={setSelectedLogo}
                        />
                        <p className="text-sm !text-gray-500 text-center mt-4">
                            Téléchargez le logo de votre entreprise 
                        </p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center gap-2 !text-blue-500 mb-2">
                            <SparklesIcon className="w-4 h-4" />
                            <h3 className="font-medium">Pro Tip</h3>
                        </div>
                        <p className="text-sm !text-blue-600/80">
                            A professional company profile helps build trust with your customers and partners.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label htmlFor="raison_sociale" className="block text-sm font-medium !text-gray-700 mb-1">
                                Raison Sociale:
                            </label>
                            <input 
                                type="text" 
                                id="raison_sociale" 
                                name="raison_sociale" 
                                value={formik.values.raison_sociale}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.raison_sociale && formik.errors.raison_sociale}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" 
                            />
                        </div>

                        <div>
                            <label htmlFor="nom_contact" className="block text-sm font-medium !text-gray-700 mb-1">
                                Nom:
                            </label>
                            <input 
                                type="text" 
                                id="nom_contact" 
                                name="nom_contact" 
                                value={formik.values.nom_contact}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" 
                            />
                            {formik.touched.nom_contact && formik.errors.nom_contact && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.nom_contact}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="prenom_contact" className="block text-sm font-medium !text-gray-700 mb-1">
                                Prénom:
                            </label>
                            <input 
                                type="text" 
                                id="prenom_contact" 
                                name="prenom_contact" 
                                value={formik.values.prenom_contact}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" 
                            />
                            {formik.touched.prenom_contact && formik.errors.prenom_contact && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.prenom_contact}</p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="adresse" className="block text-sm font-medium !text-gray-700 mb-1">
                                Adresse:
                            </label>
                            <input 
                                type="text" 
                                id="adresse" 
                                name="adresse" 
                                value={formik.values.adresse}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" 
                            />
                            {formik.touched.adresse && formik.errors.adresse && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.adresse}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium !text-gray-700 mb-1">
                                Email:
                            </label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" 
                            />
                            {formik.touched.email && formik.errors.email && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="tel" className="block text-sm font-medium !text-gray-700 mb-1">
                                Téléphone:
                            </label>
                            <input 
                                type="text" 
                                id="tel" 
                                name="tel" 
                                value={formik.values.tel}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" 
                            />
                            {formik.touched.tel && formik.errors.tel && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.tel}</p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <label htmlFor="registre_commerce" className="block text-sm font-medium !text-gray-700 mb-1">
                                Registre de commerce:
                            </label>
                            <input 
                                type="text" 
                                id="registre_commerce" 
                                name="registre_commerce" 
                                value={formik.values.registre_commerce}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" 
                            />
                            {formik.touched.registre_commerce && formik.errors.registre_commerce && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.registre_commerce}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="id_fiscal" className="block text-sm font-medium !text-gray-700 mb-1">
                                ID fiscal:
                            </label>
                            <input 
                                type="text" 
                                id="id_fiscal" 
                                name="id_fiscal" 
                                value={formik.values.id_fiscal}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" 
                            />
                            {formik.touched.id_fiscal && formik.errors.id_fiscal && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.id_fiscal}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="capital" className="block text-sm font-medium !text-gray-700 mb-1">
                                Capital:
                            </label>
                            <input 
                                type="text" 
                                id="capital" 
                                name="capital" 
                                value={formik.values.capital}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200" 
                            />
                            {formik.touched.capital && formik.errors.capital && (
                                <p className="text-red-500 text-xs mt-1">{formik.errors.capital}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-8">
                        <button 
                            type="submit" 
                            disabled={isSubmitting || !hasChanges(formik.values)}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <span>Enregistrement</span>
                                    <ButtonSpinner className='w-6 h-6'/>
                                </div>
                            ) : (
                                "Enregistrer les modifications"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
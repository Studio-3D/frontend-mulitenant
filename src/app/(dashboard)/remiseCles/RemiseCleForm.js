"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation';

// Importez vos composants Input, InputSelect, SelectInput ici
import Input from "@/components/Input";
import SelectInput from "@/components/SelectInput";
import InputSelect from "@/components/inputSelect";
import { useAuth } from "@/context/AuthContext";
import { useProjet } from "@/context/ProjetContext";
import { APIURL, ENDPOINTS, RESOURCE_URL } from "@/configs/api";
import BreadCrumb from "../navigation/BreadCrumb";
import Button from "@/components/Button";
import LoadingSpin from '@/components/LoadingSpin';
import { Grid } from "@mui/material";



const schema = yup.object().shape({
  date_remise: yup.string().required("La Date De Remise est Obligatoire"),
  bien_id: yup.string().required("Le Bien est obligatoire"),
  user_id_remise: yup.string().required("Le Commercial est obligatoire"),
  // Ajoutez d’autres validations si nécessaire
});

const RemiseCleForm = ({ id = null }) => {
  const router = useRouter();
  const { selectedProjet } = useProjet();

  const [biens, setBiens] = useState([]);
  const [cc, setCC] = useState([]);
  const [file, setFile] = useState(null);
  const [backendErrors, setBackendErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const { user } = useAuth();
    const accessToken = localStorage.getItem('accessToken');
 ///const [selectedProjet] = useState({ id: '1', description: 'Salle de Bain' });
  const [formData, setFormData] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState(null);

  const defaultValues = {
    date_remise: "",
    user_id_remise: user?.role === 3 ? user.user_id_origin : "",
    bien_id: "",
    fichier: "",
    bien_prop: "",
    projet_id: selectedProjet?.id || "",
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const isEditing = Boolean(id);

  // Fonction utilitaire pour afficher le nom complet du bien
  

  function NomBienComplet(bien) {
    const noms = [];
  
    if (bien.tranche?.nom) noms.push(bien.tranche.nom);
    if (bien.bloc?.nom) noms.push(bien.bloc.nom);
    if (bien.immeuble?.nom) noms.push(bien.immeuble.nom);
  
    noms.push(bien.propriete_dite_bien);
  
    return noms.join(' - ');
  }

  const fetch_cc = async () => {
  try {
    if (!accessToken) {
      console.warn("Pas de token d'accès");
      return;
    }
    const response = await axios.get(
      `${APIURL.ROOTV1}/commerciaux/${selectedProjet?.id}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
      const { data } = response
      setCC(data.data)  } 
      catch (error) {
    console.error("Erreur fetch_cc:", error);
  }
};

const fetchbiens = async () => {
  try {
    if (!accessToken) {
      console.warn("Pas de token d'accès");
      return;
    }
    setLoading(true);
    const response = await axios.get(
      `${APIURL.ROOTV1}/getBiens_Vendu_ByProjet_Concat/${selectedProjet?.id}/BiensVendu`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    console.log("fetchbiens response:", response.data);
    setBiens(response.data.biens || []);
  } catch (error) {
    console.error("Erreur fetchbiens:", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {

    fetch_cc()
    fetchbiens()
  }, []);
  useEffect(() => {
    
    if (isEditing) {
      setLoadingData(true);
      axios
        .get(`${APIURL.REMISECLES}/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        .then((res) => {
          if (res.status === 200) {
            const remise = res.data.remise;
            setValue("date_remise", remise.date_remise || "");
            setValue("user_id_remise", remise.user_id_remis || "");
            setValue("bien_prop", NomBienComplet(remise.bien) || "");
            setValue("bien_id", remise.bien?.id || "");
            setValue("fichier", remise.fichier || "");
            setExistingFileUrl(remise.fichier)
            setFormData({});

          } else {
            toast.error("Remise clé introuvable");
            router.back();
          }
        })
        .catch(() => {
          toast.error("Erreur lors du chargement de la remise clé");
          router.back();
        })
        .finally(() => setLoadingData(false));
    } else {
      reset(defaultValues);
    }
  }, [id, isEditing, setValue, reset]);
  // Soumission du formulaire
  const onSubmit = async (data) => {
    setLoading(true);
    setBackendErrors({});

    try {
      const formData = new FormData();
      formData.append("date_remise", data.date_remise);
      formData.append("user_id_remise", data.user_id_remise);
      formData.append("bien_id", data.bien_id);
      formData.append("projet_id", data.projet_id);

      if (file) {
        formData.append("fichier", file);
      }

      let url = APIURL.REMISECLES;
      if (isEditing) {
        formData.append("_method", "PATCH");
        url = `${url}/${id}`;
      }

      const res = await axios.post(url, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        toast.success(`Remise Clé ${isEditing ? "modifiée" : "créée"} avec succès`);
        reset(defaultValues);
        router.push(ENDPOINTS.REMISECLES);
      }
    } catch (error) {
      if (error.response?.status === 422) {
        setBackendErrors(error.response.data.errors || {});
        setTimeout(() => setBackendErrors({}), 5000);
      } else {
        toast.error("Une erreur est survenue lors de la soumission");
      }
    } finally {
      setLoading(false);
    }
  };

  // Gestion du changement de fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Exemple de vérification type fichier (images uniquement)
      if (!selectedFile.type.startsWith("image/")) {
        toast.error("Seuls les fichiers images sont acceptés");
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
      setExistingFileUrl(null); // Réinitialiser l'URL de l'ancienne pièce jointe
      setValue("fichier", selectedFile);
    }
  };

    if (isEditing && !formData) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpin /> {/* Use your loading spinner here */}
        </div>
      );
    }
  
    return (
      <>
        <div className="p-3">
          <div className="flex items-center justify-start">
            <BreadCrumb
              baseUrl={ENDPOINTS.REMISECLES}
              step={`${isEditing ? 'Modifier' : 'Ajouter'} Remise Clé`}
            />
          </div>
        </div>
        <div className="p-6 mt-4 bg-white shadow-md rounded-md">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
 
              <Input
                label="Date Remise :"
                name="date_remise"
                type="date"
                value={watch("date_remise")}
                onChange={(e) => setValue("date_remise", e.target.value)}
                required
                error={errors?.date_remise?.message || backendErrors?.date_remise?.[0]}
              />
                <InputSelect
                  label="Bien"
                  name="bien_id"
                  value={watch('bien_id')}
                  onChange={(val) => {
                    setValue('bien_id', val?.value || null);
          
                  }}
                  options={biens.map(s => ({
                    value: s.id,
                    label: NomBienComplet(s)
                  }))}
                  placeholder="Choisir un bien..."
                  isLoading={loading}
                  error={errors?.bien_id}
                  required
                />
          
              {user?.role <= 2 && (

                <InputSelect
                  label="Commercial"
                  name="user_id_remise"
                  value={watch('user_id_remise') || null}
                  onChange={(val) => {
                    setValue('user_id_remise', val?.value || null);
                    console.log(val);
                  }}
                  options={cc?.map(c => ({
                    value: c.user.id,
                    label: `${c.user.prenom} ${c.user.name}`
                  }))}
                  placeholder="Choisir un commercial..."
                  isLoading={loading}
                  error={errors?.user_id_remise}
                  required
                />


              )}
          
                      
            </div>

      <div className="w-full sm:col-span-2 md:col-span-4 mt-4 mb-2 border-t border-gray-300" />
      <div className="mt-6">
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} sm={4}>
                <Input
                  label="Pièce Jointe :"
                  name="fichier"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  onClick={(e) => (e.target.value = null)} // permet de re-sélectionner le même fichier
                  error={errors?.fichier?.message || backendErrors?.fichier?.[0]}
                />
          </Grid>
    <Grid item xs={12} sm={4}>

      {existingFileUrl && (
        <div style={{ marginTop: 8 }}>
          <p style={{ marginBottom: 4, fontSize: 14, color: '#555' }}>
            Pièce jointe actuelle :
          </p>
          <img
            src={`${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remise_cles/${existingFileUrl}`}
            alt="Aperçu pièce jointe"
            style={{
              width: 100,
              height: 100,
              objectFit: 'cover',
              borderRadius: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              cursor: 'pointer',
            }}
            onClick={() =>
              window.open(
                `${RESOURCE_URL.DOCS}/${user?.societe?.raison_sociale_concatene}_${user?.societe?.id}/remise_cles/${existingFileUrl}`,
                '_blank'
              )
            }
            title="Cliquer pour agrandir"
          />
        </div>
      )}
      </Grid>
      </Grid>
      </div>





    

       
              
            
            <div className="flex justify-center gap-4 items-center mt-6 mb-6">
              <Button type="button" onClick={() => router.back()}>
                Annuler
              </Button>
  
              <Button type="submit" >
                Enregistrer
              </Button>
            </div>
          </form>
          
        </div>
      </>
    );
  }


export default RemiseCleForm;

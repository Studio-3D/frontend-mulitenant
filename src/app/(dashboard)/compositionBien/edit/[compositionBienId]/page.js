"use client";
;
import { useState, useEffect, use } from "react";
import { useForm, Controller } from "react-hook-form";
import { APIURL, ENDPOINTS } from "@/configs/api";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "@/components/Button";
import { useParams, useRouter } from "next/navigation";
import BreadCrumb from "@/app/(dashboard)/navigation/BreadCrumb";
import {
  Grid,
  FormControl,
  TextField as TextField1,
  Autocomplete as Autocomplete1,
  MenuItem,
  InputLabel,
  FormHelperText,
  Alert
} from "@mui/material";
import { CIVILITES, getSCodeCivilite } from "@/components/client-utils";
import { fetchDataByProjet } from "@/configs/api-utils";
import { useProjet } from "@/context/ProjetContext";
import TextField from "@/components/Textfield";
import AutocompleteSelectComponent from '@/components/AutocompleteSelectComponent';
import Autocomplete from '@/components/Autocomplete';
import SelectInput from "@/components/SelectInput";
import { encryptUserType, USER_TYPES } from "@/components/user-utils";
import InputSelect from "@/components/inputSelect";
import Input from '@/components/Input';

const CompositionForm = () => {
const { id } = useParams();
    
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [services, setServices] = useState([]);
  const [backendErrors, setBackendErrors] = useState({});
  const router = useRouter();
  const { selectedProjet } = useProjet();
  const [info_client, setInfo_client] = useState(null)

  const [disabled, setDisabled] = useState(false)
  const [disabled_var, setDisabled_var] = useState(false)
  const accessToken = localStorage.getItem("accessToken");

  // Utilisation de react-hook-form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nbre_balcons: 0,
      nbre_buanderies: 0,
      nbre_chambres: 0,
      nbre_cuisines: 0,
      nbre_halls: 0,
      nbre_placards: 0,
      nbre_receptions: 0,
      nbre_salons: 0,
      nbre_sdb: 0,
      nbre_terasses: 0,
    }
  });

  // Load composition data if editing
  useEffect(() => {
    if (id) {
      fetchCompositionData(id);
    }
  }, [id]);

  const fetchCompositionData = async (compositionId) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${APIURL.Compositions}/${compositionId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.data?.composition) {
        const compositionData = response.data.composition;
        // Remplir les champs avec les données de composition
        setValue("nbre_chambres", compositionData.nbre_chambres || "");
        setValue("nbre_salons", compositionData.nbre_salons || "");
        setValue("nbre_sdb", compositionData.nbre_sdb || "");
        setValue("nbre_cuisines", compositionData.nbre_cuisines || "");
        setValue("nbre_halls", compositionData.nbre_halls || "");
        setValue("adresse", compositionData.adresse || "");
        setValue("nbre_terasses", compositionData.nbre_terasses || "");
        setValue("nbre_buanderies", compositionData.nbre_buanderies || "");
        setValue("nbre_placards", compositionData.nbre_placards || "");
        setValue("nbre_receptions", compositionData.nbre_receptions || "");
        setValue("nbre_balcons", compositionData.nbre_balcons || "");
      }
    } catch (error) {
      console.error("Error fetching composition data:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

 

  const onSubmit = async (data) => {
    setSubmitting(true);

    try {
      let url = APIURL.COMPOSITIONBIENS;
      let method = "post";

      if (id) {
        url = `${url}/${id}`;
        method = "put";
      }

      const response = await axios({
        method,
        url,
        data,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success(
        id
          ? "Composition modifié avec succès"
          : "Composition ajouté avec succès"
      );
      setTimeout(() => router.back(), 300);
    } catch (error) {
      console.error("Error submitting form:", error);

      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors || {};
        setBackendErrors(backendErrors);
        Object.values(backendErrors).forEach((errorArray) => {
          errorArray.forEach((message) => toast.error(message));
        });
      } else {
        toast.error("Erreur lors de l'enregistrement");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Ajoute ça dans PrestataireForm.jsx




  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
<div className="p-3">
 
  
  <div className="flex items-center justify-start">
    <BreadCrumb
      baseUrl={ENDPOINTS.COMPOSITIONBIENS}
      step={`${id ? "Modifier" : "Ajouter"} un prestataire`}
    />
  </div>

  <div className="p-6 mt-4 bg-white shadow-md rounded-md">
  
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">

      

  <Input
  label="Nombre de balcons"
  name="nbre_balcons"
  value={watch('nbre_balcons') || ''}
  onChange={(e) => setValue('nbre_balcons', e.target.value)}
  required
  error={errors?.nbre_balcons?.message || backendErrors?.nbre_balcons?.[0]}
/>

<Input
  label="Nombre de buanderies"
  name="nbre_buanderies"
  value={watch('nbre_buanderies')}
  onChange={(e) => setValue('nbre_buanderies', e.target.value)}
  required
  error={errors?.nbre_buanderies?.message || backendErrors?.nbre_buanderies?.[0]}
/>

<Input
  label="Nombre de chambres"
  name="nbre_chambres"
  type="number"
  value={watch('nbre_chambres')}
  onChange={(e) => setValue('nbre_chambres', e.target.value)}
  error={errors?.nbre_chambres?.message || backendErrors?.nbre_chambres?.[0]}
/>

<Input
  label="Nombre de cuisines"
  name="nbre_cuisines"
  value={watch('nbre_cuisines')}
  onChange={(e) => setValue('nbre_cuisines', e.target.value)}
  error={errors?.nbre_cuisines?.message || backendErrors?.nbre_cuisines?.[0]}
/>

<Input
  label="Nombre de halls"
  name="nbre_halls"
  value={watch('nbre_halls')}
  onChange={(e) => setValue('nbre_halls', e.target.value)}
  error={errors?.nbre_halls?.message || backendErrors?.nbre_halls?.[0]}
/>

<Input
  label="Nombre de placards"
  name="nbre_placards"
  value={watch('nbre_placards')}
  onChange={(e) => setValue('nbre_placards', e.target.value)}
  error={errors?.nbre_placards?.message || backendErrors?.nbre_placards?.[0]}
/>

<Input
  label="Nombre de réceptions"
  name="nbre_receptions"
  value={watch('nbre_receptions')}
  onChange={(e) => setValue('nbre_receptions', e.target.value)}
  error={errors?.nbre_receptions?.message || backendErrors?.nbre_receptions?.[0]}
/>

<Input
  label="Nombre de salons"
  name="nbre_salons"
  value={watch('nbre_salons')}
  onChange={(e) => setValue('nbre_salons', e.target.value)}
  error={errors?.nbre_salons?.message || backendErrors?.nbre_salons?.[0]}
/>

<Input
  label="Nombre de salles de bain"
  name="nbre_sdb"
  value={watch('nbre_sdb')}
  onChange={(e) => setValue('nbre_sdb', e.target.value)}
  error={errors?.nbre_sdb?.message || backendErrors?.nbre_sdb?.[0]}
/>

<Input
  label="Nombre de terrasses"
  name="nbre_terasses"
  value={watch('nbre_terasses')}
  onChange={(e) => setValue('nbre_terasses', e.target.value)}
  error={errors?.nbre_terasses?.message || backendErrors?.nbre_terasses?.[0]}
/>

      </div>

      <div className="flex justify-center gap-4 items-center mt-6 mb-6">
        <Button
          type="button"
          onClick={() => router.back()}
          customColor="gray"
        >
          Quitter
        </Button>
        <Button
          type="submit"
          customColor="blue"
          variant="contained"
          disabled={submitting || loading||disabled}
        >
          {submitting ? "Chargement..." : id ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </form>
  </div>
</div>


  );
};

export default CompositionForm;

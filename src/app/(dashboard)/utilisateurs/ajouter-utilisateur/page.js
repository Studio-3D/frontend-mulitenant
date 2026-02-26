'use client';
import React, { useState, useRef, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { APIURL } from "../../../../configs/api";
import { useSociete } from "../../../../context/SocieteContext";
import { useAuth } from "../../../../context/AuthContext";
import { Pencil, Eye, EyeOff } from "lucide-react";
import Input from "../../../../components/Input";
import SelectInput from "../../../../components/SelectInput";
import DateInput from "../../../../components/DateInput";
import { EDUCATION_LEVELS, GENDERS } from "@/components/user-utils";

const Page = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedSociete } = useSociete();
  const [societes, setSocietes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFileUrl, setImageFileUrl] = useState(null);
  const fileInputRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);
  const [roles, setRoles] = useState([]);
  const [loading_roles, setLoading_roles] = useState(false);

  useEffect(() => {
    if (user?.role === 1) {
      fetchSocietes();
    }
  }, [user]);



  // Dans votre Page.jsx

const fetchRoles = async (societeId) => {
  setLoading_roles(true);
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${APIURL.GESTION_ROLES_ACTIVES}/${societeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRoles(response.data.roles || []);
    setLoading_roles(false);

  } catch (error) {
    console.error('Error fetching roles:', error);
    toast.error('Failed to load roles');
  } finally {
    setLoading_roles(false);
  }
};

   useEffect(() => {
        if (
          user.role!=1 
        ) {
          router.push('/');
        }
      }, [user, router]);
// Utilisation - appeler fetchRoles avec le societe_id
useEffect(() => {
  if (selectedSociete?.id) {
    fetchRoles(selectedSociete.id);
  }
}, [selectedSociete?.id]); // Rafraîchir quand la société change


  const fetchSocietes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.get(APIURL.SOCIETES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSocietes(response.data.societes || []);
    } catch (error) {
      toast.error("Erreur lors de la récupération des sociétés");
    }
  };

  // Fonction pour obtenir les options de rôles
  const getRoleOptions = () => {
    // Rôles par défaut (toujours disponibles)
    const defaultRoles = [
      ...(user?.role === 1 && !selectedSociete
        ? [{ label: "Super Admin", value: "1" }]
        : []),
      { label: "Admin", value: "2" },
      { label: "Commercial", value: "3" },
    ];

    // Si aucun rôle supplémentaire n'est configuré, retourner seulement les rôles par défaut
    if (!roles || roles.length === 0) {
      return defaultRoles;
    }

    // Mapper les rôles dynamiques depuis l'API
    const dynamicRoles = roles
      .filter(role => {
        // Exclure les rôles déjà dans les rôles par défaut (1, 2, 3)
        const roleValue = parseInt(role.role);
        return ![1, 2, 3].includes(roleValue);
      })
      .map(role => {
        const roleValue = parseInt(role.role);
        let label = '';
        
        // Mapper les valeurs aux labels correspondants
        switch(roleValue) {
          case 6:
            label = 'Responsable Livraison';
            break;
          case 5:
            label = 'Notaire';
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
            label = 'Agent Administratif';
            break;
          default:
            label = `Rôle ${roleValue}`;
        }
        
        return {
          label,
          value: role.role.toString(),
        };
      });

    // Combiner les rôles par défaut avec les rôles dynamiques
    return [...defaultRoles, ...dynamicRoles];
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required("Le nom est requis")
      .min(3, "Le nom doit comporter au moins 3 caractères"),
    prenom: Yup.string()
      .required("Le prénom est requis")
      .min(3, "Le prénom doit comporter au moins 3 caractères"),
    email: Yup.string()
      .trim()
      .required("L'email est requis")
      .max(254, "L'email ne doit pas dépasser 254 caractères")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Veuillez entrer une adresse email valide"
      )
      .test(
        "no-spaces",
        "L'email ne doit pas contenir d'espaces",
        (value) => !/\s/.test(value)
      )
      .test("valid-domain", "Domaine email non valide", (value) => {
        if (!value) return true;
        const domain = value.split("@")[1];
        return domain && domain.includes(".");
      })
      .test(
        "no-special-chars",
        "L'email contient des caractères spéciaux non autorisés",
        (value) => {
          if (!value) return true;
          return /^[a-zA-Z0-9._%+-@]+$/.test(value.split("@")[0]);
        }
      )
      .lowercase(),
    role: Yup.string().required("Le rôle est requis"),
    gender: Yup.string().required("Le genre est requis"),
    phone: Yup.string()
      .min(10, "Téléphone doit contenir au moins 10 caractères")
      .max(15, "Téléphone ne doit pas dépasser 15 caractères"),
    cin: Yup.string(),
    cnss: Yup.string(),
    fonction: Yup.string(),
    date_embauche: Yup.date(),
    password: Yup.string()
      .min(8, "• Au moins 8 caractères")
      .required("Mot de passe requis"),
    password_confirmation: Yup.string()
      .oneOf(
        [Yup.ref("password"), null],
        "Les mots de passe ne correspondent pas"
      )
      .required("Confirmation du mot de passe requise"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      prenom: "",
      email: "",
      adresse: "",
      photo: null,
      role: "",
      password: "",
      password_confirmation: "",
      societe_id: selectedSociete?.id || "",
      gender: "",
      phone: "",
      cin: "",
      fonction: "",
      date_embauche: "",
      niveau_etude: "",
      cnss: "",
      is_actif: "1",
      solde_conge: "",
    },
    validationSchema,
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
        router.push("/utilisateurs");
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Une erreur est survenue."
        );
      } finally {
        setLoading(false);
      }
    },
    validateOnChange: true,
    validateOnBlur: false,
  });
// OU si vous avez formik.values.societe_id
useEffect(() => {
  if (formik?.values?.societe_id) {
    fetchRoles(formik?.values?.societe_id);
  }
}, [formik?.values?.societe_id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux. Taille maximale : 5 Mo");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Type de fichier invalide. Formats acceptés : JPEG ou PNG");
        return;
      }
      setImageFileUrl(URL.createObjectURL(file));
      formik.setFieldValue("photo", file);
    }
  };

  return (
    <div className="flex justify-center mt-2 bg-white min-h-[89vh] shadow-md rounded-lg p-4 overflow-auto">
      <div className="flex flex-col gap-4 items-center w-full">
        <h1 className="text-2xl font-semibold mt-2">Ajouter un utilisateur</h1>
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col items-center w-full"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="hidden"
          />
          <div
            className="relative w-32 h-32 mt-6 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <img
              src={
                imageFileUrl ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              alt="User avatar"
              className="w-full h-full rounded-full object-cover border-8 border-gray-100 shadow-md"
            />
            <div className="absolute top-1 right-1 bg-white p-1 rounded-full shadow-md">
              <Pencil className="text-gray-600 w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 md:gap-y-3 gap-y-4 p-4 ">
            <Input
              label="Nom :"
              type="text"
              name="name"
              value={formik.values.name}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldTouched("name", true, false);
              }}
              onBlur={formik.handleBlur}
              error={
                formik.touched.name || formik.submitCount > 0
                  ? formik.errors.name
                  : null
              }
            />
            <Input
              label="Prénom :"
              type="text"
              name="prenom"
              value={formik.values.prenom}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldTouched("prenom", true, false);
              }}
              onBlur={formik.handleBlur}
              error={
                formik.touched.prenom || formik.submitCount > 0
                  ? formik.errors.prenom
                  : null
              }
            />
            <Input
              label="Email :"
              type="email"
              name="email"
              placeholder={"exemple@gmail.com"}
              value={formik.values.email}
              onChange={(e) => {
                formik.handleChange(e);
                formik.setFieldTouched("email", true, false);
              }}
              onBlur={formik.handleBlur}
              error={
                formik.touched.email || formik.submitCount > 0
                  ? formik.errors.email
                  : null
              }
            />
            <SelectInput
              label="Rôle"
              name="role"
              loading={loading_roles}
              placeholder="Sélectionnez un rôle"
              options={getRoleOptions()}
              value={formik.values.role}
              onChange={(value) => formik.setFieldValue("role", value)}
              onBlur={() => formik.setFieldTouched("role", true)}
              error={
                formik.touched.role || formik.submitCount > 0
                  ? formik.errors.role
                  : null
              }
              submitted={formik.submitCount > 0}
            />

            <SelectInput
              label="Société"
              name="societe_id"
              placeholder="Sélectionnez une société"
              options={societes.map((societe) => ({
                label: societe.raison_sociale,
                value: societe.id,
              }))}
              value={formik.values.societe_id}
              onChange={(value) => formik.setFieldValue("societe_id", value)}
              error={formik.errors.societe_id}
            />
            <SelectInput
              label="Genre"
              name="gender"
              placeholder="Sélectionnez un genre"
              options={Object.values(GENDERS).map(({ code, label }) => ({
                value: code,
                label,
              }))}
              value={formik.values.gender}
              onChange={(value) => formik.setFieldValue("gender", value)}
              onBlur={() => formik.setFieldTouched("gender", true)}
              error={
                formik.touched.gender || formik.submitCount > 0
                  ? formik.errors.gender
                  : null
              }
              submitted={formik.submitCount > 0}
            />

            <Input
              label="Téléphone"
              type="text"
              name="phone"
              value={formik.values.phone}
              placeholder={"Ex: 0612345678"}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/[^0-9]/g, "");
                formik.setFieldValue("phone", numericValue);
              }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              error={formik.errors.phone}
              inputMode="numeric"
              pattern="[0-9]*"
            />
            <Input
              label="CIN"
              type="text"
              name="cin"
              value={formik.values.cin}
              onChange={formik.handleChange}
              {...formik.getFieldProps("cin")}
              error={formik.errors.cin}
            />
            <DateInput
              label="Date d'embauche"
              name="date_embauche"
              value={formik.values.date_embauche}
              onChange={(date) => formik.setFieldValue("date_embauche", date)}
              error={formik.errors.date_embauche}
            />
            <SelectInput
              label="Niveau d'étude"
              name="niveau_etude"
              placeholder="Sélectionnez un niveau d'étude"
              options={Object.entries(EDUCATION_LEVELS).map(([key, label]) => ({
                value: label,
                label,
              }))}
              value={formik.values.niveau_etude}
              onChange={(value) => formik.setFieldValue("niveau_etude", value)}
            />
            <Input
              label="Adresse"
              type="text"
              name="adresse"
              value={formik.values.adresse}
              onChange={formik.handleChange}
            />
            <Input
              label="CNSS"
              type="number"
              name="cnss"
              value={formik.values.cnss}
              onChange={formik.handleChange}
              error={formik.errors.cnss}
            />
            <SelectInput
              label="Actif"
              name="is_actif"
              placeholder="Sélectionnez un statut"
              options={[
                { label: "Actif", value: "1" },
                { label: "Inactif", value: "0" },
              ]}
              value={formik.values.is_actif}
              onChange={(value) => formik.setFieldValue("is_actif", value)}
              error={formik.errors.is_actif}
            />
            <Input
              label="Fonction"
              type="text"
              name="fonction"
              value={formik.values.fonction}
              onChange={formik.handleChange}
              error={formik.errors.fonction}
            />
            <Input
              label="Solde de congé"
              type="number"
              name="solde_conge"
              value={formik.values.solde_conge}
              onChange={formik.handleChange}
            />
            {/* password input with toggle view hide */}
            <Input
              label="Mot de passe"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.errors.password}
            >
              {showPassword ? (
                <EyeOff
                  className="w-6 h-6 !text-gray-600"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="w-6 h-6 !text-gray-500"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </Input>
            {/* confirm password input with toggle view hide */}
            <Input
              label="Confirmer le mot de passe"
              type={showPasswordConfirmation ? "text" : "password"}
              name="password_confirmation"
              value={formik.values.password_confirmation}
              onChange={formik.handleChange}
              error={formik.errors.password_confirmation}
            >
              {showPasswordConfirmation ? (
                <EyeOff
                  className="w-6 h-6 !text-gray-600"
                  onClick={() => setShowPasswordConfirmation(false)}
                />
              ) : (
                <Eye
                  className="w-6 h-6 !text-gray-500"
                  onClick={() => setShowPasswordConfirmation(true)}
                />
              )}
            </Input>
          </div>
          <div className="flex gap-4 items-center mt-6 mb-6">
            <button
              type="button"
              className="bg-gray-400 text-white font-medium rounded-lg px-6 py-2"
              onClick={() => router.push("/utilisateurs")}
            >
              Annuler
            </button>
            <button
              type="submit"
              className={`bg-[#2D8548] text-white font-medium rounded-lg px-6 py-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Ajout en cours..." : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
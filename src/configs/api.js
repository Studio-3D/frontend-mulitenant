import axios from "axios";

const APIBASEURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const BASERESOURCEURL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export const RESOURCE_URL = {
  DOCS: `${BASERESOURCEURL}/Docs`,
  BASE: BASERESOURCEURL,
};

export const APIURL = {
  ROOT: APIBASEURL,
  ME: `${APIBASEURL}/dashboard`,
  LOGIN: `${APIBASEURL}/login`,
  REGISTER: `${APIBASEURL}/register`,
  LOGOUT: `${APIBASEURL}/logout`,
  FORGOT_PASSWORD: `${APIBASEURL}/sendEmail`,
  VALIDATE_TOKEN: `${APIBASEURL}/validateToken`,
  RESET_PASSWORD: `${APIBASEURL}/resetPassword`,
  SWITCH_SOCIETES: `${APIBASEURL}/Switch_Societes`,
  SOCIETE: `${APIBASEURL}/societe`,
  UTILISATEURS: `${APIBASEURL}/v1/utilisateurs`,
  SOCIETES: `${APIBASEURL}/v1/societes`,
  GETSOCIETES: `${APIBASEURL}/get_societes`,
  TYPEPROJETS: `${APIBASEURL}/v1/typeProjets`,
  TYPEBIENS: `${APIBASEURL}/v1/typeBiens`,
  TYPEFREINS: `${APIBASEURL}/v1/typefreins`,
  BANQUES: `${APIBASEURL}/v1/banques`,
  VUES: `${APIBASEURL}/v1/vues`,
  TYPOLOGIES: `${APIBASEURL}/v1/typologies`,
  SOURCES: `${APIBASEURL}/v1/sources`,
  PARTENAIRES: `${APIBASEURL}/v1/partenaires`,
  PROJETS: `${APIBASEURL}/v1/projets`,
  TRANCHES: `${APIBASEURL}/v1/tranches`,
  BLOCS: `${APIBASEURL}/v1/blocs`,
  IMMEUBLES: `${APIBASEURL}/v1/immeubles`,
  BIENS: `${APIBASEURL}/v1/biens`,
  COMPOSITIONBIENS: `${APIBASEURL}/v1/compositionBiens`,
  VISITES: `${APIBASEURL}/v1/visites`,
  ENCAISSEMENTS: `${APIBASEURL}/v1/encaissements`,
  APPELS: `${APIBASEURL}/v1/appels`,
  T_APPELS: `${APIBASEURL}/v1/destroy_t_appel`,
  ROOTV1: `${APIBASEURL}/v1`,
  PROSPECTS: `${APIBASEURL}/v1/prospects`,
  CLIENTS: `${APIBASEURL}/v1/clients`,
  PAIEMENTS: `${APIBASEURL}/v1/avances`,
  DESISTEMENT: `${APIBASEURL}/v1/desistements`,
  OBJECTIFS: `${APIBASEURL}/v1/objectifs`,
  RESERVATIONS: `${APIBASEURL}/v1/reservations`,
  FOURNISSEURS: `${APIBASEURL}/v1/fournisseurs`,
  DECOMPTES: `${APIBASEURL}/v1/decomptes`,
  FACTURES: `${APIBASEURL}/v1/factures`,
  CPS: `${APIBASEURL}/v1/cps`,
  CREDITS: `${APIBASEURL}/v1/credits`,
  ServicesPrestataires: `${APIBASEURL}/v1/ServicesPrestataires`,
  Prestataires: `${APIBASEURL}/v1/Prestataires`,
  ReclamationsSav: `${APIBASEURL}/v1/ReclamationsSav`,
  ReclamationsClient: `${APIBASEURL}/v1/ReclamationsClients`,
  REMISECLES: `${APIBASEURL}/v1/RemiseCles`,
  ECHEANCESTRANCE: `${APIBASEURL}/v1/EcheancesTranche`,
  ETAPESPROJET: `${APIBASEURL}/v1/etapesProjet`,
  COMMISSIONS: `${APIBASEURL}/v1/commissions`,
  COMMISSSIONCONFIG: `${APIBASEURL}/v1/commisssionConfig`,
  COMMISSIONSCONFIGURATIONS: `${APIBASEURL}/v1/commissionsConfigurations`,
  FACTURES_BY_DECOMPTE: `${APIBASEURL}/v1/factures_by_decompte`,
  DOCUMENTS_FACTURES: `${BASERESOURCEURL}/Docs/factures`,
  DOCUMENTS_CPS: `${BASERESOURCEURL}/Docs/cps`,
  HISTOIMPORTATION: `${APIBASEURL}/v1/delete_fichier_import`,
  COMPOSITIONBIENS: `${APIBASEURL}/v1/compositionBiens`,

  // Social Media Configuration APIs
  LINKEDIN_CONFIG: `${APIBASEURL}/v1/linkedin-config`,
  TIKTOK_CONFIG: `${APIBASEURL}/v1/tiktok-config`,

  // Social Media Sharing APIs
  LINKEDIN_SHARE: `${APIBASEURL}/v1/linkedin/share`,
  TIKTOK_PUBLISH: `${APIBASEURL}/v1/tiktok/publish`,
  TIKTOK_STATUS: `${APIBASEURL}/v1/tiktok/status`,
};

export const ENDPOINTS = {
  API: process.env.NEXT_PUBLIC_API_URL,
  HOME: "/home",
  UTILISATEURS: "/utilisateurs/home",
  SOCIETES: "/societes/home",
  TYPEPROJETS: "/administration/types-projets",
  TYPEBIENS: "/administration/typeBiens",
  BANQUES: "/administration/banques",
  VUES: "/administration/vues",
  TYPOLOGIES: "/administration/typologies",
  TYPEFREINS: "/administration/freins",
  SOURCES: "/administration/sources",
  PARTENAIRES: "/administration/partenaires",
  PROJETS: "/projets/home",
  TRANCHES: "/tranches/home",
  BLOCS: "/blocs/home",
  IMMEUBLES: "/immeubles/home",
  BIENS: "/biens/home",
  COMPOSITIONBIENS: "/compositionBiens/home",
  VISITES: "/crm/visites",
  APPELS: "/crm/appels",
  PROSPECTS: "/crm/prospects",
  CLIENTS: "/ventes/clients",

  ENCAISSEMENTS: "/encaissements",
  RESERVATIONS: "/ventes/reservations",
  TVA: "/comptabilite",
  DESISTEMENT: "/desistements/home",
  PAIEMENTS: "/paiements/home",
  OBJECTIFS: "/administration/objectifs",
  FOURNISSEURS: "/comptabilite/fournisseurs",
  DECOMPTES: "/comptabilite/decomptes",
  FACTURES: "/comptabilite/factures",
  CPS: "/comptabilite/cps",
  CREDITS: "/comptabilite/credits",
  ServicesPrestataires: "/sav/services",
  Prestataires: "/sav/prestataires",
  ReclamationsSav: "/sav/reclamations",
  ReclamationsClients: "/reclamationsClients",
  REMISECLES: "/remiseCles",
  ECHEANCESTRANCE: "/echeancesTranche/home",
  HISTOIMPORTATION: "/histoImportation",
  ETAPESPROJET: "/etapesProjet/home",
};

// Add axios default configuration
axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Add request interceptor to always include auth token
axios.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper functions to check social media configurations
export const checkSocialMediaConfigurations = async (projectId) => {
  const token = localStorage.getItem("accessToken");
  const configurations = {
    linkedin: false,
    tiktok: false,
    facebook: false,
    instagram: false,
  };

  try {
    // Check LinkedIn configuration
    const linkedinResponse = await axios.get(
      `${APIURL.LINKEDIN_CONFIG}/project/${projectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    configurations.linkedin = !!linkedinResponse.data.configuration;
  } catch (error) {
    console.log("No LinkedIn configuration found");
  }

  try {
    // Check TikTok configuration
    const tiktokResponse = await axios.get(
      `${APIURL.TIKTOK_CONFIG}/project/${projectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    configurations.tiktok = !!tiktokResponse.data.configuration;
  } catch (error) {
    console.log("No TikTok configuration found");
  }

  return configurations;
};

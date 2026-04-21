import axios from 'axios';

const APIBASEURL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
const BASERESOURCEURL =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000';

export const RESOURCE_URL = {
  DOCS: `${BASERESOURCEURL}/docs`,
  BASE: BASERESOURCEURL,
  FRONTEND_IMAGES: '/images', // Add this for frontend images

};

export const APIURL = {
  ROOT: APIBASEURL,
  ME: `${APIBASEURL}/dashboard`,
  GESTION_ROLES: `${APIBASEURL}/v1/gestion_roles`,
  GESTION_ROLES_ACTIVES: `${APIBASEURL}/v1/gestion_roles_actives`,
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
  //COMMISSSIONCONFIG: `${APIBASEURL}/v1/commisssionConfig`,
  COMMISSIONSCONFIGURATIONS: `${APIBASEURL}/v1/commissionsConfigurations`,
  FACTURES_BY_DECOMPTE: `${APIBASEURL}/v1/factures_by_decompte`,
  DOCUMENTS_FACTURES: `${BASERESOURCEURL}/docs/factures`,
  DOCUMENTS_CPS: `${BASERESOURCEURL}/docs/cps`,
  HISTOIMPORTATION: `${APIBASEURL}/v1/delete_fichier_import`,
  COMPOSITIONBIENS: `${APIBASEURL}/v1/compositionBiens`,

  // Social Media Configuration APIs
  LINKEDIN_CONFIG: `${APIBASEURL}/v1/linkedin-config`,
  TIKTOK_CONFIG: `${APIBASEURL}/v1/tiktok-config`,
  FACEBOOK_CONFIG: `${APIBASEURL}/v1/facebook-configurations`,
  INSTAGRAM_CONFIG: `${APIBASEURL}/v1/instagram-configurations`,

  // Social Media Sharing APIs
  LINKEDIN_SHARE: `${APIBASEURL}/v1/linkedin/share`,
  TIKTOK_PUBLISH: `${APIBASEURL}/v1/tiktok/publish`,
  TIKTOK_STATUS: `${APIBASEURL}/v1/tiktok/status`,
  FACEBOOK_SHARE: `${APIBASEURL}/v1/postTo_Social_Network`,
  INSTAGRAM_SHARE: `${APIBASEURL}/v1/postTo_Social_Network`,

  // Webhook Management APIs
  FACEBOOK_WEBHOOK_TOGGLE: `${APIBASEURL}/v1/facebook-configurations`,
  INSTAGRAM_WEBHOOK_TOGGLE: `${APIBASEURL}/v1/instagram-configurations`,
  FACEBOOK_WEBHOOKS: `${APIBASEURL}/v1/facebook-webhooks`,
  INSTAGRAM_WEBHOOKS: `${APIBASEURL}/v1/instagram-webhooks`,
};

export const ENDPOINTS = {
  API: process.env.NEXT_PUBLIC_API_URL,
  HOME: '/home',
  UTILISATEURS: '/utilisateurs',
  SOCIETES: '/societes',
  TYPEPROJETS: '/administration/types-projets',
  TYPEBIENS: '/administration/types-biens',
  BANQUES: '/administration/banques',
  VUES: '/administration/vues',
  TYPOLOGIES: '/administration/typologies',
  TYPEFREINS: '/administration/freins',
  SOURCES: '/administration/sources',
  PARTENAIRES: '/administration/partenaires',
  PROJETS: '/projets',
  TRANCHES: '/tranches',
  BLOCS: '/blocs',
  IMMEUBLES: '/immeubles',
  BIENS: '/biens',
  COMPOSITIONBIENS: '/ajouter_composition',
  VISITES: '/crm/visites',
  CRM: '/crm',
   ECHEANCESTRANCE: '/crm/echeance-tranches',
  APPELS: '/crm/appels',
  PROSPECTS: '/crm/prospects',
  VENTE: '/ventes',
  CLIENTS: '/ventes/clients',
  ENCAISSEMENTS: '/encFaissements',
  RESERVATIONS: '/ventes/reservations',
  TVA: '/comptabilite',
  DESISTEMENT: '/desistements',
  PAIEMENTS: '/paiements',
  OBJECTIFS: '/administration/objectifs',
  COMPTABILITE: '/comptabilite',
  FOURNISSEURS: '/comptabilite/fournisseurs',
  DECOMPTES: '/comptabilite/decomptes',
  FACTURES: '/comptabilite/factures',
  CPS: '/comptabilite/cps',
  CREDITS: '/comptabilite/credits',
  ServicesPrestataires: '/sav/services',
  Prestataires: '/sav/prestataires',
  ReclamationsSav: '/sav/reclamations',
  ReclamationsClients: '/reclamationsClients',
  REMISECLES: '/remiseCles',
  HISTOIMPORTATION: '/histo-importation',
  ETAPESPROJET: '/etapes-projet',
  COMMISSSION_MENSUELLE_ATTENTE: '/commissions/commissionMensuelleAtt',
};

// Add axios default configuration
axios.defaults.baseURL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Add request interceptor to always include auth token
axios.interceptors.request.use(
  (config) => {
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('accessToken')
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
  const token = localStorage.getItem('accessToken');
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
    console.log('No LinkedIn configuration found');
  }

  try {
    // Check TikTok configuration
    const tiktokResponse = await axios.get(
      `${APIURL.TIKTOK_CONFIG}/project/${projectId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    configurations.tiktok = !!tiktokResponse.data.configuration;
  } catch (error) {
    console.log('No TikTok configuration found');
  }

  try {
    // Check Facebook configuration
    const facebookResponse = await axios.get(`${APIURL.FACEBOOK_CONFIG}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    configurations.facebook =
      facebookResponse.data.configurations &&
      facebookResponse.data.configurations.some(
        (config) => config.projet_id == projectId
      );
  } catch (error) {
    console.log('No Facebook configuration found');
  }

  try {
    // Check Instagram configuration
    const instagramResponse = await axios.get(`${APIURL.INSTAGRAM_CONFIG}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    configurations.instagram =
      instagramResponse.data.configurations &&
      instagramResponse.data.configurations.some(
        (config) => config.projet_id == projectId
      );
  } catch (error) {
    console.log('No Instagram configuration found');
  }

  return configurations;
};

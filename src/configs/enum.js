export const User_roles = {
  ROLE_SUPER_ADMIN: 1,
  ROLE_ADMIN: 2,
  ROLE_COMMERCIAL: 3,
  ROLE_NOTAIRE: 5,
  ROLE_RESPO_LIVRAISON: 6,
  ROLE_COMPTABLE: 7,
  ROLE_SAV: 8,
  ROLE_RESPO_COMMERCIAL: 9,
  ROLE_AGENT_ADMINISTRATIF: 10,
};

export const decryptUserType = (role) => {
  switch (role) {
    case 1:
      return User_roles.ROLE_SUPER_ADMIN;
    case 2:
      return User_roles.ROLE_ADMIN;
    case 3:
      return User_roles.ROLE_COMMERCIAL;
    case 5:
      return User_roles.ROLE_NOTAIRE;
    case 6:
      return User_roles.ROLE_RESPO_LIVRAISON;
    case 7:
      return User_roles.ROLE_COMPTABLE;
    case 8:
      return User_roles.ROLE_SAV;
    case 9:
      return User_roles.ROLE_RESPO_COMMERCIAL;
    case 10:
      return User_roles.ROLE_AGENT_ADMINISTRATIF;
    default:
      return 'UNKNOWN';
  }
};

export const isSuperAdmin = (role) => {
  return decryptUserType(role) === User_roles.ROLE_SUPER_ADMIN;
};

export const isCommercial = (role) => {
  return decryptUserType(role) === User_roles.ROLE_COMMERCIAL;
};
export const isNotaire = (role) => {
  return decryptUserType(role) === User_roles.ROLE_NOTAIRE;
};
export const isRespoLivraison = (role) => {
  return decryptUserType(role) === User_roles.ROLE_RESPO_LIVRAISON;
};
export const isComptable = (role) => {
  return decryptUserType(role) === User_roles.ROLE_COMPTABLE;
};
export const isSav = (role) => {
  return decryptUserType(role) === User_roles.ROLE_SAV;
};
export const isAdmin = (role) => {
  return decryptUserType(role) === User_roles.ROLE_ADMIN;
};
export const isRespoCommercial = (role) => {
  return decryptUserType(role) === User_roles.ROLE_RESPO_COMMERCIAL;
};
export const isAgentAdministratif = (role) => {
  return decryptUserType(role) === User_roles.ROLE_AGENT_ADMINISTRATIF;
};

export const VISITE_STATUT = {
  1: { code: 1, label: 'Pré-Réservation', color: 'bg-blue-100 !text-blue-800' },
  2: { code: 2, label: 'Vendu', color: 'bg-green-100 !text-green-800' },
  3: {
    code: 3,
    label: 'Pré-Réservation-Perdu',
    color: 'bg-yellow-100 !text-yellow-800',
  },
  4: { code: 4, label: 'Réservation-Perdu', color: 'bg-red-100 !text-red-800' },
  5: {
    code: 5,
    label: 'Pré-Réservation-Vendu',
    color: 'bg-purple-100 text-purple-800',
  },
};

// Visite interest levels
export const VISITE_INTERETS = {
  1: { code: 1, label: 'Intéressé', color: 'bg-green-100 !text-green-800' },
  2: { code: 2, label: 'Réceptif', color: 'bg-blue-100 !text-blue-800' },
  3: { code: 3, label: 'Perdu', color: 'bg-red-100 !text-red-800' },
  4: { code: 4, label: 'Injoignable', color: 'bg-gray-100 text-white-800' },
  5: { code: 5, label: 'Suivi Dossier', color: 'bg-orange-100 text-orange-800' },

};

export const getInteret_label = (number) => {
  if (VISITE_INTERETS[number]?.code == number) {
    return VISITE_INTERETS[number]?.label;
  }
};
// Visite statuses for form selection
export const VISITE_STATUT_FORM = {
  1: { code: 1, label: 'Pré-Réservation' },
  2: { code: 2, label: 'Vendu' },
};
// Visite statuses for form selection
// Ajoutez ceci dans votre fichier enum.js ou configs/enum.js
export const Statut_SUIVI_DOSSIER  = {
  1: {
    code: 1,
    label: 'Nouvelle avance',
  },
  2: {
    code: 2,
    label: 'Suivi Avanacement des travaux',
  },

  3: {
    code: 3,
    label: 'Demande des documents',
  },
  4: {
    code: 4,
    label: 'Autre ',
  },
};

export const Statuts_Client = {
  1: { id: '1', label: 'Nouvelle Avance' },
  2: { id: '2', label: 'Suivi Avancement travaux' },
  3: { id: '3', label: 'Demande des documents' },
  4: { id: '4', label: 'Autre' },
  5: { id: '5', label: 'Creation Reservation' },
  6: { id: '6', label: 'Ajout Rendez Vous' },
  7: { id: '7', label: 'Signature Attestation Vente' },
  8: { id: '8', label: 'Signature Contrat Vente' },
  9: { id: '9', label: 'Remise Cle' },
  10: { id: '10', label: 'Désistement Définitif' },
  11: { id: '11', label: 'Désistement au Profit d\'un Proche' },
  12: { id: '12', label: 'Désistement au Profit d\'un Co-Réservataire' },
  13: { id: '13', label: 'Désistement Partiel' },
  14: { id: '14', label: 'Désistement Changement de Bien' },
  15: { id: '15', label: 'Penalite valide' },
  16: { id: '16', label: 'Remise du Remboursement' },
  17: { id: '17', label: 'Decaissement effectue' },
  18: { id: '18', label: 'Penalite rejete' },

};
// Visite notification types
export const VISITE_TYPE_NOTIF = {
  1: { code: 1, label: 'Sms' },
  2: { code: 2, label: 'Appel' },
  3: { code: 3, label: 'Email' },
};

export const MODES_RELANCES = {
  1: { code: '1', label: 'Sms' },
  2: { code: '2', label: 'Appel ' },
  3: { code: '3', label: 'Email ' },
};
/*export const getRelance_label = number => {
  if (MODES_RELANCES[number]?.code == number) {
    return MODES_RELANCES[number]?.label
  }
}*/

export const getRelance_label = (number) => {
  const mode = MODES_RELANCES[number];
  if (!mode) return null;

  const baseClasses =
    'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold';

  switch (mode.label.trim().toLowerCase()) {
    case 'sms':
      return (
        <span className={`${baseClasses} bg-green-100 `}>{mode.label}</span>
      );
    case 'appel':
      return (
        <span className={`${baseClasses} bg-orange-100 `}>{mode.label}</span>
      );
    case 'email':
      return (
        <span className={`${baseClasses} bg-blue-100 `}>{mode.label}</span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-100 `}>{mode.label}</span>
      );
  }
};

// Payment modes
export const MODE_PAIEMENT = {
  1: { code: 1, label: 'Espèce' },
  2: { code: 2, label: 'Chèque' },
  3: { code: 3, label: 'Chèque Banque' },
  4: { code: 4, label: 'Chèque Certifié' },
  5: { code: 5, label: 'Virement' },
  6: { code: 6, label: 'Versement' },

};
// Penalty modes
export const modes_penalites = {
  1: { code: 1, label: '10%' },
  2: { code: 2, label: '15% (gros oeuvre)' },
  3: { code: 3, label: '20% (Finition)' },
  4: { code: 4, label: '25%' },
  5: { code: 5, label: '30%' },
  6: { code: 6, label: '40%' },
  7: { code: 7, label: '50%' },
  8: { code: 8, label: '60%' },
  9: { code: 9, label: '70%' },
  10: { code: 10, label: '80%' },
  11: { code: 11, label: '90%' },
  12: { code: 12, label: '100%' },
  13: { code: 13, label: 'Montant' },
};
export const getModePenaliteCode = (percentage) => {
  const mode = Object.values(modes_penalites).find(
    (m) => m.label.startsWith(percentage) // Checks if label starts with "15%", etc.
  );
  return mode ? mode.code : null; // Returns the code (1, 2, 3...) or null if not found
};
export const getModePenaliteLabel = (percentage) => {
  const mode = Object.values(modes_penalites).find(
    (m) => m.label.startsWith(percentage) // Checks if label starts with "15%", etc.
  );
  return mode ? mode.label : null; // Returns the code (1, 2, 3...) or null if not found
};

export const type_dst = {
  1: { id: 1, label: 'Définitif' },
  2: { id: 2, label: 'Au Profit' },
  3: { id: 3, label: 'Changement de Bien' },
};
export const type_dst_dp = {
  1: { id: 1, label: "Au Profit d'un Proche" },
  2: { id: 2, label: "Au Profit d'un Co-Reservataire" },
  3: { id: 3, label: 'Partiel' },
};

export const motif_desistements = {
  1: { id: 1, label: 'Incapacité Financière' },
  2: { id: 2, label: 'Décès' },
  3: { id: 3, label: 'Problème familier' },
  4: { id: 4, label: 'Mutation' },
  5: { id: 5, label: 'Licenciement' },
  6: { id: 6, label: 'Insatisfaction' },
  7: { id: 7, label: 'Echange' },
  8: { id: 8, label: 'Crédit Bancaire non accordé' },
  9: { id: 9, label: 'Client imposé à la TSC' },
  10: { id: 10, label: 'Autre investissement' },
  11: { id: 11, label: 'Problème de santé' },
};
export const getMotifLabel = (code) => {
  return motif_desistements[code]?.label || 'Unknown';
};

export const lien_parentes = {
  1: { id: 1, label: 'Parents' },
  2: { id: 2, label: 'Fils' },
  3: { id: 3, label: 'Frères' }, // Note: Fixed accent on "Frères"
  4: { id: 4, label: 'Sœurs' }, // Note: Fixed accent on "Sœurs"
  5: { id: 5, label: 'Autre' },
};

// Financing modes
export const MODE_FINANCE = {
  1: { code: 1, label: 'Comptant' },
  2: { code: 2, label: 'Crédit' },
  3: { code: 3, label: 'Indécis' },
};
export const getModeFinanceLabel = (code) => {
  return MODE_FINANCE[code]?.label || 'Unknown';
};

//desistement
export const MODE_PAIEMENT_with_transfert = {
  1: { code: 1, label: 'Espèce' },
  2: { code: 2, label: 'Chèque' },
  3: { code: 3, label: 'Chèque Banque' },
  4: { code: 4, label: 'Chèque Certifié' },
  5: { code: 5, label: 'Virement' },
  6: { code: 6, label: 'Versement' },
  7: { code: 7, label: 'Transfert Dossier' },
};
// Dans configs/enum.js
export const getOrientationLabelFromAbbreviation = (abbreviation) => {
  const directLabelMap = {
    'N': 'Nord',
    'E': 'Est',
    'S': 'Sud',
    'O': 'Ouest',
    'N_E': 'Nord-Est',
    'N_O': 'Nord-Ouest',
    'S_E': 'Sud-Est',
    'S_O': 'Sud-Ouest',
    'NORD_SUD': 'Nord / Sud',
    'NORD_OUEST': 'Nord-Ouest',
    'SUD_EST': 'Sud-Est',
    'EST_OUEST': 'Est / Ouest',
    'NO_SE': 'Nord-Ouest / Sud-Est',
    'NORD_SUD_OUEST': 'Nord / Sud / Ouest',
    'NORD_SUD_EST': 'Nord / Sud / Est',
    'NORD_EST_OUEST': 'Nord / Est / Ouest'
  };
  return directLabelMap[abbreviation] || abbreviation;
};
export const getModePaiementLabel = (code) => {
  return MODE_PAIEMENT_with_transfert[code]?.label || '';
};
export const Avance_Statut = {
  1: { label: 'Validé', color: 'success' },
  3: { label: 'En Attente', color: 'info' },
  2: { label: 'Refusé', color: 'error' },
};

// Orientations
export const ORIENTATIONS = {
  1: { code: 1, label: 'Nord', description: 'Orientation Nord' },
  2: { code: 2, label: 'Sud', description: 'Orientation Sud' },
  3: { code: 3, label: 'Est', description: 'Orientation Est' },
  4: { code: 4, label: 'Ouest', description: 'Orientation Ouest' },
  5: { code: 5, label: 'Nord-Est', description: 'Orientation Nord-Est' },
  6: { code: 6, label: 'Nord-Ouest', description: 'Orientation Nord-Ouest' },
  7: { code: 7, label: 'Sud-Est', description: 'Orientation Sud-Est' },
  8: { code: 8, label: 'Sud-Ouest', description: 'Orientation Sud-Ouest' },
 // Nouvelles orientations (8)
  9: { code: 9, label: 'Nord / Sud', description: 'Orientation double Nord/Sud', abbreviation: 'NORD_SUD' },
  10: { code: 10, label: 'Nord-Ouest', description: 'Orientation Nord-Ouest', abbreviation: 'NORD_OUEST' },
  11: { code: 11, label: 'Sud-Est', description: 'Orientation Sud-Est', abbreviation: 'SUD_EST' },
  12: { code: 12, label: 'Est / Ouest', description: 'Orientation double Est/Ouest', abbreviation: 'EST_OUEST' },
  13: { code: 13, label: 'Nord-Ouest / Sud-Est', description: 'Orientation double Nord-Ouest/Sud-Est', abbreviation: 'NO_SE' },
  14: { code: 14, label: 'Nord / Sud / Ouest', description: 'Orientation triple Nord/Sud/Ouest', abbreviation: 'NORD_SUD_OUEST' },
  15: { code: 15, label: 'Nord / Sud / Est', description: 'Orientation triple Nord/Sud/Est', abbreviation: 'NORD_SUD_EST' },
  16: { code: 16, label: 'Nord / Est / Ouest', description: 'Orientation triple Nord/Est/Ouest', abbreviation: 'NORD_EST_OUEST' }
};

export const getOrientationLabel = (code) => {
  return ORIENTATIONS[code]?.label || 'Unknown';
};
export const getOrientationCode = (orientation) =>
  ORIENTATIONS[orientation]?.code || '';

// Master prospect status definitions - matches backend StatutProspectEnum
export const Statuts_Prospect = {
  0: { id: '0', label: 'En attente', value: 'En_attente' },
  1: {
    id: '1',
    label: 'Planification Rendez Vous',
    value: 'Planification_RDV',
  },
  2: { id: '2', label: 'Injoignable', value: 'Injoignable' },
  3: { id: '3', label: 'Rappel', value: 'Rappel' },
  4: { id: '4', label: 'Converti en Visite', value: 'Converti_en_visite' },
  5: { id: '5', label: 'Nouvel Appel', value: 'Nouveau_appel' },
  6: { id: '6', label: 'Affecté', value: 'Affecte' },
  7: { id: '7', label: 'Intéressé', value: 'Interesse' },
  8: { id: '8', label: 'Perdu', value: 'Perdu' },
  9: { id: '9', label: 'Réceptif', value: 'Receptif' },
  10: { id: '10', label: 'Converti en client', value: 'Converti_en_client' },
};

// Filtered prospect statuses for treatment modal - using string labels as backend expects
export const Statuts_Prospect_Traitement = {
  1: { id: 1, label: 'Planification Rendez Vous', value: 'Planification_RDV' },
  2: { id: 2, label: 'Injoignable', value: 'Injoignable' },
  3: { id: 3, label: 'Rappel', value: 'Rappel' },
  5: { id: 5, label: 'Nouvel Appel', value: 'Nouveau_appel' },
  7: { id: 7, label: 'Intéressé', value: 'Interesse' },
  8: { id: 8, label: 'Perdu', value: 'Perdu' },
  9: { id: 9, label: 'Réceptif', value: 'Receptif' },
};

export const TYPES_APPELS = {
  1: { code: '1', label: 'Appel Entrant' },
  2: { code: '2', label: 'Appel Sortant' },
};
export const getTypeAppelLabel = (number) => {
  if (TYPES_APPELS[number].code == number) {
    return TYPES_APPELS[number].label;
  }
};

// Property status options
export const BIEN_ETAT = {
  DISPONIBLE: {
    id: 'disponible',
    label: 'Disponible',
    color: 'bg-green-100 !text-green-800',
  },
  PRE_RESERVATION: { label: 'Pré réservé' },
  RESERVATION: { label: 'Réservé' },
  BLOQUE: { label: 'Bloqué' },
  VENDU: { label: 'Vendu' },
  ENCOURS_DE_PROPOSITION: { label: 'En cours de proposition' },
};

// Helper function to get property status label
export const getEtatLabel = (etatId) => {
  return BIEN_ETAT[etatId]?.label || 'Disponible';
};
export const TYPE_CLIENT = {
  1: { code: '1', label: 'Particulier' },
  2: { code: '2', label: 'Société' },
};

export const SITUATION_FAMILIALLE = {
  1: { code: 1, label: 'Célibataire' },
  2: { code: 2, label: 'Marié' },
  3: { code: 3, label: 'Divorcé' },
  4: { code: 4, label: 'Veuf' },
  5: { value: 5, label: 'Non renseigné' }, // or 5 if you use the second approach

};

// Standardized status colors for all components
export const PROSPECT_STATUS_COLORS = {
  'En attente': 'bg-gray-100 text-gray-600',
  'Planification Rendez Vous': 'bg-blue-100 text-[#009FFF]',
  Injoignable: 'bg-purple-100 text-purple-600',
  Rappel: 'bg-yellow-100 text-yellow-600',
  'Converti en Visite': 'bg-green-100 text-green-600',
  'Converti en client': 'bg-green-100 text-green-700',
  'Nouvel Appel': 'bg-cyan-100 text-cyan-600',
  Affecté: 'bg-indigo-100 text-indigo-600',
  Intéressé: 'bg-green-100 text-emerald-600',
  Perdu: 'bg-red-100 text-red-600',
  Réceptif: 'bg-teal-100 text-teal-600',
};

// Helper functions for prospect status
// Map raw backend values to human-readable labels (handles underscores and accents)
const RAW_TO_LABEL = {
  En_attente: 'En attente',
  Planification_RDV: 'Planification Rendez Vous',
  Injoignable: 'Injoignable',
  Rappel: 'Rappel',
  Converti_en_visite: 'Converti en Visite',
  Nouveau_appel: 'Nouvel Appel',
  Affecte: 'Affecté',
  Interesse: 'Intéressé',
  Perdu: 'Perdu',
  Receptif: 'Réceptif',
};

// Normalize any backend/frontend status into a user-facing label
export const getProspectStatusLabel = (statusValue) => {
  if (statusValue === undefined || statusValue === null) return '';
  // If numeric or numeric string, map by id
  const num =
    typeof statusValue === 'number' || /^\d+$/.test(String(statusValue))
      ? Number(statusValue)
      : null;
  if (num !== null && Statuts_Prospect.hasOwnProperty(num)) {
    return Statuts_Prospect[num].label;
  }
  // Direct match by enum value
  const byValue = Object.values(Statuts_Prospect).find(
    (s) => s.value === statusValue
  );
  if (byValue) return byValue.label;
  // Direct match by label
  const byLabel = Object.values(Statuts_Prospect).find(
    (s) => s.label === statusValue
  );
  if (byLabel) return byLabel.label;
  // Raw underscore name mapping
  if (RAW_TO_LABEL[statusValue]) return RAW_TO_LABEL[statusValue];
  // Fallback to string form
  return String(statusValue);
};

// Get numeric id from any representation (id number/string, label, or value)
export const getProspectStatusId = (statusValue) => {
  if (statusValue === undefined || statusValue === null) return null;
  if (typeof statusValue === 'number' || /^\d+$/.test(String(statusValue))) {
    const n = Number(statusValue);
    return Statuts_Prospect.hasOwnProperty(n) ? n : null;
  }
  const byValueEntry = Object.entries(Statuts_Prospect).find(
    ([, s]) => s.value === statusValue
  );
  if (byValueEntry) return Number(byValueEntry[0]);
  const byLabelEntry = Object.entries(Statuts_Prospect).find(
    ([, s]) => s.label === statusValue
  );
  if (byLabelEntry) return Number(byLabelEntry[0]);
  const rawMapped = RAW_TO_LABEL[statusValue];
  if (rawMapped) {
    const byRawLabelEntry = Object.entries(Statuts_Prospect).find(
      ([, s]) => s.label === rawMapped
    );
    if (byRawLabelEntry) return Number(byRawLabelEntry[0]);
  }
  return null;
};

export const getProspectStatusById = (id) => {
  return Statuts_Prospect[id] || null;
};

export const getProspectStatusColor = (status) => {
  const label = getProspectStatusLabel(status);
  return PROSPECT_STATUS_COLORS[label] || 'bg-gray-100 text-gray-600';
};

// Reassignment is always allowed now
export const FINAL_PROSPECT_STATUSES = [];
export const isProspectStatusFinal = () => false;
export const canProspectBeAssigned = () => true;


///*show prospect historiqus**/

// Fonction pour obtenir le label du statut en fonction du type
export const getStatusLabelByType = (statutValue, typeSource = 'prospect') => {
  if (!statutValue && statutValue !== 0) return '';
  
  // Convertir en string pour la comparaison
  const statutStr = String(statutValue);
  
  if (typeSource === 'prospect') {
    return getProspectStatusLabel(statutStr);
  } else if (typeSource === 'client') {
    return getClientStatusLabel(statutStr);
  }
  
  return '';
};

// Fonction pour obtenir la couleur du statut en fonction du type
export const getStatusColorByType = (statutValue, typeSource = 'prospect') => {
  if (!statutValue && statutValue !== 0) return 'bg-gray-100 text-gray-600';
  
  const statutStr = String(statutValue);
  
  if (typeSource === 'prospect') {
    return getProspectStatusColor(statutStr);
  } else if (typeSource === 'client') {
    // Vous pouvez ajouter des couleurs spécifiques pour les statuts client si nécessaire
    // Pour l'instant, on utilise une logique simple
    return getClientStatusColor(statutStr);
  }
  
  return 'bg-gray-100 text-gray-600';
};

// Fonction pour obtenir le label du statut client
export const getClientStatusLabel = (statutValue) => {
  if (!statutValue && statutValue !== 0) return '';
  
  const statutStr = String(statutValue);
  
  // First check Statuts_Client
  for (const [key, value] of Object.entries(Statuts_Client)) {
    if (value.id === statutStr || key === statutStr) {
      // Direct mapping for desistement statuses
      const label = value.label;
      return label;
    }
  }
  
  // Recherche dans Statut_SUIVI_DOSSIER
  if (Statut_SUIVI_DOSSIER.hasOwnProperty(statutStr)) {
    return Statut_SUIVI_DOSSIER[statutStr].label;
  }
  
  return statutStr;
};

// Fonction pour obtenir la couleur du statut client
export const getClientStatusColor = (statutValue) => {
  const label = getClientStatusLabel(statutValue);
  
  // Logique de couleur pour les statuts client
  // Vous pouvez personnaliser cela selon vos besoins
  const clientStatusColors = {
    // Statuts d'avancement
    'Nouvelle Avance': 'bg-blue-100 text-blue-600',
    'Suivi Avancement travaux': 'bg-cyan-100 text-cyan-600',
    'Demande des documents': 'bg-purple-100 text-purple-600',
    'Autre': 'bg-gray-100 text-gray-600',
    
    // Statuts de réservation
    'Creation Reservation': 'bg-green-100 text-green-600',
    'Ajout Rendez Vous': 'bg-indigo-100 text-indigo-600',
    
    // Statuts de signature
    'Signature Attestation Vente': 'bg-yellow-100 text-yellow-600',
    'Signature Contrat Vente': 'bg-orange-100 text-orange-600',
    
    // Finalisation
    'Remise Cle': 'bg-green-100 text-emerald-600',
    
    // Désistements - UPDATE THESE TO MATCH NEW DISPLAY LABELS
    'Désistement Définitif': 'bg-red-100 text-red-600',
    'Désistement au Profit d\'un Proche': 'bg-red-200 text-red-700',
    'Désistement au Profit d\'un Co-Réservataire': 'bg-red-200 text-red-700',
    'Désistement Partiel': 'bg-red-200 text-red-700',
    'Désistement Changement de Bien': 'bg-red-200 text-red-700',
    
    // Pénalités et remboursements
    'Penalite valide': 'bg-amber-100 text-amber-600',
    'decaissement_effectue': 'bg-indigo-200 text-indigo-700',
    'Remise du Remboursement': 'bg-green-200 text-green-700',
    'Penalite rejete': 'bg-red-200 text-red-700',
  };
  
  return clientStatusColors[label] || 'bg-gray-100 text-gray-600';
};

// Fonction utilitaire pour afficher un badge de statut dans le frontend
export const StatusBadge = ({ statutValue, typeSource = 'prospect', className = '' }) => {
  const label = getStatusLabelByType(statutValue, typeSource);
  const colorClasses = getStatusColorByType(statutValue, typeSource);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses} ${className}`}>
      {label}
    </span>
  );
};

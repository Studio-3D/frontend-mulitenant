export const User_roles = {
  ROLE_SUPER_ADMIN: 1,
  ROLE_ADMIN: 2,
  ROLE_COMMERCIAL: 3,
};

export const decryptUserType = (role) => {
  switch (role) {
    case 1:
      return User_roles.ROLE_SUPER_ADMIN;
    case 2:
      return User_roles.ROLE_ADMIN;
    case 3:
      return User_roles.ROLE_COMMERCIAL;
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
export const isAdmin = (role) => {
  return decryptUserType(role) === User_roles.ROLE_ADMIN;
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
  5: { code: 5, label: 'Suivi Dossier', color: 'bg-red-100 text-red-800' },

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
export const SUIVI_DOSSIER = {
  1: { code: 1, label: 'Nouvelle Avance' },
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
  2: { id: 2, label: 'au Profit' },
  3: { id: 3, label: 'Changement de Bien' },
};
export const type_dst_dp = {
  1: { id: 1, label: "au Profit d'un Proche" },
  2: { id: 2, label: "au Profit d'un Co-Reservataire" },
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
};

export const getOrientationLabel = (code) => {
  return ORIENTATIONS[code]?.label || 'Unknown';
};

export const ORIENTATION_ABBREVIATIONS = {
  Nord: 'N',
  Sud: 'S',
  Est: 'E',
  Ouest: 'O',
  'Nord-Est': 'N_E',
  'Nord-Ouest': 'N_O',
  'Sud-Est': 'S_E',
  'Sud-Ouest': 'S_O',
};

// Function that accepts a letter/abbreviation and returns the full word
export const getFullOrientation = (letter) => {
  // Reverse the object so that the keys are abbreviations and values are the full names
  const reversedAbbreviations = Object.fromEntries(
    Object.entries(ORIENTATION_ABBREVIATIONS).map(([key, value]) => [
      value,
      key,
    ])
  );

  // Return the full orientation name based on abbreviation
  return reversedAbbreviations[letter] || 'Unknown Orientation'; // Default if not found
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

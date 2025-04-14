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
// Visite statuses for display
export const VISITE_STATUT = {
  1: { code: 1, label: 'Programmée', color: 'bg-blue-100 text-blue-800' },
  2: { code: 2, label: 'Vendu', color: 'bg-green-100 text-green-800' },
  3: { code: 3, label: 'Reportée', color: 'bg-yellow-100 text-yellow-800' },
  4: { code: 4, label: 'Annulée', color: 'bg-red-100 text-red-800' },
  5: { code: 5, label: 'Complétée', color: 'bg-purple-100 text-purple-800' },
};

// Visite interest levels
export const VISITE_INTERETS = {
  1: { code: 1, label: 'Intéressé', color: 'bg-green-100 text-green-800' },
  2: { code: 2, label: 'À relancer', color: 'bg-blue-100 text-blue-800' },
  3: { code: 3, label: 'Perdu', color: 'bg-red-100 text-red-800' },
};

// Visite statuses for form selection
export const VISITE_STATUT_FORM = {
  1: { code: 1, label: 'Programmée' },
  2: { code: 2, label: 'Vendu' },
  3: { code: 3, label: 'Reportée' },
  4: { code: 4, label: 'Annulée' },
  5: { code: 5, label: 'Complétée' },
};

// Visite notification types
export const VISITE_TYPE_NOTIF = {
  1: { code: 1, label: 'Email' },
  2: { code: 2, label: 'SMS' },
  3: { code: 3, label: 'Téléphone' },
};

// Payment modes
export const MODE_PAIEMENT = {
  1: { code: 1, label: 'Espèce' },
  2: { code: 2, label: 'Chèque' },
  3: { code: 3, label: 'Effet' },
  4: { code: 4, label: 'Virement' },
  5: { code: 5, label: 'Carte bancaire' },
  6: { code: 6, label: 'Autre' },
};

// Financing modes
export const MODE_FINANCE = {
  1: { code: 1, label: 'Cash' },
  2: { code: 2, label: 'Crédit bancaire' },
  3: { code: 3, label: 'Crédit promoteur' },
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

export const Statuts_Prospect = {
  1: { id: '1', label: 'Planification Rendez Vous' },
  2: { id: '2', label: 'Injoignable' },
  3: { id: '3', label: 'Rappel' },
  4: { id: '4', label: 'Converti en Visite' },
}

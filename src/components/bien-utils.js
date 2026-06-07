export const ORIENTATIONS = {
  N: { code: 1, label: 'Nord', description: 'Orienté vers le Nord' },
  E: { code: 2, label: 'Est', description: "Orienté vers l'Est" },
  S: { code: 3, label: 'Sud', description: 'Orienté vers le Sud' },
  O: { code: 4, label: 'Ouest', description: "Orienté vers l'Ouest" },
  N_E: { code: 5, label: 'Nord-Est', description: 'Orienté vers le Nord-Est' },
  N_O: { code: 6, label: 'Nord-Ouest', description: 'Orienté vers le Nord-Ouest' },
  S_E: { code: 7, label: 'Sud-Est', description: "Orienté vers le Sud Est" },
  S_O: { code: 8, label: 'Sud-Ouest', description: "Orienté vers l'Ouest-Sud" },
  // Nouvelles orientations (8)
  NORD_SUD: { code: 9, label: 'Nord / Sud', description: 'Orientation double Nord/Sud' },
  NORD_OUEST: { code: 10, label: 'Nord-Ouest', description: 'Orientation Nord-Ouest' },
  SUD_EST: { code: 11, label: 'Sud-Est', description: 'Orientation Sud-Est' },
  EST_OUEST: { code: 12, label: 'Est / Ouest', description: 'Orientation double Est/Ouest' },
  NO_SE: { code: 13, label: 'Nord-Ouest / Sud-Est', description: 'Orientation double Nord-Ouest/Sud-Est' },
  NORD_SUD_OUEST: { code: 14, label: 'Nord / Sud / Ouest', description: 'Orientation triple Nord/Sud/Ouest' },
  NORD_SUD_EST: { code: 15, label: 'Nord / Sud / Est', description: 'Orientation triple Nord/Sud/Est' },
  NORD_EST_OUEST: { code: 16, label: 'Nord / Est / Ouest', description: 'Orientation triple Nord/Est/Ouest' }
}

export const getOrientationCode = orientation => ORIENTATIONS[orientation]?.code || ''

export const getOrientationLabel = orientation => ORIENTATIONS[orientation]?.label || ''

// Get options for select inputs
export const getOrientationOptions = () => {
  return Object.entries(ORIENTATIONS).map(([key, value]) => ({
    value: key, // Use the key (N, E, S, etc.) as value
    label: value.label, // Use the French label for display
  }));
};

export const BIEN_ETATS = {
  DISPONIBLE: { code: 'DISPONIBLE', label: 'Disponible' },
  PRE_RESERVATION: { code: 'PRE_RESERVATION', label: 'Pré-réservé' },
  RESERVATION: { code: 'RESERVATION', label: 'Réservé' },
  BLOQUE: { code: 'BLOQUE', label: 'Bloqué' },
  VENDU: { code: 'VENDU', label: 'Vendu' },
  ENCOURS_DE_PROPOSITION: { code: 'ENCOURS_DE_PROPOSITION', label: 'En cours de proposition' },
}

export const getEtatLabel= etat => BIEN_ETATS[etat]?.label || 'État inconnu';


const BIEN_ETAT_COLORS = {
  DISPONIBLE: 'success',
  PRE_RESERVATION: 'info',
  RESERVATION: 'move',
  BLOQUE: 'error',
  VENDU: 'default',
  ENCOURS_DE_PROPOSITION: 'warning'
}

export const decryptBienEtat = etat => {
  return BIEN_ETAT_COLORS[etat] || 'default'
}

export const rowBienBackgroundColors = {
  success: 'lightgreen',
  info: '#d1ecf1',
  error: '#f8d7da',
  default: '#f8f9fa',
  warning: '#fff3cd',
  move:'#f3f4f6'
}

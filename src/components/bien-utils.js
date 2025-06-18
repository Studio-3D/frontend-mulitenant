export const ORIENTATIONS = {
  N: { code: 1, label: 'Nord', description: 'Orienté vers le Nord' },
  E: { code: 2, label: 'Est', description: "Orienté vers l'Est" },
  S: { code: 3, label: 'Sud', description: 'Orienté vers le Sud' },
  O: { code: 4, label: 'Ouest', description: "Orienté vers l'Ouest" },
  N_E: { code: 5, label: 'Nord-Est', description: 'Orienté vers le Nord-Est' },
  N_O: { code: 6, label: 'Nord-Ouest', description: 'Orienté vers le Nord-Ouest' },
  N_S: { code: 7, label: 'Nord-Sud', description: 'Orienté vers le Nord-Sud' },
  O_E: { code: 8, label: 'Ouest-Est', description: "Orienté vers l'Ouest-Est" },
  O_S: { code: 9, label: 'Ouest-Sud', description: "Orienté vers l'Ouest-Sud" },
  E_S: { code: 10, label: 'Est-Sud', description: "Orienté vers l'Est-Sud" }
}

export const getOrientationCode = orientation => ORIENTATIONS[orientation]?.code || ''

export const getOrientationLabel = orientation => ORIENTATIONS[orientation]?.label || ''



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

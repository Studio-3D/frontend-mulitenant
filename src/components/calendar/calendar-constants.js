export const EVENT_TYPES = {
  RELANCE_APPEL: 27,
  RDV_APPEL: 28,
  RELANCE_VISITE: 1,
  RDV_VISITE: 2,
  ECHEANCE: 5,
  COMPROMIS_EXPIRE: 26
};

export const EVENT_CATEGORIES = {
  [EVENT_TYPES.RELANCE_APPEL]: 'relances-appels',
  [EVENT_TYPES.RDV_APPEL]: 'rdv-appels',
  [EVENT_TYPES.RELANCE_VISITE]: 'relances-visites',
  [EVENT_TYPES.RDV_VISITE]: 'rdv-visites',
  [EVENT_TYPES.ECHEANCE]: 'echeances',
  [EVENT_TYPES.COMPROMIS_EXPIRE]: 'echeances'
};

export const EVENT_COLORS = {
  [EVENT_TYPES.RELANCE_APPEL]: '#FF5733',
  [EVENT_TYPES.RDV_APPEL]: '#33FF57',
  [EVENT_TYPES.RELANCE_VISITE]: '#3385FF',
  [EVENT_TYPES.RDV_VISITE]: '#FF33F6',
  [EVENT_TYPES.ECHEANCE]: '#F5A623',
  [EVENT_TYPES.COMPROMIS_EXPIRE]: '#F5A623',
  default: '#888888'
};

export const SIDEBAR_FILTERS = [
  { id: 'all', text: 'Tous' },
  { id: 'relances-appels', text: 'Relances Appels' },
  { id: 'rdv-appels', text: 'Rendez-vous Appels' },
  { id: 'relances-visites', text: 'Relances Visites' },
  { id: 'rdv-visites', text: 'Rendez-vous Visites' },
  { id: 'echeances', text: 'Echéances' }
];

export const FILTER_COLORS = {
  'all': '#6B7280',
  'relances-appels': '#FF5733',
  'rdv-appels': '#33FF57',
  'relances-visites': '#3385FF',
  'rdv-visites': '#FF33F6',
  'echeances': '#F5A623'
};

export const getEventColor = (type) => EVENT_COLORS[type] || EVENT_COLORS.default;
export const getEventCategory = (type) => EVENT_CATEGORIES[type] || 'other';
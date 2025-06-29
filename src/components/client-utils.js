export const CIVILITES = {
  Mr: { code: 1, label: 'Mr' },
  Mme: { code: 2, label: 'Mme' },
  Mlle: { code: 3, label: 'Mlle ' }
}

export const SITUATION_FAMILIALLE = {
  Célibataire: { code: 1, label: 'Célibataire' },
  Marié: { code: 2, label: 'Marié' },
  Divorcé: { code: 3, label: 'Divorcé ' },
  Veuf: { code: 4, label: 'Veuf' }
}

export const TYPE_CLIENT = {
  Particulier: { code: 1, label: 'Particulier' },
  Société: { code: 2, label: 'Société' }
}

export const getSituationLabel = situationCode => {
  const situation = Object.values(SITUATION_FAMILIALLE).find(item => String(item.code) === String(situationCode))

  return situation?.label || ''
}

export const getSCodeCivilite = string => {
  const civilite = CIVILITES[string];
  return civilite ? civilite.code : '';
}
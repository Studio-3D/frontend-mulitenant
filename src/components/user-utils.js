export const EDUCATION_LEVELS = {
  BAC: 'BAC',
  BAC_1: 'BAC+1',
  BAC_2: 'BAC+2',
  BAC_3: 'BAC+3',
  BAC_4: 'BAC+4',
  BAC_5_PLUS: 'BAC+5 et plus'
}

export const USER_TYPES = {
  SUPERADMIN: 'SUPER ADMIN',
  ADMIN: 'ADMIN',
  COMMERCIAL: 'COMMERCIAL'
}

export const GENDERS = {
  MALE: { code: 'homme', label: 'Homme' },
  FEMALE: { code: 'femme', label: 'Femme' }
}

export const USER_STATUS = {
  ACTIVE: { code: 1, label: 'Actif' },
  INACTIVE: { code: 0, label: 'Non actif' }
}

export const decryptUserType = role => {
  switch (role) {
    case 1:
      return USER_TYPES.SUPERADMIN
    case 2:
      return USER_TYPES.ADMIN
    case 3:
      return USER_TYPES.COMMERCIAL
    default:
      return 'UNKNOWN'
  }
}

export const encryptUserType = role => {
  switch (role) {
    case USER_TYPES.SUPERADMIN:
      return 1
    case USER_TYPES.ADMIN:
      return 2
    case USER_TYPES.COMMERCIAL:
      return 3
    default:
      return 'UNKNOWN'
  }
}

export const isSuperAdmin = role => {
  return decryptUserType(role) === USER_TYPES.SUPERADMIN
}

export const isCommercial = role => {
  return decryptUserType(role) === USER_TYPES.COMMERCIAL
}


export const isAdmin = role => {
  return decryptUserType(role) === USER_TYPES.ADMIN
}

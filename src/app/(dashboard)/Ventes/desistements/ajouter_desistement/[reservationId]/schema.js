import * as yup from 'yup';

// Common fields used across all types
const commonFields = {
 /* motif: yup.string().required('Motif est requis'),
  dateOperation: yup.date().required('Date est requise'),
  fichierAutorisation: yup.mixed().when('pourCompte', {
    is: 'Autre',
    then: yup.mixed().required('Fichier autorisation est requis'),
    otherwise: yup.mixed().nullable()
  }),*/
};

export const desistementDefinitifSchema = yup.object().shape({
  ...commonFields,
  motif: yup.string().required('Motif est requis')
  /*remboursement: yup.string().required('Type de remboursement est requis'),
  modeRemboursement: yup.string().required('Mode de remboursement est requis'),
  numeroPaiement: yup.string().required('Numéro de paiement est requis'),
  pourCompte: yup.string().required('Pour le compte est requis'),
  avecPenalite: yup.boolean(),
  avecPiecesJointes: yup.boolean(),
  chequeFile: yup.mixed().when('modeRemboursement', {
    is: 'Chèque',
    then: yup.mixed().required('Fichier chèque est requis'),
    otherwise: yup.mixed().nullable()
  }),*/
});

export const desistementAuProfitSchema = yup.object().shape({
  ...commonFields,
  type_dp: yup.string().required('Type desistement au profit est requis'),
  /*beneficiaireId: yup.string().required('Bénéficiaire est requis'),
  pourcentageTransfert: yup.number()
    .required('Pourcentage est requis')
    .min(1, 'Minimum 1%')
    .max(100, 'Maximum 100%'),*/
});

export const changementDeBienSchema = yup.object().shape({
  ...commonFields,
 /* nouveauBienId: yup.string().required('Nouveau bien est requis'),
  contratFile: yup.mixed().required('Contrat de changement est requis'),*/
});
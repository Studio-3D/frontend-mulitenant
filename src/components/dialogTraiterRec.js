'use client';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import InputSelect from './inputSelect';
import Input from './Input';
import SelectInput from './SelectInput';
import Button from '@/components/Button'; // adjust the path as needed

const ReclamationDialog = ({
  open,
  onClose,
  type = 'traiter',
  prestataires = [],
  values,
  setValues,
  onSubmit,
  disabled,
  from_dashboard_client,
}) => {
  const isTraitementRec = type === 'traiter';
  const isTraitementClient = type === 'traiter_client';
  const isResolution = type === 'resoudre';
  const isResolutionClient = type === 'resoudre_client';

 const statutOptions = isTraitementRec
  ? [/*
      { value: '3', label: 'Résolu' },
      { value: '4', label: 'Non Résolu' },
    */]
  : from_dashboard_client
    ? [
        { value: '1', label: 'En cours' },
        { value: '2', label: 'Traité' },
        { value: '3', label: 'Non Traité' },
      ]
    : [ 
        { value: '4', label: 'Traité' },
        { value: '3', label: 'Non Traité' }];
  const prestataireOptions = prestataires.map((p) => ({
    value: p.id,
    label: `${p.prenom} ${p.nom}`,
  }));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* Header */}
      <Box
        sx={{
          backgroundColor:
            isResolution || isResolutionClient ? '#28A745' : '#009FFF',
          px: 3,
          py: 2,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ color: 'white', fontWeight: 'bold' }}
        >
          {isTraitementRec && 'Traiter Réclamation'}
          {isResolution && 'Résoudre Réclamation'}
          {isResolutionClient && 'Résoudre Réclamation Client'}
          {isTraitementClient && 'Traiter Réclamation'}
        </Typography>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 4, py: 3 }}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Grid container spacing={3}>
            {isTraitementRec && (
              <>
                {/* Prestataire */}
                <Grid item xs={12} sm={6}>
                  <div className="w-full sm:w-[250px]">
                    <InputSelect
                      label="Prestataire"
                      name="prestataire_id"
                      value={values.prestataire_id}
                      onChange={(selected) =>
                        setValues((prev) => ({
                          ...prev,
                          prestataire_id: selected?.value || '',
                        }))
                      }
                      options={prestataireOptions}
                      placeholder="Sélectionner un prestataire"
                      required
                    />
                  </div>
                </Grid>

                {/* Date d’intervention */}
                <Grid item xs={12} sm={6}>
                  <div className="w-full sm:w-[250px]">
                    <Input
                      label="Date d’intervention"
                      type="date"
                      name="date_intervention"
                      value={values.date_intervention || ''}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          date_intervention: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </Grid>
              </>
            )}

            {isResolution && (
              <>
                {/* Statut */}
                <Grid item xs={12} sm={6}>
                  <div className="w-full sm:w-[250px]">
                    <SelectInput
                      label="Statut"
                      value={values.statut}
                      onChange={(val) =>
                        setValues((prev) => ({ ...prev, statut: val }))
                      }
                      options={statutOptions}
                      placeholder="Sélectionner un statut"
                      error={!values.statut}
                      required
                    />
                  </div>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <div className="w-full sm:w-[250px]">
                    <Input
                      label="Date de fin d’intervention"
                      type="date"
                      name="date_fin_inter"
                      value={values.date_fin_inter || ''}
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          date_fin_inter: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </Grid>
              </>
            )}

            {(isTraitementClient || isResolutionClient) && (
              <>
                {/* Statut */}
                <Grid item xs={12} sm={6}>
                  <div className="w-full sm:w-[250px]">
                    <SelectInput
                      label="Statut"
                      value={values.statut}
                      onChange={(val) =>
                        setValues((prev) => ({ ...prev, statut: val }))
                      }
                      options={
                        isResolutionClient
                          ? statutOptions.filter((opt) => opt.value !== '1')
                          : statutOptions
                      }
                      placeholder="Sélectionner un statut"
                      error={!values.statut}
                      required
                    />
                  </div>
                </Grid>

                {values.statut == 1 ? (
                  // En cours → date de traitement
                  <Grid item xs={12} sm={6}>
                    <div className="w-full sm:w-[250px]">
                      <Input
                        label="Date de traitement"
                        type="date"
                        name="date_traitement"
                        value={values.date_traitement || ''}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            date_traitement: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </Grid>
                ) : values.statut == 2 ? (
                  // Traité ou Non Traité → date de fin d’intervention
                  <Grid item xs={12} sm={6}>
                    <div className="w-full sm:w-[250px]">
                      <Input
                        label="Date fin traitement"
                        type="date"
                        name="date_fin_traitement"
                        value={values.date_fin_traitement || ''}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            date_fin_traitement: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </Grid>
                ) : null}
              </>
            )}

            {/* Commentaire pour tous les cas */}
            <Grid item xs={12}>
              <div className="w-full sm:w-[500px]">
                <Input
                  label="Commentaire"
                  name="commentaire"
                  value={values.commentaire || ''}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      commentaire: e.target.value,
                    }))
                  }
                  placeholder="Ajouter un commentaire (optionnel)"
                  multiline
                  rows={4}
                  required
                />
              </div>
            </Grid>
          </Grid>

          <div className="flex justify-center gap-4 items-center mt-6 mb-6">
            <Button type="button" onClick={onClose} disabled={disabled}>
              Annuler
            </Button>

            <Button type="submit" disabled={disabled}>
              Enregistrer
            </Button>
          </div>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ReclamationDialog;

'use client'

import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import InputSelect from './inputSelect'
import Input from './Input'
import SelectInput from './SelectInput'
import Button from '@/components/Button'; // adjust the path as needed

const ReclamationDialog = ({
  open,
  onClose,
  type = "traiter",
  prestataires = [],
  values,
  setValues,
  onSubmit,
  disabled
}) => {
  const isTraitement = type === "traiter"

  const statutOptions = [
    { value: '3', label: 'Résolu' },
    { value: '4', label: 'Non Résolu' },
  ]

  const prestataireOptions = prestataires.map(p => ({
    value: p.id,
    label: `${p.prenom} ${p.nom}`,
  }))

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      {/* Header */}
      <Box sx={{
        backgroundColor: isTraitement ? '#009FFF' : '#28A745',
        px: 3, py: 2,
        borderTopLeftRadius: 8, borderTopRightRadius: 8
      }}>
        <Typography variant="h5" align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
          {isTraitement ? "Traiter Réclamation" : "Résoudre Réclamation"}
        </Typography>
      </Box>

      {/* Content */}
      <DialogContent sx={{ px: 4, py: 3 }}>
        <Box component="form" onSubmit={onSubmit} noValidate>
          <Grid container spacing={3}>
            {isTraitement ? (
              <>
                {/* Prestataire */}
                <Grid item xs={12} sm={6}>
                <div className="w-full sm:w-[250px]">
                  <InputSelect
                    label="Prestataire"
                    name="prestataire_id"
                    value={values.prestataire_id}
                    onChange={(selected) =>
                      setValues(prev => ({ ...prev, prestataire_id: selected?.value || '' }))
                    }
                    options={prestataireOptions}
                    placeholder="Sélectionner un prestataire"
                    required
                  />
                  </div>
                </Grid>

                {/* Date intervention */}
                <Grid item xs={12} sm={6}>
                <div className="w-full sm:w-[250px]">
                  <Input
                    label="Date d’intervention"
                    type="date"
                    name="date_intervention"
                    value={values.date_intervention || ''}
                    onChange={(e) => setValues(prev => ({ ...prev, date_intervention: e.target.value }))}
                    required
                  />
                  </div>
                </Grid>
              </>
            ) : (
              <>
                {/* Statut */}
                <Grid item xs={12} sm={6}>
                <div className="w-full sm:w-[250px]"> 

                  <SelectInput
                    label="Statut"
                    value={values.statut}
                    onChange={(val) => setValues(prev => ({ ...prev, statut: val }))}
                    options={statutOptions}
                    placeholder="Sélectionner un statut"
                    error={!values.statut}
                  />
                  </div>

                </Grid>

                {/* Date fin d’intervention */}
                <Grid item xs={12} sm={6}>
                <div className="w-full sm:w-[250px]"> 

                  <Input
                    label="Date de fin d’intervention"
                    type="date"
                    name="date_fin_inter"
                    value={values.date_fin_inter || ''}
                    onChange={(e) => setValues(prev => ({ ...prev, date_fin_inter: e.target.value }))}
                    required
                  />
                  </div>
                </Grid>
                
              </>
            )}

            {/* Commentaire */}
            <Grid item xs={12} sm={12}>
            <div className="w-full sm:w-[500px]"> 
            <Input
              label="Commentaire"
              name="commentaire"
              value={values.commentaire || ''}
              onChange={(e) => setValues(prev => ({ ...prev, commentaire: e.target.value }))}
              placeholder="Ajouter un commentaire (optionnel)"
              multiline
              rows={4}
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
  )
}

export default ReclamationDialog

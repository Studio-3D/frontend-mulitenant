'use client';

import { Fragment } from 'react';
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

  if (!open) return null;

  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        {/* Header */}
        <div
          className={`px-6 py-4 rounded-t-2xl ${
            isResolution || isResolutionClient ? 'bg-green-600' : 'bg-[#009FFF]'
          }`}
        >
          <h5 className="text-white font-bold text-xl text-center">
            {isTraitementRec && 'Traiter Réclamation'}
            {isResolution && 'Résoudre Réclamation'}
            {isResolutionClient && 'Résoudre Réclamation Client'}
            {isTraitementClient && 'Traiter Réclamation'}
          </h5>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <form onSubmit={onSubmit} noValidate>
            <div className="space-y-6">
              {isTraitementRec && (
                <>
                  {/* Prestataire */}
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

                  {/* Date d’intervention */}
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
                </>
              )}

              {isResolution && (
                <>
                  {/* Statut */}
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
                </>
              )}

              {(isTraitementClient || isResolutionClient) && (
                <>
                  {/* Statut */}
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

                  {values.statut == 1 ? (
                    // En cours → date de traitement
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
                  ) : values.statut == 2 ? (
                    // Traité ou Non Traité → date de fin d’intervention
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
                  ) : null}
                </>
              )}

              {/* Commentaire pour tous les cas */}
              <div className="w-full ">
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
                  placeholder="Ajouter un commentaire "
                  multiline
                  rows={4}
                  required
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 items-center mt-8 mb-4">
              <Button type="button" onClick={onClose} disabled={disabled}>
                Annuler
              </Button>

              <Button type="submit" disabled={disabled}>
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Backdrop - click outside to close */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={onClose}
      />
    </div>
  
  );
};

export default ReclamationDialog;
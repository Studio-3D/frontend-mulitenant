import React from 'react';
import TextField from '@/components/Textfield';
import SelectInput from '@/components/SelectInput';

const FreinsComponent = ({
  watch,
  control,
  errors,
  backendErrors,
  defaultValues,
  formSubmitted,
  type_freins,
  list_tranches,
  list_etages,
  orientationOptions,
  list_typologies,
  list_vues,
  loading_tp_frein,
  loading,
  handleChange_freins,
  handlePrixChange,
  setValue,
  info_prix,
  info_sup,
  isEditMode,
}) => {
  // Transform data for SelectInput with safety checks
  const freinOptions = type_freins
    .filter(frein => frein && frein.description)
    .map(frein => ({
      value: frein.description?.toLowerCase() || '',
      label: frein.description || ''
    }))
    .filter(option => option.value && option.label);

  const trancheOptions = list_tranches
    .filter(tranche => tranche && tranche.id && tranche.nom)
    .map(tranche => ({
      value: tranche.id.toString(),
      label: tranche.nom
    }));

  const etageOptions = list_etages
    .filter(etage => etage && etage.value !== undefined && etage.value !== null)
    .map(etage => ({
      value: etage.value.toString(),
      label: etage.value.toString()
    }));

  const orientationSelectOptions = orientationOptions
    .filter(orientation => orientation && orientation.code && orientation.label)
    .map(orientation => ({
      value: orientation.code.toString(),
      label: orientation.label
    }));

  const typologieOptions = list_typologies
    .filter(typologie => typologie && typologie.id && typologie.typologie)
    .map(typologie => ({
      value: typologie.id.toString(),
      label: typologie.typologie
    }));

  const vueOptions = list_vues
    .filter(vue => vue && vue.id && vue.vue)
    .map(vue => ({
      value: vue.id.toString(),
      label: vue.vue
    }));

  // Helper function to handle SelectInput changes
  const handleSelectChange = (fieldName, selectedValues) => {
    setValue(fieldName, selectedValues || []);
  };

  return (
    <>
      {/* Freins Field */}
      <div>
        <SelectInput
          label="Freins :"
          name="frein"
          required={true}
          isMulti={true}
          options={freinOptions}
          value={watch('frein') || []}
          onChange={(selectedValues) => handleChange_freins(selectedValues)}
          placeholder="Sélectionnez un ou plusieurs freins"
          errors={{
            ...errors,
            frein:
              formSubmitted && (!watch('frein') || watch('frein').length === 0)
                ? 'Veuillez renseigner le champ frein.'
                : null,
          }}
          loading={loading_tp_frein}
          backendErrors={backendErrors}
        />
      </div>

      {/* Tranches Field */}
      {watch('frein')?.includes('tranche') && (
        <div>
          <SelectInput
            label="Tranches :"
            name="tranches"
            required={true}
            isMulti={true}
            options={trancheOptions}
            value={watch('tranches') || []}
            onChange={(selectedValues) => handleSelectChange('tranches', selectedValues)}
            placeholder="sélectionnez un ou plusieurs Tranches"
            errors={{
              ...errors,
              tranches:
                formSubmitted &&
                watch('frein')?.includes('tranche') &&
                (!watch('tranches') || watch('tranches').length === 0)
                  ? "Ce champ est obligatoire lorsque 'frein' inclut 'tranche'."
                  : null,
            }}
            backendErrors={backendErrors}
            loading={loading}
          />
        </div>
      )}

      {/* Etages Field */}
      {watch('frein')?.includes('etage') && (
        <div>
          <SelectInput
            label="Etages :"
            name="etages"
            required={true}
            isMulti={true}
            options={etageOptions}
            value={watch('etages') || []}
            onChange={(selectedValues) => handleSelectChange('etages', selectedValues)}
            placeholder="sélectionnez un ou plusieurs étages"
            errors={{
              ...errors,
              etages:
                formSubmitted &&
                watch('frein')?.includes('etage') &&
                (!watch('etages') || watch('etages').length === 0)
                  ? "Ce champ est obligatoire lorsque 'frein' inclut 'etage'."
                  : null,
            }}
            backendErrors={backendErrors}
            loading={loading}
          />
        </div>
      )}

      {/* Orientations Field */}
      {watch('frein')?.includes('orientation') && (
        <div>
          <SelectInput
            label="Orientations :"
            name="orientations"
            required={true}
            isMulti={true}
            options={orientationSelectOptions}
            value={watch('orientations') || []}
            onChange={(selectedValues) => handleSelectChange('orientations', selectedValues)}
            placeholder="sélectionnez un ou plusieurs orientations"
            errors={{
              ...errors,
              orientations:
                formSubmitted &&
                watch('frein')?.includes('orientation') &&
                (!watch('orientations') || watch('orientations').length === 0)
                  ? "Ce champ est obligatoire lorsque 'frein' inclut 'orientation'."
                  : null,
            }}
            backendErrors={backendErrors}
            loading={loading}
          />
        </div>
      )}

      {/* Avance Field */}
      {watch('frein')?.includes('avance') && (
        <div>
          <TextField
            label="Avance:"
            name="avance"
            type="number"
            control={control}
            errors={errors}
            backendErrors={backendErrors}
            defaultValues={defaultValues}
            required={watch('frein')?.includes('avance')}
          />
        </div>
      )}

      {/* Prix Fields */}
      {watch('frein')?.includes('prix') && (
        <>
          <div className="sm:col-span-2 flex gap-4">
            <div className="w-1/2">
              <TextField
                label="Prix Min:"
                name="prix_min"
                type="number"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
                onChange={handlePrixChange(1)}
                required={watch('frein')?.includes('prix')}
              />
              {info_prix != null && (
                <div className="text-red-500 text-sm mt-1">
                  {info_prix}
                </div>
              )}
            </div>
            <div className="w-1/2">
              <TextField
                label="Prix Max:"
                name="prix_max"
                type="number"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
                onChange={handlePrixChange(1)}
                required={watch('frein')?.includes('prix')}
              />
            </div>
          </div>
        </>
      )}

      {/* Superficie Fields */}
      {watch('frein')?.includes('superficie') && (
        <>
          <div className="sm:col-span-2 flex gap-4">
            <div className="w-1/2">
              <TextField
                label="Sup Min:"
                name="sup_min"
                type="number"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
                onChange={handlePrixChange(2)}
                required={watch('frein')?.includes('superficie')}
              />
              {info_sup != null && (
                <div className="text-red-500 text-sm mt-1">
                  {info_sup}
                </div>
              )}
            </div>
            <div className="w-1/2">
              <TextField
                label="Sup Max:"
                name="sup_max"
                type="number"
                control={control}
                errors={errors}
                backendErrors={backendErrors}
                defaultValues={defaultValues}
                onChange={handlePrixChange(2)}
                required={watch('frein')?.includes('superficie')}
              />
            </div>
          </div>
        </>
      )}

      {/* Typologies Field */}
      {watch('frein')?.includes('typologie') && (
        <div>
          <SelectInput
            label="Typologies :"
            name="typologies"
            required={true}
            isMulti={true}
            options={typologieOptions}
            value={watch('typologies') || []}
            onChange={(selectedValues) => handleSelectChange('typologies', selectedValues)}
            placeholder="sélectionnez un ou plusieurs Typologies"
            errors={{
              ...errors,
              typologies:
                formSubmitted &&
                watch('frein')?.includes('typologie') &&
                (!watch('typologies') || watch('typologies').length === 0)
                  ? "Ce champ est obligatoire lorsque 'frein' inclut 'typologie'."
                  : null,
            }}
            loading={loading}
            backendErrors={backendErrors}
          />
        </div>
      )}

      {/* Vues Field */}
      {watch('frein')?.includes('vue') && (
        <div>
          <SelectInput
            label="Vue :"
            name="vues"
            required={true}
            isMulti={true}
            options={vueOptions}
            value={watch('vues') || []}
            onChange={(selectedValues) => handleSelectChange('vues', selectedValues)}
            placeholder="sélectionnez un ou plusieurs Vues"
            errors={{
              ...errors,
              vues:
                formSubmitted &&
                watch('frein')?.includes('vue') &&
                (!watch('vues') || watch('vues').length === 0)
                  ? "Ce champ est obligatoire lorsque 'frein' inclut 'vue'."
                  : null,
            }}
            loading={loading}
            backendErrors={backendErrors}
          />
        </div>
      )}

      {/* Description Autre Field */}
      {watch('frein')?.includes('autre') && (
        <div>
          <TextField
            label="Description Frein Autre:"
            name="description_autre"
            multi={true}
            control={control}
            errors={errors}
            backendErrors={backendErrors}
            defaultValues={defaultValues}
            required={watch('frein')?.includes('autre')}
            width="w-full"
            height="h-full"
          />
        </div>
      )}
    </>
  );
};

export default FreinsComponent;
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
  loading_tr,
  handleChange_freins,
  handlePrixChange,
  setValue,
  info_prix,
  info_sup,
  isEditMode,
}) => {
  // Helper function to get selected values in the correct format
  const getSelectedValues = (fieldName, options) => {
    const storedValues = watch(fieldName) || [];
    
    // If values are already in the correct format (array of strings)
    if (storedValues.length > 0 && typeof storedValues[0] === 'string') {
      return storedValues;
    }
    
    // If values are objects, extract the IDs
    if (storedValues.length > 0 && typeof storedValues[0] === 'object') {
      return storedValues.map(item => item.id.toString());
    }
    
    return [];
  };

  // Helper function to handle SelectInput changes
  const handleSelectChange = (fieldName, selectedValues) => {
    setValue(fieldName, selectedValues || []);
  };

  // Transform data for SelectInput with safety checks
  const freinOptions = type_freins
    .filter(frein => frein && frein.description)
    .map(frein => ({
      value: frein.description?.toUpperCase() || '', // UPPERCASE to match conditional checks
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
      {watch('frein')?.includes('TRANCHE') && (
        <div>
          <SelectInput
            label="Tranches :"
            name="tranches"
            required={true}
            isMulti={true}
            options={trancheOptions}
            value={getSelectedValues('tranches', trancheOptions)}
            onChange={(selectedValues) => handleSelectChange('tranches', selectedValues)}
            placeholder="sélectionnez un ou plusieurs Tranches"
            errors={{
              ...errors,
              tranches:
                formSubmitted &&
                watch('frein')?.includes('TRANCHE') &&
                (!watch('tranches') || watch('tranches').length === 0)
                  ? "Ce champ est obligatoire lorsque 'frein' inclut 'tranche'."
                  : null,
            }}
            backendErrors={backendErrors}
            loading={loading_tr}
          />
        </div>
      )}

      {/* Etages Field */}
      {watch('frein')?.includes('ETAGE') && (
        <div>
          <SelectInput
            label="Etages :"
            name="etages"
            required={true}
            isMulti={true}
            options={etageOptions}
            value={getSelectedValues('etages', etageOptions)}
            onChange={(selectedValues) => handleSelectChange('etages', selectedValues)}
            placeholder="sélectionnez un ou plusieurs étages"
            errors={{
              ...errors,
              etages:
                formSubmitted &&
                watch('frein')?.includes('ETAGE') &&
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
      {watch('frein')?.includes('ORIENTATION') && (
        <div>
          <SelectInput
            label="Orientations :"
            name="orientations"
            required={true}
            isMulti={true}
            options={orientationSelectOptions}
            value={getSelectedValues('orientations', orientationSelectOptions)}
            onChange={(selectedValues) => handleSelectChange('orientations', selectedValues)}
            placeholder="sélectionnez un ou plusieurs orientations"
            errors={{
              ...errors,
              orientations:
                formSubmitted &&
                watch('frein')?.includes('ORIENTATION') &&
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
      {watch('frein')?.includes('AVANCE') && (
        <div>
          <TextField
            label="Avance:"
            name="avance"
            type="number"
            control={control}
            errors={errors}
            backendErrors={backendErrors}
            defaultValues={defaultValues}
            required={watch('frein')?.includes('AVANCE')}
          />
        </div>
      )}

      {/* Prix Fields */}
      {watch('frein')?.includes('PRIX') && (
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
                required={watch('frein')?.includes('PRIX')}
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
                required={watch('frein')?.includes('PRIX')}
              />
            </div>
          </div>
        </>
      )}

      {/* Superficie Fields */}
      {watch('frein')?.includes('SUPERFICIE') && (
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
                required={watch('frein')?.includes('SUPERFICIE')}
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
                required={watch('frein')?.includes('SUPERFICIE')}
              />
            </div>
          </div>
        </>
      )}

      {/* Typologies Field */}
      {watch('frein')?.includes('TYPOLOGIE') && (
        <div>
          <SelectInput
            label="Typologies :"
            name="typologies"
            required={true}
            isMulti={true}
            options={typologieOptions}
            value={getSelectedValues('typologies', typologieOptions)}
            onChange={(selectedValues) => handleSelectChange('typologies', selectedValues)}
            placeholder="sélectionnez un ou plusieurs Typologies"
            errors={{
              ...errors,
              typologies:
                formSubmitted &&
                watch('frein')?.includes('TYPOLOGIE') &&
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
      {watch('frein')?.includes('VUE') && (
        <div>
          <SelectInput
            label="Vue :"
            name="vues"
            required={true}
            isMulti={true}
            options={vueOptions}
            value={getSelectedValues('vues', vueOptions)}
            onChange={(selectedValues) => handleSelectChange('vues', selectedValues)}
            placeholder="sélectionnez un ou plusieurs Vues"
            errors={{
              ...errors,
              vues:
                formSubmitted &&
                watch('frein')?.includes('VUE') &&
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
      {watch('frein')?.includes('AUTRE') && (
        <div>
          <TextField
            label="Description Frein Autre:"
            name="description_autre"
            multi={true}
            control={control}
            errors={errors}
            backendErrors={backendErrors}
            defaultValues={defaultValues}
            required={watch('frein')?.includes('AUTRE')}
            width="w-full"
            height="h-full"
          />
        </div>
      )}
    </>
  );
};

export default FreinsComponent;
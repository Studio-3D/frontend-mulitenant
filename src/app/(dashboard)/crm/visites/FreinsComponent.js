import React from 'react';
import AutocompleteMultiple from '@/components/AutocompleteMultiple'; // Adjust the path as needed
import TextField from '@/components/Textfield'; // Import the component

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
  isEditMode, // Boolean: whether it's editing mode or not
}) => {
  return (
    <>
      {/* Freins Field */}
      <div>
        <AutocompleteMultiple
          label="Freins :"
          name="frein"
          required={true}
          options={type_freins}
          value={
            isEditMode
              ? (Array.isArray(watch('frein')) ? watch('frein') : []).map(
                  (word) =>
                    typeof word == 'string'
                      ? word.toLowerCase()
                      : word?.description?.toLowerCase()
                )
              : []
          } // Differentiate for edit mode
          choiceKey="description"
          valueKey="description"
          onChange={handleChange_freins}
          placeholder="Sélectionnez un ou plusieurs freins"
          errors={{
            ...errors,
            frein:
              formSubmitted && watch('frein')?.length === 0
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
          <AutocompleteMultiple
            label="Tranches :"
            name="tranches"
            required={true}
            value={watch('tranches')}
            options={list_tranches}
            choiceKey="nom"
            valueKey="id"
            onChange={(newValue) => {
              if (Array.isArray(newValue)) {
                const selectedIds = newValue.map((option) => option?.id);
                setValue('tranches', selectedIds);
              } else {
                console.error('Expected array but got:', newValue);
              }
            }}
            placeholder="sélectionnez un ou plusieurs Tranches"
            errors={{
              ...errors,
              tranches:
                formSubmitted &&
                watch('frein')?.includes('tranche') &&
                watch('tranches')?.length === 0
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
          <AutocompleteMultiple
            label="Etages :"
            name="etages"
            required={true}
            value={
              isEditMode
                ? Array.isArray(watch('etages'))
                  ? watch('etages')
                  : []
                : []
            }
            options={list_etages}
            choiceKey="value"
            valueKey="value"
            onChange={(newValue) => {
              if (Array.isArray(newValue)) {
                const selectedValues = newValue.map((option) => option?.value);
                const etagesArray = selectedValues.join(',');
                setValue('etages', etagesArray);
              } else {
                console.error('Expected array but got:', newValue);
              }
            }}
            placeholder="sélectionnez un ou plusieurs étages"
            errors={{
              ...errors,
              etages:
                formSubmitted &&
                watch('frein')?.includes('etage') &&
                watch('etages')?.length === 0
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
          <AutocompleteMultiple
            label="Orientations :"
            name="orientations"
            required={true}
            value={
              isEditMode
                ? Array.isArray(watch('orientations'))
                  ? orientationOptions.filter((opt) =>
                      watch('orientations').includes(opt.code)
                    )
                  : []
                : []
            }
            options={orientationOptions}
            choiceKey="label"
            valueKey="code"
            onChange={(newValue) => {
              if (Array.isArray(newValue)) {
                const selectedCodes = newValue.map((option) => option?.code);
                setValue('orientations', selectedCodes);
              } else {
                console.error('Expected array but got:', newValue);
              }
            }}
            placeholder="sélectionnez un ou plusieurs orientations"
            errors={{
              ...errors,
              orientations:
                formSubmitted &&
                watch('frein')?.includes('orientation') &&
                watch('orientations')?.length === 0
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
          <AutocompleteMultiple
            label="Typologies :"
            name="typologies"
            required={true}
            value={watch('typologies')}
            options={list_typologies}
            choiceKey="typologie"
            valueKey="id"
            onChange={(newValue) => {
              if (Array.isArray(newValue)) {
                const selectedIds = newValue.map((option) => option?.id);
                setValue('typologies', selectedIds);
              } else {
                console.error('Expected array but got:', newValue);
              }
            }}
            placeholder="sélectionnez un ou plusieurs Typologies"
            errors={{
              ...errors,
              typologies:
                formSubmitted &&
                watch('frein')?.includes('typologie') &&
                watch('typologies')?.length === 0
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
          <AutocompleteMultiple
            label="Vue :"
            name="vues"
            required={true}
            options={list_vues}
            value={watch('vues') || []}
            valueKey="id"
            choiceKey="vue"
            onChange={(newValue) => {
              const ids = Array.isArray(newValue)
                ? newValue.map((option) => option.id)
                : [];
              const payload = ids.length > 0 ? ids.join(',') : '';
              setValue('vues', payload);
            }}
            placeholder="sélectionnez un ou plusieurs Vues"
            errors={{
              ...errors,
              vues:
                formSubmitted &&
                watch('frein')?.includes('vue') &&
                watch('vues')?.length === 0
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

import React from 'react';
import { Controller } from 'react-hook-form';
import Input from '@/components/Input';
import SelectInput from '@/components/SelectInput';

const ProspectInformations = ({
  control,
  watch,
  errors,
  backendErrors,
  defaultValues,
  formSubmitted,
  email_required,
  loading,
  sources,
  handleSourceChange,
  partenaires,
  handlePartenaireChange,
  source_d,
  disabled_var_source,
  partenaire_txt,
  sourceValue,
  partenaireValue,
  handleChange_event,
  loading_sources,
  loading_partenaires,
}) => {
  
  // Transform sources data for SelectInput
  const sourceOptions = sources.map(source => ({
    value: source.id.toString(),
    label: source.source
  }));

  // Transform partenaires data for SelectInput
  const partenaireOptions = partenaires.map(partenaire => ({
    value: partenaire.id.toString(),
    label: partenaire.description
  }));

  return (
    <>
      <div>
        <Input
          label="Nom:"
          name="nom"
          required
          control={control}
          error={errors?.nom?.message || backendErrors?.nom}
          defaultValue={defaultValues?.nom}
        />
      </div>
      <div>
        <Input
          label="Prenom:"
          name="prenom"
          required
          control={control}
          error={errors?.prenom?.message || backendErrors?.prenom}
          defaultValue={defaultValues?.prenom}
        />
      </div>
      <div>
        <Input
          label="Email:"
          name="email"
          type="email"
          placeholder="email@example.com"
          control={control}
          rules={{
            required: false,
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Email invalide',
            },
          }}
          error={errors?.email?.message || backendErrors?.email}
          defaultValue={defaultValues?.email}
          onChange={(e) => {
            handleChange_event("l'email")(e);
          }}
        />
      </div>
      <div>
        <Input
          label="CIN:"
          name="cin"
          required={Number(watch('interet')) === 1}
          control={control}
          onChange={(e) => {
            handleChange_event('cin')(e);
          }}
          rules={{
            validate: (value) => {
              if (Number(watch('interet')) === 1 && !value) {
                return 'Ce champ est obligatoire lorsque interet est intéressé.';
              }
              return true;
            },
          }}
          error={errors?.cin?.message || backendErrors?.cin}
          defaultValue={defaultValues?.cin}
        />
      </div>
      <div>
        <Input
          label="Téléphone:"
          required
          name="telephone"
          type="number"
          control={control}
          error={errors?.telephone?.message || backendErrors?.telephone}
          defaultValue={defaultValues?.telephone}
          inputMode="numeric"
          onKeyDown={(e) => {
            const allowedKeys = [
              'Backspace',
              'Delete',
              'ArrowLeft',
              'ArrowRight',
              'Tab',
            ];

            if (allowedKeys.includes(e.key)) return;

            if (!/^[0-9]$/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, '');

            // If using react-hook-form's setValue method:
            if (control.setValue) {
              control.setValue('telephone', numericValue, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }

            // Trigger your custom handler
            handleChange_event('Téléphone')({
              ...e,
              target: { ...e.target, value: numericValue },
            });
          }}
        />
      </div>
      <div>
        <Input
          label="Téléphone 2:"   
          name="telephone_num2"
          type="number"
          control={control}
          error={errors?.telephone_num2?.message || backendErrors?.telephone_num2}
          defaultValue={defaultValues?.telephone_num2}
          inputMode="numeric"
          onKeyDown={(e) => {
            const allowedKeys = [
              'Backspace',
              'Delete',
              'ArrowLeft',
              'ArrowRight',
              'Tab',
            ];

            if (allowedKeys.includes(e.key)) return;

            if (!/^[0-9]$/.test(e.key)) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, '');

            // If using react-hook-form's setValue method:
            if (control.setValue) {
              control.setValue('telephone_num2', numericValue, {
                shouldValidate: true,
                shouldDirty: true,
              });
            }

            // Trigger your custom handler
            handleChange_event('Téléphone2')({
              ...e,
              target: { ...e.target, value: numericValue },
            });
          }}
        />
      </div>
      <div>
        <Input
          label="Ville:"
          name="ville"
          control={control}
          error={errors?.ville?.message || backendErrors?.ville}
          defaultValue={defaultValues?.ville}
        />
      </div>

      {/* Source Select */}
      {disabled_var_source ? (
        <div>
          <SelectInput
            placeholder='Sélectionner une source'
            options={sourceOptions}
            label="Source:"
            name="source_id"
            value={watch('source_id')?.toString()}
            disabled
            loading={loading_sources}
            error={errors?.source_id?.message || backendErrors?.source_id}
            onChange={handleSourceChange}
          />
        </div>
      ) : (
        <div>
          <SelectInput
            placeholder='Sélectionner une source'
            label="Source:"
            required
            name="source_id"
            value={watch('source_id')?.toString()}
            options={sourceOptions}
            loading={loading_sources}
            error={errors?.source_id?.message || backendErrors?.source_id}
            onChange={handleSourceChange}
          />
        </div>
      )}

      {/* Partenaire Select - Always show when source is Partenaire */}
      {watch('source_txt') === 'Partenaire' && (
        <div>
          <SelectInput
            placeholder='Sélectionner un partenaire'
            label="Partenaire:"
            name="partenaire_id"
            required={watch('source_txt') == 'Partenaire'}
            options={partenaireOptions}
            value={watch('partenaire_id')?.toString()}
            loading={loading_partenaires}
            error={
              errors?.partenaire_id?.message || 
              backendErrors?.partenaire_id ||
              (formSubmitted && watch('source_txt') === 'Partenaire' && !watch('partenaire_id') 
                ? 'Partenaire est obligatoire' 
                : null)
            }
            onChange={handlePartenaireChange}
          />
        </div>
      )}

      <div className="flex items-center justify-between w-full mt-4">
        <Controller
          name="notifie"
          control={control}
          defaultValue={defaultValues['notifie'] || 0}
          render={({ field }) => (
            <label className="flex justify-center items-center space-x-2">
              <input
                type="checkbox"
                {...field}
                checked={field.value === 1}
                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                className="h-5 w-7 items-center rounded-full bg-gray-300 transition-all duration-300 "
              />
              <span
                className={` font-medium ${
                  field.value === 1 ? 'text-[#009FFF]' : ''
                }`}
              >
                Accepte {'d\''}être contacté
              </span>
            </label>
          )}
        />
      </div>
    </>
  );
};

export default ProspectInformations;
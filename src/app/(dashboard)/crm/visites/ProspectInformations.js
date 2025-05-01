import React from 'react';
import { Controller } from 'react-hook-form';
import Autocomplete from '@/components/Autocomplete';
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
  selectedProspect,
  disabled_var_source,
  partenaire_txt,
  sourceValue,
  partenaireValue,
  handleChange_event,
}) => {
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
          required={email_required}
          control={control}
          error={
            formSubmitted && email_required && !watch('email')
              ? 'Email obligatoire'
              : formSubmitted &&
                watch('email') &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watch('email'))
              ? 'Email invalide'
              : errors?.email?.message || backendErrors?.email
          }
          defaultValue={defaultValues?.email}
          onChange={(e) => {
            control?.register('email').onChange(e);
            handleChange_event("l'email")(e);
          }}
        />
      </div>
      <div>
        <Input
          label="CNI:"
          name="cin"
          required={Number(watch('interet')) === 1}
          control={control}
          error={
            formSubmitted && Number(watch('interet')) === 1 && !watch('cin')
              ? 'Ce champ est obligatoire lorsque interet est intéressé.'
              : errors?.cin?.message || backendErrors?.cin
          }
          defaultValue={defaultValues?.cin}
          onChange={(e) => {
            control?.register('cin').onChange(e);
            handleChange_event('cin')(e);
          }}
        />
      </div>
      <div>
      <Input
        label="Telephone:"
        required
        name="telephone"
        type="text" // Keep as text input
        control={control}
        error={errors?.telephone?.message || backendErrors?.telephone}
        defaultValue={defaultValues?.telephone}
        onKeyPress={(e) => {
          // Only allow numbers (0-9) to be pressed
          if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          // Filter out any non-numeric characters that might get through (like paste)
          const numericValue = e.target.value.replace(/[^0-9]/g, '');
          // Update the input value
          e.target.value = numericValue;
          // Pass to form handlers
          control?.register('telephone').onChange(e);
          handleChange_event('Téléphone')(e);
        }}
        inputMode="numeric" // Shows numeric keyboard on mobile
      />
      </div>
      <div>
      <Input
        label="Telephone 2:"
        name="telephone_num2"
        type="text" // Keep as text input
        control={control}
        error={errors?.telephone_num2?.message || backendErrors?.telephone_num2}
        defaultValue={defaultValues?.telephone_num2}
        onKeyPress={(e) => {
          // Only allow numbers (0-9) to be pressed
          if (!/[0-9]/.test(e.key)) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          // Filter out any non-numeric characters that might get through (like paste)
          const numericValue = e.target.value.replace(/[^0-9]/g, '');
          // Update the input value
          e.target.value = numericValue;
          // Pass to form handlers
          control?.register('telephone_num2').onChange(e);
          handleChange_event('Téléphone2')(e);
        }}
        inputMode="numeric" // Shows numeric keyboard on mobile
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
      {selectedProspect?.source || disabled_var_source ? (
        <div>
          <SelectInput
            label="Source:"
            name="source_txt"
            disabled
            control={control}
            error={errors?.source_txt?.message || backendErrors?.source_txt}
            defaultValue={defaultValues?.source_txt}
          />
        </div>
      ) : (
        <div>
          <SelectInput
            label="Source:"
            required
            name="source_id"
            value={sourceValue}
            options={sources}
            placeholder="Sélectionnez une source"
            onChange={handleSourceChange}
            error={errors?.source_id?.message || backendErrors?.source_id}
          />
        </div>
      )}
      {watch('source_txt') === 'Partenaire' &&
        (partenaire_txt != null ? (
          <div>
            <Input
              label="Partenaire:"
              name="partenaire_txt"
              disabled
              control={control}
              error={errors?.partenaire_txt?.message || backendErrors?.partenaire_txt}
              defaultValue={defaultValues?.partenaire_txt}
            />
          </div>
        ) : (
          <div>
            <Autocomplete
              label="Partenaire:"
              name="partenaire_id"
              required={watch('source_txt') === 'Partenaire'}
              options={partenaires}
              value={partenaireValue}
              loading={loading}
              control={control}
              errors={{
                ...errors,
                partenaire_id:
                  formSubmitted &&
                  watch('source_txt') === 'Partenaire' &&
                  !watch('partenaire_id')
                    ? { message: 'Partenaire est obligatoire' }
                    : null,
              }}
              backendErrors={backendErrors}
              onChange={handlePartenaireChange}
              choix="description"
            />
          </div>
        ))}
      <div className="flex items-center">
        <Controller
          name="notifie"
          control={control}
          defaultValue={defaultValues['notifie'] || 0}
          render={({ field }) => (
            <label className="flex items-center space-x-2">
              <span
                className={`text-sm font-medium ${
                  field.value === 1 ? 'text-purple-600' : ''
                }`}
              >
                Accepte être contacté:
              </span>
              <input
                type="checkbox"
                {...field}
                checked={field.value === 1}
                onChange={(e) => field.onChange(e.target.checked ? 1 : 0)}
                className="h-5 w-10 rounded-full bg-gray-300 transition-all duration-300"
              />
            </label>
          )}
        />
      </div>
    </>
  );
};

export default ProspectInformations;
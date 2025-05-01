import React from 'react';
import { Controller } from 'react-hook-form';
import TextField from '@/components/Textfield'; // Import the component
import Autocomplete from '@/components/Autocomplete'; // Import the component

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
  sourceValue, // Add this prop for the source value
  partenaireValue, // Add this prop for the partenaire value
  handleChange_event,
}) => {
  return (
    <>
      <div>
        <TextField
          label="Cin:"
          name="cin"
          required={Number(watch('interet')) === 1}
          control={control}
          errors={{
            ...errors,
            cin:
              formSubmitted && Number(watch('interet')) === 1
                ? 'Ce champ est obligatoire lorsque interet est intéressé.'
                : null,
          }}
          backendErrors={backendErrors}
          defaultValues={defaultValues}
          onChange={handleChange_event('cin')}
        />
      </div>
      <div>
        <TextField
          label="Nom:"
          name="nom"
          control={control}
          errors={errors}
          backendErrors={backendErrors}
          defaultValues={defaultValues}
        />
      </div>
      <div>
        <TextField
          label="Prenom:"
          name="prenom"
          required
          control={control}
          errors={errors}
          backendErrors={backendErrors}
          defaultValues={defaultValues}
        />
      </div>
      <div>
        <TextField
          label="Email:"
          name="email"
          type="email"
          required={email_required}
          errors={{
            ...errors,
            email:
              formSubmitted && email_required && !watch('email')
                ? { message: 'Email obligatoire' }
                : formSubmitted &&
                  watch('email') &&
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watch('email'))
                ? { message: 'Email invalide' }
                : null,
          }}
          control={control}
          backendErrors={backendErrors}
          defaultValues={defaultValues}
          onChange={handleChange_event("l'email")}
        />
      </div>
      <div>
        <TextField
          label="Telephone:"
          required
          name="telephone"
          type="number"
          control={control}
          errors={errors}
          backendErrors={backendErrors}
          defaultValues={defaultValues}
          onChange={handleChange_event('Téléphone')}
        />
      </div>
      <div>
        <TextField
          label="Telephone 2:"
          required
          name="telephone_num2"
          type="number"
          control={control}
          errors={errors}
          backendErrors={backendErrors}
          defaultValues={defaultValues}
          onChange={handleChange_event('Téléphone2')}
        />
      </div>
      <div>
        <TextField
          label="Ville:"
          name="ville"
          control={control}
          errors={errors}
          backendErrors={backendErrors}
          defaultValues={defaultValues}
        />
      </div>
      {selectedProspect?.source || disabled_var_source ? (
        <div>
          <TextField
            label="Source:"
            name="source_txt"
            disabled
            control={control}
            errors={errors}
            backendErrors={backendErrors}
            defaultValues={defaultValues}
          />
        </div>
      ) : (
        <div>
          <Autocomplete
            label="Source:"
            required
            name="source_id"
            value={sourceValue}
            options={sources}
            loading={loading}
            control={control}
            errors={errors}
            backendErrors={backendErrors}
            onChange={handleSourceChange}
            choix="source"
          />
        </div>
      )}
      {watch('source_txt') === 'Partenaire' &&
        (partenaire_txt != null ? (
          <div>
            <TextField
              label="Partenaire:"
              name="partenaire_txt"
              disabled
              control={control}
              errors={errors}
              backendErrors={backendErrors}
              defaultValues={defaultValues}
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

'use client';
import React, { useState, useEffect } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';
import SelectInput from '@/components/SelectInput';

export const GeneralParametersStep = ({
  formData,
  updateFormData,
  onPrevious,
  onSubmit,
  isSubmitting,
  errors,
  touched,
  users = [],
  fetchingUsers = false,
  editMode = false,
}) => {
  const [inputValues, setInputValues] = useState({
    typesDeBien: '',
    vues: '',
    typologies: '',
  });

  const [partenaireInputs, setPartenaireInputs] = useState({
    description: '',
    remise: '',
  });
  const [display_errors_users, setDisplay_Errors_users] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize selected users from form data when users are available
  useEffect(() => {
    if (
      !isInitialized &&
      formData.parameters.utilisateursAcces &&
      users.length > 0
    ) {
      // Convert all IDs to strings for consistency
      const userIds = formData.parameters.utilisateursAcces.map((id) =>
        id.toString()
      );
      setSelectedUserIds(userIds);
      setIsInitialized(true);
    }
  }, [formData.parameters.utilisateursAcces, users, isInitialized]);

  // Add new item to a parameter field
  const handleAddItem = (field) => {
    if (inputValues[field].trim()) {
      updateFormData(`parameters.${field}`, [
        ...(formData.parameters[field] || []),
        inputValues[field].trim(),
      ]);
      setInputValues((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Add new partner
  const handleAddPartenaire = () => {
    if (partenaireInputs.description.trim()) {
      const newPartenaire = {
        description: partenaireInputs.description.trim(),
        remise: partenaireInputs.remise || '0',
      };
      updateFormData(`parameters.partenaires`, [
        ...(formData.parameters.partenaires || []),
        newPartenaire,
      ]);
      setPartenaireInputs({ description: '', remise: '' });
    }
  };

  // Remove item from a parameter field
  const handleRemoveItem = (field, index) => {
    const newItems = (formData.parameters[field] || []).filter(
      (_, i) => i !== index
    );
    updateFormData(`parameters.${field}`, newItems);
  };

  // Handle user selection from dropdown
  const handleUserSelection = (selectedValues) => {
    setSelectedUserIds(selectedValues || []);
    updateFormData(`parameters.utilisateursAcces`, selectedValues || []);
    if (display_errors_users) {
      setDisplay_Errors_users(false);
    }
  };

  // Get the full user objects for display
  const getSelectedUsers = () => {
    return selectedUserIds
      .map((id) => users.find((user) => user.id.toString() === id.toString()))
      .filter(Boolean);
  };

  // Prepare user options for SelectInput
  const userOptions = users.map((user) => ({
    value: user.id.toString(),
    label: `${user.prenom} ${user.name}`,
  }));

  // Get display value for an item
  const getItemDisplayValue = (item, field) => {
    // If item is an object (from API), return the appropriate property
    if (typeof item === 'object' && item !== null) {
      if (field === 'typesDeBien') return item.type || item;
      if (field === 'vues') return item.vue || item.type || item;
      if (field === 'typologies') return item.typologie || item.type || item;
      if (field === 'partenaires') return item.description || item.nom || '';
      return item;
    }
    // Otherwise return the string directly
    return item;
  };

  // Render parameter field with add/remove functionality
  const renderParameterField = (field, label, isOptional = true) => {
    const displayItems = formData.parameters[field] || [];

    return (
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-medium text-gray-700">
          {label}{' '}
          {isOptional && (
            <span className="text-gray-500 text-xs">(optionnel)</span>
          )}
        </label>

        {/* Input to add new items */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValues[field]}
            onChange={(e) =>
              setInputValues((prev) => ({ ...prev, [field]: e.target.value }))
            }
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
            placeholder={`Ajouter un ${label.toLowerCase()}`}
          />
          <button
            type="button"
            onClick={() => handleAddItem(field)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-md"
            aria-label={`Ajouter ${label}`}
          >
            <PlusIcon size={20} />
          </button>
        </div>

        {/* Display all items */}
        {displayItems.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {editMode ? `${label} existants` : `${label} ajoutés`} (
              {displayItems.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {displayItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center bg-gray-100 rounded-md px-3 py-1"
                >
                  <span className="text-sm">
                    {getItemDisplayValue(item, field)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(field, index)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                    aria-label={`Retirer ${getItemDisplayValue(item, field)}`}
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedUserIds.length === 0) {
      setDisplay_Errors_users(true);
      updateFormData('touched', {
        ...formData.touched,
        parameters: {
          ...formData.touched?.parameters,
          utilisateursAcces: true,
        },
      });
      updateFormData('errors', {
        ...formData.errors,
        parameters: {
          ...formData.errors?.parameters,
          utilisateursAcces: 'Veuillez sélectionner au moins un utilisateur',
        },
      });
      return;
    } else {
      setDisplay_Errors_users(false);
    }

    onSubmit();
  };

  // Get selected users for display
  const selectedUsers = getSelectedUsers();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800">
          Paramètres généraux
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            {renderParameterField('typesDeBien', 'Types de bien')}
            {renderParameterField('vues', 'Vues')}
            {renderParameterField('typologies', 'Typologies')}
          </div>

          {/* Right Column */}
          <div>
            {/* Partners Section */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Partenaires{' '}
                <span className="text-gray-500 text-xs">(optionnel)</span>
              </label>

              {/* Input to add new partners */}
              <div className="flex gap-2">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Description du partenaire"
                    value={partenaireInputs.description}
                    onChange={(e) =>
                      setPartenaireInputs((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Remise %"
                    value={partenaireInputs.remise}
                    onChange={(e) =>
                      setPartenaireInputs((prev) => ({
                        ...prev,
                        remise: e.target.value,
                      }))
                    }
                    className="block w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border px-3 py-2"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddPartenaire}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded-md"
                  aria-label="Ajouter partenaire"
                >
                  <PlusIcon size={20} />
                </button>
              </div>

              {/* Display all partners */}
              {(formData.parameters.partenaires || []).length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {editMode ? 'Partenaires existants' : 'Partenaires ajoutés'}{' '}
                    ({formData.parameters.partenaires.length})
                  </h4>
                  <div className="flex flex-col gap-2">
                    {formData.parameters.partenaires.map(
                      (partenaire, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-100 rounded-md px-3 py-2"
                        >
                          <div>
                            <span className="font-medium">
                              {getItemDisplayValue(partenaire, 'partenaires')}
                            </span>
                            {partenaire.remise && (
                              <span className="ml-2 text-sm text-gray-500">
                                Remise: {partenaire.remise}%
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveItem('partenaires', index)
                            }
                            className="text-gray-500 hover:text-gray-700"
                            aria-label={`Retirer ${getItemDisplayValue(
                              partenaire,
                              'partenaires'
                            )}`}
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Users Access Section */}
            <div className="space-y-3 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Utilisateurs avec accès au projet{' '}
                <span className="text-red-500">*</span>
              </label>

              <SelectInput
                isMulti
                label=""
                placeholder="Sélectionnez des utilisateurs"
                options={userOptions}
                value={selectedUserIds}
                onChange={handleUserSelection}
                error={errors.parameters?.utilisateursAcces}
                submitted={touched.parameters?.utilisateursAcces}
                required
              />

              {/* Display selected users */}
              {selectedUsers.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {editMode
                      ? 'Utilisateurs existants'
                      : 'Utilisateurs ajoutés'}{' '}
                    ({selectedUsers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center bg-blue-50 rounded-full px-3 py-1 border border-blue-100"
                      >
                        <span className="text-sm text-blue-800">{`${user.prenom} ${user.name}`}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedIds = selectedUserIds.filter(
                              (id) => id !== user.id.toString()
                            );
                            handleUserSelection(updatedIds);
                          }}
                          className="ml-2 text-blue-500 hover:text-blue-700"
                          aria-label={`Retirer ${user.prenom} ${user.name}`}
                        >
                          <XIcon size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {display_errors_users && (
                <div className="text-red-500 text-sm mt-1">
                  {'Veuillez sélectionner au moins un utilisateur'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={onPrevious}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300"
          disabled={isSubmitting}
        >
          Précédent
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting
            ? editMode
              ? 'Mise à jour en cours...'
              : 'Ajout en cours...'
            : editMode
            ? 'Mettre à jour le projet'
            : 'Ajouter le projet'}
        </button>
      </div>
    </div>
  );
};

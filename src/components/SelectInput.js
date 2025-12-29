'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';
import classNames from 'classnames';

export default function SelectInput({
  label,
  placeholder = '',
  options = [],
  value,
  onChange = () => {},
  error,
  width = 'w-full',
  required = false,
  name,
  onBlur,
  submitted = false,
  isMulti = false,
  loading = false,
  disabled = false,
  selected_Data = null, // Add this prop for reservation form cliens
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [internalValue, setInternalValue] = useState(isMulti ? [] : '');
  const dropdownRef = useRef(null);

  // Sync internal value with external value and handle selected_Data
 // In SelectInput component
useEffect(() => {
  if (selected_Data && value === '' && internalValue === '') {
    // Add a check to prevent infinite updates
    setInternalValue(selected_Data);
    // Only call onChange if value is actually different
    if (selected_Data !== value) {
      onChange(selected_Data);
    }
  } else if (isMulti) {
    const newValue = Array.isArray(value) ? value : [];
    setInternalValue(newValue);
  } else {
    setInternalValue(value || '');
  }
}, [value, isMulti, selected_Data]); // Remove internalValue and onChange from dependencies
  // Rest of your SelectInput component remains the same...
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isTouched) setIsTouched(true);
  };

  const handleSelect = (optionValue, isDisabled) => {
    if (isDisabled) return;

    if (isMulti) {
      const currentValues = Array.isArray(internalValue) ? internalValue : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];

      setInternalValue(newValues);
      onChange(newValues);
    } else {
      setInternalValue(optionValue);
      onChange(optionValue);
      setIsOpen(false);
    }
    setIsTouched(true);
    if (onBlur) onBlur();
  };

  const removeSelected = (optionValue, e) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(internalValue)) {
      const newValues = internalValue.filter((v) => v !== optionValue);
      setInternalValue(newValues);
      onChange(newValues);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onBlur]);

  const isEmpty = isMulti
    ? !internalValue || internalValue.length === 0
    : internalValue === undefined ||
      internalValue === null ||
      internalValue === '';

  const showError = error && (isTouched || submitted);
  const errorMessage = error;

  const getSelectedOptions = () => {
    if (isMulti && Array.isArray(internalValue)) {
      return options.filter((opt) => internalValue.includes(opt.value));
    }
    return options.find((opt) => String(opt.value) === String(internalValue))
      ? [options.find((opt) => String(opt.value) === String(internalValue))]
      : [];
  };

  const selectedOptions = getSelectedOptions();

  // Check if an option is selected
  const isOptionSelected = (optionValue) => {
    if (isMulti) {
      return internalValue.includes(optionValue);
    }
    return String(internalValue) === String(optionValue);
  };

  return (
    <div className={`flex flex-col ${width}`} ref={dropdownRef}>
      {label && (
        <label className="font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={classNames(
            'min-h-[38px] text-[15px] px-4 py-2 border rounded-md cursor-pointer flex items-center justify-between w-full',
            {
              'border-red-500': showError,
              'border-gray-300': !showError,
              'bg-white': true,
              'bg-gray-100': disabled,
              'hover:border-gray-500': !showError && !disabled,
              'cursor-not-allowed opacity-50': disabled,
            }
          )}
          onClick={toggleDropdown}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length > 0 ? (
              isMulti ? (
                selectedOptions.map((option) => (
                  <div
                    key={option.value}
                    className="flex items-center bg-gray-100 rounded px-2 py-1"
                    onClick={(e) => !disabled && e.stopPropagation()}
                  >
                    <span className="mr-1">{option.label}</span>
                    {!disabled && (
                      <X 
                        size={14} 
                        className="text-gray-500 hover:text-gray-700 cursor-pointer" 
                        onClick={(e) => removeSelected(option.value, e)}
                      />
                    )}
                  </div>
                ))
              ) : (
                <span>{selectedOptions[0].label}</span>
              )
            ) : (
              <span
                className={classNames({
                  'text-gray-500': true,
                  'text-red-500': showError,
                })}
              >
                {placeholder}
              </span>
            )}
          </div>
          {!disabled && (
            <ChevronDown 
              className={classNames(
                "transition-transform duration-200",
                {
                  "text-gray-500": !showError,
                  "text-red-500": showError,
                  "rotate-180": isOpen,
                }
              )}
            />
          )}
        </div>

        {isOpen && !disabled && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <li className="px-4 py-2 text-gray-500">Chargement...</li>
            ) : options.length > 0 ? (
              options.map((option) => {
                const selected = isOptionSelected(option.value);

                return (
                  <li
                    key={option.value}
                    className={classNames(
                      'px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center',
                      {
                        'bg-blue-50': selected,
                        'bg-gray-100 opacity-50 cursor-not-allowed':
                          option.disabled,
                        'hover:bg-gray-100': option.disabled,
                      }
                    )}
                    onClick={() => handleSelect(option.value, option.disabled)}
                  >
                    {isMulti && (
                      <input
                        type="checkbox"
                        checked={selected}
                        readOnly
                        className={classNames('mr-2', {
                          'cursor-not-allowed': option.disabled,
                        })}
                        disabled={option.disabled}
                      />
                    )}
                    {option.label}
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-2 text-gray-500">
                Aucune option disponible
              </li>
            )}
          </ul>
        )}
      </div>

      {showError && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}

      {/* Hidden input for form submission */}
      {isMulti ? (
        (internalValue || []).map((val, index) => (
          <input
            key={index}
            type="hidden"
            name={`${name}[${index}]`}
            value={String(val ?? '')}
          />
        ))
      ) : (
        <input type="hidden" name={name} value={String(internalValue ?? '')} />
      )}
    </div>
  );
}
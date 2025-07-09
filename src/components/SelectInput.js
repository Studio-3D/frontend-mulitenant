'use client';

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import classNames from "classnames";

export default function SelectInput({
  label,
  placeholder = "Sélectionner",
  options = [],
  value,
  backendErrors,
  onChange = () => {},
  error,
  width = 'w-full',
  required = false,
  name,
  submitted = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isTouched) setIsTouched(true);
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setIsTouched(true);

    // Clear error if error is a callback
    if (error && typeof error === 'function') {
      error(name, '');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isEmpty = value === undefined || value === null || value === '';

  const getErrorMessage = () => {
    if (required && isEmpty && (isTouched || submitted)) {
      return 'Ce champ est obligatoire';
    }
    if (error) {
      if (typeof error === 'string') return error;
      if (typeof error === 'object' && error.message) return error.message;
    }
    if (backendErrors) {
      if (typeof backendErrors === 'string') return backendErrors;
      if (Array.isArray(backendErrors)) return backendErrors.join(', ');
    }
    return null;
  };

  const errorMessage = getErrorMessage();
  const showError = !!errorMessage && (isTouched || submitted);

  const selectedOption = options.find(opt => String(opt.value) === String(value));

  return (
    <div className={`flex flex-col ${width}`} ref={dropdownRef}>
      {label && (
        <label className="font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div
          className={classNames(
            "h-[38px] text-[15px] px-4 py-2 border rounded-md cursor-pointer flex items-center justify-between w-full",
            {
              "border-red-500": showError,
              "border-gray-300": !showError,
              "bg-white": true,
              "hover:border-gray-500": !showError,
            }
          )}
          onClick={toggleDropdown}
        >
          <span className={classNames({
            "text-gray-800": !isEmpty,
            "text-gray-500": isEmpty,
            "text-red-500": showError,
          })}>
            {selectedOption?.label || placeholder}
          </span>
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
        </div>

        {isOpen && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options.length > 0 ? (
              options.map((option) => (
                <li
                  key={option.value}
                  className={classNames(
                    "px-4 py-2 hover:bg-gray-50 cursor-pointer",
                    {
                      "bg-blue-50": String(option.value) === String(value),
                    }
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">Aucune option disponible</li>
            )}
          </ul>
        )}
      </div>

      {showError && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}

      {/* Pour valider HTML5 sans afficher un champ visible */}
      <input
        type="text"
        name={name}
        value={String(value ?? '')}
        required={required}
        readOnly
        className="absolute opacity-0 h-0 w-0"
        aria-hidden="true"
      />
    </div>
  );
}

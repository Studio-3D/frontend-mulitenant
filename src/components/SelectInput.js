'use client';

import { useState, useEffect, useRef } from "react";
import { ChevronDown, X } from "lucide-react";
import classNames from "classnames";

export default function SelectInput({
  label,
  placeholder = "Sélectionner",
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
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isTouched) setIsTouched(true);
  };

  const handleSelect = (optionValue) => {
    if (isMulti) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
    setIsTouched(true);
    if (onBlur) onBlur();
  };

  const removeSelected = (optionValue, e) => {
    e.stopPropagation();
    if (isMulti && Array.isArray(value)) {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (onBlur) onBlur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const isEmpty = isMulti 
    ? !value || value.length === 0
    : value === undefined || value === null || value === '';

  const showError = error && (isTouched || submitted);
  const errorMessage = error;

  const getSelectedOptions = () => {
    if (isMulti && Array.isArray(value)) {
      return options.filter(opt => value.includes(opt.value));
    }
    return options.find(opt => String(opt.value) === String(value)) ? [options.find(opt => String(opt.value) === String(value))] : [];
  };

  const selectedOptions = getSelectedOptions();

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
            "min-h-[38px] text-[15px] px-4 py-2 border rounded-md cursor-pointer flex items-center justify-between w-full",
            {
              "border-red-500": showError,
              "border-gray-300": !showError,
              "bg-white": true,
              "hover:border-gray-500": !showError,
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="mr-1">{option.label}</span>
                    <X 
                      size={14} 
                      className="text-gray-500 hover:text-gray-700 cursor-pointer" 
                      onClick={(e) => removeSelected(option.value, e)}
                    />
                  </div>
                ))
              ) : (
                <span>{selectedOptions[0].label}</span>
              )
            ) : (
              <span className={classNames({
                "text-gray-500": true,
                "text-red-500": showError,
              })}>
                {placeholder}
              </span>
            )}
          </div>
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
                    "px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center",
                    {
                      "bg-blue-50": isMulti
                        ? value?.includes(option.value)
                        : String(option.value) === String(value),
                    }
                  )}
                  onClick={() => handleSelect(option.value)}
                >
                  {isMulti && (
                    <input
                      type="checkbox"
                      checked={value?.includes(option.value)}
                      readOnly
                      className="mr-2"
                    />
                  )}
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

      {/* Hidden input for form submission */}
      {isMulti ? (
        (value || []).map((val, index) => (
          <input
            key={index}
            type="text"
            name={`${name}[${index}]`}
            value={String(val ?? '')}
            readOnly
            className="absolute opacity-0 h-0 w-0"
            aria-hidden="true"
          />
        ))
      ) : (
        <input
          type="text"
          name={name}
          value={String(value ?? '')}
          required={required}
          readOnly
          className="absolute opacity-0 h-0 w-0"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
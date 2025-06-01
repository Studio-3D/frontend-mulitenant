'use client';

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import classNames from "classnames";

export default function SelectInput({ 
  label, 
  placeholder = "choisissez un element...", 
  options = [], 
  value='',
  backendErrors, 
  onChange = () => {}, 
  error,
  width = 'w-full',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
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

  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];
  
  // Get the error message in the same way as Input component
  const getErrorMessage = () => {
    if (error) {
      if (typeof error === 'object' && error.message) {
        return error.message;
      }
      if (typeof error === 'string') {
        return error;
      }
      return 'Ce champ est obligatoire';
    }
    if (backendErrors) {
      if (typeof backendErrors === 'string') {
        return backendErrors;
      }
      if (typeof backendErrors === 'object' && backendErrors.message) {
        return backendErrors.message;
      }
      if (Array.isArray(backendErrors)) {
        return backendErrors.join(', ');
      }
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  // Safely find the selected option using the safeOptions array
  const selectedOption = typeof value === 'object' 
  ? value 
  : safeOptions.find(option => String(option.value) === String(value));
  return (
    <div className= {`flex flex-col ${width}`} ref={dropdownRef}>
      {label && <label className="font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <div
          className={classNames(
            "h-[38px] text-[15px] px-4 py-2 border rounded-md cursor-pointer flex items-center justify-between w-full",
            {
              "border-gray-300 hover:border-gray-500 focus:border-gray-500": !errorMessage,
              "border-red-500 focus:border-red-500 hover:border-red-500": errorMessage,
            }
          )}
          onClick={toggleDropdown}
        >
          <span className={value ? "text-gray-800" : "text-gray-500"}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown 
            className={`text-gray-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
        
        {isOpen && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {safeOptions.length > 0 ? (
              safeOptions.map((option) => (
                <li
                  key={option.value}
                  className={classNames(
                    "px-4 py-2 hover:bg-gray-50 cursor-pointer",
                    {
                      "bg-blue-50": String(option.value) === String(value),
                    }
                  )}
                  onClick={() => handleSelect(option)}
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No options available</li>
            )}
          </ul>
        )}
      </div>
      {errorMessage && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
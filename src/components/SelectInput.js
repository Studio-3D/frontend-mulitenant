'use client';

import { useState, useEffect, useRef } from "react";
import { BiChevronDown } from "react-icons/bi";
import classNames from "classnames";

export default function SelectInput({ 
  label, 
  placeholder = "Select an option", 
  options = [], 
  value,
  backendErrors, 
  onChange = () => {}, 
  error
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

  const getErrorMessage = () => {
    if (error) return error;
    if (!backendErrors) return null;
    
    if (typeof backendErrors === 'string') return backendErrors;
    if (typeof backendErrors === 'object') {
      if (backendErrors.message) return backendErrors.message;
      if (backendErrors.error) return backendErrors.error;
      if (Array.isArray(backendErrors)) return backendErrors.join(', ');
    }
    return null;
  };

  const errorMessage = getErrorMessage();

  // Safely find the selected option
  const selectedOption = options.find(option => 
    String(option.value) === String(value)
  );

  return (
    <div className="flex flex-col w-full" ref={dropdownRef}>
      {label && <label className="font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <div
          className={classNames(
            "min-h-[38px] px-4 py-2 border rounded-md cursor-pointer flex items-center justify-between w-full",
            {
              "border-gray-300 hover:border-gray-400": !errorMessage && !isOpen,
              "border-blue-500 ring-1 ring-blue-500": !errorMessage && isOpen,
              "border-red-500": errorMessage,
              "bg-gray-50": !isOpen && !errorMessage,
              "bg-red-50": errorMessage,
            }
          )}
          onClick={toggleDropdown}
        >
          <span className={value ? "text-gray-800" : "text-gray-500"}>
            {selectedOption?.label || placeholder}
          </span>
          <BiChevronDown 
            className={`text-gray-500 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
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
        <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
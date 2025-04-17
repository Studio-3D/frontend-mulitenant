'use client';

import { useState, useEffect, useRef } from "react";
import { BiChevronDown } from "react-icons/bi";
import classNames from "classnames";

export default function SelectInput({ 
  label, 
  placeholder, 
  options, 
  value, 
  onChange, 
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

  return (
    <div className="flex flex-col w-full" ref={dropdownRef}> {/* Same width control */}
      <label className="font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div
          className={classNames(
            "h-[38px] px-4 py-2 border rounded-md cursor-pointer flex items-center justify-between w-full",
            {
              "border-gray-300 hover:border-gray-500": !error && !isOpen,
              "border-gray-500": !error && isOpen,
              "border-red-500": error,
              "bg-gray-50": !isOpen
            }
          )}
          onClick={toggleDropdown}
        >
          <span className={value ? "text-gray-700" : "text-gray-400"}>
            {value ? options.find(o => o.value === value)?.label : placeholder}
          </span>
          <BiChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
        
        {isOpen && (
          <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options?.map((option) => (
              <li
                key={option.value}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
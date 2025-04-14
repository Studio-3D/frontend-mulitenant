'use client';

import { useState, useEffect, useRef } from "react";
import { BiChevronDown } from "react-icons/bi";
import classNames from "classnames";

export default function SelectInput({ label, placeholder, options, value, onChange, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleSelect = (option) => {
    onChange(option.value); // Pass the selected option's value to the parent
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
    <div className="flex flex-col" ref={dropdownRef}>
      <label className="font-medium text-gray-700">{label}</label>
      <div className="relative">
        <div
          className={classNames(
            "w-[350px] h-[38px] px-4 py-2 outline-none border rounded-md cursor-pointer flex items-center justify-between duration-200",
            {
              "border-gray-300 hover:border-gray-500 focus:border-gray-500": !error,
              "border-red-500": error,
            }
          )}
          onClick={toggleDropdown}
        >
          <span
            className={classNames("duration-200", {
              "text-gray-400": !value, // Placeholder styling
              "text-gray-700": value,  // Selected text styling
            })}
          >
            {value ? options.find((option) => option.value === value)?.label : placeholder}
          </span>
          <BiChevronDown className={classNames({ "rotate-180": isOpen })} />
        </div>
        {isOpen && (
          <ul className="absolute z-10  w-[350px] bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {options?.map((option, index) => (
              <li
                key={index}
                className="px-2 py-2 hover:bg-gray-100 cursor-pointer m-1 rounded-md"
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

'use client';
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns"; // Import format function

export default function DateInput({ label, value, onChange, placeholderText, error }) {
  const handleDateChange = (date) => {
    onChange(date ? format(date, "yyyy-MM-dd") : ""); // Ensure format is "YYYY-MM-DD"
  };

  return (
    <div className="flex flex-col">
      <label className="font-medium !text-gray-700">{label}</label>
      <DatePicker
        selected={value ? new Date(value) : null}
        onChange={handleDateChange}
        dateFormat="yyyy-MM-dd"
        className={`p-2 w-[350px] h-[38px] outline-none border rounded-md hover:border-gray-500 focus:border-gray-500 duration-200 bg-inherit ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        placeholderText={placeholderText || "yyyy-MM-dd"}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

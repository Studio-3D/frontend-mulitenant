import React from "react";

export const MetricsCard = ({
  title,
  value,
  icon,
  color,
  message,
  subtitle,
  trend,
}) => {
  const getColorClass = () => {
    switch (color) {
      case "blue":
        return "bg-blue-50 text-blue-600";
      case "green":
        return "bg-green-50 text-green-600";
      case "red":
        return "bg-red-50 text-red-600";
      case "purple":
        return "bg-purple-50 text-purple-600";
      case "amber":
        return "bg-amber-50 text-amber-600";
      case "indigo":
        return "bg-indigo-50 text-indigo-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  const displayValue =
    value === null || value === undefined || value === "" ? "--" : value;

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-50 transition-all hover:shadow-md h-full">
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="xl:text-2xl font-bold mt-1 text-gray-800 truncate">
            {displayValue}
          </p>

          {subtitle ? (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          ) : null}

          {message ? (
            <p className="text-xs text-gray-500 mt-2">{message}</p>
          ) : null}

          {trend ? (
            <p className="text-xs font-medium mt-2 text-gray-600">{trend}</p>
          ) : null}
        </div>
        <div
          className={`p-1 xl:p-3 ml-1 rounded-xl shrink-0 ${getColorClass()}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

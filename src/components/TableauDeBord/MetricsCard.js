import React from 'react';

export const MetricsCard = ({
  title,
  value,
  icon,
  color,
}) => {
  const getColorClass = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-600';
      case 'green':
        return 'bg-green-50 text-green-600';
      case 'red':
        return 'bg-red-50 text-red-600';
      case 'purple':
        return 'bg-purple-50 text-purple-600';
      case 'amber':
        return 'bg-amber-50 text-amber-600';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-600';
      default:
        return 'bg-gray-50 text-gray-600';
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-50 transition-all hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1 text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${getColorClass()}`}>{icon}</div>
      </div>
    </div>
  );
};
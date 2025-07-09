import React from 'react';

export const StatCard = ({ title, value, change, isPositive, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow mt-1 transition-transform hover:shadow-md hover:-translate-y-1 duration-300">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

export const StatCard = ({ title, value, change, isPositive, icon, color }) => {
  return (
    <div className="bg-white rounded-lg shadow transition-transform hover:shadow-md hover:-translate-y-1 duration-300">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color} text-white`}>{icon}</div>
        </div>
        <div className="flex items-center mt-4">
          <div
            className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}
          >
            {isPositive ? (
              <TrendingUpIcon size={16} className="mr-1" />
            ) : (
              <TrendingDownIcon size={16} className="mr-1" />
            )}
            <span className="text-sm font-medium">{change}</span>
          </div>
          <span className="text-xs text-gray-500 ml-2">
            depuis le mois dernier
          </span>
        </div>
      </div>
    </div>
  );
};
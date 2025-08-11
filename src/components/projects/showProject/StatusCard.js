import React from 'react';

export const StatusCard = ({ name, count, color }) => {
  return (
    <div
      className={`${color} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition text-white flex-1`}
    >
      <div className="p-4">
        <div className="text-2xl font-bold">{count}</div>
        <div className="text-sm truncate">{name}</div>
      </div>
    </div>
  );
};
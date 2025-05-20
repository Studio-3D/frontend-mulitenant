import React from 'react';

export default function StatCard({ title, value, trend, trendUp = true, subtitle, color = 'bg-blue-500' }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 h-full">
      <div className="flex justify-between items-start mb-6">
        {/* Remove the icon container */}
        <div className={`${color} p-2 rounded-lg text-white`}></div>
        
        <div className="flex items-center text-sm">
          <span className={trendUp ? 'text-green-600' : 'text-red-600'}>
            {trend}
          </span>
          {/* Remove the ChevronUp/ChevronDown icons */}
        </div>
      </div>
      
      <div className="text-lg font-bold mb-1">
        {value}
      </div>
      
      <div className="text-gray-700 text-sm mb-5">
        {title}
      </div>
      
      <div className="text-xs text-gray-500 bg-gray-100 py-1 px-2 rounded-full inline-block">
        {subtitle}
      </div>
    </div>
  );
}

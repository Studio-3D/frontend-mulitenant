import React from 'react';
import { format } from 'date-fns';
export const DayView = ({
  currentDate
}) => {
  const hours = Array.from({
    length: 24
  }, (_, i) => i);
  return <div className="overflow-auto">
      <div className="grid grid-cols-2 border-b">
        <div className="w-20" /> {/* Empty corner cell */}
        <div className={`p-4 text-center ${format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-blue-50' : ''}`}>
          <div className="font-medium text-gray-900">
            {format(currentDate, 'EEEE')}
          </div>
          <div className="text-2xl font-bold text-gray-600">
            {format(currentDate, 'd MMMM')}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="w-20">
          {hours.map(hour => <div key={hour} className="h-20 border-b text-right pr-2 pt-1 text-sm text-gray-500">
              {format(new Date().setHours(hour), 'ha')}
            </div>)}
        </div>
        <div>
          {hours.map(hour => <div key={hour} className="h-20 border-b hover:bg-gray-50 transition-colors" />)}
        </div>
      </div>
    </div>;
};
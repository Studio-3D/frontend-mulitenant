import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
export const WeekView = ({
  currentDate
}) => {
  const startDate = startOfWeek(currentDate);
  const hours = Array.from({
    length: 24
  }, (_, i) => i);
  const weekDays = Array.from({
    length: 7
  }, (_, i) => addDays(startDate, i));
  return <div className="overflow-auto">
      <div className="grid grid-cols-8 border-b">
        <div className="w-20" /> {/* Empty corner cell */}
        {weekDays.map((day, i) => <div key={i} className={`p-4 text-center border-l ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-blue-50' : ''}`}>
            <div className="font-medium text-gray-900">
              {format(day, 'EEE')}
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {format(day, 'd')}
            </div>
          </div>)}
      </div>
      <div className="grid grid-cols-8">
        <div className="">
          {hours.map(hour => <div key={hour} className="h-20 border-b text-right pr-2 pt-1 text-sm text-gray-500">
              {format(new Date().setHours(hour), 'ha')}
            </div>)}
        </div>
        {weekDays.map((day, dayIndex) => <div key={dayIndex} className="border-l">
            {hours.map(hour => <div key={hour} className="h-20 border-b hover:bg-gray-50 transition-colors" />)}
          </div>)}
      </div>
    </div>;
};
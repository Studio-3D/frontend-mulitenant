import React from 'react';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
export const ListView = ({
  currentDate
}) => {
  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  });
  return <div className="divide-y">
      {days.map((day, index) => <div key={index} className={`p-4 hover:bg-gray-50 transition-colors ${format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-blue-50' : ''}`}>
          <div className="flex items-center">
            <CalendarIcon className="mr-3 text-gray-400" size={20} />
            <div>
              <div className="font-medium text-gray-900">
                {format(day, 'EEEE')}
              </div>
              <div className="text-sm text-gray-500">
                {format(day, 'd MMMM yyyy')}
              </div>
            </div>
          </div>
        </div>)}
    </div>;
};
import React, { useState } from 'react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameMonth, addDays } from 'date-fns';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ListView } from './ListView';
export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('month');
  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startDate = startOfMonth(currentDate);
    const startDay = getDay(startDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    // Create array for all days in the calendar view
    const days = [];
    // Add previous month's days
    let prevMonthDate = new Date(currentYear, currentMonth, 0);
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthDate.getDate() - i),
        isCurrentMonth: false
      });
    }
    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true
      });
    }
    // Add next month's days to fill remaining cells (6 rows of 7 days = 42 cells)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false
      });
    }
    return days;
  };
  const days = renderCalendarDays();
  const renderView = () => {
    switch (activeView) {
      case 'week':
        return <WeekView currentDate={currentDate} />;
      case 'day':
        return <DayView currentDate={currentDate} />;
      case 'list':
        return <ListView currentDate={currentDate} />;
      default:
        return <div className="calendar-grid">
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => <div key={index} className="py-2 text-center text-sm font-medium text-blue-500">
                    {day}
                  </div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6">
              {days.map((day, index) => <div key={index} className={`min-h-[100px] p-2 border-b border-r hover:bg-gray-50 transition-colors ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-800'} ${format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'bg-blue-50' : ''}`}>
                  <div className="text-right font-medium">
                    {format(day.date, 'd')}
                  </div>
                </div>)}
            </div>
          </div>;
    }
  };
  return <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
      <div className="flex flex-col md:flex-row">
        <CalendarSidebar />
        <div className="flex-1">
          <CalendarHeader />
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <div className="flex items-center space-x-4">
              <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeftIcon size={20} />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRightIcon size={20} />
              </button>
              <button onClick={goToToday} className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">
                today
              </button>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex rounded-lg overflow-hidden bg-gray-100">
              <button className={`px-4 py-1 text-sm ${activeView === 'month' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`} onClick={() => setActiveView('month')}>
                MONTH
              </button>
              <button className={`px-4 py-1 text-sm ${activeView === 'week' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`} onClick={() => setActiveView('week')}>
                WEEK
              </button>
              <button className={`px-4 py-1 text-sm ${activeView === 'day' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`} onClick={() => setActiveView('day')}>
                DAY
              </button>
              <button className={`px-4 py-1 text-sm ${activeView === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-200'}`} onClick={() => setActiveView('list')}>
                LIST
              </button>
            </div>
          </div>
          {renderView()}
        </div>
      </div>
    </div>;
};
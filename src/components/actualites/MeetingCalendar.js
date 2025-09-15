import React, { useState } from 'react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale'; // Import French locale
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

export default function MeetingCalendar({ meetings = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  
  // Helper functions for calendar navigation
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  
  // Generate calendar days
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
    
    // Add next month's days to fill remaining cells
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };
  
  // Get meetings for a specific date
  const getMeetingsForDate = (date) => {
    return meetings.filter(meeting => {
      const meetingDate = meeting.date_relance 
        ? parseISO(meeting.date_relance) 
        : meeting.rdv 
          ? parseISO(meeting.rdv) 
          : null;
      
      return meetingDate && isSameDay(date, meetingDate);
    });
  };
  
  // Check if a date has meetings
  const hasMeetings = (date) => {
    return getMeetingsForDate(date).length > 0;
  };
  
  const days = renderCalendarDays();
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden h-full">
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div className="text-lg font-semibold">Calendrier des Réunions</div>
        
        <div className="flex items-center space-x-2">
          <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronLeftIcon size={18} />
          </button>
          <span className="text-sm font-medium">
            {format(currentDate, 'MMMM yyyy', { locale: fr })} {/* Add locale here */}
          </span>
          <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-100">
            <ChevronRightIcon size={18} />
          </button>
        </div>
      </div>
      
      <div className="px-3 py-2">
        {/* Calendar grid */}
        <div className="grid grid-cols-7 text-center text-xs font-medium !text-gray-500 mb-1">
          {['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'].map((day, idx) => (
            <div key={idx} className="py-1">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const hasEvents = hasMeetings(day.date);
            const isToday = isSameDay(day.date, new Date());
            const isSelected = selectedDate && isSameDay(day.date, selectedDate);
            
            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                  ${!day.isCurrentMonth ? 'text-gray-300' : 'text-gray-800'}
                  ${isToday ? 'bg-blue-100' : ''}
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${hasEvents && !isSelected ? 'bg-green-50' : ''}
                  hover:bg-gray-100 transition-colors
                `}
              >
                <span>{format(day.date, 'd')}</span>
                {hasEvents && (
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Selected date meetings */}
        {selectedDate && (
          <div className="mt-4 border-t pt-3">
            <h3 className="text-sm font-medium !text-gray-700 mb-2">
              {format(selectedDate, 'EEEE d MMMM', { locale: fr })} {/* Add locale here */}
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {getMeetingsForDate(selectedDate).map((meeting, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">
                    {meeting.visite?.prospect?.nom} {meeting.visite?.prospect?.prenom}
                  </div>
                  <div className="text-xs !text-gray-500">
                    {meeting.date_relance ? 'Relance' : 'RDV'}
                  </div>
                </div>
              ))}
              
              {getMeetingsForDate(selectedDate).length === 0 && (
                <p className="text-xs !text-gray-500 text-center py-2">
                  Aucune réunion ce jour
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* If no date is selected, show next meetings */}
        {!selectedDate && meetings.length > 0 && (
          <div className="mt-4 border-t pt-3">
            <h3 className="text-sm font-medium !text-gray-700 mb-2">
              Prochaines réunions
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {meetings.slice(0, 3).map((meeting, idx) => (
                <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm">
                    {meeting.visite?.prospect?.nom} {meeting.visite?.prospect?.prenom}
                  </div>
                  <div className="text-xs !text-gray-500">
                    {format(parseISO(meeting.date_relance || meeting.rdv), 'd MMMM yyyy', { locale: fr })} {/* Add locale here too */}
                    {meeting.date_relance ? ' (Relance)' : ' (RDV)'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {meetings.length === 0 && !selectedDate && (
          <div className="text-center py-4 !text-gray-500 mt-2">
            Aucune réunion prévue
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';

import { format, addDays, startOfWeek, parseISO, isSameDay, getHours, isValid } from 'date-fns';

export const WeekView = ({
  currentDate,
  events,
  onPrev,
  onNext,
  onToday
}) => {

  const startDate = startOfWeek(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  // Organize events by day and hour
  const eventsByDay = {};
  weekDays.forEach((day) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    eventsByDay[dayKey] = {};

    // Initialize each hour
    hours.forEach((hour) => {
      eventsByDay[dayKey][hour] = [];
    });
  });

  // Populate events with better error handling

  events.forEach(event => {
    // Skip empty or invalid events
    if (!event || typeof event !== 'object' || Object.keys(event).length === 0) {

      console.warn('Skipping empty or invalid event object');
      return;
    }

    // Skip events without start date
    if (!event.start) {
      console.warn('Skipping event without start date:', event);
      return;
    }

    try {
      let eventDate;
      // Handle different date formats
      if (event.start.includes('T')) {
        eventDate = parseISO(event.start);
      } else if (event.start.includes(' ')) {
        eventDate = parseISO(event.start);
      } else {
        // Assume all-day event at noon
        eventDate = new Date(event.start + 'T12:00:00');
      }

      // Validate the date
      if (!isValid(eventDate)) {
        console.warn('Invalid date for event:', event, eventDate);
        return;
      }

      const eventDay = format(eventDate, 'yyyy-MM-dd');
      const hour = getHours(eventDate);

      if (eventsByDay[eventDay] && eventsByDay[eventDay][hour]) {
        eventsByDay[eventDay][hour].push(event);
      }
    } catch (e) {
      console.warn('Error processing event:', event, e);
    }
  });


  const handleEventClick = (event) => {
    if (event.url && event.url !== '#') {
      window.open(event.url, '_blank');
    }
  };

  return (

    <div className="flex flex-col h-full">
      {/* Week grid */}
      <div className="overflow-auto flex-1">
        <div className="grid grid-cols-8 border-b">
          <div className="w-20" /> {/* Empty corner cell */}
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={`p-4 text-center border-l ${
                isSameDay(day, new Date()) ? 'bg-blue-50' : ''
              }`}
            >
              <div className="font-medium !text-gray-900">
                {format(day, 'EEE')}
              </div>
              <div className="text-2xl font-bold !text-gray-600">
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* All-day events row */}
        <div className="grid grid-cols-8 border-b">
          <div className="w-full p-4 font-semibold text-center text-gray-500">
            Toute la journée
          </div>
          {weekDays.map((day, i) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const allDayEvents = events.filter((event) => {
              const eventDate = event.start.includes(' ')
                ? parseISO(event.start)
                : new Date(event.start + 'T00:00:00');
              return isSameDay(eventDate, day) && !event.start.includes(' ');
            });

            return (
              <div key={i} className="border-l p-1 min-h-16">
                {allDayEvents.map((event, j) => (
                  <div
                    key={j}
                    className="text-xs p-1 mb-1 rounded shadow-sm truncate"
                    style={{
                      backgroundColor: `${event.backgroundColor}20`,
                      borderLeft: `3px solid ${event.backgroundColor}`,
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-8">
          <div className="">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-20 border-b text-right pr-2 pt-1 text-sm !text-gray-500"
              >
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {weekDays.map((day, dayIndex) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            return (
              <div key={dayIndex} className="border-l">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-20 border-b hover:bg-gray-50 transition-colors relative overflow-y-auto"
                  >
                    {eventsByDay[dayKey]?.[hour]?.map((event, eventIndex) => {
                      try {
                        const eventDate = parseISO(event.start);
                        const minutes = eventDate.getMinutes();
                        const topPosition = (minutes / 60) * 80; // 80px hour height

                        return (
                          <div
                            key={eventIndex}
                            className="text-xs p-1 mb-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                            style={{
                              top: `${topPosition}px`,
                              backgroundColor: `${event.backgroundColor}20`,
                              borderLeft: `3px solid ${event.backgroundColor}`,
                              zIndex: 1,
                              minHeight: '22px',
                              margin: '3px 0',
                            }}
                            title={`${event.title}${
                              event.projet_code ? ` (${event.projet_code})` : ''
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            <div className="font-medium truncate">
                              {event.title}
                            </div>
                          </div>
                        );
                      } catch (e) {
                        console.error('Error rendering event:', event, e);
                        return null;
                      }
                    })}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { format, isSameDay, parseISO, getHours, getMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

export const DayView = ({ 
  currentDate, 
  events,
  onPrev,
  onNext,
  onToday
}) => {
  // Generate hours array (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events for the current day
  const dayEvents = events.filter(event => {
    try {
      const eventDate = event.start.includes(' ') 
        ? parseISO(event.start)
        : new Date(event.start + 'T00:00:00');
      return isSameDay(eventDate, currentDate);
    } catch (e) {
      console.error('Error parsing event date:', event.start, e);
      return false;
    }
  });

  // Separate all-day events from timed events
  const allDayEvents = dayEvents.filter(event => !event.start.includes(' '));
  const timedEvents = dayEvents.filter(event => event.start.includes(' '));

  // Group timed events by hour
  const eventsByHour = {};
  timedEvents.forEach(event => {
    try {
      const eventDate = parseISO(event.start);
      const hour = getHours(eventDate);
      
      if (!eventsByHour[hour]) {
        eventsByHour[hour] = [];
      }
      eventsByHour[hour].push(event);
    } catch (e) {
      console.error('Error processing timed event:', event, e);
    }
  });

  // Sort events within each hour by minute
  Object.keys(eventsByHour).forEach(hour => {
    eventsByHour[hour].sort((a, b) => {
      try {
        const aMinutes = getMinutes(parseISO(a.start));
        const bMinutes = getMinutes(parseISO(b.start));
        return aMinutes - bMinutes;
      } catch (e) {
        return 0;
      }
    });
  });

  return (
    <div className="flex flex-col h-full">
      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="border-b p-4">
          <div className="font-medium text-gray-500 mb-2">Toute la journée</div>
          <div className="flex flex-wrap gap-2">
            {allDayEvents.map((event, i) => (
              <div
                key={i}
                className="text-xs px-3 py-2 rounded flex-1 min-w-[150px] max-w-[300px] shadow-sm"
                style={{
                  backgroundColor: `${event.backgroundColor}20`,
                  borderLeft: `3px solid ${event.backgroundColor}`,
                }}
                title={`${event.title}${event.projet_code ? ` (${event.projet_code})` : ''}`}
              >
                <div className="font-medium truncate">{event.title}</div>
                {event.projet_code && (
                  <div className="text-xs text-gray-600 truncate">{event.projet_code}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-12">
          {/* Time labels column */}
          <div className="col-span-2 border-r">
            {hours.map(hour => (
              <div 
                key={hour} 
                className="h-20 border-b text-right pr-2 pt-1 text-sm text-gray-500 relative"
              >
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
                <div className="absolute top-0 left-0 right-0 border-t border-gray-100"></div>
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="col-span-10 grid grid-cols-1 ">
            {hours.map(hour => (
              <div 
                key={hour} 
                className="h-20 border-b overflow-y-auto"
              >
                
                {/* Events for this hour */}
                {eventsByHour[hour]?.map((event, i) => {
                  try {
                    const eventDate = parseISO(event.start);
                    const minutes = getMinutes(eventDate);
                    const topPosition = (minutes / 60) * 80; // 80px hour height

                    return (
                      <div
                        key={`${hour}-${i}`}
                        className="text-xs px-2 py-1  rounded shadow-sm  mx-2 "
                        style={{
                          top: `${topPosition}px`,
                          backgroundColor: `${event.backgroundColor}20`,
                          borderLeft: `3px solid ${event.backgroundColor}`,
                          zIndex: 1,
                          minHeight: '22px',
                          margin: '3px 0',
                        }}
                        title={`${event.title}${event.projet_code ? ` (${event.projet_code})` : ''}`}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        
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
        </div>
      </div>
    </div>
  );
};
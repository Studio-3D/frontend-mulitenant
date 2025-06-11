import React from 'react';
import { format, isSameDay, parseISO } from 'date-fns';


export const DayView = ({ 
  currentDate, 
  events,   
}) => {
  // Generate hours array (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events for the current day
  const dayEvents = events.filter(event => {
    const eventDate = event.start.includes(' ') 
      ? parseISO(event.start)
      : new Date(event.start + 'T00:00:00');
    return isSameDay(eventDate, currentDate);
  });

  // Group events by hour
  const eventsByHour = {};
  dayEvents.forEach(event => {
    const eventDate = event.start.includes(' ') 
      ? parseISO(event.start)
      : new Date(event.start + 'T12:00:00'); // All-day events at noon
    
    const hour = eventDate.getHours();
    if (!eventsByHour[hour]) {
      eventsByHour[hour] = [];
    }
    eventsByHour[hour].push(event);
  });

  return (
    <div className="flex flex-col h-full">

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-2">
          {/* Time labels column */}
          <div className="border-r">
            {hours.map(hour => (
              <div 
                key={hour} 
                className="h-20 border-b text-right pr-2 pt-1 text-sm text-gray-500"
              >
                {format(new Date().setHours(hour, 0, 0, 0), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Events column */}
          <div className="relative">
            {hours.map(hour => (
              <div 
                key={hour} 
                className="h-20 border-b hover:bg-gray-50 transition-colors relative"
              >
                {/* Hour marker line */}
                <div className="absolute top-0 left-0 right-0 border-t border-gray-100"></div>
                
                {/* Events for this hour */}
                {eventsByHour[hour]?.map((event, i) => {
                  const eventDate = event.start.includes(' ') 
                    ? parseISO(event.start)
                    : new Date(event.start + 'T12:00:00');
                  
                  const minutes = eventDate.getMinutes();
                  const topPosition = (minutes / 60) * 80; // 80px hour height

                  return (
                    <div
                      key={`${hour}-${i}`}
                      className="text-xs  rounded  shadow-sm "
                      style={{
                        top: `${topPosition}px`,
                        backgroundColor: `${event.backgroundColor}20`,
                        borderLeft: `3px solid ${event.backgroundColor}`,
                        zIndex: 1,
                        minHeight: '22px',
                        
                      }}
                      title={`${event.title}${event.projet_code ? ` (${event.projet_code})` : ''}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.start.includes(' ') && (
                        <div className="text-xs text-gray-600">
                          {format(eventDate, 'HH:mm')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
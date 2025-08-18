import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, addMonths, subMonths, getDaysInMonth, startOfMonth, 
  getDay, addDays, addWeeks, subDays, subWeeks, startOfWeek, 
  endOfWeek, isSameDay, parseISO 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarHeader } from './CalendarHeader';
import { CalendarSidebar } from './CalendarSidebar';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { ListView } from './ListView';
import axios from 'axios';
import { APIURL } from '../../configs/api';
import { 
  EVENT_TYPES, 
  getEventColor, 
  getEventCategory, 
  SIDEBAR_ITEMS 
} from './calendar-constants';

const toTitleCase = (str) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeView, setActiveView] = useState('month');
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Stats states (keep your existing state declarations)
  const [stats, setStats] = useState({
    calls: { current: 0, month: 0, objective: 0 },
    visits: { current: 0, month: 0, objective: 0 },
    reservations: { current: 0, month: 0, objective: 0 },
    cancellations: 0
  });

  const accessToken = localStorage.getItem('accessToken');
  const selectedProjet_id = JSON.parse(localStorage.getItem('selectedProjet'))?.id || 0;

  useEffect(() => {
    fetchData();
  }, [selectedProjet_id, currentDate]);

  useEffect(() => {
    const filtered = applyFilter(events, activeFilter);
    setFilteredEvents(filtered);
  }, [activeFilter, events]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${APIURL.ROOTV1}/fullcalendar/${selectedProjet_id}/0`, 
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      if (!response.data) throw new Error('Données de réponse vides');

      const { data, ...statsData } = response.data;
      console.log('Données récupérées:', data);
      
      const allEvents = data.map(dt => {
      const isTimedEvent = dt.date.includes(' ');
      const eventDate = isTimedEvent ? dt.date : dt.date + 'T00:00:00';
      
      return {
        type: dt.type,
        id: dt.id,
        title: toTitleCase(dt.description_type),
        backgroundColor: getEventColor(dt.type),
        borderColor: getEventColor(dt.type),
        start: eventDate,  // Keep original date format
        allDay: !isTimedEvent,
        url: selectedProjet_id != 0 ? dt.lien : '#',
        deleted_at: dt.deleted_at,
        projet_code: dt.projet?.code,
        selectedProjet_id: selectedProjet_id,
        category: getEventCategory(dt.type)
      };
    });

      setEvents(allEvents);
      // Update your stats here as before
    } catch (error) {
      console.error('Erreur:', error);
      setStats({
        calls: { current: -1, month: -1, objective: -1 },
        visits: { current: -1, month: -1, objective: -1 },
        reservations: { current: -1, month: -1, objective: -1 },
        cancellations: -1
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = useMemo(() => {
    return (events, filter) => {
      if (filter === 'all') return events;
      return events.filter(event => event.category === filter);
    };
  }, []);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Navigation handlers (keep your existing navigation functions)
  const nextPeriod = () => {
    if (activeView === 'day') setCurrentDate(addDays(currentDate, 1));
    else if (activeView === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addMonths(currentDate, 1));
  };

  const prevPeriod = () => {
    if (activeView === 'day') setCurrentDate(subDays(currentDate, 1));
    else if (activeView === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subMonths(currentDate, 1));
  };

  const goToToday = () => setCurrentDate(new Date());

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startDate = startOfMonth(currentDate);
    const startDay = getDay(startDate);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const days = [];
    
    // Previous month days
    const prevMonthDays = startDay === 0 ? 6 : startDay;
    for (let i = prevMonthDays; i > 0; i--) {
      const date = new Date(currentYear, currentMonth, -i + 1);
      days.push({
        date,
        isCurrentMonth: false,
        events: filteredEvents.filter(event => 
          format(new Date(event.start), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      days.push({
        date,
        isCurrentMonth: true,
        events: filteredEvents.filter(event => 
          format(new Date(event.start), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        events: filteredEvents.filter(event => 
          format(new Date(event.start), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        )
      });
    }
    
    return days;
  };

  const renderDayCell = (day, index) => {
    const isToday = isSameDay(day.date, new Date());
    
    return (
      <div 
        key={index} 
        className={`
          min-h-[100px] p-2 border-b border-r hover:bg-gray-50 transition-colors
          ${!day.isCurrentMonth ? 'text-gray-400 bg-gray-50' : 'text-gray-800'}
          ${isToday ? 'bg-blue-50 font-bold' : ''}
          relative
        `}
      >
        <div className="text-right font-medium mb-1">
          {format(day.date, 'd')}
        </div>
        
        <div className="overflow-y-auto max-h-[80px]">
          {day.events.map((event, i) => (
            <div 
              key={i} 
              className="text-xs p-1 mb-1 rounded truncate"
              style={{ 
                backgroundColor: `${event.backgroundColor}20`,
                borderLeft: `3px solid ${event.backgroundColor}`,
                color: '#333'
              }}
              title={event.title}
            >
              {event.title}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderView = () => {
  const views = {
    week: (
      <WeekView 
        currentDate={currentDate} 
        events={filteredEvents} 
        onNext={nextPeriod}
        onPrev={prevPeriod}
        onToday={goToToday}
      />
    ),
    day: (
      <DayView 
        currentDate={currentDate} 
        events={filteredEvents}
        onNext={nextPeriod}
        onPrev={prevPeriod}
        onToday={goToToday}
      />
    ),
    list: <ListView currentDate={currentDate} events={filteredEvents} />,
    month: (
      <div className="calendar-grid">
        <div className="grid grid-cols-7 border-b">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day, i) => (
            <div key={i} className="py-2 text-center text-sm font-medium text-blue-500">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6">
          {renderCalendarDays().map(renderDayCell)}
        </div>
      </div>
    )
  };
  
  return views[activeView] || views.month;
};

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden p-4">
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white">Chargement...</div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row">
        <CalendarSidebar 
          onFilterChange={handleFilterChange}
          activeFilter={activeFilter}
        />
        
        <div className="flex-1">
          <CalendarHeader />
          
          <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b gap-4">
            <div className="flex items-center space-x-2">
              <button onClick={prevPeriod} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronLeftIcon size={20} />
              </button>
              <button onClick={nextPeriod} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <ChevronRightIcon size={20} />
              </button>
              <button onClick={goToToday} className="px-3 py-1 text-sm bg-cyan-100 rounded-md hover:bg-cyan-200 transition-colors">
                Aujour{'d\''}hui
              </button>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-800">
              {activeView === 'month' && format(currentDate, 'MMMM yyyy', { locale: fr })}
              {activeView === 'week' && `${format(startOfWeek(currentDate), 'd MMM')} - ${format(endOfWeek(currentDate), 'd MMM yyyy')}`}
              {activeView === 'day' && format(currentDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h2>
            
            <div className="flex rounded-lg overflow-hidden bg-gray-100">
              {['month', 'week', 'day', 'list'].map(view => (
                <button
                  key={view}
                  className={`px-4 py-1 text-sm capitalize ${
                    activeView === view 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setActiveView(view)}
                >
                  {view === 'month' ? 'Mois' : 
                   view === 'week' ? 'Semaine' : 
                   view === 'day' ? 'Jour' : 'Liste'}
                </button>
              ))}
            </div>
          </div>
          
          {renderView()}
        </div>
      </div>
    </div>
  );
};
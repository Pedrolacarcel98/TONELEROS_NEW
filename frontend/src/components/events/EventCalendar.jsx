import React, { useState, useMemo } from 'react';
import styles from './EventCalendar.module.css';

const EventCalendar = ({ events, onEventClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  // Helper para obtener el primer día del mes (ajustado a Lunes=0)
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Ajustar domingo de 0 a 6 y desplazar otros
  };

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = getFirstDayOfMonth(year, month);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDays = [];
    
    // Días del mes anterior para rellenar la primera fila
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push({
        day: daysInPrevMonth - i,
        month: month - 1,
        year: year,
        currentMonth: false
      });
    }
    
    // Días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({
        day: i,
        month: month,
        year: year,
        currentMonth: true
      });
    }
    
    // Días del mes siguiente para completar la última fila (hasta 42 celdas = 6 semanas)
    const remainingDays = 42 - calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      calendarDays.push({
        day: i,
        month: month + 1,
        year: year,
        currentMonth: false
      });
    }
    
    return calendarDays;
  }, [currentDate]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const isToday = (day, month, year) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const isSelected = (day, month, year) => {
    return day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
  };

  const getEventsForDay = (day, month, year) => {
    return events.filter(event => {
      const eventDate = new Date(event.fecha);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year;
    });
  };

  const selectedDayEvents = useMemo(() => {
    return getEventsForDay(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear());
  }, [selectedDate, events]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.calendarContainer}>
      <header className={styles.calendarHeader}>
        <h2 className={styles.monthTitle}>
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className={styles.navButtons}>
          <button onClick={prevMonth} className={styles.navButton}>&lt;</button>
          <button onClick={() => setCurrentDate(new Date())} className={styles.navButton}>Hoy</button>
          <button onClick={nextMonth} className={styles.navButton}>&gt;</button>
        </div>
      </header>

      <div className={styles.daysGrid}>
        {daysOfWeek.map(day => (
          <div key={day} className={styles.dayHeader}>{day}</div>
        ))}
        
        {calendarData.map((item, index) => {
          const dayEvents = getEventsForDay(item.day, item.month, item.year);
          return (
            <div 
              key={index} 
              className={`
                ${styles.dayCell} 
                ${!item.currentMonth ? styles.notCurrentMonth : ''} 
                ${isToday(item.day, item.month, item.year) ? styles.today : ''}
                ${isSelected(item.day, item.month, item.year) ? styles.selected : ''}
              `}
              onClick={() => setSelectedDate(new Date(item.year, item.month, item.day))}
            >
              <span className={styles.dayNumber}>{item.day}</span>
              <div className={styles.eventsListInCell}>
                {dayEvents.slice(0, 3).map(event => (
                  <div 
                    key={event.id} 
                    className={`${styles.eventMiniTag} ${event.estado === 'CONFIRMADO' ? styles.confirmed : ''}`}
                  >
                    {event.tipo}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className={styles.eventMiniTag} style={{background: 'transparent', color: '#718096'}}>
                    +{dayEvents.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.dayDetailView}>
        <h3 className={styles.detailHeader}>
          Eventos para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
        </h3>
        {selectedDayEvents.length > 0 ? (
          <div className={styles.detailEventsList}>
            {selectedDayEvents.map(event => {
              const isConfirmed = event.estado === 'CONFIRMADO';
              return (
                <div 
                  key={event.id} 
                  className={`${styles.detailEventItem} ${isConfirmed ? styles.detailConfirmed : styles.detailNegotiation}`}
                  onClick={() => onEventClick(event)}
                >
                  <div className={styles.detailEventInfo}>
                    <span className={styles.detailTime}>{formatTime(event.fecha)}</span>
                    <span className={styles.detailDivider}>|</span>
                    <span className={styles.detailType}>{event.tipo}</span>
                  </div>
                  <div className={styles.detailArrow}>
                     ➜
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.noEventsText}>No hay eventos programados para este día.</p>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;

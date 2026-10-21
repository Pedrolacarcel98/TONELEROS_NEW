import React, { useState, useMemo } from 'react';
import styles from './EventCalendar.module.css';
import { parseLocalDate } from '../../utils/dateUtils';
import { getVacationsForDay } from '../../utils/vacationUtils';

const EventCalendar = ({ events = [], vacations = [], onEventClick }) => {
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
      const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
      calendarDays.push({
        day: prevDate.getDate(),
        month: prevDate.getMonth(),
        year: prevDate.getFullYear(),
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
      const nextDate = new Date(year, month + 1, i);
      calendarDays.push({
        day: nextDate.getDate(),
        month: nextDate.getMonth(),
        year: nextDate.getFullYear(),
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
      const eventDate = parseLocalDate(event.fecha);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === month && 
             eventDate.getFullYear() === year;
    });
  };

  const selectedDayEvents = useMemo(() => {
    return getEventsForDay(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear());
  }, [selectedDate, events]);

  const selectedDayVacations = useMemo(() => {
    return getVacationsForDay(selectedDate.getDate(), selectedDate.getMonth(), selectedDate.getFullYear(), vacations);
  }, [selectedDate, vacations]);

  const formatShortRange = (v) => {
    const s = parseLocalDate(v.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    if (v.is_single_day || !v.end_date || v.start_date === v.end_date) {
      return `Día único (${s})`;
    }
    const e = parseLocalDate(v.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    return `${s} - ${e}`;
  };

  return (
    <div className={styles.calendarContainer}>
      <header className={styles.calendarHeader}>
        <div className={styles.headerTitleGroup}>
          <h2 className={styles.monthTitle}>
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className={styles.legend}>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.dotConfirmed}`} /> Confirmado
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.dotNegotiation}`} /> Negociación
            </span>
            <span className={styles.legendItem}>
              <span className={`${styles.legendDot} ${styles.dotVacation}`} /> Vacaciones
            </span>
          </div>
        </div>
        <div className={styles.navButtons}>
          <button onClick={prevMonth} className={styles.navButton}>&lt;</button>
          <button onClick={() => { const now = new Date(); setCurrentDate(now); setSelectedDate(now); }} className={styles.navButton}>Hoy</button>
          <button onClick={nextMonth} className={styles.navButton}>&gt;</button>
        </div>
      </header>

      <div className={styles.daysGrid}>
        {daysOfWeek.map(day => (
          <div key={day} className={styles.dayHeader}>{day}</div>
        ))}
        
        {calendarData.map((item, index) => {
          const dayEvents = getEventsForDay(item.day, item.month, item.year);
          const dayVacations = getVacationsForDay(item.day, item.month, item.year, vacations);
          const hasVacations = dayVacations.length > 0;

          return (
            <div 
              key={index} 
              className={`
                ${styles.dayCell} 
                ${!item.currentMonth ? styles.notCurrentMonth : ''} 
                ${isToday(item.day, item.month, item.year) ? styles.today : ''}
                ${isSelected(item.day, item.month, item.year) ? styles.selected : ''}
                ${hasVacations && item.currentMonth ? styles.dayWithVacation : ''}
              `}
              onClick={() => setSelectedDate(new Date(item.year, item.month, item.day))}
            >
              <span className={styles.dayNumber}>{item.day}</span>
              <div className={styles.eventsListInCell}>
                {dayEvents.slice(0, 2).map(event => (
                  <div 
                    key={`ev-${event.id}`} 
                    className={`${styles.eventMiniTag} ${event.estado === 'CONFIRMADO' ? styles.confirmed : ''}`}
                    title={`${event.tipo} (${event.hora_comienzo || 'Sin hora'})`}
                  >
                    {event.tipo}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className={styles.moreMiniTag}>
                    +{dayEvents.length - 2} ev.
                  </div>
                )}

                {dayVacations.length === 1 && (
                  <div 
                    className={styles.vacationMiniTag}
                    title={`Vacaciones: ${dayVacations[0].member_name}${dayVacations[0].description ? ' - ' + dayVacations[0].description : ''}`}
                  >
                    🏖️ {dayVacations[0].member_name}
                  </div>
                )}
                {dayVacations.length > 1 && (
                  <div 
                    className={styles.vacationMiniTag}
                    title={`Vacaciones: ${dayVacations.map(v => v.member_name).join(', ')}`}
                  >
                    🏖️ {dayVacations.map(v => v.member_name).join(', ')}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.dayDetailView}>
        <h3 className={styles.detailHeader}>
          Agenda para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
        </h3>
        {(selectedDayEvents.length > 0 || selectedDayVacations.length > 0) ? (
          <div className={styles.detailEventsList}>
            {selectedDayEvents.map(event => {
              const isConfirmed = event.estado === 'CONFIRMADO';
              return (
                <div 
                  key={`detail-ev-${event.id}`} 
                  className={`${styles.detailEventItem} ${isConfirmed ? styles.detailConfirmed : styles.detailNegotiation}`}
                  onClick={() => onEventClick(event)}
                >
                  <div className={styles.detailEventInfo}>
                    <span className={styles.detailTime}>{event.hora_comienzo || '--:--'}</span>
                    <span className={styles.detailDivider}>|</span>
                    <span className={styles.detailType}>{event.tipo}</span>
                  </div>
                  <div className={styles.detailArrow}>
                     ➜
                  </div>
                </div>
              );
            })}

            {selectedDayVacations.map(v => (
              <div 
                key={`detail-vac-${v.id}`} 
                className={`${styles.detailEventItem} ${styles.detailVacation}`}
              >
                <div className={styles.detailVacationContent}>
                  <div className={styles.detailEventInfo}>
                    <span className={styles.vacationBadge}>🏖️ VACACIONES</span>
                    <span className={styles.detailDivider}>|</span>
                    <span className={styles.detailType}>{v.member_name}</span>
                  </div>
                  <div className={styles.detailVacationMeta}>
                    <span>{formatShortRange(v)}</span>
                    {v.description && (
                      <span className={styles.detailVacationDesc}> • "{v.description}"</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.noEventsText}>No hay eventos ni vacaciones registrados para este día.</p>
        )}
      </div>
    </div>
  );
};

export default EventCalendar;

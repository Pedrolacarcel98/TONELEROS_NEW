import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import EventForm from '../components/events/EventForm';
import EventsList from '../components/events/EventsList';
import EventCalendar from '../components/events/EventCalendar';
import EventDetailModal from '../components/events/EventDetailModal';
import eventsService from '../services/eventsService';
import styles from './Events.module.css';

export const Events = () => {
  const [view, setView] = useState('list'); // 'list' o 'calendar'
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, [refreshKey]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = () => {
    setRefreshKey(prev => prev + 1);
    setEditingEvent(null);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className={styles.page}>
      <Header showBack={true} />
      <main className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Agenda de Eventos</h1>
          <div className={styles.viewSwitcher}>
            <button 
              className={`${styles.viewBtn} ${view === 'list' ? styles.activeView : ''}`}
              onClick={() => setView('list')}
            >
              Lista
            </button>
            <button 
              className={`${styles.viewBtn} ${view === 'calendar' ? styles.activeView : ''}`}
              onClick={() => setView('calendar')}
            >
              Calendario
            </button>
          </div>
        </header>

        <section className={styles.formSection}>
          <EventForm 
            onCreated={handleCreated} 
            initialData={editingEvent}
            onCancel={handleCancelEdit}
          />
        </section>

        {loading ? (
          <div style={{textAlign: 'center', padding: '2rem'}}>Cargando eventos...</div>
        ) : (
          <section className={styles.contentSection}>
            {view === 'list' ? (
              <EventsList 
                events={events}
                onEdit={handleEdit}
                onRefresh={handleCreated}
              />
            ) : (
              <EventCalendar 
                events={events} 
                onEventClick={handleEventClick}
              />
            )}
          </section>
        )}
      </main>

      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={closeModal}
          onEdit={(e) => { closeModal(); handleEdit(e); }}
        />
      )}
    </div>
  );
};

export default Events;

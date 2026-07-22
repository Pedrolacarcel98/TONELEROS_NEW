import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import EventForm from '../components/events/EventForm';
import EventsList from '../components/events/EventsList';
import EventCalendar from '../components/events/EventCalendar';
import EventDetailModal from '../components/events/EventDetailModal';
import eventsService from '../services/eventsService';
import { vacationsService } from '../services/vacationsService';
import styles from './Events.module.css';

export const Events = () => {
  const [view, setView] = useState('cards'); // 'cards', 'table', o 'calendar'
  const [showHistory, setShowHistory] = useState(false);
  const [events, setEvents] = useState([]);
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [refreshKey, showHistory]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const [eventsData, vacationsData] = await Promise.all([
        eventsService.getEvents(showHistory),
        vacationsService.getVacations()
      ]);
      setEvents(eventsData);
      setVacations(vacationsData);
      if (selectedEvent) {
        const updatedSelected = data.find(e => e.id === selectedEvent.id);
        if (updatedSelected) {
          setSelectedEvent(updatedSelected);
        }
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = () => {
    setRefreshKey(prev => prev + 1);
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className={styles.page}>
      <Header showBack={true} title="Eventos" />
      <main className="container">

        {/* Overview Cards */}
        {!loading && (
          <div className={styles.overviewCards}>
            <div className={styles.overviewCard}>
              <span className={styles.overviewValue}>{events.filter(e => new Date(e.fecha) >= new Date()).length}</span>
              <span className={styles.overviewLabel}>Próximos</span>
            </div>
            <div className={styles.overviewCard}>
              <span className={styles.overviewValue}>{events.filter(e => {
                const eventDate = new Date(e.fecha);
                const today = new Date();
                const diffTime = Math.abs(eventDate - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                return diffDays <= 7 && eventDate >= today;
              }).length}</span>
              <span className={styles.overviewLabel}>Esta semana</span>
            </div>
          </div>
        )}

        <header className={styles.header}>
          <h1 className={styles.title}>Agenda</h1>
          
          <div className={styles.headerActions}>
            <div className={styles.filterTabs}>
              <button 
                className={`${styles.tabBtn} ${!showHistory ? styles.activeTab : ''}`}
                onClick={() => setShowHistory(false)}
              >
                Próximos
              </button>
              <button 
                className={`${styles.tabBtn} ${showHistory ? styles.activeTab : ''}`}
                onClick={() => setShowHistory(true)}
              >
                Historial
              </button>
            </div>

            <div className={styles.viewSwitcher}>
              <button 
                className={`${styles.viewBtn} ${view === 'cards' ? styles.activeView : ''}`}
                onClick={() => setView('cards')}
              >
                🎴 Tarjetas
              </button>
              <button 
                className={`${styles.viewBtn} ${view === 'table' ? styles.activeView : ''}`}
                onClick={() => setView('table')}
              >
                📋 Tabla
              </button>
              <button 
                className={`${styles.viewBtn} ${view === 'calendar' ? styles.activeView : ''}`}
                onClick={() => setView('calendar')}
              >
                📅 Calendario
              </button>
            </div>
          </div>
        </header>

        {/* Botón Flotante para añadir evento */}
        {!showHistory && (
          <button 
            className={`${styles.addBtn} ${styles.fabButton}`}
            onClick={() => {
              setEditingEvent(null);
              setShowForm(!showForm);
              if (!showForm) {
                setTimeout(() => {
                  document.getElementById('eventFormSection')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            title="Nuevo Evento"
          >
            {showForm ? '✕ Cerrar' : '➕ Nuevo'}
          </button>
        )}

        {/* Solo mostramos el formulario si no estamos viendo el historial y se ha activado showForm */}
        {!showHistory && showForm && (
          <section id="eventFormSection" className={styles.formSection}>
            <EventForm 
              onCreated={handleCreated} 
              initialData={editingEvent}
              onCancel={handleCancelEdit}
              vacations={vacations}
            />
          </section>
        )}

        {loading ? (
          <div style={{textAlign: 'center', padding: '2rem'}}>Cargando eventos...</div>
        ) : (
          <section className={styles.contentSection}>
            {view === 'calendar' ? (
              <EventCalendar 
                events={events} 
                onEventClick={handleEventClick}
              />
            ) : (
              <EventsList 
                events={events}
                onEdit={handleEdit}
                onRefresh={handleCreated}
                vacations={vacations}
                viewMode={view}
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

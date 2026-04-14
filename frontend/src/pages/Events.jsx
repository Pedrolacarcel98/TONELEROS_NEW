import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import EventForm from '../components/events/EventForm';
import EventsList from '../components/events/EventsList';
import styles from './Events.module.css';

export const Events = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [editingEvent, setEditingEvent] = useState(null);

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

  return (
    <div className={styles.page}>
      <Header showBack={true} />
      <main className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Agenda de Eventos</h1>
          <p className={styles.subtitle}>Gestiona tus actuaciones y compromisos musicales</p>
        </header>

        <section className={styles.formSection}>
          <EventForm 
            onCreated={handleCreated} 
            initialData={editingEvent}
            onCancel={handleCancelEdit}
          />
        </section>

        <section className={styles.listSection}>
          <EventsList 
            key={refreshKey} 
            onEdit={handleEdit}
          />
        </section>
      </main>
    </div>
  );
};

export default Events;

import React, { useEffect, useState } from 'react';
import styles from './EventsList.module.css';
import { eventsService } from '../../services/eventsService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import EventDetailModal from './EventDetailModal';

export const EventsList = ({ onEdit }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsService.getEvents();
      data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Error cargando eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleEditClick = (event) => {
    setSelectedEvent(null);
    if (onEdit) onEdit(event);
  };

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Cargando agenda...</p>
    </div>
  );

  if (error) return (
    <div className={styles.errorCard}>
      <p>Error: {error}</p>
      <button onClick={load} className="btn-secondary">Reintentar</button>
    </div>
  );

  const groups = events.reduce((acc, ev) => {
    const d = new Date(ev.fecha);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {});

  const groupKeys = Object.keys(groups).sort();

  return (
    <div className={styles.container}>
      <div className={styles.viewSwitcher}>
        <div className={styles.switcherLabel}>Vista:</div>
        <div className={styles.switcherButtons}>
          <button 
            className={`${styles.switchBtn} ${viewMode === 'cards' ? styles.activeSwitch : ''}`}
            onClick={() => setViewMode('cards')}
            title="Vista de tarjetas"
          >
            🎴 Tarjetas
          </button>
          <button 
            className={`${styles.switchBtn} ${viewMode === 'table' ? styles.activeSwitch : ''}`}
            onClick={() => setViewMode('table')}
            title="Vista de tabla"
          >
            📋 Tabla
          </button>
        </div>
      </div>

      {groupKeys.length === 0 && (
        <div className={styles.emptyState}>
          <p>No hay eventos programados</p>
          <span className={styles.hint}>Añade uno nuevo arriba</span>
        </div>
      )}

      {groupKeys.map(key => {
        const [year, month] = key.split('-');
        const items = groups[key];
        const monthDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
        const headerLabel = format(monthDate, 'LLLL yyyy', { locale: es });
        const totalGross = items.reduce((s, it) => s + (Number(it.presupuesto) || 0), 0);

        return (
          <section key={key} className={styles.monthSection}>
            <header className={styles.monthHeader}>
              <h2 className={styles.monthTitle}>{headerLabel}</h2>
              <span className={styles.monthSummary}>{totalGross.toLocaleString()} € en total</span>
            </header>
            
            {viewMode === 'cards' ? (
              <div className={styles.grid}>
                {items.map(ev => {
                  const eventDate = new Date(ev.fecha);
                  const isNegotiation = ev.estado === 'NEGOCIACION';
                  return (
                    <div 
                      key={ev.id} 
                      className={`${styles.eventCard} ${isNegotiation ? styles.negotiationCard : ''}`} 
                      onClick={() => setSelectedEvent(ev)}
                    >
                      <div className={styles.dateBlock}>
                        <span className={styles.dayNum}>{format(eventDate, 'd')}</span>
                        <span className={styles.dayName}>{format(eventDate, 'eee', { locale: es })}</span>
                      </div>

                      <div className={styles.cardInfo}>
                        <div className={styles.cardHeader}>
                          <span className={`${styles.typeBadge} ${isNegotiation ? styles.negotiationBadge : ''}`}>
                            {isNegotiation ? '⌛ Negociación' : ev.tipo}
                          </span>
                          <span className={styles.time}>{format(eventDate, 'HH:mm')}</span>
                        </div>
                        
                        <h3 className={styles.direccion}>{ev.direccion}</h3>
                        
                        <div className={styles.cardFooter}>
                          <span className={styles.contact}>👤 {ev.pContacto}</span>
                          <span className={styles.price}>{Number(ev.presupuesto).toLocaleString()} €</span>
                        </div>
                      </div>
                      
                      <div className={styles.cardHover}>
                        <span>Ver Detalles</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Hora</th>
                      <th>Estado / Tipo</th>
                      <th>Dirección / Lugar</th>
                      <th>Contacto</th>
                      <th className={styles.textRight}>Ppto.</th>
                      <th className={styles.textRight}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(ev => {
                      const eventDate = new Date(ev.fecha);
                      const pending = Number(ev.presupuesto) - Number(ev.senal);
                      const isNegotiation = ev.estado === 'NEGOCIACION';
                      return (
                        <tr key={ev.id} onClick={() => setSelectedEvent(ev)} className={`${styles.tableRow} ${isNegotiation ? styles.negotiationRow : ''}`}>
                          <td className={styles.tableDate}>
                            <strong>{format(eventDate, 'dd')}</strong>
                            <small>{format(eventDate, 'eee', { locale: es })}</small>
                          </td>
                          <td className={styles.tableTime}>{format(eventDate, 'HH:mm')}</td>
                          <td>
                            <span className={`${styles.tableBadge} ${isNegotiation ? styles.negotiationBadgeSmall : ''}`}>
                              {isNegotiation ? 'Negociación' : ev.tipo}
                            </span>
                          </td>
                          <td className={styles.tableAddress}>{ev.direccion}</td>
                          <td className={styles.tableContact}>
                            <div>{ev.pContacto}</div>
                            <small>{ev.tlf}</small>
                          </td>
                          <td className={styles.textRight}><strong>{Number(ev.presupuesto).toLocaleString()} €</strong></td>
                          <td className={styles.textRight}>
                            {pending > 0 ? (
                              <span className={styles.pendingBadge}>-{pending} €</span>
                            ) : (
                              <span className={styles.paidBadge}>Pagado</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}

      {selectedEvent && (
        <EventDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onUpdate={load}
          onEdit={handleEditClick}
        />
      )}
    </div>
  );
};

export default EventsList;

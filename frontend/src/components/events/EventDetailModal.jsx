import React from 'react';
import styles from './EventDetailModal.module.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventsService } from '../../services/eventsService';

export const EventDetailModal = ({ event, onClose, onUpdate, onEdit }) => {
  if (!event) return null;

  const eventDate = new Date(event.fecha);
  const isNegotiation = event.estado === 'NEGOCIACION';

  const handleEdit = () => {
    onEdit(event);
  };

  const handleConfirm = async () => {
    if (!window.confirm('¿Confirmar este evento? Pasará de Negociación a Confirmado.')) return;
    try {
      const updatedData = { ...event, estado: 'CONFIRMADO' };
      // Remove fields not in EventCreate schema if necessary, 
      // but EventCreate is same as EventBase except id/archivado
      delete updatedData.id;
      delete updatedData.archivado;
      delete updatedData.created_at;
      
      await eventsService.updateEvent(event.id, updatedData);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      alert('Error al confirmar evento');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Borrar este evento permanentemente?')) return;
    try {
      await eventsService.deleteEvent(event.id);
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      alert('Error al borrar evento');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <div className={styles.titleInfo}>
            <span className={`${styles.typeBadge} ${isNegotiation ? styles.negotiationBadge : ''}`}>
              {isNegotiation ? 'En Negociación' : event.tipo}
            </span>
            <h2 className={styles.title}>{event.direccion || 'Sin dirección'}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </header>

        <div className={styles.content}>
          <div className={styles.mainGrid}>
            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Detalles del Evento</h3>
              <div className={styles.infoRow}>
                <span className={styles.label}>Estado:</span>
                <span className={`${styles.value} ${isNegotiation ? styles.negotiationValue : ''}`}>
                  {isNegotiation ? '⏳ Negociación' : '✅ Confirmado / Vendido'}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Fecha:</span>
                <span className={styles.value}>{format(eventDate, "PPPP", { locale: es })}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Hora:</span>
                <span className={styles.value}>{format(eventDate, "p")}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Dirección:</span>
                <span className={styles.value}>{event.direccion}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Equipo:</span>
                <span className={styles.value}>{event.equipo ? '✅ Incluido' : '❌ No incluido'}</span>
              </div>
            </div>

            <div className={styles.infoSection}>
              <h3 className={styles.sectionTitle}>Contacto</h3>
              <div className={styles.infoRow}>
                <span className={styles.label}>Persona:</span>
                <span className={styles.value}>{event.pContacto}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Teléfono:</span>
                <span className={styles.value}>{event.tlf}</span>
              </div>
            </div>

            <div className={`${styles.infoSection} ${styles.financeSection}`}>
              <h3 className={styles.sectionTitle}>Finanzas</h3>
              <div className={styles.infoRow}>
                <span className={styles.label}>Presupuesto Total:</span>
                <span className={`${styles.value} ${styles.highlight}`}>{Number(event.presupuesto).toLocaleString()} €</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Señal / Reserva:</span>
                <span className={styles.value}>{Number(event.senal).toLocaleString()} €</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Pendiente:</span>
                <span className={styles.value}>{(Number(event.presupuesto) - Number(event.senal)).toLocaleString()} €</span>
              </div>
            </div>
          </div>

          {event.observaciones && (
            <div className={styles.observations}>
              <h3 className={styles.sectionTitle}>Observaciones</h3>
              <p className={styles.obsText}>{event.observaciones}</p>
            </div>
          )}
        </div>

        <footer className={styles.footer}>
          <div className={styles.leftActions}>
             <button className={styles.deleteBtn} onClick={handleDelete}>Borrar Evento</button>
             <button className={styles.editBtn} onClick={handleEdit}>Editar Datos</button>
          </div>
          <div className={styles.rightActions}>
            {isNegotiation && (
              <button className={styles.confirmBtn} onClick={handleConfirm}>Confirmar Venta</button>
            )}
            <button className={styles.doneBtn} onClick={onClose}>Cerrar</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EventDetailModal;

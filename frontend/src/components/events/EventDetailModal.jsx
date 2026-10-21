import React from 'react';
import styles from './EventDetailModal.module.css';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventsService } from '../../services/eventsService';
import { parseLocalDate } from '../../utils/dateUtils';
import { getEventPriceGradient } from '../../utils/pricingUtils';

export const EventDetailModal = ({ event, onClose, onUpdate, onEdit }) => {
  if (!event) return null;

  const eventDate = parseLocalDate(event.fecha);
  const isNegotiation = event.estado === 'NEGOCIACION';
  const priceGrad = getEventPriceGradient(event.presupuesto, event.equipo);

  const handleEdit = () => {
    onEdit(event);
  };

  const handleToggleRepartida = async (isRepartida) => {
    const msg = isRepartida 
      ? '¿Marcar la señal como repartida entre los integrantes?' 
      : '¿Seguro que quieres desmarcar la señal como repartida?';
    if (!window.confirm(msg)) return;
    try {
      const updatedData = { ...event, senal_repartida: isRepartida };
      delete updatedData.id;
      delete updatedData.archivado;
      delete updatedData.created_at;
      
      await eventsService.updateEvent(event.id, updatedData);
      if (onUpdate) onUpdate();
    } catch (error) {
      alert('Error al actualizar la señal');
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('¿Confirmar este evento? Pasará de Negociación a Confirmado.')) return;
    try {
      const updatedData = { ...event, estado: 'CONFIRMADO' };
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
          <button className={styles.closeBtn} onClick={onClose} title="Cerrar modal">×</button>
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
                <span className={styles.label}>Hora Comienzo:</span>
                <span className={styles.value}>{event.hora_comienzo || '--:--'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Hora Llegada:</span>
                <span className={styles.value}>{event.hora_llegada || '--:--'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Dirección:</span>
                <span className={styles.value}>{event.direccion}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Equipo de Sonido:</span>
                <span className={styles.value}>{event.equipo ? '🔊 Nosotros (Media 750 €)' : '🏠 Cliente (Media 600 €)'}</span>
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
                <span 
                  className={`${styles.value} ${styles.highlight}`}
                  style={{
                    background: priceGrad.background,
                    color: priceGrad.color,
                    border: `1px solid ${priceGrad.border}`,
                  }}
                >
                  {Number(event.presupuesto).toLocaleString()} €
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Señal / Reserva:</span>
                <span className={styles.value}>
                  {Number(event.senal).toLocaleString()} €
                </span>
              </div>
              
              {Number(event.senal) > 0 && (
                <div className={`${styles.infoRow} ${styles.senalRow}`}>
                  <span className={styles.label}>Estado de Señal:</span>
                  <div className={styles.senalValueWrapper}>
                    {event.senal_repartida ? (
                      <span className={styles.senalRepartidaText}>
                        <span>✓ Repartida por {event.cobrador}</span>
                        <button 
                          onClick={() => handleToggleRepartida(false)}
                          className={styles.unmarkBtn}
                        >
                          Desmarcar
                        </button>
                      </span>
                    ) : (
                      <span className={styles.senalPendienteText}>
                        <span>Cobrada por: {event.cobrador}</span>
                        <button 
                          onClick={() => handleToggleRepartida(true)}
                          className={styles.markBtn}
                        >
                          Marcar repartida
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
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
            <button className={styles.deleteBtn} onClick={handleDelete}>
              🗑️ Borrar Evento
            </button>
            <button className={styles.editBtn} onClick={handleEdit}>
              ✏️ Editar Datos
            </button>
          </div>
          <div className={styles.rightActions}>
            {isNegotiation && (
              <button className={styles.confirmBtn} onClick={handleConfirm}>
                🤝 Confirmar Venta
              </button>
            )}
            <button className={styles.doneBtn} onClick={onClose}>
              Cerrar
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default EventDetailModal;

import React, { useState, useEffect } from 'react';
import styles from './EventForm.module.css';
import { eventsService } from '../../services/eventsService';

export const EventForm = ({ onCreated, initialData, onCancel }) => {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({
    tipo: '',
    fecha: '',
    direccion: '',
    pContacto: '',
    tlf: '',
    presupuesto: '',
    senal: '',
    observaciones: '',
    equipo: false,
    estado: 'NEGOCIACION',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        // Ensure numbers are strings for input value
        tlf: initialData.tlf?.toString() || '',
        presupuesto: initialData.presupuesto?.toString() || '',
        senal: initialData.senal?.toString() || '',
        // Handle ISO date for datetime-local (slice to YYYY-MM-DDTHH:MM)
        fecha: initialData.fecha ? initialData.fecha.slice(0, 16) : '',
      });
      setVisible(true);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleToggle = () => {
    if (visible && isEditing && onCancel) {
      onCancel();
    }
    setVisible(!visible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        tlf: parseInt(form.tlf || 0, 10),
        presupuesto: parseInt(form.presupuesto || 0, 10),
        senal: parseInt(form.senal || 0, 10),
        fecha: form.fecha,
      };

      if (isEditing) {
        await eventsService.updateEvent(initialData.id, payload);
      } else {
        await eventsService.createEvent(payload);
      }

      setForm({ tipo: '', fecha: '', direccion: '', pContacto: '', tlf: '', presupuesto: '', senal: '', observaciones: '', equipo: false, estado: 'NEGOCIACION' });
      if (onCreated) onCreated();
      if (onCancel) onCancel();
      setVisible(false);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error guardando evento');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{isEditing ? 'Editar Evento' : 'Nuevo Evento'}</h2>
        <button 
          type="button" 
          className={`${styles.toggleBtn} ${visible ? styles.active : ''}`} 
          onClick={handleToggle}
        >
          {visible ? 'Cancelar' : '+ Añadir Evento'}
        </button>
      </header>

      {visible && (
        <div className={styles.formWrapper}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Tipo de Evento</label>
                <input 
                  className={styles.input}
                  name="tipo" 
                  value={form.tipo} 
                  onChange={handleChange} 
                  placeholder="Ej: Boda, Concierto..."
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Fecha y Hora</label>
                <input 
                  className={styles.input}
                  name="fecha" 
                  type="datetime-local" 
                  value={form.fecha} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Dirección / Lugar</label>
                <input 
                  className={styles.input}
                  name="direccion" 
                  value={form.direccion} 
                  onChange={handleChange} 
                  placeholder="Ubicación del evento"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Persona de Contacto</label>
                <input 
                  className={styles.input}
                  name="pContacto" 
                  value={form.pContacto} 
                  onChange={handleChange} 
                  placeholder="Nombre"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Teléfono</label>
                <input 
                  className={styles.input}
                  name="tlf" 
                  value={form.tlf} 
                  onChange={handleChange} 
                  placeholder="Número de teléfono"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Presupuesto (€)</label>
                <input 
                  className={styles.input}
                  name="presupuesto" 
                  type="number"
                  value={form.presupuesto} 
                  onChange={handleChange} 
                  placeholder="0.00"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Señal / Reserva (€)</label>
                <input 
                  className={styles.input}
                  name="senal" 
                  type="number"
                  value={form.senal} 
                  onChange={handleChange} 
                  placeholder="0.00"
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Estado del Evento</label>
                <select 
                  className={styles.input}
                  name="estado" 
                  value={form.estado} 
                  onChange={handleChange}
                >
                  <option value="NEGOCIACION">En Negociación</option>
                  <option value="CONFIRMADO">Confirmado / Vendido</option>
                </select>
              </div>

              <div className={styles.inputGroupCheckbox}>
                <label className={styles.checkboxLabel}>
                  <input 
                    name="equipo" 
                    type="checkbox" 
                    checked={form.equipo} 
                    onChange={handleChange} 
                  /> 
                  <span>Equipo incluido</span>
                </label>
              </div>

              <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>Observaciones</label>
                <textarea 
                  className={styles.textarea}
                  name="observaciones" 
                  value={form.observaciones} 
                  onChange={handleChange} 
                  placeholder="Detalles adicionales, requisitos técnicos..."
                />
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button type="submit" className={styles.submitBtn} disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Confirmar y Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventForm;

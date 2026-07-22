import React, { useState, useEffect } from 'react';
import styles from './EventForm.module.css';
import { eventsService } from '../../services/eventsService';
import { checkVacationOverlap } from '../../utils/vacationUtils';

export const EventForm = ({ onCreated, initialData, onCancel, vacations = [] }) => {
  const [form, setForm] = useState({
    tipo: '',
    fecha: '',
    hora_comienzo: '',
    hora_llegada: '',
    direccion: '',
    pContacto: '',
    tlf: '',
    presupuesto: '',
    senal: '',
    senal_repartida: false,
    cobrador: '',
    observaciones: '',
    equipo: false,
    estado: 'NEGOCIACION',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!initialData;

  useEffect(() => {
    // Check for pre-fill data (from Clients section)
    const prefill = sessionStorage.getItem('prefill_event');
    if (prefill && !isEditing) {
      const data = JSON.parse(prefill);
      setForm((prev) => ({
        ...prev,
        pContacto: data.pContacto || '',
        tlf: data.tlf || '',
        direccion: data.direccion || ''
      }));
      sessionStorage.removeItem('prefill_event'); // Clean up
    }

    if (initialData) {
      setForm({
        ...initialData,
        // Ensure numbers are strings for input value
        tlf: initialData.tlf?.toString() || '',
        presupuesto: initialData.presupuesto?.toString() || '',
        senal: initialData.senal?.toString() || '',
        senal_repartida: initialData.senal_repartida || false,
        cobrador: initialData.cobrador || '',
        fecha: initialData.fecha ? initialData.fecha.slice(0, 10) : '',
        hora_comienzo: initialData.hora_comienzo || '',
        hora_llegada: initialData.hora_llegada || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newForm = { ...form, [name]: type === 'checkbox' ? checked : value };

    // Validación: No permitir señal si está en negociación
    if (name === 'senal' && Number(value) > 0 && newForm.estado === 'NEGOCIACION') {
      alert("Un evento en negociación nunca debe tener señal. La señal solo se cobra con eventos confirmados.");
      return;
    }

    // Si cambian el estado a negociación y ya había señal, la borramos
    if (name === 'estado' && value === 'NEGOCIACION' && Number(newForm.senal) > 0) {
      alert("Al pasar a negociación, la señal se borrará. Un evento en negociación no puede tener señal.");
      newForm.senal = '';
      newForm.senal_repartida = false;
      newForm.cobrador = '';
    }

    if (name === 'hora_comienzo' && value) {
      try {
        const [hours, minutes] = value.split(':').map(Number);
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        d.setMinutes(d.getMinutes() - 45);
        const resHours = String(d.getHours()).padStart(2, '0');
        const resMins = String(d.getMinutes()).padStart(2, '0');
        newForm.hora_llegada = `${resHours}:${resMins}`;
      } catch (err) {
        console.error("Error al calcular hora de llegada", err);
      }
    }

    setForm(newForm);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificamos vacaciones si hay fecha
    if (form.fecha) {
      const overlaps = checkVacationOverlap(form.fecha, vacations);
      if (overlaps.length > 0) {
        const msg = `⚠️ ATENCIÓN: ${overlaps.join(', ')} tiene(n) vacaciones este día.\n\n¿Estás seguro de que quieres crear/guardar la actuación?`;
        if (!window.confirm(msg)) {
          return;
        }
      }
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        tlf: parseInt(form.tlf || 0, 10),
        presupuesto: parseInt(form.presupuesto || 0, 10),
        senal: parseInt(form.senal || 0, 10),
        fecha: form.fecha,
        cobrador: parseInt(form.senal || 0, 10) > 0 ? form.cobrador : null,
      };

      if (isEditing) {
        await eventsService.updateEvent(initialData.id, payload);
      } else {
        await eventsService.createEvent(payload);
      }

      setForm({ tipo: '', fecha: '', hora_comienzo: '', hora_llegada: '', direccion: '', pContacto: '', tlf: '', presupuesto: '', senal: '', senal_repartida: false, cobrador: '', observaciones: '', equipo: false, estado: 'NEGOCIACION' });
      if (onCreated) onCreated();
      if (onCancel) onCancel();
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
        {isEditing && (
          <button type="button" className={styles.cancelBtnText} onClick={handleCancel}>
            Cancelar
          </button>
        )}
      </header>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Tipo de Evento</label>
                <select 
                  className={styles.input}
                  name="tipo" 
                  value={form.tipo} 
                  onChange={handleChange} 
                  required 
                >
                  <option value="" disabled>Selecciona un tipo...</option>
                  <option value="Boda">Boda</option>
                  <option value="Fiesta">Fiesta</option>
                  <option value="Feria">Feria</option>
                  <option value="Feria de Sevilla">Feria de Sevilla</option>
                  <option value="Cumpleaños">Cumpleaños</option>
                  <option value="Puesta de Largo">Puesta de Largo</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Fecha</label>
                <input 
                  className={styles.input}
                  name="fecha" 
                  type="date" 
                  value={form.fecha ? form.fecha.split('T')[0] : ''} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Hora Comienzo</label>
                <input 
                  className={styles.input}
                  name="hora_comienzo" 
                  type="time" 
                  value={form.hora_comienzo} 
                  onChange={handleChange} 
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Hora Llegada (Automática)</label>
                <input 
                  className={styles.input}
                  name="hora_llegada" 
                  type="time" 
                  value={form.hora_llegada} 
                  onChange={handleChange} 
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
                  disabled={form.estado === 'NEGOCIACION'}
                  title={form.estado === 'NEGOCIACION' ? "No se puede añadir señal a un evento en negociación" : ""}
                />
              </div>

              {Number(form.senal) > 0 && (
                <>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>¿Quién ha cobrado la señal?</label>
                    <select 
                      className={styles.input}
                      name="cobrador" 
                      value={form.cobrador} 
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona un integrante...</option>
                      <option value="Luis">Luis</option>
                      <option value="Pedro">Pedro</option>
                      <option value="Alfonso">Alfonso</option>
                      <option value="Pipa">Pipa</option>
                    </select>
                  </div>

                  <div className={styles.inputGroupCheckbox}>
                    <label className={styles.checkboxLabel}>
                      <input 
                        name="senal_repartida" 
                        type="checkbox" 
                        checked={form.senal_repartida} 
                        onChange={handleChange} 
                      /> 
                      <span>Señal Repartida (entre todos)</span>
                    </label>
                  </div>
                </>
              )}

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
    </div>
  );
};

export default EventForm;

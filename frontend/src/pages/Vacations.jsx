import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import { vacationsService } from '../services/vacationsService';
import styles from './Vacations.module.css';
import { parseLocalDate } from '../utils/dateUtils';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

export default function Vacations() {
  const [vacations, setVacations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [form, setForm] = useState({
    member_name: '',
    start_date: '',
    end_date: '',
    is_single_day: false,
    description: ''
  });
  const [showForm, setShowForm] = useState(false);

  const members = ["Luis", "Pedro", "Alfonso", "Pipa"];

  useEffect(() => {
    fetchVacations();
  }, []);

  const fetchVacations = async () => {
    try {
      const data = await vacationsService.getVacations();
      setVacations(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      // Pydantic will reject empty strings for dates, so convert '' to null
      const payload = {
        ...form,
        end_date: form.end_date === '' ? null : form.end_date
      };
      
      await vacationsService.createVacation(payload);
      setForm({
        member_name: '',
        start_date: '',
        end_date: '',
        is_single_day: false,
        description: ''
      });
      setShowForm(false);
      fetchVacations();
    } catch (e) {
      console.error("Detalle del error:", e.response?.data || e.message);
      setErrorMsg('Error al guardar las vacaciones. Verifica los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro de vacaciones?')) return;
    try {
      await vacationsService.deleteVacation(id);
      fetchVacations();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateString) => {
    return parseLocalDate(dateString).toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Vacaciones</h1>
          
          {/* Botón clásico / FAB para añadir vacaciones */}
          <button 
            className={`${styles.addBtn} ${styles.fabButton}`}
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setTimeout(() => {
                  document.getElementById('vacationFormSection')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
          >
            {showForm ? '✕ Cerrar' : '➕ Añadir'}
          </button>
        </div>

        <div className={styles.grid}>
          {/* Formulario */}
          {showForm && (
            <section id="vacationFormSection" className={styles.card}>
            <h2>Añadir Vacaciones</h2>
            {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Integrante</label>
                <select 
                  name="member_name" 
                  value={form.member_name} 
                  onChange={handleChange} 
                  className={styles.select}
                  required
                >
                  <option value="">Selecciona un integrante...</option>
                  {members.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <label className={styles.checkboxGroup}>
                <input 
                  type="checkbox" 
                  name="is_single_day"
                  checked={form.is_single_day}
                  onChange={handleChange}
                />
                <span className={styles.checkboxLabel}>Solo 1 día (fechas únicas)</span>
              </label>

              {form.is_single_day ? (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fecha</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    value={form.start_date} 
                    onChange={handleChange} 
                    className={styles.input}
                    required 
                  />
                </div>
              ) : (
                <div className={styles.dateGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Desde</label>
                    <input 
                      type="date" 
                      name="start_date" 
                      value={form.start_date} 
                      onChange={handleChange} 
                      className={styles.input}
                      required 
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Hasta</label>
                    <input 
                      type="date" 
                      name="end_date" 
                      value={form.end_date} 
                      onChange={handleChange} 
                      className={styles.input}
                      required 
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Descripción (Opcional)</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  className={styles.input}
                  rows="2"
                  placeholder="Ej: Viaje a la playa..."
                />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Vacaciones'}
              </button>
            </form>
          </section>
          )}

          {/* Listado Agrupado */}
          <section className={`${styles.card} ${styles.listSection}`}>
            <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '20px' }}>Registros por Integrante</h2>
            {vacations.length === 0 ? (
              <div className={styles.emptyState}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <p>No hay vacaciones registradas aún.</p>
              </div>
            ) : (
              <div className={styles.memberGroups}>
                {members.map(member => {
                  const memberVacations = vacations.filter(v => v.member_name === member);
                  if (memberVacations.length === 0) return null;
                  return (
                    <div key={member} className={styles.memberGroup}>
                      <h3 className={styles.groupTitle}>👤 {member}</h3>
                      <ul className={styles.list}>
                        {memberVacations.map(v => (
                          <li key={v.id} className={styles.listItem}>
                            <div className={styles.vacationInfo}>
                              <div className={styles.vacationDates}>
                                <CalendarIcon />
                                {v.is_single_day || v.start_date === v.end_date ? (
                                  <span>{formatDate(v.start_date)}</span>
                                ) : (
                                  <span>{formatDate(v.start_date)} - {formatDate(v.end_date)}</span>
                                )}
                              </div>
                              {v.description && (
                                <div className={styles.vacationDescription}>
                                  {v.description}
                                </div>
                              )}
                            </div>
                            <button onClick={() => handleDelete(v.id)} className={styles.deleteBtn}>
                              🗑️
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

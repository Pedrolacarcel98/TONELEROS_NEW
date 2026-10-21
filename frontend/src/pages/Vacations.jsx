import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/common/Header';
import { vacationsService } from '../services/vacationsService';
import eventsService from '../services/eventsService';
import styles from './Vacations.module.css';
import { parseLocalDate } from '../utils/dateUtils';
import {
  OFFICIAL_MEMBERS,
  getConflictingEvents,
  calculateVacationDays,
  getVacationStatus
} from '../utils/vacationUtils';

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);

const initialFormState = {
  member_name: '',
  selected_members: [],
  start_date: '',
  end_date: '',
  is_single_day: false,
  description: ''
};

export default function Vacations() {
  const [vacations, setVacations] = useState([]);
  const [summary, setSummary] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [form, setForm] = useState(initialFormState);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');

  const members = OFFICIAL_MEMBERS; // ["Pedro", "Pipa", "Alfonso", "Luis"]
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vacData, sumData, evData] = await Promise.all([
        vacationsService.getVacations(),
        vacationsService.getSummary(currentYear),
        eventsService.getEvents(false).catch(() => [])
      ]);
      setVacations(vacData || []);
      setSummary(sumData || []);
      setEvents(evData || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'is_single_day' && checked) {
        updated.end_date = updated.start_date;
      }
      return updated;
    });
  };

  const toggleMemberSelection = (member) => {
    if (editingId) {
      setForm(prev => ({ ...prev, member_name: member }));
      return;
    }
    setForm(prev => {
      const exists = prev.selected_members.includes(member);
      const next = exists
        ? prev.selected_members.filter(m => m !== member)
        : [...prev.selected_members, member];
      return {
        ...prev,
        selected_members: next,
        member_name: next[0] || ''
      };
    });
  };

  const toggleAllMembers = () => {
    if (editingId) return;
    setForm(prev => {
      const allSelected = prev.selected_members.length === members.length;
      const next = allSelected ? [] : [...members];
      return {
        ...prev,
        selected_members: next,
        member_name: next[0] || ''
      };
    });
  };

  const openCreateForm = () => {
    if (showForm && !editingId) {
      setShowForm(false);
      return;
    }
    setEditingId(null);
    setErrorMsg(null);
    setForm(initialFormState);
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('vacationFormSection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleEdit = (vacation) => {
    setEditingId(vacation.id);
    setErrorMsg(null);
    setForm({
      member_name: vacation.member_name,
      selected_members: [vacation.member_name],
      start_date: vacation.start_date || '',
      end_date: vacation.end_date || vacation.start_date || '',
      is_single_day: Boolean(vacation.is_single_day || vacation.start_date === vacation.end_date),
      description: vacation.description || ''
    });
    setShowForm(true);
    setTimeout(() => {
      document.getElementById('vacationFormSection')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCancelForm = () => {
    setEditingId(null);
    setErrorMsg(null);
    setForm(initialFormState);
    setShowForm(false);
  };

  // Eventos que chocan con las fechas seleccionadas en el formulario
  const conflictingEvents = useMemo(() => {
    return getConflictingEvents(form.start_date, form.end_date, form.is_single_day, events);
  }, [form.start_date, form.end_date, form.is_single_day, events]);

  const previewDays = useMemo(() => {
    return calculateVacationDays(form.start_date, form.end_date, form.is_single_day);
  }, [form.start_date, form.end_date, form.is_single_day]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!editingId && form.selected_members.length === 0) {
      setErrorMsg('Selecciona al menos un integrante.');
      return;
    }
    if (editingId && !form.member_name) {
      setErrorMsg('Selecciona un integrante.');
      return;
    }

    setLoading(true);
    try {
      const effectiveEndDate = form.is_single_day
        ? form.start_date
        : (form.end_date === '' ? form.start_date : form.end_date);

      if (editingId) {
        await vacationsService.updateVacation(editingId, {
          member_name: form.member_name,
          start_date: form.start_date,
          end_date: effectiveEndDate,
          is_single_day: form.is_single_day,
          description: form.description
        });
      } else {
        await vacationsService.createVacation({
          member_name: form.selected_members[0],
          member_names: form.selected_members,
          start_date: form.start_date,
          end_date: effectiveEndDate,
          is_single_day: form.is_single_day,
          description: form.description
        });
      }

      setForm(initialFormState);
      setEditingId(null);
      setShowForm(false);
      await fetchData();
    } catch (e) {
      console.error("Detalle del error:", e.response?.data || e.message);
      const backendDetail = e.response?.data?.detail;
      setErrorMsg(typeof backendDetail === 'string' ? backendDetail : 'Error al guardar las vacaciones. Verifica las fechas.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este registro de vacaciones?')) return;
    try {
      await vacationsService.deleteVacation(id);
      if (editingId === id) {
        handleCancelForm();
      }
      await fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (dateString) => {
    return parseLocalDate(dateString).toLocaleDateString('es-ES', { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  const displayedMembers = activeFilter === 'Todos'
    ? members
    : members.filter(m => m === activeFilter);

  const filteredVacationsCount = activeFilter === 'Todos'
    ? vacations.length
    : vacations.filter(v => v.member_name === activeFilter).length;

  return (
    <div className={styles.container}>
      <Header showBack={true} title="Vacaciones" />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1>Vacaciones</h1>
            <p className={styles.subtitle}>
              Las fechas pasadas se limpian automáticamente al día siguiente de finalizar
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={`${styles.summaryToggleBtn} ${showSummary ? styles.summaryToggleActive : ''}`}
              onClick={() => setShowSummary(!showSummary)}
              title="Ver días acumulados en el año"
            >
              📊 Días {currentYear}
            </button>

            <button 
              className={`${styles.addBtn} ${styles.fabButton}`}
              onClick={openCreateForm}
            >
              {showForm && !editingId ? '✕ Cerrar' : '➕ Añadir'}
            </button>
          </div>
        </div>

        {/* Panel discreto de contador anual por integrante */}
        {showSummary && (
          <section className={styles.summaryPanel}>
            <div className={styles.summaryHeader}>
              <span className={styles.summaryTitle}>Acumulado anual ({currentYear})</span>
              <span className={styles.summaryHint}>Conteo total de días registrados este año</span>
            </div>
            <div className={styles.summaryGrid}>
              {members.map(member => {
                const item = summary.find(s => s.member_name === member) || { total_days: 0, periods_count: 0 };
                return (
                  <div key={member} className={styles.summaryCard}>
                    <span className={styles.summaryMember}>{member}</span>
                    <div className={styles.summaryMetrics}>
                      <span className={styles.summaryDays}>{item.total_days}</span>
                      <span className={styles.summaryUnit}>{item.total_days === 1 ? 'día' : 'días'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <div className={styles.grid}>
          {/* Formulario Crear / Editar */}
          {showForm && (
            <section id="vacationFormSection" className={styles.card}>
              <div className={styles.formHeaderRow}>
                <h2>{editingId ? '✏️ Editar Vacaciones' : '➕ Añadir Vacaciones'}</h2>
                <button type="button" className={styles.cancelLinkBtn} onClick={handleCancelForm}>
                  Cancelar
                </button>
              </div>

              {errorMsg && <div className={styles.errorMessage}>{errorMsg}</div>}

              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <div className={styles.labelRow}>
                    <label className={styles.label}>
                      {editingId ? 'Integrante' : 'Integrante(s)'}
                    </label>
                    {!editingId && (
                      <button
                        type="button"
                        className={styles.selectAllBtn}
                        onClick={toggleAllMembers}
                      >
                        {form.selected_members.length === members.length ? 'Deseleccionar todos' : 'Seleccionar todos (Grupo)'}
                      </button>
                    )}
                  </div>

                  <div className={styles.memberChips}>
                    {members.map(m => {
                      const isSelected = editingId
                        ? form.member_name === m
                        : form.selected_members.includes(m);
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => toggleMemberSelection(m)}
                          className={`${styles.memberChip} ${isSelected ? styles.memberChipActive : ''}`}
                        >
                          👤 {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className={styles.checkboxGroup}>
                  <input 
                    type="checkbox" 
                    name="is_single_day"
                    checked={form.is_single_day}
                    onChange={handleChange}
                  />
                  <span className={styles.checkboxLabel}>Solo 1 día (fecha única)</span>
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
                        min={form.start_date || undefined}
                        onChange={handleChange} 
                        className={styles.input}
                        required 
                      />
                    </div>
                  </div>
                )}

                {previewDays > 0 && (
                  <div className={styles.durationPreview}>
                    Duración seleccionada: <strong>{previewDays} {previewDays === 1 ? 'día' : 'días'}</strong>
                  </div>
                )}

                {conflictingEvents.length > 0 && (
                  <div className={styles.conflictWarning}>
                    <strong>⚠️ Atención:</strong> Coincide con {conflictingEvents.length} evento(s) en la agenda:
                    <ul className={styles.conflictList}>
                      {conflictingEvents.map(ev => (
                        <li key={ev.id}>
                          {ev.tipo} — {formatDate(ev.fecha)} ({ev.estado === 'CONFIRMADO' ? 'Confirmado' : 'En negociación'})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label className={styles.label}>Descripción / Motivo (Opcional)</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange} 
                    className={styles.input}
                    rows="2"
                    placeholder="Ej: Viaje, compromiso personal..."
                  />
                </div>

                <div className={styles.formActions}>
                  {editingId && (
                    <button type="button" className={styles.secondaryBtn} onClick={handleCancelForm}>
                      Cancelar
                    </button>
                  )}
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Guardando...' : (editingId ? 'Guardar Cambios' : 'Guardar Vacaciones')}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Listado Agrupado */}
          <section className={`${styles.card} ${styles.listSection}`}>
            <div className={styles.listHeader}>
              <h2>Próximas Vacaciones y Ausencias</h2>
              <div className={styles.filterPills}>
                {['Todos', ...members].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveFilter(tab)}
                    className={`${styles.filterPill} ${activeFilter === tab ? styles.filterPillActive : ''}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredVacationsCount === 0 ? (
              <div className={styles.emptyState}>
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                <p>
                  {activeFilter === 'Todos'
                    ? 'No hay vacaciones activas o próximas registradas.'
                    : `${activeFilter} no tiene vacaciones próximas registradas.`}
                </p>
              </div>
            ) : (
              <div className={styles.memberGroups}>
                {displayedMembers.map(member => {
                  const memberVacations = vacations.filter(v => v.member_name === member);
                  if (memberVacations.length === 0) return null;
                  const totalUpcomingDays = memberVacations.reduce(
                    (acc, v) => acc + calculateVacationDays(v.start_date, v.end_date, v.is_single_day),
                    0
                  );

                  return (
                    <div key={member} className={styles.memberGroup}>
                      <div className={styles.groupHeader}>
                        <h3 className={styles.groupTitle}>👤 {member}</h3>
                        <span className={styles.groupCountBadge}>
                          {memberVacations.length} {memberVacations.length === 1 ? 'periodo' : 'periodos'} ({totalUpcomingDays} {totalUpcomingDays === 1 ? 'día' : 'días'})
                        </span>
                      </div>

                      <ul className={styles.list}>
                        {memberVacations.map(v => {
                          const daysCount = calculateVacationDays(v.start_date, v.end_date, v.is_single_day);
                          const status = getVacationStatus(v.start_date, v.end_date, v.is_single_day);
                          const isBeingEdited = editingId === v.id;

                          return (
                            <li
                              key={v.id}
                              className={`${styles.listItem} ${status === 'active' ? styles.listItemActive : ''} ${isBeingEdited ? styles.listItemEditing : ''}`}
                            >
                              <div className={styles.vacationInfo}>
                                <div className={styles.vacationDatesRow}>
                                  <div className={styles.vacationDates}>
                                    <CalendarIcon />
                                    {v.is_single_day || !v.end_date || v.start_date === v.end_date ? (
                                      <span>{formatDate(v.start_date)}</span>
                                    ) : (
                                      <span>{formatDate(v.start_date)} — {formatDate(v.end_date)}</span>
                                    )}
                                  </div>

                                  <div className={styles.badgesRow}>
                                    <span className={styles.daysBadge}>
                                      {daysCount} {daysCount === 1 ? 'día' : 'días'}
                                    </span>
                                    {status === 'active' && (
                                      <span className={styles.activeStatusBadge}>En curso</span>
                                    )}
                                  </div>
                                </div>

                                {v.description && (
                                  <div className={styles.vacationDescription}>
                                    {v.description}
                                  </div>
                                )}
                              </div>

                              <div className={styles.itemActions}>
                                <button
                                  type="button"
                                  onClick={() => handleEdit(v)}
                                  className={styles.editBtn}
                                  title="Editar vacaciones"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(v.id)}
                                  className={styles.deleteBtn}
                                  title="Eliminar vacaciones"
                                >
                                  🗑️
                                </button>
                              </div>
                            </li>
                          );
                        })}
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

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '../components/common/Header';
import eventsService from '../services/eventsService';
import financeService from '../services/financeService';
import styles from './Finance.module.css';
import { parseLocalDate } from '../utils/dateUtils';
import { getAveragePriceGradient } from '../utils/pricingUtils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MEMBERS = ['Pedro', 'Pipa', 'Alfonso', 'Luis'];

export const Finance = () => {
  const [events, setEvents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [showExpensesModal, setShowExpensesModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsData, expensesData] = await Promise.all([
        eventsService.getAllEvents(),
        financeService.getExpenses().catch(() => [])
      ]);
      setEvents(eventsData || []);
      setExpenses(expensesData || []);
    } catch (e) {
      console.error("Error al cargar datos estadísticos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Años disponibles en los datos (incluyendo años futuros como 2027)
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(
      events.map(e => {
        const d = parseLocalDate(e.fecha);
        const yr = d.getFullYear();
        return (yr >= 2020 && yr <= 2035) ? yr.toString() : null;
      }).filter(Boolean)
    )).sort((a, b) => b - a);
    return years.length > 0 ? years : [new Date().getFullYear().toString()];
  }, [events]);

  // Filtrado de eventos según año seleccionado
  const filteredEvents = useMemo(() => {
    if (selectedYear === 'Todos') return events;
    return events.filter(e => {
      const d = parseLocalDate(e.fecha);
      return d.getFullYear().toString() === selectedYear;
    });
  }, [events, selectedYear]);

  // Eventos válidos para cálculo de precio medio (no archivados, con presupuesto > 0)
  const validEventsForAverage = useMemo(() => {
    return filteredEvents.filter(e => !e.archivado && Number(e.presupuesto) > 0);
  }, [filteredEvents]);

  // 1. Media total del precio de actuaciones
  const averageMetrics = useMemo(() => {
    const count = validEventsForAverage.length;
    if (count === 0) {
      return {
        average: 0,
        totalGross: 0,
        count: 0,
        gradient: getAveragePriceGradient(0),
      };
    }
    const totalGross = validEventsForAverage.reduce((sum, e) => sum + (Number(e.presupuesto) || 0), 0);
    const average = Math.round(totalGross / count);
    const gradient = getAveragePriceGradient(average);
    return {
      average,
      totalGross,
      count,
      gradient,
    };
  }, [validEventsForAverage]);

  // 2. Próximos ingresos (total y por integrante, evaluando 2026, 2027 y posteriores)
  const upcomingMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Si está en 'Todos', abarca todos los años futuros (incluidos 2026, 2027...)
    // Si selecciona un año concreto (ej: 2027), calcula los futuros de ese año
    const listToEvaluate = selectedYear === 'Todos' ? events : filteredEvents;

    const futureEvents = listToEvaluate.filter(e => {
      if (e.archivado) return false;
      const d = parseLocalDate(e.fecha);
      return d >= today;
    });

    const totalUpcoming = futureEvents.reduce((sum, e) => sum + (Number(e.presupuesto) || 0), 0);
    const count = futureEvents.length;
    const perMember = count > 0 ? Math.round(totalUpcoming / MEMBERS.length) : 0;

    return {
      totalUpcoming,
      count,
      perMember,
    };
  }, [events, filteredEvents, selectedYear]);

  // 3. Meses ordenados: Mejores y Peores
  const { topMonths, worstMonths } = useMemo(() => {
    const monthGroups = {};

    filteredEvents.forEach(e => {
      if (e.archivado || e.estado === 'NEGOCIACION') return;
      const d = parseLocalDate(e.fecha);
      const yr = d.getFullYear();
      if (yr < 2020 || yr > 2035) return; // descartar fechas anómalas de prueba
      
      const key = `${yr}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthGroups[key]) {
        monthGroups[key] = {
          key,
          year: yr,
          monthIndex: d.getMonth(),
          total: 0,
          count: 0,
          date: new Date(yr, d.getMonth(), 1),
        };
      }
      monthGroups[key].total += Number(e.presupuesto) || 0;
      monthGroups[key].count += 1;
    });

    const allMonths = Object.values(monthGroups);
    if (allMonths.length === 0) return { topMonths: [], worstMonths: [] };

    const maxVal = Math.max(...allMonths.map(m => m.total), 1);

    // Top Mejores (descendente)
    const sortedDesc = [...allMonths].sort((a, b) => b.total - a.total);
    const top = sortedDesc.map((m, idx) => ({
      ...m,
      rank: idx + 1,
      percentage: Math.round((m.total / maxVal) * 100),
    }));

    // Peores Meses (ascendente)
    const sortedAsc = [...allMonths].sort((a, b) => a.total - b.total);
    const worst = sortedAsc.map((m, idx) => ({
      ...m,
      rank: idx + 1,
      percentage: Math.max(Math.round((m.total / maxVal) * 100), 8),
    }));

    return { topMonths: top, worstMonths: worst };
  }, [filteredEvents]);

  return (
    <div className={styles.page}>
      <Header title="Estadísticas" />
      
      <main className={styles.mainContainer}>
        {/* Encabezado Superior */}
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.title}>Vista General de Estadísticas</h1>
            <p className={styles.subtitle}>
              Rendimiento económico, precio medio por actuación y previsión de ingresos de Toneleros
            </p>
          </div>

          <div className={styles.controlsRow}>
            {/* Selector de Año */}
            <div className={styles.selectorWrapper}>
              <label className={styles.selectorLabel}>Periodo:</label>
              <select 
                value={selectedYear} 
                onChange={e => setSelectedYear(e.target.value)}
                className={styles.yearSelect}
              >
                <option value="Todos">Todos los años</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>Año {yr}</option>
                ))}
              </select>
            </div>

            {/* Acceso a Gastos si existen */}
            {expenses.length > 0 && (
              <button 
                type="button"
                className={styles.expensesBtn}
                onClick={() => setShowExpensesModal(prev => !prev)}
                title="Consultar registro de gastos"
              >
                💸 Gastos ({expenses.length})
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Calculando estadísticas del grupo...</p>
          </div>
        ) : (
          <div className={styles.statsGrid}>
            
            {/* TARJETA 1: MEDIA DE ACTUACIONES (MATE Y ELEGANTE) */}
            <section 
              className={styles.heroCard}
              style={{
                background: averageMetrics.gradient.background,
                borderColor: averageMetrics.gradient.border,
              }}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTag}>Rentabilidad del Grupo</span>
                <span 
                  className={styles.benchmarkPill}
                  style={{
                    color: averageMetrics.gradient.color,
                    borderColor: averageMetrics.gradient.border,
                    background: 'rgba(0, 0, 0, 0.2)',
                  }}
                >
                  Media base: 700 €
                </span>
              </div>

              <div className={styles.heroBody}>
                <div className={styles.heroMetric}>
                  <div className={styles.metricLabel}>Precio Medio por Actuación</div>
                  <div 
                    className={styles.metricValueLarge}
                    style={{ color: averageMetrics.gradient.color }}
                  >
                    {averageMetrics.average.toLocaleString()} €
                  </div>
                </div>

                <div className={styles.diffBadgeWrapper}>
                  <span 
                    className={styles.diffBadge}
                    style={{
                      background: 'rgba(0, 0, 0, 0.25)',
                      color: averageMetrics.gradient.color,
                      borderColor: averageMetrics.gradient.border,
                    }}
                  >
                    {averageMetrics.gradient.diff >= 0 ? '🟢 ' : '🟠 '}
                    {averageMetrics.gradient.badgeText}
                  </span>
                </div>
              </div>

              <div className={styles.heroFooter}>
                <div className={styles.subStat}>
                  <span className={styles.subStatNum}>{averageMetrics.count}</span>
                  <span className={styles.subStatLabel}>Actuaciones evaluadas</span>
                </div>
                <div className={styles.subStatDivider}></div>
                <div className={styles.subStat}>
                  <span className={styles.subStatNum}>{averageMetrics.totalGross.toLocaleString()} €</span>
                  <span className={styles.subStatLabel}>Facturación acumulada</span>
                </div>
              </div>
            </section>

            {/* TARJETA 2: PRÓXIMOS INGRESOS (TOTAL Y POR INTEGRANTE) */}
            <section className={styles.upcomingCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTag}>
                  Previsión Futura {selectedYear === 'Todos' ? '(Todos los años)' : `(${selectedYear})`}
                </span>
                <span className={styles.upcomingCountPill}>
                  {upcomingMetrics.count} {upcomingMetrics.count === 1 ? 'concierto' : 'conciertos'}
                </span>
              </div>

              <div className={styles.upcomingHero}>
                <span className={styles.metricLabel}>Próximos Ingresos Totales</span>
                <div className={styles.upcomingTotalVal}>
                  {upcomingMetrics.totalUpcoming.toLocaleString()} €
                </div>
              </div>

              <div className={styles.membersBreakdownTitle}>
                <span>Reparto por integrante ({upcomingMetrics.perMember.toLocaleString()} € / persona):</span>
              </div>

              <div className={styles.membersGrid}>
                {MEMBERS.map(member => (
                  <div key={member} className={styles.memberCard}>
                    <div className={styles.memberAvatar}>
                      {member === 'Pedro' ? '🎸' : member === 'Pipa' ? '🥁' : member === 'Alfonso' ? '🎤' : '🎹'}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberName}>{member}</span>
                      <span className={styles.memberShare}>
                        {upcomingMetrics.perMember.toLocaleString()} €
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* TARJETA 3: COMPARATIVA MEJORES Y PEORES MESES */}
            <section className={styles.monthsComparisonCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTag}>Rendimiento por Temporada</span>
                <span className={styles.comparisonPill}>Histórico de Meses</span>
              </div>

              <div className={styles.comparisonGrid}>
                {/* Columna Izquierda: Top Mejores Meses */}
                <div className={styles.comparisonColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>🏆</span>
                    <div>
                      <h3 className={styles.columnTitle}>Mejores Meses</h3>
                      <span className={styles.columnSubtitle}>Mayor volumen de facturación</span>
                    </div>
                  </div>

                  {topMonths.length === 0 ? (
                    <div className={styles.emptyState}>Sin datos para este periodo.</div>
                  ) : (
                    <div className={styles.monthList}>
                      {topMonths.slice(0, 4).map(m => {
                        const monthName = format(m.date, 'MMMM yyyy', { locale: es });
                        const medal = m.rank === 1 ? '🥇' : m.rank === 2 ? '🥈' : m.rank === 3 ? '🥉' : `#${m.rank}`;
                        
                        return (
                          <div key={m.key} className={styles.monthItem}>
                            <div className={styles.monthItemLeft}>
                              <span className={styles.rankIcon}>{medal}</span>
                              <div className={styles.monthNameBlock}>
                                <span className={styles.monthName}>{monthName}</span>
                                <span className={styles.monthCount}>{m.count} {m.count === 1 ? 'bolo' : 'bolos'}</span>
                              </div>
                            </div>
                            <div className={styles.monthItemRight}>
                              <span className={styles.monthTotalPositive}>+{m.total.toLocaleString()} €</span>
                              <div className={styles.progressBarWrapper}>
                                <div 
                                  className={styles.progressBarPositive}
                                  style={{ width: `${m.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Columna Derecha: Peores Meses */}
                <div className={styles.comparisonColumn}>
                  <div className={styles.columnHeader}>
                    <span className={styles.columnIcon}>📉</span>
                    <div>
                      <h3 className={styles.columnTitle}>Peores Meses</h3>
                      <span className={styles.columnSubtitle}>Menor facturación / temporada baja</span>
                    </div>
                  </div>

                  {worstMonths.length === 0 ? (
                    <div className={styles.emptyState}>Sin datos para este periodo.</div>
                  ) : (
                    <div className={styles.monthList}>
                      {worstMonths.slice(0, 4).map(m => {
                        const monthName = format(m.date, 'MMMM yyyy', { locale: es });
                        
                        return (
                          <div key={m.key} className={styles.monthItem}>
                            <div className={styles.monthItemLeft}>
                              <span className={styles.worstRankBadge}>#{m.rank}</span>
                              <div className={styles.monthNameBlock}>
                                <span className={styles.monthName}>{monthName}</span>
                                <span className={styles.monthCount}>{m.count} {m.count === 1 ? 'bolo' : 'bolos'}</span>
                              </div>
                            </div>
                            <div className={styles.monthItemRight}>
                              <span className={styles.monthTotalLow}>{m.total.toLocaleString()} €</span>
                              <div className={styles.progressBarWrapper}>
                                <div 
                                  className={styles.progressBarLow}
                                  style={{ width: `${m.percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>
        )}

        {/* Modal / Sección de Gastos auxiliar */}
        {showExpensesModal && (
          <div className={styles.modalBackdrop} onClick={() => setShowExpensesModal(false)}>
            <div className={styles.expensesModal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Registro de Gastos</h3>
                <button 
                  type="button" 
                  onClick={() => setShowExpensesModal(false)}
                  className={styles.closeBtn}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalContent}>
                {expenses.length === 0 ? (
                  <p>No hay gastos registrados.</p>
                ) : (
                  <div className={styles.expensesList}>
                    {expenses.map(exp => (
                      <div key={exp.id} className={styles.expenseItem}>
                        <div>
                          <strong className={styles.expConcept}>{exp.concepto}</strong>
                          <span className={styles.expDate}>
                            {new Date(exp.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                        <span className={styles.expAmount}>-{exp.cantidad.toLocaleString()} €</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Finance;

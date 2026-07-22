import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import FinanceSummary from '../components/finance/FinanceSummary';
import ExpenseForm from '../components/finance/ExpenseForm';
import ExpensesList from '../components/finance/ExpensesList';
import financeService from '../services/financeService';
import eventsService from '../services/eventsService';
import styles from './Finance.module.css';
import { parseLocalDate } from '../utils/dateUtils';

const Finance = () => {
  const [events, setEvents] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState('Todos');
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const [eventsData, expensesData] = await Promise.all([
        eventsService.getEvents(true),
        financeService.getExpenses()
      ]);
      setEvents(eventsData || []);
      setExpenses(expensesData || []);
    } catch (e) {
      console.error("Error loading finance data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, []);

  // Detect dynamically available years
  const availableYears = Array.from(new Set([
    ...events.map(e => parseLocalDate(e.fecha).getFullYear().toString()),
    ...expenses.map(e => new Date(e.created_at).getFullYear().toString())
  ])).sort((a, b) => b - a);

  if (availableYears.length === 0) {
    availableYears.push(new Date().getFullYear().toString());
  }

  // Filter events and expenses based on current selections
  const filteredEvents = events.filter(e => {
    const d = parseLocalDate(e.fecha);
    const yearMatch = selectedYear === 'Todos' || d.getFullYear().toString() === selectedYear;
    const monthMatch = selectedMonth === 'Todos' || d.getMonth() === Number(selectedMonth);
    return yearMatch && monthMatch;
  });

  const filteredExpenses = expenses.filter(e => {
    const d = new Date(e.created_at);
    const yearMatch = selectedYear === 'Todos' || d.getFullYear().toString() === selectedYear;
    const monthMatch = selectedMonth === 'Todos' || d.getMonth() === Number(selectedMonth);
    return yearMatch && monthMatch;
  });

  // Calculate overall metrics for summary
  const grossIncome = filteredEvents.reduce((sum, e) => sum + (e.presupuesto || 0), 0);
  const totalExpensesVal = filteredExpenses.reduce((sum, e) => sum + (e.cantidad || 0), 0);
  const netBalance = grossIncome - totalExpensesVal;

  const now = new Date();
  const pastEvents = filteredEvents.filter(e => parseLocalDate(e.fecha) <= now);
  const futureEvents = filteredEvents.filter(e => parseLocalDate(e.fecha) > now);
  const grossPast = pastEvents.reduce((sum, e) => sum + (e.presupuesto || 0), 0);
  const grossFuture = futureEvents.reduce((sum, e) => sum + (e.presupuesto || 0), 0);

  // Calculate monthly data for chart (only applies to a selected year, defaults to current if 'Todos')
  const activeYearForChart = selectedYear === 'Todos' ? new Date().getFullYear().toString() : selectedYear;
  
  const monthlyChartData = Array.from({ length: 12 }, (_, i) => {
    const monthEvents = events.filter(e => {
      const d = parseLocalDate(e.fecha);
      return d.getFullYear().toString() === activeYearForChart && d.getMonth() === i;
    });
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.created_at);
      return d.getFullYear().toString() === activeYearForChart && d.getMonth() === i;
    });

    const income = monthEvents.reduce((sum, e) => sum + (e.presupuesto || 0), 0);
    const expense = monthExpenses.reduce((sum, e) => sum + (e.cantidad || 0), 0);

    return { monthIndex: i, income, expense };
  });

  const maxChartVal = Math.max(...monthlyChartData.flatMap(d => [d.income, d.expense]), 100);
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const handleMonthClick = (monthIdx) => {
    setSelectedMonth(prev => prev === monthIdx.toString() ? 'Todos' : monthIdx.toString());
  };

  return (
    <div className={styles.page}>
      <Header showBack={true} title="Finanzas" />
      <main className="container">
        
        {/* Encabezado */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Panel de Finanzas</h1>
            <p className={styles.subtitle}>Analiza las ganancias del grupo, filtra periodos y gestiona gastos</p>
          </div>

          {/* Botón flotante para móvil */}
          <button 
            className={`${styles.addBtn} ${styles.fabButton}`}
            onClick={() => {
              setShowExpenseForm(!showExpenseForm);
              if (!showExpenseForm) {
                setTimeout(() => {
                  document.getElementById('expenseFormSection')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}
            title="Nuevo Gasto"
          >
            {showExpenseForm ? '✕ Cerrar' : '➕ Gasto'}
          </button>

          {/* Selector de Año */}
          <div className={styles.yearSelectorWrapper}>
            <label className={styles.selectLabel}>Año:</label>
            <select 
              value={selectedYear} 
              onChange={e => { setSelectedYear(e.target.value); setSelectedMonth('Todos'); }} 
              className={styles.yearSelect}
            >
              <option value="Todos">Todos los años</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Filtros de Meses (Barra Horizontal Interactiva) */}
        <div className={styles.monthBar}>
          <button 
            onClick={() => setSelectedMonth('Todos')} 
            className={`${styles.monthBtn} ${selectedMonth === 'Todos' ? styles.monthBtnActive : ''}`}
          >
            Todos los meses
          </button>
          {monthNames.map((name, idx) => (
            <button 
              key={name}
              onClick={() => handleMonthClick(idx)} 
              className={`${styles.monthBtn} ${selectedMonth === idx.toString() ? styles.monthBtnActive : ''}`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Gráfico y Métricas */}
        <div className={styles.dashboardTopGrid}>
          
          {/* Métricas Resumen */}
          <div className={styles.metricsWrapper}>
            <FinanceSummary 
              grossIncome={grossIncome}
              grossPast={grossPast}
              grossFuture={grossFuture}
              totalExpenses={totalExpensesVal}
              netBalance={netBalance}
              loading={loading}
            />
          </div>

          {/* Gráfico de Barras Mensual */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              Evolución Mensual ({activeYearForChart})
              <span className={styles.chartSubtitle}>Haz clic en un mes para filtrar los datos</span>
            </h3>
            
            <div className={styles.chartWrapper}>
              {monthlyChartData.map(d => {
                const isSelected = selectedMonth === d.monthIndex.toString();
                const incomePercent = (d.income / maxChartVal) * 100;
                const expensePercent = (d.expense / maxChartVal) * 100;
                
                return (
                  <div 
                    key={d.monthIndex} 
                    className={`${styles.chartColumn} ${isSelected ? styles.chartColumnActive : ''}`}
                    onClick={() => handleMonthClick(d.monthIndex)}
                  >
                    <div className={styles.barContainer}>
                      <div 
                        className={styles.incomeBar} 
                        style={{ height: `${incomePercent}%` }}
                      >
                        {d.income > 0 && (
                          <span className={styles.chartTooltip}>
                            Ingresos: <strong>{d.income.toLocaleString()} €</strong>
                          </span>
                        )}
                      </div>
                      <div 
                        className={styles.expenseBar} 
                        style={{ height: `${expensePercent}%` }}
                      >
                        {d.expense > 0 && (
                          <span className={styles.chartTooltip}>
                            Gastos: <strong>{d.expense.toLocaleString()} €</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={styles.monthLabel}>{monthNames[d.monthIndex]}</span>
                  </div>
                );
              })}
            </div>

            {/* Leyenda */}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.incomeColor}`}></span>
                <span>Ingresos</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendColor} ${styles.expenseColor}`}></span>
                <span>Gastos</span>
              </div>
            </div>
          </div>

        </div>

        {/* Listado Detallado (Doble Columna) */}
        <div className={styles.ledgerGrid}>
          
          {/* Columna Izquierda: Ingresos de Actuaciones */}
          <section className={styles.ledgerColumn}>
            <div className={styles.ledgerHeader}>
              <h2 className={styles.ledgerTitle}>
                <span className={styles.incomeIndicatorDot}></span>
                Ingresos (Actuaciones)
              </h2>
              <span className={styles.ledgerBadge}>{filteredEvents.length} items</span>
            </div>
            
            {loading ? (
              <div className={styles.loadingText}>Cargando actuaciones...</div>
            ) : filteredEvents.length === 0 ? (
              <div className={styles.emptyLedger}>
                <p>No hay actuaciones registradas en este periodo.</p>
              </div>
            ) : (
              <div className={styles.ledgerList}>
                {filteredEvents.map(e => (
                  <div key={e.id} className={styles.ledgerItem}>
                    <div className={styles.ledgerMainInfo}>
                      <h4 className={styles.ledgerConcept}>{e.tipo}</h4>
                      <p className={styles.ledgerMeta}>
                        {parseLocalDate(e.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} • {e.direccion}
                      </p>
                    </div>
                    <div className={styles.ledgerAmountPositive}>
                      +{e.presupuesto.toLocaleString()} €
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

            {/* Columna Derecha: Gastos */}
          <section className={styles.ledgerColumn}>
            <div className={styles.ledgerHeader}>
              <h2 className={styles.ledgerTitle}>
                <span className={styles.expenseIndicatorDot}></span>
                Gastos (Salidas)
              </h2>
              <div className={styles.ledgerHeaderRight}>
                <span className={styles.ledgerBadge}>{filteredExpenses.length} items</span>
                <button 
                  className={styles.desktopAddBtn}
                  onClick={() => setShowExpenseForm(!showExpenseForm)}
                >
                  {showExpenseForm ? '✕ Cancelar' : '➕ Gasto'}
                </button>
              </div>
            </div>

            {showExpenseForm && (
              <div id="expenseFormSection" className={styles.expenseFormWrapper}>
                <ExpenseForm onCreated={() => { fetchFinanceData(); setShowExpenseForm(false); }} />
              </div>
            )}

            <ExpensesList 
              items={filteredExpenses} 
              onRefresh={fetchFinanceData} 
              loading={loading} 
            />
          </section>

        </div>

      </main>
    </div>
  );
};

export default Finance;

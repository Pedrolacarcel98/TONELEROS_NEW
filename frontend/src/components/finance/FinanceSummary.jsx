import React from 'react';
import styles from './FinanceSummary.module.css';

export const FinanceSummary = ({ 
  grossIncome = 0, 
  grossPast = 0, 
  grossFuture = 0, 
  totalExpenses = 0, 
  netBalance = 0, 
  loading = false 
}) => {

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.metricCard}>
          <span className={styles.loading}>Calculando métricas...</span>
        </div>
      </div>
    );
  }

  const net = parseFloat(netBalance).toFixed(2);
  const perMember = (parseFloat(net) / 4).toFixed(2);

  return (
    <div className={styles.container}>
      
      {/* Tarjetas Principales */}
      <div className={styles.mainMetrics}>
        
        <div className={styles.metricCard}>
          <span className={styles.label}>Ingresos (Filtro)</span>
          <span className={styles.value}>{parseFloat(grossIncome).toLocaleString()} €</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.label}>Gastos (Filtro)</span>
          <span className={`${styles.value} ${styles.expense}`}>{parseFloat(totalExpenses).toLocaleString()} €</span>
        </div>

        <div className={`${styles.metricCard} ${styles.netCard}`}>
          <span className={styles.label}>Saldo Neto</span>
          <span className={`${styles.value} ${parseFloat(net) >= 0 ? styles.positive : styles.negative}`}>
            {parseFloat(net).toLocaleString()} €
          </span>
        </div>

      </div>

      {/* Desglose Detallado */}
      <div className={styles.detailsCard}>
        <h3 className={styles.detailsTitle}>Desglose del Periodo</h3>
        
        <div className={styles.detailRow}>
          <span>Cobrado (Pasado):</span>
          <span className={styles.detailValue}>{parseFloat(grossPast).toLocaleString()} €</span>
        </div>

        <div className={styles.detailRow}>
          <span>Por cobrar (Futuro):</span>
          <span className={styles.detailValue}>{parseFloat(grossFuture).toLocaleString()} €</span>
        </div>

        <div className={styles.divider}></div>

        <div className={`${styles.detailRow} ${styles.highlight}`}>
          <span>Estimado por integrante (4):</span>
          <span className={styles.perMemberValue}>{parseFloat(perMember).toLocaleString()} €</span>
        </div>

      </div>

    </div>
  );
};

export default FinanceSummary;

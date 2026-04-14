import React, { useEffect, useState } from 'react';
import financeService from '../../services/financeService';
import styles from './FinanceSummary.module.css';

export const FinanceSummary = ({ refreshKey }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [data, expenses] = await Promise.all([
          financeService.getSummary(),
          financeService.getExpenses(),
        ]);
        setSummary(data);
        const sum = (expenses || []).reduce((s, e) => s + (parseFloat(e.cantidad) || 0), 0);
        setTotalExpenses(sum);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshKey]);

  if (loading) return (
    <div className={styles.card}>
      <div className={styles.loading}>Cargando resumen...</div>
    </div>
  );

  if (!summary) return (
    <div className={styles.card}>
      <div className={styles.error}>No se pudieron cargar los datos</div>
    </div>
  );

  const gross = parseFloat(summary.gross_total || 0);
  const net = (gross - totalExpenses).toFixed(2);
  const perMember = (parseFloat(net) / 4).toFixed(2); // assuming 4 members

  return (
    <div className={styles.container}>
      <div className={styles.mainMetrics}>
        <div className={styles.metricCard}>
          <span className={styles.label}>Ingresos Totales</span>
          <span className={styles.value}>{gross.toLocaleString()} €</span>
        </div>
        <div className={styles.metricCard}>
          <span className={styles.label}>Gastos Totales</span>
          <span className={`${styles.value} ${styles.expense}`}>{totalExpenses.toLocaleString()} €</span>
        </div>
        <div className={`${styles.metricCard} ${styles.netCard}`}>
          <span className={styles.label}>Saldo Neto</span>
          <span className={`${styles.value} ${parseFloat(net) >= 0 ? styles.positive : styles.negative}`}>
            {parseFloat(net).toLocaleString()} €
          </span>
        </div>
      </div>

      <div className={styles.detailsCard}>
        <h3 className={styles.detailsTitle}>Desglose Detallado</h3>
        <div className={styles.detailRow}>
          <span>Ingresos realizados:</span>
          <span className={styles.detailValue}>{parseFloat(summary.gross_past || 0).toLocaleString()} €</span>
        </div>
        <div className={styles.detailRow}>
          <span>Ingresos pendientes:</span>
          <span className={styles.detailValue}>{parseFloat(summary.gross_future || 0).toLocaleString()} €</span>
        </div>
        <div className={styles.divider}></div>
        <div className={`${styles.detailRow} ${styles.highlight}`}>
          <span>Estimado por integrante (4):</span>
          <span className={styles.perMemberValue}>{perMember.toLocaleString()} €</span>
        </div>
      </div>
    </div>
  );
};

export default FinanceSummary;

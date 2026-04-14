import React, { useState } from 'react';
import styles from './ExpenseForm.module.css';
import financeService from '../../services/financeService';
import ExpensesList from './ExpensesList';

export const ExpenseForm = ({ onCreated, refreshKey }) => {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({ concepto: '', cantidad: '', observaciones: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const payload = { concepto: form.concepto, cantidad: parseFloat(form.cantidad || 0), observaciones: form.observaciones };
      await financeService.createExpense(payload);
      setForm({ concepto: '', cantidad: '', observaciones: '' });
      setVisible(false);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error al guardar el gasto');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Listado de Gastos</h2>
          <button 
            onClick={() => setVisible(v => !v)} 
            className={`${styles.toggleBtn} ${visible ? styles.cancelBtn : ''}`}
          >
            {visible ? 'Cancelar' : '+ Nuevo Gasto'}
          </button>
        </div>

        {visible && (
          <div className={styles.formWrapper}>
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Concepto</label>
                <input 
                  name="concepto" 
                  value={form.concepto} 
                  onChange={handleChange} 
                  placeholder="Ej: Gasolina, Cuerdas, Publicidad..."
                  required 
                  className={styles.input}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Cantidad (€)</label>
                <input 
                  name="cantidad" 
                  type="number" 
                  step="0.01" 
                  value={form.cantidad} 
                  onChange={handleChange} 
                  placeholder="0.00"
                  required 
                  className={styles.input}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Observaciones (opcional)</label>
                <textarea 
                  name="observaciones" 
                  value={form.observaciones} 
                  onChange={handleChange} 
                  placeholder="Detalles adicionales..."
                  className={styles.textarea}
                />
              </div>

              {error && <div className={styles.error}>{error}</div>}
              
              <button className={styles.submitBtn} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Gasto'}
              </button>
            </form>
          </div>
        )}

        <div className={styles.listSection}>
          <ExpensesList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
};

export default ExpenseForm;

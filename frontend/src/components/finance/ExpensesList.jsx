import React, { useEffect, useState } from 'react';
import financeService from '../../services/financeService';
import styles from './ExpensesList.module.css';

export const ExpensesList = ({ refreshKey }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ concepto: '', cantidad: '', observaciones: '' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await financeService.getExpenses();
      setItems(data || []);
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshKey]);

  if (loading) return <div className={styles.empty}>Cargando gastos...</div>;
  
  if (items.length === 0) return (
    <div className={styles.empty}>
      <p>No hay gastos registrados aún.</p>
    </div>
  );

  const startEdit = (it) => {
    setEditingId(it.id);
    setEditForm({ 
      concepto: it.concepto || '', 
      cantidad: it.cantidad || '', 
      observaciones: it.observaciones || '' 
    });
  };

  const cancelEdit = () => { 
    setEditingId(null); 
    setEditForm({ concepto: '', cantidad: '', observaciones: '' }); 
  };

  const saveEdit = async (id) => {
    try {
      const payload = { 
        concepto: editForm.concepto, 
        cantidad: parseFloat(editForm.cantidad || 0), 
        observaciones: editForm.observaciones 
      };
      await financeService.updateExpense(id, payload);
      await load();
      cancelEdit();
    } catch (e) { 
      console.error(e); 
      alert('Error al actualizar el gasto');
    }
  };

  const doDelete = async (id) => {
    if (!window.confirm('¿Borrar este gasto? Esta acción no se puede deshacer.')) return;
    try {
      await financeService.deleteExpense(id);
      await load();
    } catch (e) { 
      console.error(e); 
      alert('Error al borrar el gasto');
    }
  };

  return (
    <div className={styles.list}>
      {items.map(it => (
        <div key={it.id} className={`${styles.item} ${editingId === it.id ? styles.editingItem : ''}`}>
          {editingId === it.id ? (
            <div className={styles.editForm}>
              <div className={styles.editRow}>
                <input 
                  className={styles.editInput}
                  value={editForm.concepto} 
                  onChange={e=>setEditForm(f=>({...f, concepto:e.target.value}))} 
                  placeholder="Concepto"
                />
                <input 
                  className={styles.editInput}
                  type="number" 
                  step="0.01" 
                  value={editForm.cantidad} 
                  onChange={e=>setEditForm(f=>({...f, cantidad:e.target.value}))} 
                  placeholder="Cantidad"
                />
              </div>
              <textarea 
                className={styles.editTextarea}
                value={editForm.observaciones} 
                onChange={e=>setEditForm(f=>({...f, observaciones:e.target.value}))} 
                placeholder="Observaciones"
              />
              <div className={styles.editActions}>
                <button className={styles.saveBtn} onClick={()=>saveEdit(it.id)}>Guardar</button>
                <button className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
              </div>
            </div>
          ) : (
            <div className={styles.content}>
              <div className={styles.info}>
                <h4 className={styles.concepto}>{it.concepto}</h4>
                {it.observaciones && <p className={styles.observaciones}>{it.observaciones}</p>}
              </div>
              <div className={styles.data}>
                <div className={styles.amount}>-{parseFloat(it.cantidad || 0).toLocaleString()} €</div>
                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={()=>startEdit(it)} title="Editar">
                    Editar
                  </button>
                  <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={()=>doDelete(it.id)} title="Borrar">
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExpensesList;

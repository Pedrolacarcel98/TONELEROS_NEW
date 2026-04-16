import React, { useState, useEffect } from 'react';
import styles from './ClientForm.module.css';
import clientsService from '../../services/clientsService';

const ClientForm = ({ onCreated, initialData, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    notas: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        email: initialData.email || '',
        telefono: initialData.telefono || '',
        direccion: initialData.direccion || '',
        notas: initialData.notas || ''
      });
    } else {
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        direccion: '',
        notas: ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (initialData) {
        await clientsService.updateClient(initialData.id, formData);
      } else {
        await clientsService.createClient(formData);
      }
      setFormData({ nombre: '', email: '', telefono: '', direccion: '', notas: '' });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al guardar el cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formCard}>
      <h3>{initialData ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Nombre Completo / Empresa *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Ej: Hotel Gran Playa"
          />
        </div>

        <div className={styles.row}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className={styles.inputGroup}>
            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="600 000 000"
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Calle, Ciudad..."
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Notas / Observaciones</label>
          <textarea
            name="notas"
            value={formData.notas}
            onChange={handleChange}
            placeholder="Detalles sobre el cliente..."
            rows="3"
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          {onCancel && (
            <button type="button" onClick={onCancel} className={styles.cancelBtn}>
              Cancelar
            </button>
          )}
          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Guardando...' : (initialData ? 'Actualizar Cliente' : 'Guardar Cliente')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientForm;

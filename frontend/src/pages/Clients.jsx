import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import ClientForm from '../components/clients/ClientForm';
import clientsService from '../services/clientsService';
import styles from './Clients.module.css';

export const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchClients();
  }, [refreshKey]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await clientsService.getClients();
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = () => {
    setShowForm(false);
    setEditingClient(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        await clientsService.deleteClient(id);
        setRefreshKey(prev => prev + 1);
      } catch (error) {
        console.error('Error deleting client:', error);
      }
    }
  };

  const handleAddEvent = (client) => {
    // Redirigir a eventos con el ID del cliente en el estado o URL
    // Para simplificar, usaremos sessionStorage para pasar el contacto del cliente
    sessionStorage.setItem('prefill_event', JSON.stringify({
      pContacto: client.nombre,
      tlf: client.telefono,
      direccion: client.direccion,
      client_id: client.id
    }));
    window.location.hash = '#/events';
  };

  return (
    <div className={styles.page}>
      <Header showBack={true} />
      <main className="container">
        <header className={styles.header}>
          <h1 className={styles.title}>Clientes Habituales</h1>
          <button 
            className={styles.addBtn}
            onClick={() => {
              setEditingClient(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cerrar Formulario' : '➕ Nuevo Cliente'}
          </button>
        </header>

        {showForm && (
          <section className={styles.formSection}>
            <ClientForm 
              onCreated={handleCreated} 
              initialData={editingClient}
              onCancel={() => setShowForm(false)}
            />
          </section>
        )}

        <section className={styles.listSection}>
          {loading ? (
            <div className={styles.loading}>Cargando clientes...</div>
          ) : clients.length === 0 ? (
            <div className={styles.empty}>No hay clientes registrados todavía.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre / Empresa</th>
                    <th>Contacto</th>
                    <th>Dirección</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id}>
                      <td className={styles.clientName}>
                        <strong>{client.nombre}</strong>
                        {client.notas && <small>{client.notas}</small>}
                      </td>
                      <td className={styles.clientContact}>
                        <div>{client.telefono}</div>
                        <small>{client.email}</small>
                      </td>
                      <td className={styles.clientAddress}>{client.direccion || '-'}</td>
                      <td className={styles.actions}>
                        <button 
                          onClick={() => handleAddEvent(client)}
                          className={styles.eventBtn}
                          title="Crear Evento"
                        >
                          📅 Evento
                        </button>
                        <button 
                          onClick={() => handleEdit(client)}
                          className={styles.editBtn}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id)}
                          className={styles.deleteBtn}
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Clients;

import React, { useState, useEffect } from 'react';
import { Header } from '../components/common/Header';
import apiClient from '../services/apiClient';
import styles from './Integrations.module.css';

export default function Integrations() {
  const [webhooks, setWebhooks] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', event_type: 'event.created' });
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState(null);

  useEffect(() => {
    fetchWebhooks();
    fetchApiKeys();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await apiClient.get('/api/integrations/webhooks');
      setWebhooks(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApiKeys = async () => {
    try {
      const res = await apiClient.get('/api/integrations/apikeys');
      setApiKeys(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const createWebhook = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/api/integrations/webhooks', newWebhook);
      setNewWebhook({ name: '', url: '', event_type: 'event.created' });
      fetchWebhooks();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteWebhook = async (id) => {
    try {
      await apiClient.delete(`/api/integrations/webhooks/${id}`);
      fetchWebhooks();
    } catch (e) {
      console.error(e);
    }
  };

  const createApiKey = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/api/integrations/apikeys', { name: newApiKeyName });
      setCreatedKey(res.data.key);
      setNewApiKeyName('');
      fetchApiKeys();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteApiKey = async (id) => {
    try {
      await apiClient.delete(`/api/integrations/apikeys/${id}`);
      fetchApiKeys();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1>Integraciones n8n</h1>
          <a href="#/" className={styles.backBtn}>← Volver al Dashboard</a>
        </div>

        <div className={styles.grid}>
          {/* Webhooks Section */}
          <section className={styles.card}>
            <h2>Webhooks Registrados</h2>
            <p>Toneleros enviará un POST a estas URLs cuando ocurran eventos.</p>
            
            <form onSubmit={createWebhook} className={styles.form}>
              <input 
                type="text" 
                placeholder="Nombre (Ej: Zapier, n8n)" 
                value={newWebhook.name} 
                onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                required 
              />
              <input 
                type="url" 
                placeholder="https://tu-n8n.com/webhook/..." 
                value={newWebhook.url} 
                onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                required 
              />
              <select 
                value={newWebhook.event_type} 
                onChange={(e) => setNewWebhook({...newWebhook, event_type: e.target.value})}
              >
                <option value="event.created">Nuevo Evento Creado</option>
                <option value="client.created">Nuevo Cliente Creado</option>
              </select>
              <button type="submit" className={styles.btn}>Añadir Webhook</button>
            </form>

            <ul className={styles.list}>
              {webhooks.map(wh => (
                <li key={wh.id} className={styles.listItem}>
                  <div>
                    <strong>{wh.name}</strong> - <code>{wh.event_type}</code>
                    <br/><small>{wh.url}</small>
                  </div>
                  <button onClick={() => deleteWebhook(wh.id)} className={styles.deleteBtn}>Eliminar</button>
                </li>
              ))}
            </ul>
          </section>

          {/* API Keys Section */}
          <section className={styles.card}>
            <h2>API Keys</h2>
            <p>Genera claves para que n8n o sistemas externos consulten la API de Toneleros.</p>
            
            {createdKey && (
              <div className={styles.alert}>
                <strong>¡Guarda esta clave, no volverá a mostrarse!</strong>
                <br/><code>{createdKey}</code>
              </div>
            )}

            <form onSubmit={createApiKey} className={styles.form}>
              <input 
                type="text" 
                placeholder="Nombre (Ej: n8n Production)" 
                value={newApiKeyName} 
                onChange={(e) => setNewApiKeyName(e.target.value)}
                required 
              />
              <button type="submit" className={styles.btn}>Generar API Key</button>
            </form>

            <ul className={styles.list}>
              {apiKeys.map(ak => (
                <li key={ak.id} className={styles.listItem}>
                  <div>
                    <strong>{ak.name}</strong>
                    <br/><small>Creada: {new Date(ak.created_at).toLocaleDateString()}</small>
                  </div>
                  <button onClick={() => deleteApiKey(ak.id)} className={styles.deleteBtn}>Revocar</button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

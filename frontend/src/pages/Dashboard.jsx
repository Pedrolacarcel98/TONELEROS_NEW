import React from 'react';
import styles from './Dashboard.module.css';
import { Header } from '../components/common/Header';
import EventForm from '../components/events/EventForm';
import EventsList from '../components/events/EventsList';

export const Dashboard = () => {
  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <div className="container">
        <div className={styles.welcome}>
          <h1>Bienvenido a Toneleros</h1>
          <p>Plataforma de Gestión de Eventos para el Grupo Musical</p>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.icon}>📅</div>
            <h3>Eventos</h3>
            <p>Gestiona tu agenda de actuaciones y eventos</p>
            <button onClick={() => { window.location.hash = '#/events'; }}>Ir a Eventos</button>        </div>

          <div className={styles.card}>
            <div className={styles.icon}>💰</div>
            <h3>Finanzas</h3>
            <p>Control de presupuestos e ingresos</p>
            <button onClick={() => { window.location.hash = '#/finance'; }} className={styles.btn}>Ir a Finanzas</button>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>📄</div>
            <h3>Documentos</h3>
            <p>Administra contratos y documentación</p>
            <button onClick={() => { window.location.hash = '#/documents'; }} className={styles.btn}>Ir a Documentos</button>
          </div>

          <div className={styles.card}>
            <div className={styles.icon}>🎬</div>
            <h3>Multimedia</h3>
            <p>Galería de fotos y videos</p>
            <button onClick={() => { window.location.hash = '#/media'; }} className={styles.btn}>Ir a Multimedia</button>
          </div>
        </div>

        <div className={styles.infoBox}>
          <h2>ℹ️ Estado del MVP</h2>
          <p>
            Esta es la versión inicial de la plataforma. Actualmente tienes acceso a:
          </p>
          <ul>
            <li>✓ Autenticación de usuarios</li>
            <li>✓ Dashboard principal</li>
            <li>⏳ Gestión de eventos (Funcional pero en desarrollo)</li>
            <li>⏳ Control de finanzas (Funcional pero en desarrollo)</li>
            <li>⏳ Gestión de documentos (próximamente)</li>
            <li>⏳ Galería multimedia (próximamente)</li>
          </ul>
        </div>

        {/* Events moved to dedicated page */}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm = () => {
  const [email, setEmail] = useState('pedro@toneleros.com');
  const [password, setPassword] = useState('Pedro123?');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);

    try {
      await login(email, password);
    } catch (err) {
      setLocalError(error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1>🎸 Toneleros</h1>
          <p>Gestión de Eventos</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          {localError && <div className={styles.error}>{localError}</div>}

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className={styles.testUsers}>
          <p className={styles.testUsersTitle}>Usuarios de prueba:</p>
          <ul>
            <li>pedro@toneleros.com / Pedro123?</li>
            <li>admin@toneleros.com / Admin123?</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

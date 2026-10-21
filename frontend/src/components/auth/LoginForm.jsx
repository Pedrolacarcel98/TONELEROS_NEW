import React, { useState } from 'react';
import styles from './LoginForm.module.css';
import { useAuth } from '../../hooks/useAuth';

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const { login, loading } = useAuth();

  const validateField = (name, value) => {
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) return 'El correo electrónico es requerido';
      if (!emailRegex.test(value)) return 'Introduce un formato de email válido';
    }
    if (name === 'password') {
      if (!value) return 'La contraseña es requerida';
      if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    const errorMsg = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));

    if (serverError) setServerError(null);
  };

  const handleAutofill = (testEmail, testPassword) => {
    setFormData({ email: testEmail, password: testPassword });
    setFieldErrors({});
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    if (emailError || passwordError) {
      setFieldErrors({ email: emailError, password: passwordError });
      return;
    }

    setServerError(null);

    try {
      await login(formData.email.trim(), formData.password);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Error al iniciar sesión. Revisa tus credenciales.';
      setServerError(message);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <main className={styles.loginBox} aria-labelledby="login-title">
        <header className={styles.header}>
          <h1 id="login-title">🎸 Toneleros</h1>
          <p>Gestión de Eventos y Producción</p>
        </header>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.formGroup}>
            <label htmlFor="login-email">Correo Electrónico</label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              required
              disabled={loading}
              className={fieldErrors.email ? styles.inputError : ''}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && (
              <span id="email-error" className={styles.fieldError} role="alert">
                {fieldErrors.email}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
              className={fieldErrors.password ? styles.inputError : ''}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <span id="password-error" className={styles.fieldError} role="alert">
                {fieldErrors.password}
              </span>
            )}
          </div>

          {serverError && (
            <div className={styles.error} role="alert" aria-live="assertive">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <section className={styles.testUsers} aria-label="Usuarios de prueba para desarrollo">
          <p className={styles.testUsersTitle}>Usuarios de prueba (clic para autocompletar):</p>
          <div className={styles.testUsersList}>
            <button
              type="button"
              className={styles.testUserBtn}
              onClick={() => handleAutofill('pedro@toneleros.com', 'Pedro123?')}
              disabled={loading}
            >
              <span>pedro@toneleros.com</span>
              <span className={styles.badge}>Usuario</span>
            </button>
            <button
              type="button"
              className={styles.testUserBtn}
              onClick={() => handleAutofill('admin@toneleros.com', 'Admin123?')}
              disabled={loading}
            >
              <span>admin@toneleros.com</span>
              <span className={styles.badge}>Admin</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

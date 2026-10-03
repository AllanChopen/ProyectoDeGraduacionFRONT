import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import { requestPasswordReset, resetPassword } from '../../src/api/authApi';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [recoveryStep, setRecoveryStep] = useState('login');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleRequestReset = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setIsSubmitting(true);
    try {
      await requestPasswordReset(email.trim());
      setRecoveryStep('reset');
      setNotice('Si existe una cuenta con ese correo, recibiras un codigo para restablecer tu contrasena.');
    } catch (requestError) {
      setError(requestError.message || 'No se pudo enviar el codigo. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword({ email: email.trim(), code: code.trim(), newPassword, confirmPassword });
      setRecoveryStep('login');
      setPassword('');
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setNotice('Contrasena actualizada. Ya puedes iniciar sesion.');
    } catch (requestError) {
      setError(requestError.message || 'No se pudo restablecer la contrasena. Revisa el codigo e intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const authData = await login(email, password);
      const bandSlug = authData?.band?.slug;

      if (bandSlug) {
        navigate(`/${bandSlug}/dashboard`, { replace: true });
        return;
      }

      navigate(location.state?.from || '/', { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Correo o contrasena incorrectos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <h1 className="login-title">{recoveryStep === 'login' ? 'Iniciar sesion' : recoveryStep === 'request' ? 'Recuperar contrasena' : 'Crear contrasena nueva'}</h1>
        <p className="login-subtitle">
          {recoveryStep === 'login'
            ? 'Accede al panel de administracion de tu banda.'
            : recoveryStep === 'request'
              ? 'Te enviaremos un codigo al correo asociado a tu cuenta.'
              : `Ingresa el codigo enviado a ${email}.`}
        </p>

        {recoveryStep === 'login' ? (
          <form className="login-form" onSubmit={handleSubmit}>
            <input
              className="bp-field"
              type="email"
              placeholder="Correo electronico"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="bp-field"
              type="password"
              placeholder="Contrasena"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className="login-error">{error}</p>}
            {notice && <p className="login-notice">{notice}</p>}
            <button type="submit" className="bp-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </button>
            <button type="button" className="login-link" onClick={() => { setError(''); setNotice(''); setRecoveryStep('request'); }}>
              Olvide mi contrasena
            </button>
          </form>
        ) : recoveryStep === 'request' ? (
          <form className="login-form" onSubmit={handleRequestReset}>
            <input
              className="bp-field"
              type="email"
              placeholder="Correo electronico"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="bp-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar codigo'}
            </button>
            <button type="button" className="login-link" onClick={() => { setRecoveryStep('login'); setError(''); setNotice(''); }}>
              Volver a iniciar sesion
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleResetPassword}>
            <input
              className="bp-field"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Codigo de verificacion"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
            />
            <input
              className="bp-field"
              type="password"
              autoComplete="new-password"
              placeholder="Contrasena nueva (minimo 8 caracteres)"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
            <input
              className="bp-field"
              type="password"
              autoComplete="new-password"
              placeholder="Confirmar contrasena nueva"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
            {error && <p className="login-error">{error}</p>}
            {notice && <p className="login-notice">{notice}</p>}
            <button type="submit" className="bp-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Cambiar contrasena'}
            </button>
            <button type="button" className="login-link" onClick={() => { setRecoveryStep('request'); setError(''); setNotice(''); }}>
              Enviar otro codigo
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

export default Login;

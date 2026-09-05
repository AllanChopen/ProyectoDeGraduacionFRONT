import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    } catch {
      setError('Correo o contrasena incorrectos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-panel">
        <h1 className="login-title">Iniciar sesion</h1>
        <p className="login-subtitle">Accede al panel de administracion de tu banda.</p>

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

          <button type="submit" className="bp-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;

import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { Input, PasswordInput } from '../components/ui/Input.jsx';
import { Logo } from '../components/layout/Logo.jsx';
import './LoginPage.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Ingresa tu correo electrónico';
  else if (!EMAIL_REGEX.test(email.trim())) errors.email = 'El correo no tiene un formato válido';
  if (!password) errors.password = 'Ingresa tu contraseña';
  return errors;
}

export default function LoginPage() {
  const { login, sessionMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (event) => {
    setForm((f) => ({ ...f, [field]: event.target.value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
    setServerError('');
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    setServerError('');
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(location.state?.from || '/admin', { replace: true });
    } catch (error) {
      setServerError(error.message);
      setLoading(false);
    }
  };

  const banner = serverError || sessionMessage;

  return (
    <div className="login">
      <div className="login__panel">
        <div className="login__card">
          <Logo />
          <div className="login__heading">
            <h1>Iniciar sesión</h1>
            <p className="text-muted">Accede al panel para diseñar y generar tus catálogos.</p>
          </div>

          {banner && (
            <div className={serverError ? 'login__alert' : 'login__alert login__alert--info'} role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{banner}</span>
            </div>
          )}

          <form className="login__form" onSubmit={onSubmit} noValidate>
            <FormField label="Correo electrónico" error={errors.email}>
              <Input
                type="email"
                icon={Mail}
                autoComplete="username"
                placeholder="tucorreo@empresa.com"
                value={form.email}
                onChange={update('email')}
                autoFocus
              />
            </FormField>
            <FormField label="Contraseña" error={errors.password}>
              <PasswordInput autoComplete="current-password" placeholder="••••••••" value={form.password} onChange={update('password')} />
            </FormField>
            <Button type="submit" variant="primary" size="lg" icon={LogIn} loading={loading} block>
              {loading ? 'Ingresando…' : 'Iniciar sesión'}
            </Button>
          </form>
        </div>
      </div>

      <div className="login__visual" aria-hidden="true">
        <div className="login__sheet login__sheet--back">
          <div className="login__band" />
        </div>
        <div className="login__sheet">
          <div className="login__photo" />
          <div className="login__lines">
            <span style={{ width: '70%' }} />
            <span style={{ width: '45%' }} />
          </div>
          <div className="login__thumbs">
            <span />
            <span />
            <span />
          </div>
          <div className="login__band" />
        </div>
        <p className="login__tagline">Diseña visualmente. Genera PDFs listos para imprimir.</p>
      </div>
    </div>
  );
}

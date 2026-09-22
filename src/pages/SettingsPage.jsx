import { useState } from 'react';
import { CheckCircle2, KeyRound, UserPlus, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useChangePassword, useCreateUser, useSetUserStatus, useUsers } from '../hooks/useUsers.js';
import { useEditorConfig } from '../hooks/useEditorConfig.js';
import { configService } from '../services/catalogService.js';
import { API_BASE } from '../services/apiClient.js';
import { PageHeader } from '../components/layout/PageHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge, Card } from '../components/ui/Controls.jsx';
import { FormField } from '../components/ui/FormField.jsx';
import { Input, PasswordInput } from '../components/ui/Input.jsx';
import { Loading } from '../components/ui/Loading.jsx';
import { formatDate } from '../utils/format.js';
import { fieldErrors } from '../utils/errors.js';
import './SettingsPage.css';

function ChangePasswordCard() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const change = useChangePassword();
  const toast = useToast();

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!form.currentPassword) found.currentPassword = 'Ingresa tu contraseña actual';
    if (form.newPassword.length < 8) found.newPassword = 'Mínimo 8 caracteres';
    if (form.newPassword !== form.confirm) found.confirm = 'Las contraseñas no coinciden';
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await change.mutateAsync({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Contraseña actualizada');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (error) {
      setErrors(fieldErrors(error));
      toast.error(error.message);
    }
  };

  const bind = (field) => ({
    value: form[field],
    onChange: (e) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      setErrors((er) => ({ ...er, [field]: undefined }));
    },
  });

  return (
    <Card title="Cambiar contraseña" description="La contraseña se guarda cifrada (bcrypt).">
      <form className="stack" onSubmit={submit} noValidate>
        <FormField label="Contraseña actual" error={errors.currentPassword}>
          <PasswordInput autoComplete="current-password" {...bind('currentPassword')} />
        </FormField>
        <FormField label="Nueva contraseña" hint="Mínimo 8 caracteres." error={errors.newPassword}>
          <PasswordInput autoComplete="new-password" {...bind('newPassword')} />
        </FormField>
        <FormField label="Confirmar nueva contraseña" error={errors.confirm}>
          <PasswordInput autoComplete="new-password" {...bind('confirm')} />
        </FormField>
        <div>
          <Button type="submit" variant="primary" icon={KeyRound} loading={change.isPending}>
            Actualizar contraseña
          </Button>
        </div>
      </form>
    </Card>
  );
}

function AdminsCard() {
  const { user } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const create = useCreateUser();
  const setStatus = useSetUserStatus();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) found.email = 'Correo inválido';
    if (form.password.length < 8) found.password = 'Mínimo 8 caracteres';
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await create.mutateAsync({ email: form.email.trim(), password: form.password });
      toast.success('Administrador creado');
      setForm({ email: '', password: '' });
    } catch (error) {
      setErrors(fieldErrors(error));
      toast.error(error.message);
    }
  };

  const toggle = async (target) => {
    try {
      await setStatus.mutateAsync({ id: target.id, status: target.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Card title="Administradores" description="Todos los usuarios tienen rol de administrador.">
      {isLoading ? (
        <Loading />
      ) : (
        <ul className="users-list">
          {users.map((u) => (
            <li key={u.id}>
              <div className="users-list__info">
                <strong>{u.email}</strong>
                <small>Desde {formatDate(u.createdAt)}</small>
              </div>
              <Badge tone={u.status === 'ACTIVE' ? 'success' : 'neutral'}>{u.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</Badge>
              {u.id === user?.id ? (
                <Badge tone="accent">Tú</Badge>
              ) : (
                <Button size="sm" variant="ghost" onClick={() => toggle(u)} loading={setStatus.isPending && setStatus.variables?.id === u.id}>
                  {u.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <form className="users-form" onSubmit={submit} noValidate>
        <FormField label="Correo" error={errors.email}>
          <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} autoComplete="off" />
        </FormField>
        <FormField label="Contraseña inicial" error={errors.password}>
          <PasswordInput value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} autoComplete="new-password" />
        </FormField>
        <Button type="submit" icon={UserPlus} loading={create.isPending}>
          Agregar
        </Button>
      </form>
    </Card>
  );
}

function StatusRow({ label, ok, detail }) {
  return (
    <li className="status-row">
      {ok ? <CheckCircle2 size={18} className="status-row__ok" /> : <XCircle size={18} className="status-row__fail" />}
      <span>{label}</span>
      <small className="text-muted">{detail}</small>
    </li>
  );
}

function SystemCard() {
  const health = useQuery({ queryKey: ['health'], queryFn: configService.health, retry: false });
  const { data: config } = useEditorConfig();
  return (
    <Card title="Estado del sistema">
      <ul className="status-list">
        <StatusRow label="API" ok={health.isSuccess} detail={API_BASE} />
        <StatusRow label="Base de datos (PostgreSQL)" ok={health.data?.database === 'ok'} detail={health.data?.database === 'ok' ? 'Conectada' : 'Sin conexión'} />
        <StatusRow label="Cloudinary" ok={Boolean(config?.services?.cloudinary)} detail={config?.services?.cloudinary ? 'Configurado' : 'Faltan credenciales en el backend'} />
      </ul>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Configuración" description="Cuenta, administradores y estado de los servicios." />
      <div className="settings-grid">
        <div className="stack">
          <AdminsCard />
          <SystemCard />
        </div>
        <ChangePasswordCard />
      </div>
    </>
  );
}

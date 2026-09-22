import { Button } from './Button.jsx';
import { Modal } from './Modal.jsx';

/** Confirmación para acciones destructivas o irreversibles. */
export function ConfirmDialog({
  open,
  title = '¿Estás seguro?',
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      title={title}
      size="sm"
      locked={loading}
      footer={
        <>
          <Button onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading} data-autofocus>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-muted">{message}</p>
    </Modal>
  );
}

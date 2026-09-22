import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useUpdateImage } from '../../hooks/useImages.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatBytes, formatDate } from '../../utils/format.js';
import { thumbnailUrl } from '../../utils/cloudinary.js';
import { Button } from '../ui/Button.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Input, Textarea } from '../ui/Input.jsx';
import { Modal } from '../ui/Modal.jsx';
import './ImageEditModal.css';

/** Edita nombre y descripción; muestra los metadatos guardados. */
export function ImageEditModal({ image, onClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const update = useUpdateImage();
  const toast = useToast();

  useEffect(() => {
    if (!image) return;
    setName(image.name);
    setDescription(image.description || '');
    setError('');
  }, [image]);

  const save = async (event) => {
    event.preventDefault();
    if (!name.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    try {
      await update.mutateAsync({ id: image.id, data: { name: name.trim(), description: description.trim() } });
      toast.success('Información actualizada');
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      open={Boolean(image)}
      onClose={onClose}
      title="Editar imagen"
      size="lg"
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="primary" type="submit" form="image-edit-form" loading={update.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      {image && (
        <div className="image-edit">
          <div className="image-edit__preview">
            <img src={thumbnailUrl(image.url)} alt={image.name} />
          </div>
          <form id="image-edit-form" className="stack" onSubmit={save}>
            <FormField label="Nombre" required error={error}>
              <Input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} data-autofocus />
            </FormField>
            <FormField label="Descripción">
              <Textarea rows={3} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} />
            </FormField>
            <dl className="image-edit__meta">
              <dt>Dimensiones</dt>
              <dd>
                {image.width} × {image.height} px
              </dd>
              <dt>Formato</dt>
              <dd>{image.format?.toUpperCase() || '—'}</dd>
              <dt>Peso</dt>
              <dd>{formatBytes(image.bytes) || '—'}</dd>
              <dt>Subida</dt>
              <dd>{formatDate(image.createdAt)}</dd>
              <dt>Uso</dt>
              <dd>{image.usageCount ? `${image.usageCount} elemento(s)` : 'Sin usar'}</dd>
              <dt>Cloudinary</dt>
              <dd className="image-edit__public-id">{image.publicId}</dd>
            </dl>
            <a href={image.url} target="_blank" rel="noreferrer" className="row">
              <ExternalLink size={14} /> Ver original
            </a>
          </form>
        </div>
      )}
    </Modal>
  );
}

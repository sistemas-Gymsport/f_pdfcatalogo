import { useEffect, useRef, useState } from 'react';
import { ImagePlus, UploadCloud, X } from 'lucide-react';
import { useUploadImage } from '../../hooks/useImages.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatBytes } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';
import { Button } from '../ui/Button.jsx';
import { FormField } from '../ui/FormField.jsx';
import { Input, Textarea } from '../ui/Input.jsx';
import './ImageUploader.css';

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/avif'];

const nameFromFile = (file) => file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim().slice(0, 120);

/** Selección (clic o arrastrar), vista previa, nombre/descripción y subida a Cloudinary. */
export function ImageUploader({ onUploaded, maxUploadMb = 15, disabled = false, disabledReason }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const upload = useUploadImage();
  const toast = useToast();

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const pick = (selected) => {
    setError('');
    if (!selected) return;
    if (!ACCEPTED.includes(selected.type)) {
      setError('Formato no permitido. Usa JPG, PNG, WEBP, GIF, AVIF o SVG.');
      return;
    }
    if (selected.size > maxUploadMb * 1024 * 1024) {
      setError(`La imagen pesa ${formatBytes(selected.size)}. El máximo es ${maxUploadMb} MB.`);
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setName(nameFromFile(selected));
  };

  const reset = () => {
    setFile(null);
    setPreviewUrl(null);
    setName('');
    setDescription('');
    setProgress(0);
    if (inputRef.current) inputRef.current.value = '';
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    if (!disabled) pick(event.dataTransfer.files?.[0]);
  };

  const submit = async () => {
    setProgress(0);
    try {
      const image = await upload.mutateAsync({
        data: { file, name: name.trim(), description: description.trim() },
        onProgress: setProgress,
      });
      toast.success(`"${image.name}" se subió correctamente`);
      reset();
      onUploaded?.(image);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!file) {
    return (
      <div className="uploader">
        <button
          type="button"
          className={cn('uploader__drop', dragging && 'is-dragging')}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          disabled={disabled}
        >
          <span className="uploader__icon">
            <UploadCloud size={26} />
          </span>
          <strong>Arrastra una imagen aquí o haz clic para elegirla</strong>
          <span className="text-muted">JPG, PNG, WEBP, GIF, AVIF o SVG · máx. {maxUploadMb} MB</span>
        </button>
        {disabled && disabledReason && <p className="uploader__error">{disabledReason}</p>}
        {error && <p className="uploader__error">{error}</p>}
        <input ref={inputRef} type="file" accept={ACCEPTED.join(',')} hidden onChange={(e) => pick(e.target.files?.[0])} />
      </div>
    );
  }

  return (
    <div className="uploader uploader--selected">
      <div className="uploader__preview">
        <img src={previewUrl} alt="Vista previa" />
        {!upload.isPending && (
          <Button className="uploader__remove" size="sm" variant="secondary" icon={X} tooltip="Quitar imagen" onClick={reset} />
        )}
        <span className="uploader__size">{formatBytes(file.size)}</span>
      </div>
      <div className="uploader__fields">
        <FormField label="Nombre" required>
          <Input value={name} maxLength={120} onChange={(e) => setName(e.target.value)} disabled={upload.isPending} />
        </FormField>
        <FormField label="Descripción" hint="Ayuda a encontrarla con el buscador.">
          <Textarea rows={2} value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} disabled={upload.isPending} />
        </FormField>
        {upload.isPending && (
          <div className="uploader__progress" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span style={{ width: `${progress}%` }} />
            <small>{progress < 100 ? `Subiendo… ${progress}%` : 'Procesando en Cloudinary…'}</small>
          </div>
        )}
        {error && <p className="uploader__error">{error}</p>}
        <div className="row">
          <Button variant="primary" icon={ImagePlus} onClick={submit} loading={upload.isPending} disabled={!name.trim()}>
            Subir imagen
          </Button>
          <Button onClick={reset} disabled={upload.isPending}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}

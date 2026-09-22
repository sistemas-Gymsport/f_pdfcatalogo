import { Heading1, Heading2, Image, Minus, AlignLeft, Square, TextQuote } from 'lucide-react';

/**
 * Registro de tipos de elemento del editor.
 * Para agregar un tipo nuevo:
 *   1. Añadir la entrada aquí (etiquetas, icono, valores por defecto y secciones).
 *   2. Definir su "kind" visual en src/shared/renderModel.js (y copiarlo al backend).
 *
 * sections: paneles de propiedades que se muestran al seleccionarlo.
 */
export const ELEMENT_REGISTRY = {
  title: {
    label: 'Título',
    addLabel: 'Agregar título',
    description: 'Encabezado grande',
    icon: Heading1,
    sections: ['content', 'typography', 'position', 'appearance', 'arrange'],
    defaults: {
      width: 150,
      height: 16,
      content: 'Título del catálogo',
      fontFamily: 'Montserrat',
      fontSize: 28,
      fontWeight: 700,
      lineHeight: 1.1,
      color: 'text',
      textAlign: 'left',
      verticalAlign: 'top',
    },
  },
  subtitle: {
    label: 'Subtítulo',
    addLabel: 'Agregar subtítulo',
    description: 'Encabezado secundario',
    icon: Heading2,
    sections: ['content', 'typography', 'position', 'appearance', 'arrange'],
    defaults: {
      width: 120,
      height: 10,
      content: 'Subtítulo de la sección',
      fontFamily: 'Montserrat',
      fontSize: 15,
      fontWeight: 600,
      lineHeight: 1.2,
      color: 'primary',
      textAlign: 'left',
      verticalAlign: 'top',
    },
  },
  text: {
    label: 'Texto',
    addLabel: 'Agregar descripción',
    description: 'Párrafo de texto',
    icon: AlignLeft,
    sections: ['content', 'typography', 'position', 'appearance', 'arrange'],
    defaults: {
      width: 90,
      height: 30,
      content: 'Escribe aquí la descripción del producto o servicio. Haz doble clic para editar el texto directamente sobre la hoja.',
      fontFamily: 'Inter',
      fontSize: 10,
      fontWeight: 400,
      lineHeight: 1.45,
      color: 'text',
      textAlign: 'left',
      verticalAlign: 'top',
    },
  },
  textBlock: {
    label: 'Bloque de texto',
    addLabel: 'Agregar bloque de texto',
    description: 'Texto sobre fondo de color',
    icon: TextQuote,
    sections: ['content', 'typography', 'position', 'appearance', 'arrange'],
    defaults: {
      width: 90,
      height: 36,
      content: 'Información destacada',
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 600,
      lineHeight: 1.35,
      color: '#FFFFFF',
      backgroundColor: 'primary',
      padding: 6,
      borderRadius: 2,
      textAlign: 'left',
      verticalAlign: 'middle',
    },
  },
  image: {
    label: 'Imagen',
    addLabel: 'Agregar imagen',
    description: 'Fotografía de la biblioteca',
    icon: Image,
    sections: ['image', 'position', 'appearance', 'arrange'],
    defaults: { width: 90, height: 60, objectFit: 'cover', imageId: null },
  },
  line: {
    label: 'Línea',
    addLabel: 'Agregar línea',
    description: 'Separador horizontal',
    icon: Minus,
    sections: ['line', 'position', 'arrange'],
    defaults: { width: 100, height: 4, color: 'primary', borderWidth: 0.6, borderStyle: 'solid' },
  },
  rectangle: {
    label: 'Bloque de color',
    addLabel: 'Agregar bloque de color',
    description: 'Rectángulo / banda de color',
    icon: Square,
    sections: ['appearance', 'position', 'arrange'],
    defaults: { width: 80, height: 40, backgroundColor: 'primary', borderRadius: 0 },
  },
};

/** Orden de los botones del panel "Agregar". */
export const ADD_ORDER = ['title', 'subtitle', 'text', 'textBlock', 'image', 'rectangle', 'line'];

export const getElementMeta = (type) => ELEMENT_REGISTRY[type] || ELEMENT_REGISTRY.rectangle;

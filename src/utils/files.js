/** Descarga un Blob con el nombre indicado. */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Imprime un PDF usando el visor del navegador (respeta el tamaño físico del PDF).
 * Si el navegador bloquea la impresión desde un iframe, abre el PDF en otra pestaña.
 */
export function printPdfBlob(blob) {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  iframe.src = url;
  iframe.onload = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch {
      window.open(url, '_blank', 'noopener');
    }
    setTimeout(() => {
      iframe.remove();
      URL.revokeObjectURL(url);
    }, 60000);
  };
  document.body.appendChild(iframe);
}

/** Nombre de archivo a partir del header Content-Disposition. */
export function filenameFromDisposition(header, fallback) {
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header || '');
  return match ? decodeURIComponent(match[1]) : fallback;
}

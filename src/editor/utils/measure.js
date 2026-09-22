import { pxToMm } from './geometry.js';

/** Alto (mm) que necesita el contenido de un texto, medido en el DOM del editor. */
export function measureTextHeight(elementId) {
  const content = document.querySelector(`[data-element-id="${elementId}"] .el-content`);
  const text = content?.querySelector('.el-text');
  if (!content || !text) return null;
  const style = getComputedStyle(content);
  const chrome =
    parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  return pxToMm(text.scrollHeight + chrome);
}

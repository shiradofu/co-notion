import type { WithStyle } from "../deployers/StyleManager";

export class RemovePlaceholderOnEmptyLine implements WithStyle {
  get css() {
    return `
.notion-page-content
.notion-text-block
[placeholder]:not([placeholder=" "])::after {
  content: " " !important;
}
    `;
  }
}

import type { withStyle } from "../conductors/StyleAppender";

export class RemovePlaceholderOnEmptyLine implements withStyle {
  get css() {
    return `
.notion-page-content
.notion-text-block
[placeholder]:not([placeholder=" "])::after {
  content: "" !important;
}
    `;
  }
}

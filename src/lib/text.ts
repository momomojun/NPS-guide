const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&nbsp;": " ",
  "&quot;": '"',
  "&#39;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

// NPS 的描述字段偶尔带 HTML，统一转成纯文本再渲染
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(amp|nbsp|quot|#39|lt|gt);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim();
}

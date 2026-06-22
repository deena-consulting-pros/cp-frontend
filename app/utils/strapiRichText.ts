export interface BlockNode {
  type?: string;
  text?: string;
  level?: number;
  format?: "ordered" | "unordered";
  url?: string;
  children?: BlockNode[];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export const escapeHtml = (raw: string): string => {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

export const hasHtmlTags = (raw: string): boolean => /<[^>]+>/.test(raw);

export const isInternalUrl = (url: string): boolean => {
  if (!url || !url.trim()) return true;
  const trimmed = url.trim();
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return false;
  return true;
};

export const renderTextNode = (node: BlockNode): string => {
  if (!node) return "";

  const rawText = node.text || "";
  let value = hasHtmlTags(rawText) ? rawText : escapeHtml(rawText);

  if (node.bold) value = `<strong>${value}</strong>`;
  if (node.italic) value = `<em>${value}</em>`;
  if (node.underline) value = `<u>${value}</u>`;
  if (node.strikethrough) value = `<s>${value}</s>`;
  if (node.code) value = `<code>${value}</code>`;

  return value;
};

export const renderBlockNode = (node: BlockNode): string => {
  if (!node) return "";

  if (node.type === "text") {
    return renderTextNode(node);
  }

  if (node.type === "link" && node.url) {
    const children = (node.children || [])
      .map((child) => renderBlockNode(child))
      .join("");
    const safeUrl = escapeHtml(node.url.trim());
    const linkClass =
      "text-[#006c4f] underline transition-colors hover:text-[#004d38]";

    if (isInternalUrl(node.url)) {
      return `<a href="${safeUrl}" class="${linkClass}">${children}</a>`;
    }

    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="${linkClass}">${children}</a>`;
  }

  const children = (node.children || [])
    .map((child) => renderBlockNode(child))
    .join("");

  switch (node.type) {
    case "paragraph": {
      if (!children.trim()) return "";
      return `<p>${children}</p>`;
    }
    case "heading": {
      const level = Math.min(Math.max(node.level || 2, 1), 6);
      return `<h${level}>${children}</h${level}>`;
    }
    case "list": {
      const tag = node.format === "ordered" ? "ol" : "ul";
      return `<${tag}>${children}</${tag}>`;
    }
    case "list-item": {
      return `<li>${children}</li>`;
    }
    case "quote": {
      return `<blockquote>${children}</blockquote>`;
    }
    case "code": {
      return `<pre><code>${children}</code></pre>`;
    }
    default:
      return children;
  }
};

export const renderBlocks = (blocks: unknown[]): string => {
  if (!Array.isArray(blocks)) return "";
  return blocks
    .map((block) => renderBlockNode(block as BlockNode))
    .filter(Boolean)
    .join("\n");
};

export const renderStrapiRichText = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (hasHtmlTags(trimmed)) return trimmed;

    return trimmed
      .split(/\n\n+/)
      .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
      .join("\n");
  }

  if (Array.isArray(value)) {
    return renderBlocks(value);
  }

  return "";
};

export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]+>/g, "");
};

export const decodeHtmlEntities = (html: string): string => {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
};

export const richTextToPlainText = (
  value: unknown,
  maxLength?: number,
): string => {
  const html = renderStrapiRichText(value);
  if (!html.trim()) return "";

  let plain = decodeHtmlEntities(stripHtml(html))
    .replace(/\s+/g, " ")
    .trim();

  if (maxLength && plain.length > maxLength) {
    plain = `${plain.slice(0, maxLength).trim()}…`;
  }

  return plain;
};

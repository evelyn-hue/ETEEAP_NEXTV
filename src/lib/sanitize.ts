import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(dirty?: string | null): string {
  if (!dirty) return "";
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "i",
      "em",
      "strong",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "span",
      "div",
      "hr",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  });
}

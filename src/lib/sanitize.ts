import sanitize from "sanitize-html";

export function sanitizeHtml(dirty?: string | null): string {
  if (!dirty) return "";
  return sanitize(dirty, {
    allowedTags: [
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
    allowedAttributes: {
      a: ["href", "target", "rel"],
      "*": ["class"],
    },
  });
}

/**
 * Zero-dependency markdown-to-HTML converter.
 * Supports: headings, bold, italic, links, lists, paragraphs,
 * code blocks, inline code, blockquotes, hr, tables.
 */
export function markdownToHtml(md: string): string {
  let html = md;

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    return `\x00PRE\x00${escapeHtml(code.trimEnd())}\x00/PRE\x00`;
  });

  // Split into lines for block-level processing
  const lines = html.split("\n");
  const result: string[] = [];
  let inList = false;
  let inBlockquote = false;
  let inTable = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pre block placeholder
    if (line.includes("\x00PRE\x00")) {
      closeOpen();
      const content = line
        .replace("\x00PRE\x00", "<pre><code>")
        .replace("\x00/PRE\x00", "</code></pre>");
      result.push(content);
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeOpen();
      result.push("<hr />");
      continue;
    }

    // Table separator line (|---|---|) — skip it
    if (/^\|[\s:-]+\|/.test(line) && line.replace(/[\s|:-]/g, "") === "") {
      continue;
    }

    // Table row
    if (/^\|(.+)\|$/.test(line.trim())) {
      if (inList) { result.push("</ul>"); inList = false; }
      if (inBlockquote) { result.push("</blockquote>"); inBlockquote = false; }

      const cells = line
        .trim()
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());

      if (!inTable) {
        // Check if next line is separator (header row)
        const nextLine = lines[i + 1] || "";
        const isHeader =
          /^\|[\s:-]+\|/.test(nextLine) &&
          nextLine.replace(/[\s|:-]/g, "") === "";

        result.push('<div class="overflow-x-auto my-6">');
        result.push("<table>");
        if (isHeader) {
          result.push("<thead>");
          result.push("<tr>");
          for (const cell of cells) {
            result.push(`<th>${processInline(cell)}</th>`);
          }
          result.push("</tr>");
          result.push("</thead>");
          result.push("<tbody>");
          i++; // skip separator line
        } else {
          result.push("<tbody>");
          result.push("<tr>");
          for (const cell of cells) {
            result.push(`<td>${processInline(cell)}</td>`);
          }
          result.push("</tr>");
        }
        inTable = true;
      } else {
        result.push("<tr>");
        for (const cell of cells) {
          result.push(`<td>${processInline(cell)}</td>`);
        }
        result.push("</tr>");
      }
      continue;
    } else if (inTable) {
      result.push("</tbody>");
      result.push("</table>");
      result.push("</div>");
      inTable = false;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeOpen();
      const level = headingMatch[1].length;
      result.push(`<h${level}>${processInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      if (inList) { result.push("</ul>"); inList = false; }
      if (!inBlockquote) { result.push("<blockquote>"); inBlockquote = true; }
      result.push(`<p>${processInline(line.slice(2))}</p>`);
      continue;
    } else if (inBlockquote) {
      result.push("</blockquote>");
      inBlockquote = false;
    }

    // Unordered list
    if (/^[-*]\s+/.test(line)) {
      if (!inList) { result.push("<ul>"); inList = true; }
      result.push(`<li>${processInline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    } else if (inList) {
      result.push("</ul>");
      inList = false;
    }

    // Empty line
    if (line.trim() === "") {
      continue;
    }

    // Paragraph
    result.push(`<p>${processInline(line)}</p>`);
  }

  if (inList) result.push("</ul>");
  if (inBlockquote) result.push("</blockquote>");
  if (inTable) {
    result.push("</tbody>");
    result.push("</table>");
    result.push("</div>");
  }

  return result.join("\n");

  function closeOpen() {
    if (inList) { result.push("</ul>"); inList = false; }
    if (inBlockquote) { result.push("</blockquote>"); inBlockquote = false; }
    if (inTable) {
      result.push("</tbody>");
      result.push("</table>");
      result.push("</div>");
      inTable = false;
    }
  }
}

function processInline(text: string): string {
  // Inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Links
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return text;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

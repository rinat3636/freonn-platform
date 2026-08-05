import type { BlogFAQ, BlogSection } from "../../client/src/data/blogPosts";
import { escapeHtmlText, escapeXmlText } from "./escape";

export type BlogSectionsEscape = (text: string) => string;

/** Blog sections → HTML (SSR body or Turbo RSS). */
export function blogSectionsToHtml(
  sections: BlogSection[],
  opts?: { escape?: BlogSectionsEscape; maxSections?: number },
): string {
  const escape = opts?.escape ?? escapeHtmlText;
  const slice = opts?.maxSections != null ? sections.slice(0, opts.maxSections) : sections;
  let html = "";
  for (const s of slice) {
    if (s.type === "h2" && s.content) html += `<h2>${escape(s.content)}</h2>`;
    else if (s.type === "h3" && s.content) html += `<h3>${escape(s.content)}</h3>`;
    else if (s.type === "p" && s.content) html += `<p>${escape(s.content)}</p>`;
    else if (s.type === "ul" && s.items?.length) {
      html += "<ul>";
      for (const item of s.items) html += `<li>${escape(item)}</li>`;
      html += "</ul>";
    } else if (s.type === "ol" && s.items?.length) {
      html += "<ol>";
      for (const item of s.items) html += `<li>${escape(item)}</li>`;
      html += "</ol>";
    } else if (s.type === "table" && s.headers?.length && s.rows?.length) {
      html += "<table><thead><tr>";
      for (const h of s.headers) html += `<th>${escape(h)}</th>`;
      html += "</tr></thead><tbody>";
      for (const row of s.rows) {
        html += "<tr>";
        for (const cell of row) html += `<td>${escape(cell)}</td>`;
        html += "</tr>";
      }
      html += "</tbody></table>";
    } else if (s.type === "callout" && s.content) {
      html += `<blockquote>${escape(s.content)}</blockquote>`;
    }
  }
  return html;
}

export function blogFaqsToHtml(faqs: BlogFAQ[], escape: BlogSectionsEscape = escapeHtmlText): string {
  if (!faqs.length) return "";
  let html = "<h2>Вопросы и ответы</h2><dl>";
  for (const f of faqs) {
    html += `<dt>${escape(f.q)}</dt><dd>${escape(f.a)}</dd>`;
  }
  html += "</dl>";
  return html;
}

/** Turbo RSS: same structure, XML-safe escaping. */
export function blogSectionsToTurboHtml(sections: BlogSection[], maxSections = 24): string {
  return blogSectionsToHtml(sections, { escape: escapeXmlText, maxSections });
}

/**
 * Generate 10 extra blog posts for freonn.pro using Groq (one at a time, 70B).
 * Output: client/src/data/blogPostsGenerated.ts (imported by blogPosts.ts)
 */
import { groqChat } from "../server/groq.ts";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_FILE = path.join(ROOT, "client", "src", "data", "blogPostsGenerated3.ts");

type Section = {
  type: "h2" | "h3" | "p" | "ul" | "ol" | "table" | "callout";
  content?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
};

type GeneratedPost = {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  category: string;
  readTime: number;
  tags: string[];
  intro: string;
  sections: Section[];
  faqs: { q: string; a: string }[];
  relatedPosts: string[];
};

const TOPICS: GeneratedPost[] = [
  {
    slug: "/blog/sklad-3000-m2-pod-klyuch",
    title: "Склад 3000 м² под ключ: планировка, логистика, цена | Freonn",
    h1: "Склад 3000 м² под ключ",
    metaDescription: "Склад 3000 м² под ключ: логистика, пропускная способность, цена от 4 000 ₽/м² и сроки.",
    category: "Типы зданий",
    readTime: 9,
    tags: ["склад", "3000 м²", "под ключ", "логистика", "цена"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/sklad-2000-m2-moskovskaya-oblast", "/blog/sklad-1500-m2-pod-klyuch", "/blog/sklad-pod-klyuch-moskva"],
  },
  {
    slug: "/blog/angar-dlya-avtotekhniki",
    title: "Ангар для автотехники: СТО, мойка, сервис | Freonn",
    h1: "Ангар для автотехники",
    metaDescription: "Ангар для автотехники: СТО, автомойка, сервис. Вентиляция, освещение, цена под ключ.",
    category: "Типы зданий",
    readTime: 8,
    tags: ["ангар", "автотехника", "СТО", "сервис", "цена"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/angar-dlya-remonta-tehniki", "/blog/stroitelstvo-angarov-moskovskaya-oblast", "/blog/fundament-angara-moskva"],
  },
  {
    slug: "/blog/proizvodstvennoe-zdanie-s-kranom",
    title: "Производственное здание с краном: проект, нагрузки, цена | Freonn",
    h1: "Производственное здание с краном",
    metaDescription: "Производственное здание с краном: подкрановые пути, нагрузки, проектирование и цена.",
    category: "Типы зданий",
    readTime: 9,
    tags: ["производственное здание", "кран", "подкрановый путь", "нагрузки", "цена"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/kranovye-angary", "/blog/proizvodstvennyy-tsekh-pod-klyuch", "/blog/tsekh-s-kranom-moskovskaya-oblast"],
  },
];

const PUBLISH_DATE = "2026-07-19";

function buildPrompt(topic: GeneratedPost): string {
  return `Ты — технический директор строительной компании Freonn (freonn.pro). Напиши экспертную SEO-статью на русском языке для блога.

Тема: ${topic.h1}
h1: ${topic.h1}
slug: ${topic.slug}
category: ${topic.category}
tags: ${topic.tags.join(", ")}
relatedPosts: ${topic.relatedPosts.join(", ")}

Структура (минимум 1500 слов, плотная и полезная, без воды):
- intro: 2-3 абзаца, без списков, с конкретными цифрами цен или сроков где уместно.
- 6-8 h2 секций (можно с h3), включая: определение/зачем, виды/конструкция, таблицу сравнения параметров, этапы работ, факторы цены, типовые ошибки, почему выбирают Freonn.
- 1-2 таблицы с реалистичными значениями.
- 3 FAQ с конкретными ответами.
- metaDescription: 145-155 символов, с цифрой цены или срока.

Выведи строго JSON без markdown-кода. Поля: title, h1, metaDescription, category, readTime (number, слов/200), tags (array строк), intro (string), sections (array объектов {type: h2|h3|p|ul|ol|table|callout, content?: string, items?: string[], headers?: string[], rows?: string[][]}), faqs (array {q: string, a: string}), relatedPosts (array строк).`;
}

function stripFences(text: string): string {
  return text.replace(/```json\s*/i, "").replace(/```\s*$/i, "").trim();
}

function parseJson(text: string | null): Partial<GeneratedPost> {
  if (!text) throw new Error("Empty response");
  const cleaned = stripFences(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error(`JSON parse failed: ${cleaned.slice(0, 200)}`);
  }
}

function normalizePost(raw: Partial<GeneratedPost>, base: GeneratedPost): GeneratedPost {
  const title = raw.title || base.title;
  const h1 = raw.h1 || base.h1;
  const metaDescription = raw.metaDescription || base.metaDescription;
  const category = raw.category || base.category;
  const readTime = typeof raw.readTime === "number" ? raw.readTime : base.readTime;
  const tags = Array.isArray(raw.tags) && raw.tags.length ? raw.tags : base.tags;
  const intro = raw.intro || base.intro || `Статья о ${h1.toLowerCase()} от экспертов Freonn.`;
  const sections = Array.isArray(raw.sections) ? raw.sections.filter((s: any) => s && typeof s === "object") : [];
  const faqs = Array.isArray(raw.faqs)
    ? raw.faqs
        .filter((f: any) => f && typeof f.q === "string" && typeof f.a === "string")
        .map((f: any) => ({ q: f.q, a: f.a }))
    : [];
  if (faqs.length === 0) {
    faqs.push(
      { q: `Сколько стоит ${h1.toLowerCase()}?`, a: `Стоимость зависит от площади, утепления и региона. Типовой диапазон — от 4 200 ₽/м². Получите расчёт на сайте Freonn.` },
      { q: `Какие сроки строительства ${h1.toLowerCase()}?`, a: `Проектирование — 5-10 дней, производство металлоконструкций — 15-25 дней, монтаж — 20-40 дней.` },
      { q: `Что входит в строительство под ключ?`, a: `Проект, КМ/КМД, изготовление металлоконструкций, фундамент, монтаж, кровля и отделка.` },
    );
  }
  const relatedPosts = Array.isArray(raw.relatedPosts) && raw.relatedPosts.length
    ? raw.relatedPosts.filter((s: any) => typeof s === "string")
    : base.relatedPosts;
  return {
    slug: base.slug,
    title,
    h1,
    metaDescription,
    category,
    readTime,
    tags,
    intro,
    sections,
    faqs,
    relatedPosts,
  };
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function serializePost(post: GeneratedPost): string {
  const sections = post.sections
    .map((s) => {
      const parts: string[] = [`      { type: "${s.type}"`];
      if (s.content !== undefined) parts.push(`content: ${JSON.stringify(s.content)}`);
      if (s.items) parts.push(`items: ${JSON.stringify(s.items)}`);
      if (s.headers) parts.push(`headers: ${JSON.stringify(s.headers)}`);
      if (s.rows) parts.push(`rows: ${JSON.stringify(s.rows)}`);
      return parts.join(", ") + " }";
    })
    .join(",\n");

  const faqs = post.faqs
    .map((f) => `      { q: ${JSON.stringify(f.q)}, a: ${JSON.stringify(f.a)} }`)
    .join(",\n");

  return `  {\n    slug: ${JSON.stringify(post.slug)},\n    title: ${JSON.stringify(post.title)},\n    h1: ${JSON.stringify(post.h1)},\n    metaDescription: ${JSON.stringify(post.metaDescription)},\n    publishDate: ${JSON.stringify(PUBLISH_DATE)},\n    updateDate: ${JSON.stringify(PUBLISH_DATE)},\n    category: ${JSON.stringify(post.category)},\n    readTime: ${post.readTime},\n    tags: ${JSON.stringify(post.tags)},\n    intro: ${JSON.stringify(post.intro)},\n    sections: [\n${sections}\n    ],\n    faqs: [\n${faqs}\n    ],\n    relatedPosts: ${JSON.stringify(post.relatedPosts)},\n  }`;
}

async function main() {
  const generated: GeneratedPost[] = [];
  for (let i = 0; i < TOPICS.length; i++) {
    const topic = TOPICS[i];
    console.log(`[${i + 1}/${TOPICS.length}] Generating ${topic.slug}...`);
    try {
      const response = await groqChat(
        [
          { role: "system", content: "Ты пишешь только валидный JSON. Никаких пояснений, markdown-разметки и вложенного markdown внутри строк. Используй плоские строки." },
          { role: "user", content: buildPrompt(topic) },
        ],
        "llama-3.3-70b-versatile",
        3000,
        120000,
      );
      if (!response) {
        console.warn("  Empty response, using fallback.");
        generated.push(topic);
        continue;
      }
      const raw = parseJson(response);
      const post = normalizePost(raw, topic);
      generated.push(post);
      console.log(`  OK (${post.sections.length} sections, ${post.faqs.length} faqs)`);
    } catch (e) {
      console.error(`  Failed for ${topic.slug}:`, e instanceof Error ? e.message : e);
      generated.push(topic);
    }
    if (i < TOPICS.length - 1) {
      console.log("  Waiting 25s to respect rate limits...");
      await sleep(25000);
    }
  }

  if (generated.length === 0) {
    console.error("No posts generated.");
    process.exit(1);
  }

  const header = `import type { BlogPost } from "./blogPosts";\n\n/** Auto-generated extra SEO blog posts (2026-07-19). */\nexport const blogPostsGenerated: BlogPost[] = [`;
  const footer = `\n];\n`;
  const body = generated.map(serializePost).join(",\n");
  fs.writeFileSync(OUT_FILE, `${header}\n${body}\n${footer}`, "utf-8");
  console.log(`Wrote ${generated.length} posts to ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

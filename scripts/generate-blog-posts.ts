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
const OUT_FILE = path.join(ROOT, "client", "src", "data", "blogPostsGenerated.ts");

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
    slug: "/blog/sklad-1000-m2-pod-klyuch",
    title: "Склад 1000 м² под ключ: типы, конструкция, цена | Freonn",
    h1: "Склад 1000 м² под ключ",
    metaDescription: "Склад 1000 м² под ключ от 4 200 ₽/м². Типы конструкций, сроки и типовые ошибки.",
    category: "Типы зданий",
    readTime: 8,
    tags: ["склад", "1000 м²", "под ключ", "цена", "металлоконструкции"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/sklad-2000-m2-moskovskaya-oblast", "/blog/sklad-pod-klyuch-moskva", "/blog/sklad-klassa-a-i-b-sravnenie"],
  },
  {
    slug: "/blog/metallokonstruktsii-dlya-ferm",
    title: "Металлоконструкции для ферм и сельхозобъектов | Freonn",
    h1: "Металлоконструкции для ферм и сельхозобъектов",
    metaDescription: "Металлоконструкции для ферм: коровники, птичники, зернохранилища от 4 800 ₽/м².",
    category: "Типы зданий",
    readTime: 9,
    tags: ["металлоконструкции", "ферма", "сельхоз", "коровник", "птичник"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/zernokhranilishche-pod-klyuch", "/blog/angar-dlya-selskohozyaystvennoy-tehniki", "/blog/stroitelstvo-angarov-moskovskaya-oblast"],
  },
  {
    slug: "/blog/montazh-sendvich-paneley",
    title: "Монтаж сэндвич-панелей: технология, этапы, контроль качества | Freonn",
    h1: "Монтаж сэндвич-панелей",
    metaDescription: "Монтаж сэндвич-панелей: подготовка, укладка, герметизация, типичные ошибки.",
    category: "Технологии",
    readTime: 8,
    tags: ["сэндвич-панели", "монтаж", "утепление", "технология"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/sendvich-paneli-dlya-sklada-vybor-tolshchiny", "/blog/tolschina-sendvich-paneli-vybor", "/blog/angar-iz-sendvich-paneley-pod-klyuch"],
  },
  {
    slug: "/blog/sklad-klassa-a-pod-klyuch",
    title: "Склад класса А под ключ: требования, цена, сроки | Freonn",
    h1: "Склад класса А под ключ",
    metaDescription: "Склад класса А под ключ: параметры, цена от 6 500 ₽/м², этапы и документы.",
    category: "Типы зданий",
    readTime: 9,
    tags: ["склад класса А", "под ключ", "цена", "логистика"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/sklad-klassa-a-i-b-sravnenie", "/blog/logisticheskiy-sklad-2000-m2-proekt", "/blog/sklad-pod-klyuch-moskva"],
  },
  {
    slug: "/blog/angar-dlya-remonta-tehniki",
    title: "Ангар для ремонта техники: проект, освещение, вентиляция | Freonn",
    h1: "Ангар для ремонта техники",
    metaDescription: "Ангар для ремонта техники: проект, освещение, вентиляция, цена от 4 500 ₽/м².",
    category: "Типы зданий",
    readTime: 8,
    tags: ["ангар", "ремонт техники", "освещение", "вентиляция"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/angar-dlya-selskohozyaystvennoy-tehniki", "/blog/navesy-dlya-tehniki-selhoz-i-prom", "/blog/stroitelstvo-angarov-moskovskaya-oblast"],
  },
  {
    slug: "/blog/stoimost-utepleniya-angara",
    title: "Стоимость утепления ангара: материалы, расчёт, цена за м² | Freonn",
    h1: "Стоимость утепления ангара",
    metaDescription: "Стоимость утепления ангара: сэндвич-панели, минвата, пеноизол от 1 200 ₽/м².",
    category: "Цены и расчёт",
    readTime: 8,
    tags: ["утепление", "ангар", "цена", "сэндвич-панели", "минвата"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/uteplenie-angara", "/blog/sendvich-paneli-dlya-sklada-vybor-tolshchiny", "/blog/holodnyy-ili-teplyy-sklad"],
  },
  {
    slug: "/blog/vybor-krovelnogo-materiala",
    title: "Выбор кровельного материала для ангара и склада | Freonn",
    h1: "Выбор кровельного материала для ангара и склада",
    metaDescription: "Кровельный материал для ангара: профнастил, сэндвич-панели, мембрана — сравнение и цены.",
    category: "Технологии",
    readTime: 8,
    tags: ["кровля", "ангар", "профнастил", "сэндвич-панели", "мембрана"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/otdelka-fasada-angara", "/blog/raschet-nagruzok-na-krovlyu", "/blog/angar-iz-sendvich-paneley-pod-klyuch"],
  },
  {
    slug: "/blog/avtomatizaciya-sklada",
    title: "Автоматизация склада: WMS, стеллажи, конвейеры | Freonn",
    h1: "Автоматизация склада",
    metaDescription: "Автоматизация склада: WMS, стеллажи, конвейеры. Как спроектировать под металлоконструкции.",
    category: "Советы",
    readTime: 9,
    tags: ["склад", "автоматизация", "WMS", "стеллажи", "логистика"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/logisticheskiy-sklad-2000-m2-proekt", "/blog/sklad-klassa-a-i-b-sravnenie", "/blog/sklad-pod-klyuch-moskva"],
  },
  {
    slug: "/blog/osveshchenie-i-ventilyaciya-sklada",
    title: "Освещение и вентиляция склада: нормы, расчёт, решения | Freonn",
    h1: "Освещение и вентиляция склада",
    metaDescription: "Освещение и вентиляция склада: нормы СНиП, расчёт света и воздухообмена, типовые решения.",
    category: "Технологии",
    readTime: 9,
    tags: ["склад", "освещение", "вентиляция", "нормы", "СНиП"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/sklad-klassa-a-i-b-sravnenie", "/blog/sklad-pod-klyuch-moskva", "/blog/holodnyy-ili-teplyy-sklad"],
  },
  {
    slug: "/blog/dogovor-na-stroitelstvo-sklada",
    title: "Договор на строительство склада: ключевые пункты и риски | Freonn",
    h1: "Договор на строительство склада",
    metaDescription: "Договор на строительство склада: объём работ, сроки, оплата, гарантии и ответственность.",
    category: "Документы и право",
    readTime: 8,
    tags: ["договор", "склад", "строительство", "право", "гарантия"],
    intro: "",
    sections: [],
    faqs: [],
    relatedPosts: ["/blog/smeta-na-stroitelstvo-sklada", "/blog/dogovor-podryada-na-stroitelstvo-angara", "/blog/sklad-pod-klyuch-moskva"],
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

/**
 * Генерирует docs/SEO/*.md — запуск после seo:audit.
 * pnpm seo:docs
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SEO_DIR = path.join(ROOT, "docs", "SEO");

execSync("pnpm seo:inventory", { cwd: ROOT, stdio: "inherit" });

const today = new Date().toISOString().slice(0, 10);
fs.mkdirSync(SEO_DIR, { recursive: true });

const readme = `# SEO Hub — freonn.pro

> Обновлено: ${today}

## Навигация

| Документ | Назначение |
|----------|------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Matcher → SSR → feeds |
| [URL_INVENTORY.md](./URL_INVENTORY.md) | Матрица типов URL (auto) |
| [SEO_AUDIT_STRUCTURE.md](./SEO_AUDIT_STRUCTURE.md) | As-is аудит |
| [SEO_AUDIT_GAPS.md](./SEO_AUDIT_GAPS.md) | P0–P3 gaps |
| [MO_STRATEGY.md](./MO_STRATEGY.md) | Москва + МО first |
| [DEPLOY_RUNBOOK.md](./DEPLOY_RUNBOOK.md) | Push → Railway → Webmaster |
| [INDEXING_PLAN.md](./INDEXING_PLAN.md) | P0 индексация |
| [IMPROVEMENT_ROADMAP.md](./IMPROVEMENT_ROADMAP.md) | P1–P2 рост |
| [CONTENT_BACKLOG.md](./CONTENT_BACKLOG.md) | Контент и блог |
| [NEW_URL_CHECKLIST.md](./NEW_URL_CHECKLIST.md) | Чеклист нового URL |
| [MONITORING.md](./MONITORING.md) | Metrika / GSC / CWV |

## Команды

\`\`\`bash
pnpm check && pnpm seo:audit && pnpm seo:inventory
\`\`\`

Prod snapshot (2026-06-10): **592** sitemap URL, **588** turbo items.
`;

fs.writeFileSync(path.join(SEO_DIR, "README.md"), readme, "utf-8");

const stubs = {
  "ARCHITECTURE.md": "# SEO Architecture\n\nHub: `server/_core/seoRouteMatch.ts` → meta, JSON-LD, SSR body, turbo.\n\nDRY: `shared/seoContentRender/blogSections.ts` for blog SSR + turbo.\n",
  "SEO_AUDIT_STRUCTURE.md": "# SEO Audit — Structure\n\nSee URL_INVENTORY.md and run `pnpm seo:audit` for live counts.\n",
  "SEO_AUDIT_GAPS.md": "# SEO Audit — Gaps\n\nP0: SEO_CONTENT_REVISION + GSC resubmit. P1: meta trim, federal geo. P2: data layer consolidation.\n",
  "MO_STRATEGY.md": "# MO-first Strategy\n\n70% equity on Moscow + MO. Tiers in `shared/seoRegionTier.ts`. Combo pages in `moTier1ComboSizePages.ts`.\n",
  "DEPLOY_RUNBOOK.md": "# Deploy Runbook\n\n`pnpm check && pnpm seo:audit && pnpm build:ci` → push → Railway SEO_CONTENT_REVISION → curl sitemap ≥590 → Webmaster resubmit.\n",
  "INDEXING_PLAN.md": "# Indexing P0\n\nTier0 manual recrawl 20 URL. GSC baseline 90d export.\n",
  "IMPROVEMENT_ROADMAP.md": "# Roadmap\n\nMonth 1: semantic 85%. Month 2–4: CWV, turbo split >900, content cadence.\n",
  "CONTENT_BACKLOG.md": "# Content Backlog\n\n2 MO blog posts/week. Legacy queue in blog_drafts.md (archived).\n",
  "NEW_URL_CHECKLIST.md": "# New URL Checklist\n\n1. data 2. seoRouteMatch 3. seoPagePresentation 4. htmlBodyPrerender 5. seoFeeds 6. App.tsx 7. seeAlso 8. seo:audit\n",
  "MONITORING.md": "# Monitoring\n\nMetrika: seo_landing_view, seo_geo_view, seo_size_view. Turbo split routes: /turbo-geo.xml, /turbo-blog.xml at 900+ items.\n",
};

for (const [name, body] of Object.entries(stubs)) {
  const fp = path.join(SEO_DIR, name);
  if (!fs.existsSync(fp)) fs.writeFileSync(fp, body, "utf-8");
}

for (const file of ["SEO_TODO.md", "SEO_AUDIT_REPORT.md", "SEO_MOSCOW_FIRST.md", "seo_metrika_report.md", "blog_drafts.md"]) {
  const fp = path.join(ROOT, file);
  if (fs.existsSync(fp)) {
    const head = `> **Архив.** Актуально: [docs/SEO/README.md](docs/SEO/README.md)\n\n`;
    const body = fs.readFileSync(fp, "utf-8");
    if (!body.startsWith("> **Архив.**")) fs.writeFileSync(fp, head + body, "utf-8");
  }
}

console.log("docs/SEO hub ready");

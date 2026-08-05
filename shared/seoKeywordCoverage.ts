/**
 * Heuristic coverage of keywords_yandex_direct.csv against matchSeoRoute targets.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { matchSeoRoute, normalizeSpaPathname } from "../server/_core/seoRouteMatch";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export type KeywordRow = { keyword: string; group: string };

export type KeywordCoverageResult = {
  total: number;
  covered: number;
  pct: number;
  byGroup: { group: string; total: number; covered: number; pct: number }[];
  gaps: { keyword: string; group: string; suggestedUrl: string }[];
};

function loadKeywords(): KeywordRow[] {
  const csvPath = path.join(ROOT, "keywords_yandex_direct.csv");
  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split(/\r?\n/).slice(1).filter(Boolean);
  return lines.map((line) => {
    const [keyword, group] = line.split(",").map((s) => s.trim());
    return { keyword: keyword ?? line, group: group ?? "Unknown" };
  });
}

/** Map keyword → candidate URL (heuristic, not NLP). */
export function suggestUrlForKeyword(keyword: string): string {
  const k = keyword.toLowerCase();

  const cityMap: [RegExp, string][] = [
    [/москв|московск/i, "/angary-moskva"],
    [/подольск|химк|балаших|домодедов|раменск|щёлков|щелков/i, "/moskovskaya-oblast"],
    [/санкт-петербург|спб/i, "/angary-sankt-peterburg"],
    [/новосибирск/i, "/angary-novosibirsk"],
    [/екатеринburg|екатерин/i, "/angary-ekaterinburg"],
    [/краснодар/i, "/angary-krasnodar"],
  ];
  for (const [re, url] of cityMap) {
    if (re.test(k)) return url;
  }

  const sizeM = k.match(/(\d+)\s*м2|(\d+)\s*m2|(\d+)х(\d+)/);
  if (sizeM) {
    if (/склад|логист/i.test(k)) return "/sklad-1000-m2";
    if (/цех|производ/i.test(k)) return "/proizvodstvennye-zdaniya";
    return "/angar-1000-m2";
  }

  if (/зерно/i.test(k)) return "/selskokhozyaystvennye-zdaniya/zernokhranilishche";
  if (/коровник/i.test(k)) return "/selskokhozyaystvennye-zdaniya/korovnik";
  if (/птичник/i.test(k)) return "/selskokhozyaystvennye-zdaniya/ptichnik";
  if (/навес.*авто|авто.*навес/i.test(k)) return "/navesy/avto";
  if (/навес/i.test(k)) return "/navesy";
  if (/магазин/i.test(k)) return "/torgovye-zdaniya/magazin";
  if (/манеж|спорт/i.test(k)) return "/sportivnye-sooruzheniya/manezh";
  if (/сэндвич|сендвич/i.test(k)) return "/sendvich-paneli";
  if (/быстровозвод/i.test(k)) return "/bystrovozvodimye-zdaniya";
  if (/металлоконструк|км\s|кмд|монтаж металл/i.test(k)) return "/metallokonstruktsii";
  if (/холодн.*склад|холодильн/i.test(k)) return "/sklady/holodilnye";
  if (/тёпл.*склад|тепл.*склад/i.test(k)) return "/sklady/teplye";
  if (/класс\s*a/i.test(k)) return "/sklady/klass-a";
  if (/проектирован/i.test(k)) return "/proektirovanie";
  if (/фундамент/i.test(k)) return "/blog/stoimost-fundamenta-pod-angar";
  if (/разрешен/i.test(k)) return "/blog/razreshenie-na-stroitelstvo-angara";
  if (/склад/i.test(k)) return "/sklady";
  if (/цех|производ/i.test(k)) return "/proizvodstvennye-zdaniya";
  if (/ангар/i.test(k)) return "/angary";

  return "/";
}

export function runKeywordCoverageAudit(): KeywordCoverageResult {
  const keywords = loadKeywords();
  const groupMap = new Map<string, { total: number; covered: number }>();
  const gaps: KeywordCoverageResult["gaps"] = [];
  let covered = 0;

  for (const { keyword, group } of keywords) {
    const suggested = suggestUrlForKeyword(keyword);
    const pathname = normalizeSpaPathname(suggested);
    const ok = pathname === "/" || matchSeoRoute(pathname) !== null;
    if (ok) covered++;
    else gaps.push({ keyword, group, suggestedUrl: suggested });

    const g = groupMap.get(group) ?? { total: 0, covered: 0 };
    g.total++;
    if (ok) g.covered++;
    groupMap.set(group, g);
  }

  const byGroup = Array.from(groupMap.entries())
    .map(([group, { total, covered: c }]) => ({
      group,
      total,
      covered: c,
      pct: total ? Math.round((c / total) * 100) : 0,
    }))
    .sort((a, b) => a.group.localeCompare(b.group, "ru"));

  return {
    total: keywords.length,
    covered,
    pct: keywords.length ? Math.round((covered / keywords.length) * 100) : 0,
    byGroup,
    gaps: gaps.slice(0, 30),
  };
}

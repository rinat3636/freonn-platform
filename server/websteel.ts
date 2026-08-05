/**
 * Оценка стоимости через WebSteel (ПК Веста): браузерная автоматизация,
 * т.к. публичного JSON API нет — после SaveModel цена читается со страницы Project.
 *
 * Приватность: к WebSteel уходит только IP сервера и нейтральный User-Agent.
 * Имя/телефон клиента и домен нашего сайта в этот поток не передаются.
 * Регион — только короткая строка для геокода (без URL/e-mail).
 */
import puppeteer, { type Browser, type HTTPResponse, type Page } from "puppeteer";

const BASE = "https://websteel.pkvesta.ru";

/** Типичный Chrome на Windows — без имён продуктов в UA (сторона WebSteel). */
const NEUTRAL_CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/** Nominatim (не Веста): нейтральный идентификатор приложения, без домена. */
const NEUTRAL_NOMINATIM_UA = "BuildingGeocodeLookup/1.0";

export function sanitizePublicRegion(region: string | undefined): string | undefined {
  if (!region || typeof region !== "string") return undefined;
  const t = region.trim().split(/\r?\n/)[0].slice(0, 100);
  if (!t) return undefined;
  if (/@|https?:\/\//i.test(t)) return undefined;
  return t;
}

export interface WebsteelEstimateInput {
  /** Ширина здания, м (ось WebSteel model_width) */
  width: number;
  /** Длина здания, м (ось WebSteel model_length) */
  length: number;
  /** Высота (пролёт), м */
  height: number;
  /** Шаг рамы, м */
  step?: number;
  /** Регион для геокодинга (если нет lat/lng) */
  region?: string;
  latitude?: number;
  longitude?: number;
}

export interface WebsteelPriceLine {
  label: string;
  amountRub: number;
}

export interface WebsteelEstimateResult {
  totalCostRub: number;
  source: "websteel";
  /** Строки сметы со страницы Project (если удалось разобрать таблицу) */
  lines?: WebsteelPriceLine[];
}

let browserPromise: Promise<Browser> | null = null;
let queue: Promise<unknown> = Promise.resolve();

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
      ],
    });
    browserPromise.catch(() => {
      browserPromise = null;
    });
  }
  return browserPromise;
}

async function resolveCoordinates(input: WebsteelEstimateInput): Promise<{ lat: number; lng: number }> {
  const { latitude, longitude, region } = input;
  if (
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    return { lat: latitude, lng: longitude };
  }
  const q = `${sanitizePublicRegion(region) || "Москва"}, Россия`;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, {
      headers: { "User-Agent": NEUTRAL_NOMINATIM_UA },
    });
    const j = (await r.json()) as { lat?: string; lon?: string }[];
    if (Array.isArray(j) && j[0]?.lat && j[0]?.lon) {
      return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
    }
  } catch {
    /* fall through */
  }
  return { lat: 55.7558, lng: 37.6173 };
}

async function gotoStepTwo(page: Page, lat: number, lng: number): Promise<void> {
  await page.goto(`${BASE}/Home/StepOne`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForSelector("#btn_ok_wide", { visible: true, timeout: 120000 });
  await page.click("#btn_ok_wide");
  await page.waitForFunction(
    () => typeof (window as unknown as { ymaps?: unknown }).ymaps !== "undefined" &&
      typeof (window as unknown as { mapClick?: (c: number[]) => void }).mapClick === "function",
    { timeout: 120000 }
  );
  await page.evaluate(
    ([la, ln]) => {
      (window as unknown as { mapClick: (c: number[]) => void }).mapClick([la, ln]);
    },
    [lat, lng] as const
  );
  await page.waitForFunction(
    () => {
      const sm = document.getElementById("search_modal");
      const fp = document.getElementById("fm_popup");
      const vis = (el: HTMLElement | null) => el && window.getComputedStyle(el).display !== "none";
      return vis(sm) || vis(fp);
    },
    { timeout: 120000 }
  );
  const searchVis = await page.evaluate(() => {
    const el = document.getElementById("search_modal");
    return !!(el && window.getComputedStyle(el).display !== "none");
  });
  if (searchVis) {
    await page.evaluate(() => {
      const w = window as unknown as { ShowFmPopup?: () => void };
      w.ShowFmPopup?.();
    });
  }
  await page.waitForFunction(
    () => {
      const btn = document.getElementById("fm_popup_submit");
      return !!(btn && !(btn as HTMLButtonElement).disabled);
    },
    { timeout: 120000 }
  );
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 120000 }),
    page.click("#fm_popup_submit"),
  ]);
}

async function waitForSaveModelUserId(page: Page): Promise<string> {
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => {
      page.off("response", onRes);
      reject(new Error("SaveModel timeout"));
    }, 120000);

    const onRes = async (res: HTTPResponse) => {
      const u = res.url();
      if (!u.includes("/Home/SaveModel")) return;
      try {
        const txt = await res.text();
        const j = JSON.parse(txt) as { userId?: string };
        if (j.userId) {
          clearTimeout(to);
          page.off("response", onRes);
          resolve(j.userId);
        }
      } catch {
        /* ignore */
      }
    };
    page.on("response", onRes);
  });
}

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn);
  queue = next.then(
    () => {},
    () => {}
  );
  return next;
}

export async function fetchWebsteelEstimate(
  input: WebsteelEstimateInput
): Promise<WebsteelEstimateResult | null> {
  return enqueue(async () => {
    const w = Number(input.width);
    const l = Number(input.length);
    const h = Number(input.height);
    const step = Number(input.step) || 6;
    if (![w, l, h].every(n => Number.isFinite(n) && n > 0)) return null;

    const safeInput: WebsteelEstimateInput = {
      ...input,
      region: sanitizePublicRegion(input.region),
    };
    const { lat, lng } = await resolveCoordinates(safeInput);
    const browser = await getBrowser();
    const page = await browser.newPage();
    await page.setUserAgent(NEUTRAL_CHROME_UA);
    await page.setExtraHTTPHeaders({
      "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
    });
    await page.setViewport({ width: 1400, height: 900 });
    page.setDefaultTimeout(120000);

    try {
      await gotoStepTwo(page, lat, lng);

      await page.waitForFunction(
        () =>
          typeof (window as unknown as { MODEL?: { options: unknown; UpdateModel: () => void } }).MODEL !==
            "undefined" &&
          !!(window as unknown as { MODEL: { options: unknown } }).MODEL.options,
        { timeout: 120000 }
      );

      await page.evaluate(
        ({ width: mw, length: ml, height: mh, step: ms }) => {
          const MODEL = (window as unknown as {
            MODEL: {
              options: {
                model_width: number;
                model_length: number;
                model_width_half: number;
                model_length_half: number;
                model_internal_height: number;
                model_external_height_min: number;
                model_external_height_max: number;
                model_step: number;
                storey_height: number;
              };
              UpdateModel: () => void;
            };
          }).MODEL;
          const o = MODEL.options;
          o.model_width = mw;
          o.model_length = ml;
          o.model_width_half = mw / 2;
          o.model_length_half = ml / 2;
          o.model_internal_height = mh;
          o.model_external_height_min = mh;
          o.model_external_height_max = Math.max(mh * 1.08, mh + 0.6);
          o.model_step = ms;
          o.storey_height = o.model_internal_height / 2;
          MODEL.UpdateModel();
        },
        { width: w, length: l, height: h, step }
      );

      await new Promise(r => setTimeout(r, 2500));

      await page.evaluate(() => {
        const form = document.getElementById("save_model_form");
        if (!form) return;
        if (!document.getElementById("hiddenMode")) {
          const hiddenMode = document.createElement("input");
          hiddenMode.id = "hiddenMode";
          hiddenMode.style.display = "none";
          hiddenMode.name = "hiddenMode";
          hiddenMode.value = "true";
          form.appendChild(hiddenMode);
        }
        if (!document.getElementById("redirect")) {
          const redirect = document.createElement("input");
          redirect.id = "redirect";
          redirect.style.display = "none";
          redirect.name = "redirect";
          redirect.value = "false";
          form.appendChild(redirect);
        }
      });

      const userIdPromise = waitForSaveModelUserId(page);
      await page.evaluate(() => {
        (window as unknown as { MODEL: { SaveModel: () => void } }).MODEL.SaveModel();
      });
      const userId = await userIdPromise;

      await page.goto(`${BASE}/Home/Project?userId=${encodeURIComponent(userId)}`, {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });

      await page
        .waitForSelector("table.table_prices, span[cost-value]", { timeout: 20000 })
        .catch(() => {});
      await new Promise(r => setTimeout(r, 1500));

      const parsed = await page.evaluate(() => {
        const lines: { label: string; amountRub: number }[] = [];
        const seen = new Set<string>();

        const pushLine = (label: string, amountRub: number) => {
          const L = label.replace(/\s+/g, " ").trim();
          if (!L || !Number.isFinite(amountRub) || amountRub <= 0) return;
          const key = `${L}|${amountRub}`;
          if (seen.has(key)) return;
          seen.add(key);
          lines.push({ label: L, amountRub: Math.round(amountRub) });
        };

        const parseMoney = (txt: string): number | null => {
          const d = txt.replace(/\s/g, "").replace(/[^\d]/g, "");
          if (!d) return null;
          const n = parseInt(d, 10);
          return Number.isFinite(n) && n > 0 ? n : null;
        };

        document.querySelectorAll("table.table_prices tr").forEach(tr => {
          const tds = tr.querySelectorAll("td");
          if (tds.length < 2) return;
          const label = (tds[0] as HTMLElement | undefined)?.innerText || "";
          const lastCell = (tds[tds.length - 1] as HTMLElement | undefined)?.innerText || "";
          const n = parseMoney(lastCell);
          if (n != null) pushLine(label, n);
        });

        document.querySelectorAll("#ContentPriceDeadlines li, #BlockPriceDeadlines li").forEach(li => {
          const t = (li as HTMLElement).innerText || "";
          const m = t.match(/([\d\s\u00A0]{6,})\s*(?:руб|₽|Руб)/i);
          if (m) {
            const n = parseMoney(m[1]);
            if (n != null) {
              const label = t.split(/\d/)[0].replace(/[:=]/g, "").trim() || t.trim();
              pushLine(label.slice(0, 200), n);
            }
          }
        });

        const totalEl = document.querySelector(
          "#ContentPriceDeadlines span[cost-value], li.price span[cost-value], span[cost-value]",
        );
        const rawTotal = totalEl?.getAttribute("cost-value");
        const total = rawTotal ? parseInt(rawTotal, 10) : NaN;

        return { total: Number.isFinite(total) && total > 0 ? total : NaN, lines };
      });

      const total = parsed.total;
      if (!Number.isFinite(total) || total <= 0) return null;

      const lines =
        parsed.lines.length > 0
          ? parsed.lines
          : undefined;

      return { totalCostRub: total, source: "websteel" as const, lines };
    } catch (e) {
      console.warn("[websteel] estimate failed:", e);
      return null;
    } finally {
      await page.close().catch(() => {});
    }
  });
}

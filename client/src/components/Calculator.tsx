/*
 * FREONN CALCULATOR — v2 redesign
 * Two-column layout · Live price panel · SVG building illustrations
 */
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import PhoneInput from "./PhoneInput";
import { toast } from "sonner";
import { ymGoal } from "../lib/ym";
import { gaEvent } from "../lib/ga";
import {
  estimateProject,
  REGION_MULT,
  WORK_PACKAGE_LABELS,
  type WorkPackageId,
  type ProjectEstimateInput,
  type ProjectEstimateResult,
  kitFloorHintRubM2,
} from "@shared/buildingEstimate";
import {
  CALCULATOR_BUILDING_TYPES,
  BUILDING_TYPE_CATEGORIES_FOR_UI,
  getBuildingTypeDef,
  VESTA_BUILDINGS_CATALOG_URL,
} from "@shared/buildingCatalog";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface CalcState {
  type: string;
  length: number;
  width: number;
  height: number;
  frameStepM: number;
  roofPitchDeg: number;
  plinthM: number;
  workPackage: WorkPackageId;
  options: string[];
  region: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const workPackages: { id: WorkPackageId; hint: string }[] = [
  {
    id: "komplekt",
    hint: "Комплект ЛМК и ОК с завода + доставка в итоге. Монтаж и фундамент — по отдельным договорам или не включены.",
  },
  {
    id: "komplekt_montazh",
    hint: "Как в типовом КП: комплект + доставка + монтаж (~33% от комплекта). Фундамент и полы — опционально.",
  },
  {
    id: "pod_klyuch",
    hint: "Полный цикл: комплект + доставка + монтаж + фундамент (условные грунты) + проект КМ/ОК в составе.",
  },
];

const optionsList = [
  { id: "uteplenie",  label: "Утепление",  hint: "+ к комплекту ₽/м²", desc: "Усиление ограждающих конструкций / толщина панелей" },
  { id: "pokraska",   label: "Покраска",   hint: "+ к металлу", desc: "Порошковое покрытие RAL второстепенных элементов" },
  { id: "ocinkovka",  label: "Оцинковка",  hint: "+ к металлу", desc: "Горячее цинкование по согласованию" },
  { id: "fundament",  label: "Фундамент",  hint: "отдельной строкой", desc: "Плита / лента под условные грунты (после геологии уточняется)" },
];

const regionsList = [
  "Москва и МО", "Санкт-Петербург", "Краснодарский край", "Татарстан",
  "Свердловская обл.", "Новосибирская обл.", "Ростовская обл.", "Другой регион",
];

const stepLabels = ["Тип", "Габариты", "Объём работ", "Опции", "Регион", "Итог"];

// ── Price calculation (та же модель, что и в PDF / КП) ───────────────────────

function toEstimateInput(state: CalcState): ProjectEstimateInput | null {
  if (!state.type || !state.length || !state.width) return null;
  let opts = [...state.options];
  if (state.workPackage === "pod_klyuch" && !opts.includes("fundament")) {
    opts.push("fundament");
  }
  opts = Array.from(new Set(opts));
  return {
    buildingTypeId: state.type,
    length: state.length,
    width: state.width,
    height: state.height,
    frameStepM: state.frameStepM,
    roofPitchDeg: state.roofPitchDeg,
    workPackage: state.workPackage,
    options: opts,
    region: state.region,
  };
}

function getEstimate(state: CalcState): ProjectEstimateResult | null {
  const inp = toEstimateInput(state);
  if (!inp) return null;
  return estimateProject(inp);
}

function calcPrice(state: CalcState): { min: number; max: number } {
  const est = getEstimate(state);
  if (!est) return { min: 0, max: 0 };
  return { min: est.totalMin, max: est.totalMax };
}

function clampInt(n: number, lo: number, hi: number): number {
  if (!Number.isFinite(n)) return lo;
  return Math.min(hi, Math.max(lo, Math.trunc(n)));
}

// ── Building SVG illustrations ────────────────────────────────────────────────

function BuildingIllustration({ graphicsId, active }: { graphicsId: string; active: boolean }) {
  const c = active ? "#ED1C24" : "rgba(26,26,46,0.22)";
  const sw = 1.5;

  if (graphicsId === "angar") return (
    <svg width="72" height="44" viewBox="0 0 72 44" fill="none">
      <path d="M6 40 L6 22 Q36 5 66 22 L66 40" stroke={c} strokeWidth={sw} strokeLinejoin="round"/>
      <line x1="6" y1="40" x2="66" y2="40" stroke={c} strokeWidth={sw}/>
      <rect x="28" y="26" width="16" height="14" rx="0.5" stroke={c} strokeWidth="1"/>
      <line x1="36" y1="26" x2="36" y2="40" stroke={c} strokeWidth="0.75"/>
    </svg>
  );

  if (graphicsId === "sklad") return (
    <svg width="72" height="44" viewBox="0 0 72 44" fill="none">
      <rect x="6" y="18" width="60" height="22" stroke={c} strokeWidth={sw}/>
      <polyline points="6,18 36,6 66,18" stroke={c} strokeWidth={sw} strokeLinejoin="round"/>
      <rect x="28" y="28" width="16" height="12" stroke={c} strokeWidth="1"/>
      <line x1="36" y1="28" x2="36" y2="40" stroke={c} strokeWidth="0.75"/>
      <line x1="6" y1="28" x2="66" y2="28" stroke={c} strokeWidth="0.75" strokeDasharray="3 3"/>
    </svg>
  );

  if (graphicsId === "naves") return (
    <svg width="72" height="44" viewBox="0 0 72 44" fill="none">
      <rect x="6" y="16" width="60" height="5" rx="0.5" stroke={c} strokeWidth={sw}/>
      <line x1="14" y1="21" x2="14" y2="40" stroke={c} strokeWidth={sw}/>
      <line x1="58" y1="21" x2="58" y2="40" stroke={c} strokeWidth={sw}/>
      <line x1="36" y1="21" x2="36" y2="40" stroke={c} strokeWidth={sw}/>
      <line x1="6" y1="40" x2="66" y2="40" stroke={c} strokeWidth={sw}/>
    </svg>
  );

  if (graphicsId === "karkas") return (
    <svg width="72" height="44" viewBox="0 0 72 44" fill="none">
      <rect x="6" y="6" width="60" height="34" stroke={c} strokeWidth={sw}/>
      <line x1="6" y1="20" x2="66" y2="20" stroke={c} strokeWidth="0.75"/>
      <line x1="26" y1="6" x2="26" y2="40" stroke={c} strokeWidth="0.75"/>
      <line x1="46" y1="6" x2="46" y2="40" stroke={c} strokeWidth="0.75"/>
      <line x1="6" y1="13" x2="66" y2="13" stroke={c} strokeWidth="0.75" strokeDasharray="3 3"/>
    </svg>
  );

  if (graphicsId === "selhoz") return (
    <svg width="72" height="44" viewBox="0 0 72 44" fill="none">
      <rect x="6" y="22" width="60" height="18" stroke={c} strokeWidth={sw}/>
      <path d="M6 22 Q36 4 66 22" stroke={c} strokeWidth={sw}/>
      <line x1="36" y1="4" x2="36" y2="22" stroke={c} strokeWidth="0.75" strokeDasharray="2 3"/>
      <rect x="28" y="28" width="16" height="12" stroke={c} strokeWidth="1"/>
    </svg>
  );

  return (
    <svg width="72" height="44" viewBox="0 0 72 44" fill="none">
      <rect x="12" y="12" width="48" height="28" stroke={c} strokeWidth={sw}/>
      <polyline points="12,12 36,4 60,12" stroke={c} strokeWidth={sw} strokeLinejoin="round"/>
      <rect x="22" y="28" width="12" height="12" stroke={c} strokeWidth="1"/>
      <rect x="38" y="20" width="10" height="8" stroke={c} strokeWidth="1"/>
    </svg>
  );
}

// ── Progress stepper ──────────────────────────────────────────────────────────

/** На мобильных — одна строка и полоса прогресса вместо шести колонок с подписями */
function ProgressStepperMobile({ step }: { step: Step }) {
  const pct = ((step - 1) / (stepLabels.length - 1)) * 100;
  return (
    <div className="mb-3 lg:hidden">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span
          className="text-[0.62rem] uppercase tracking-[0.12em]"
          style={{ fontFamily: "IBM Plex Mono, monospace", color: "rgba(26,26,46,0.42)" }}
        >
          Шаг {step} / {stepLabels.length}
        </span>
        <span className="ms-heading text-sm font-semibold text-[#ED1C24] truncate max-w-[58%] text-right">
          {stepLabels[step - 1]}
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(26,26,46,0.07)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: "#ED1C24", transformOrigin: "left" }}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.25 }}
        />
      </div>
    </div>
  );
}

function ProgressStepperDesktop({ step }: { step: Step }) {
  return (
    <div className="hidden lg:block" style={{ marginBottom: "28px" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {stepLabels.map((label, i) => {
          const s = (i + 1) as Step;
          const isActive = step === s;
          const isDone = step > s;
          const isLast = i === stepLabels.length - 1;
          return (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", flex: isLast ? "none" : 1 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                <motion.div
                  animate={{
                    background: isDone ? "#ED1C24" : isActive ? "rgba(237,28,36,0.12)" : "rgba(26,26,46,0.05)",
                    borderColor: isDone || isActive ? "#ED1C24" : "rgba(26,26,46,0.1)",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: "30px", height: "30px", borderRadius: "50%",
                    border: "1.5px solid", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  {isDone ? (
                    <Check size={12} style={{ color: "white" }} />
                  ) : (
                    <span style={{
                      fontFamily: "IBM Plex Mono, monospace", fontSize: "0.62rem", fontWeight: 600,
                      color: isActive ? "#ED1C24" : "rgba(26,26,46,0.28)",
                    }}>{s}</span>
                  )}
                </motion.div>
                <span style={{
                  fontFamily: "IBM Plex Mono, monospace", fontSize: "0.48rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  color: isActive ? "#ED1C24" : isDone ? "rgba(26,26,46,0.45)" : "rgba(26,26,46,0.22)",
                  whiteSpace: "nowrap",
                }}>{label}</span>
              </div>
              {!isLast && (
                <div style={{
                  flex: 1, height: "1.5px", background: "rgba(26,26,46,0.07)",
                  margin: "14px 3px 0", position: "relative", overflow: "hidden",
                }}>
                  <motion.div
                    style={{ position: "absolute", inset: 0, background: "#ED1C24", transformOrigin: "left" }}
                    animate={{ scaleX: isDone ? 1 : 0 }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProgressStepper({ step }: { step: Step }) {
  return (
    <>
      <ProgressStepperMobile step={step} />
      <ProgressStepperDesktop step={step} />
    </>
  );
}

// ── Live price panel (desktop right column) ───────────────────────────────────

function ConfigRow({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
      <span style={{
        fontFamily: "IBM Plex Mono, monospace", fontSize: "0.56rem",
        color: "rgba(255,255,255,0.28)", textTransform: "uppercase",
        letterSpacing: "0.08em", flexShrink: 0, paddingTop: "2px",
      }}>{label}</span>
      <span style={{
        fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: "0.82rem",
        color: value ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.18)",
        textAlign: "right",
      }}>{value || placeholder}</span>
    </div>
  );
}

function LivePricePanel({ state }: { state: CalcState }) {
  const p = calcPrice(state);
  const est = getEstimate(state);
  const type = getBuildingTypeDef(state.type);
  const area = state.length * state.width;
  const hasPrice = p.min > 0;

  return (
    <div style={{
      background: "linear-gradient(145deg, #1A1A2E 0%, #16213E 100%)",
      borderRadius: "1.5rem", padding: "28px",
      position: "sticky", top: "100px",
      border: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{
        fontFamily: "IBM Plex Mono, monospace", fontSize: "0.56rem",
        letterSpacing: "0.14em", textTransform: "uppercase",
        color: "rgba(255,255,255,0.3)", marginBottom: "14px",
      }}>Предварительная стоимость</div>

      <AnimatePresence mode="wait">
        {hasPrice ? (
          <motion.div key={`${p.min}-${p.max}`}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <div style={{
              fontFamily: "Bebas Neue, sans-serif",
              fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)",
              color: "#ED1C24", lineHeight: 1, marginBottom: "3px",
            }}>
              {p.min.toLocaleString("ru-RU")} ₽
            </div>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.62rem", color: "rgba(255,255,255,0.28)", marginBottom: "18px" }}>
              — {p.max.toLocaleString("ru-RU")} ₽
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.6rem", color: "rgba(255,255,255,0.12)", marginBottom: "24px" }}>
            Выберите параметры
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "18px" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        <ConfigRow label="Тип" value={type?.label} placeholder="не выбран" />
        <ConfigRow
          label="Площадь"
          value={state.length && state.width ? `${state.length}×${state.width} = ${area} м²` : undefined}
          placeholder="не указана"
        />
        <ConfigRow label="Высота" value={state.height ? `${state.height} м` : undefined} placeholder="—" />
        <ConfigRow
          label="Объём работ"
          value={WORK_PACKAGE_LABELS[state.workPackage]}
          placeholder="—"
        />
        {est && est.kitRub > 0 && (
          <>
            <ConfigRow label="Комплект (ориент.)" value={`${est.kitRub.toLocaleString("ru-RU")} ₽`} />
            <ConfigRow label="Доставка" value={`${est.deliveryRub.toLocaleString("ru-RU")} ₽`} />
            {est.montazhRub > 0 && (
              <ConfigRow label="Монтаж" value={`${est.montazhRub.toLocaleString("ru-RU")} ₽`} />
            )}
            {est.fundamentRub > 0 && (
              <ConfigRow label="Фундамент" value={`${est.fundamentRub.toLocaleString("ru-RU")} ₽`} />
            )}
          </>
        )}
        {state.options.filter(o => o !== "fundament" || state.workPackage !== "pod_klyuch").length > 0 && (
          <ConfigRow
            label="Опции"
            value={state.options
              .filter(o => !(o === "fundament" && state.workPackage === "pod_klyuch"))
              .map(id => optionsList.find(o => o.id === id)?.label)
              .filter(Boolean)
              .join(", ")}
          />
        )}
        <ConfigRow label="Регион" value={state.region || undefined} placeholder="не выбран" />
      </div>

      {hasPrice && area > 0 && (
        <>
          <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "18px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{
              fontFamily: "IBM Plex Mono, monospace", fontSize: "0.55rem",
              color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.1em",
            }}>Цена за м²</span>
            <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.1rem", color: "rgba(255,255,255,0.55)" }}>
              ~{est ? est.pricePerM2.toLocaleString("ru-RU") : Math.round((p.min + p.max) / 2 / area).toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </>
      )}

      <div style={{
        marginTop: "20px", fontFamily: "IBM Plex Mono, monospace",
        fontSize: "0.5rem", color: "rgba(255,255,255,0.18)", lineHeight: 1.7, letterSpacing: "0.05em",
      }}>
        Предварительный расчёт.<br />Точная стоимость после инженерного опроса.
      </div>
    </div>
  );
}

// ── Mobile price strip ────────────────────────────────────────────────────────

function MobilePriceBar({ state }: { state: CalcState }) {
  const p = calcPrice(state);
  const type = getBuildingTypeDef(state.type);
  if (!type) return null;
  const area = state.length * state.width;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
      className="lg:hidden"
      style={{
        background: "linear-gradient(90deg, #1A1A2E 0%, #16213E 100%)",
        borderRadius: "0.75rem", padding: "8px 12px",
        marginBottom: "12px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
      }}
    >
      <div className="min-w-0 flex-1">
        <div className="truncate" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.48rem", color: "rgba(255,255,255,0.32)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {type.label}
        </div>
        {p.min > 0 ? (
          <div className="truncate" style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.05rem", color: "#ED1C24", lineHeight: 1.05 }}>
            {p.min.toLocaleString("ru-RU")} — {p.max.toLocaleString("ru-RU")} ₽
          </div>
        ) : (
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "0.95rem", color: "rgba(255,255,255,0.25)" }}>
            укажите параметры
          </div>
        )}
      </div>
      {area > 0 && (
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.46rem", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.06em" }}>м²</div>
          <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1rem", color: "rgba(255,255,255,0.65)" }}>{area}</div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Calculator() {
  const [loc] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<CalcState>({
    type: "",
    length: 20,
    width: 15,
    height: 5,
    frameStepM: 6,
    roofPitchDeg: 10,
    plinthM: 0.3,
    workPackage: "pod_klyuch",
    options: ["fundament"],
    region: "Москва и МО",
  });
  const [form, setForm] = useState({ name: "", phone: "" });
  /** Поля для КП в формате профессионального ТЗ (как в типовом КП производителя) */
  const [kpExtra, setKpExtra] = useState({
    constructionSite: "",
    gatesNote: "",
    doorsNote: "",
    craneLoad: "",
  });
  const [sent, setSent] = useState(false);
  const [downloading, setDownloading] = useState(false);

  /** Предвыбор типа с SEO-страницы `/zdaniya/:id` → ссылка `/?type=id#calculator` */
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const t = sp.get("type") ?? sp.get("building");
    if (!t) return;
    const def = getBuildingTypeDef(t);
    if (!def) return;
    setState(s => (s.type === t ? s : { ...s, type: t }));
  }, [loc]);

  const price = calcPrice(state);
  const estimate = getEstimate(state);

  const canNext = () => {
    if (step === 1) return !!state.type;
    if (step === 2) {
      const { length, width, height } = state;
      return (
        Number.isFinite(length) && length >= 5 &&
        Number.isFinite(width) && width >= 5 &&
        Number.isFinite(height) && height >= 3
      );
    }
    if (step === 3) return !!state.workPackage;
    if (step === 4) return true;
    if (step === 5) return !!state.region?.trim();
    return false;
  };

  const next = () => { if (canNext() && step < 6) setStep(s => (s + 1) as Step); };
  const prev = () => { if (step > 1) setStep(s => (s - 1) as Step); };

  const setWorkPackage = (id: WorkPackageId) => setState(s => {
    const opts = new Set(s.options);
    if (id === "pod_klyuch") opts.add("fundament");
    return { ...s, workPackage: id, options: Array.from(opts) };
  });

  const toggleOption = (id: string) => setState(s => {
    if (id === "fundament" && s.workPackage === "pod_klyuch") return s;
    return {
      ...s,
      options: s.options.includes(id) ? s.options.filter(x => x !== id) : [...s.options, id],
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTypeName = getBuildingTypeDef(state.type)?.label || state.type;
    const services = WORK_PACKAGE_LABELS[state.workPackage];
    const options = state.options.map(id => optionsList.find(o => o.id === id)?.label || id).join(", ");
    const message = [
      `Тип: ${selectedTypeName}`,
      `Размеры: ${state.length}×${state.width}×${state.height} м`,
      `Услуги: ${services}`,
      options ? `Опции: ${options}` : null,
      `Регион: ${state.region}`,
      kpExtra.constructionSite.trim() ? `Площадка: ${kpExtra.constructionSite.trim()}` : null,
      kpExtra.craneLoad.trim() ? `Кран: ${kpExtra.craneLoad.trim()}` : null,
      kpExtra.gatesNote.trim() ? `Ворота: ${kpExtra.gatesNote.trim()}` : null,
      kpExtra.doorsNote.trim() ? `Двери: ${kpExtra.doorsNote.trim()}` : null,
      `Цена: ${price.min.toLocaleString("ru")}–${price.max.toLocaleString("ru")} ₽`,
    ].filter(Boolean).join(" | ");
    try {
      const res = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, phone: form.phone, service: selectedTypeName, message }),
      });
      let errText = "Не удалось отправить заявку";
      try {
        const data = (await res.json()) as { error?: string };
        if (typeof data.error === "string" && data.error.trim()) errText = data.error.trim();
      } catch {
        /* не JSON */
      }
      if (!res.ok) {
        toast.error(errText);
        return;
      }

      try {
        const { isLoggedIn } = await import("@/lib/freonn-group/auth-storage");
        const { isFreonnApiConfigured } = await import("@/lib/freonn-group/config");
        const { submitMetalstroyRequest } = await import("@/lib/freonn-group/orders");
        if (isFreonnApiConfigured() && isLoggedIn()) {
          await submitMetalstroyRequest({
            buildingType: selectedTypeName,
            lengthM: Number(state.length) || undefined,
            widthM: Number(state.width) || undefined,
            heightM: Number(state.height) || undefined,
            workPackage: state.workPackage,
            region: state.region,
            comment: message,
          });
        }
      } catch (syncErr) {
        console.warn("[Calculator] Freonn Group request sync", syncErr);
      }

      setSent(true);
      ymGoal("calculator_submit", { type: state.type, region: state.region });
      gaEvent("calculator_submit", { event_category: "lead", event_label: state.type, value: 1 });
    } catch (e) {
      console.error("[Calculator] submit-form", e);
      toast.error("Нет связи с сервером. Попробуйте позже или позвоните 8 (800) 101-2009.");
    }
  };

  const handleDownloadKp = async () => {
    if (!estimate || price.min <= 0) return;
    setDownloading(true);
    try {
      const selectedTypeName = getBuildingTypeDef(state.type)?.label || state.type;
      const estDl = estimate;
      const servicesForApi = estDl?.servicesForApi ?? ["klyuch"];
      const optionsForApi = estDl?.optionsForApi ?? state.options;
      const servicesLabels = servicesForApi.map(id =>
        id === "klyuch" ? WORK_PACKAGE_LABELS.pod_klyuch : id === "montazh" ? "Монтаж" : "Комплект завода",
      );
      const optionsLabels = optionsForApi.map(id => optionsList.find(o => o.id === id)?.label || id);
      const res = await fetch("/api/generate-kp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: form.name, clientPhone: form.phone,
          buildingType: selectedTypeName, buildingTypeId: state.type,
          length: state.length, width: state.width, height: state.height,
          services: servicesForApi, servicesLabels,
          options: optionsForApi, optionsLabels,
          region: state.region, priceMin: price.min, priceMax: price.max,
          frameStepM: state.frameStepM,
          roofPitchDeg: state.roofPitchDeg,
          plinthM: state.plinthM,
          constructionSite: kpExtra.constructionSite.trim() || undefined,
          gatesNote: kpExtra.gatesNote.trim() || undefined,
          doorsNote: kpExtra.doorsNote.trim() || undefined,
          craneLoad: kpExtra.craneLoad.trim() || undefined,
        }),
      });
      if (!res.ok) {
        let errText = "Не удалось сформировать КП";
        const ct = res.headers.get("Content-Type") || "";
        if (ct.includes("application/json")) {
          try {
            const data = (await res.json()) as { error?: string };
            if (typeof data.error === "string" && data.error.trim()) errText = data.error.trim();
          } catch {
            /* ignore */
          }
        }
        toast.error(errText);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const d = new Date();
      const dateStr = `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()}`;
      a.download = `КП_${dateStr}_${selectedTypeName}_${state.length}x${state.width}x${state.height}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      ymGoal("kp_download", { type: state.type, region: state.region });
      gaEvent("kp_download", { event_category: "calculator", event_label: state.type, value: 1 });
    } catch (e) {
      console.error("[Calculator] generate-kp", e);
      toast.error(e instanceof Error && e.message ? e.message : "Не удалось скачать КП");
    }
    setDownloading(false);
  };

  return (
    <section
      id="calculator"
      aria-label="Калькулятор стоимости здания"
      className="relative py-14 sm:py-20 lg:py-32 overflow-hidden"
      style={{ background: "#FFFFFF" }}
    >
      {/* Grid bg */}
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(26,26,46,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,26,46,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(237,28,36,0.03) 0%, transparent 70%)",
      }} />
      <div className="absolute top-8 right-8 ms-section-num hidden lg:block">05</div>

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8 sm:mb-10 lg:mb-12 text-center px-1"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-px" style={{ background: "var(--ms-orange)" }} />
            <span className="ms-label">Конфигуратор</span>
            <div className="w-10 h-px" style={{ background: "var(--ms-orange)" }} />
          </div>
          <h2 className="ms-heading max-lg:leading-tight" style={{ fontSize: "clamp(1.45rem, 6vw, 3.5rem)", color: "#1A1A2E" }}>
            Рассчитать стоимость здания
          </h2>
          <p className="mt-2 sm:mt-3 mx-auto max-w-lg max-lg:text-sm" style={{
            fontFamily: "Barlow, sans-serif", fontSize: "0.9rem",
            color: "rgba(26,26,46,0.4)", fontWeight: 300,
          }}>
            <span className="lg:hidden">Комплект, доставка, монтаж, фундамент — как в типовом КП и PDF.</span>
            <span className="hidden lg:inline">
              Смета в логике типового КП: комплект + доставка + монтаж (~33% к комплекту) + фундамент. Те же статьи в PDF.
            </span>
          </p>
        </motion.div>

        {/* Two-column layout */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 sm:gap-6 lg:gap-8 items-start">

          {/* ── Left: wizard ── */}
          <div>
            {state.type && step > 1 && <MobilePriceBar state={state} />}

            <ProgressStepper step={step} />

            {/* Step card */}
            <div className="min-h-0 lg:min-h-[380px] rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden" style={{
              background: "rgba(26,26,46,0.025)",
              border: "1px solid rgba(26,26,46,0.07)",
            }}>
              <AnimatePresence mode="wait">

                {/* STEP 1 — Building type */}
                {step === 1 && (
                  <motion.div key="step1" className="p-4 sm:p-6 lg:p-8"
                    initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.22 }}>
                    <h3 className="ms-heading mb-1 text-base sm:text-[1.2rem]" style={{ color: "#1A1A2E" }}>Тип конструкции</h3>
                    <p className="mb-2 sm:mb-3 text-[0.65rem] sm:text-xs" style={{ fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.06em" }}>
                      <Link href="/zdaniya" className="text-[#ED1C24] no-underline hover:underline">
                        Полный каталог типов
                      </Link>
                      <span style={{ color: "rgba(26,26,46,0.25)" }}> · </span>
                      <span style={{ color: "rgba(26,26,46,0.35)" }}>карточки и переход в калькулятор</span>
                    </p>
                    <p className="mb-3 sm:mb-4 text-xs sm:text-[0.82rem] lg:hidden" style={{ fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.45)", fontWeight: 300, lineHeight: 1.45 }}>
                      Каталог по разделам, как у производителей ЛМК.{" "}
                      <a href={VESTA_BUILDINGS_CATALOG_URL} target="_blank" rel="noopener noreferrer" className="underline decoration-[rgba(237,28,36,0.35)] text-[#ED1C24]">
                        Справочно
                      </a>
                    </p>
                    <p className="mb-4 hidden lg:block" style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.82rem", color: "rgba(26,26,46,0.4)", fontWeight: 300 }}>
                      Выберите направление: типы из каталога по разделам (как у производителей ЛМК) — структура{" "}
                      <a
                        href={VESTA_BUILDINGS_CATALOG_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-[rgba(237,28,36,0.35)] hover:text-[#ED1C24]"
                      >
                        каталога ПК «Веста»
                      </a>
                      . Ориентир ₽/м² — ваша модель КП, не цены Весты.
                    </p>
                    <div
                      className="max-h-[min(42vh,380px)] sm:max-h-[min(520px,58vh)] overflow-y-auto overscroll-contain pr-1 space-y-5 sm:space-y-8"
                      style={{ scrollbarGutter: "stable" }}
                    >
                      {BUILDING_TYPE_CATEGORIES_FOR_UI.map(cat => {
                        const types = CALCULATOR_BUILDING_TYPES.filter(t => t.categoryId === cat.id);
                        return (
                          <div key={cat.id}>
                            <h4 className="ms-heading mb-2 sm:mb-3 text-[0.8rem] sm:text-[0.88rem]" style={{ color: "rgba(26,26,46,0.75)" }}>
                              {cat.label}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                              {types.map(t => {
                                const isSel = state.type === t.id;
                                return (
                                  <div
                                    key={t.id}
                                    className="flex flex-col transition-all duration-200 overflow-hidden"
                                    style={{
                                      background: isSel ? "rgba(237,28,36,0.07)" : "rgba(26,26,46,0.025)",
                                      border: `1.5px solid ${isSel ? "rgba(237,28,36,0.45)" : "rgba(26,26,46,0.07)"}`,
                                      borderRadius: "0.75rem",
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setState(s => ({ ...s, type: t.id }));
                                        ymGoal("calculator_select_type", { building_id: t.id });
                                        gaEvent("calculator_select_type", { building_id: t.id });
                                      }}
                                      className="text-left flex-1 px-2 py-2.5 sm:px-3.5 sm:py-4 border-0 bg-transparent cursor-pointer w-full"
                                    >
                                      <div className="mb-1.5 sm:mb-2.5 max-sm:scale-[0.88] max-sm:origin-top w-fit">
                                        <BuildingIllustration graphicsId={t.iconFamily} active={isSel} />
                                      </div>
                                      <div className="ms-heading text-[0.8rem] sm:text-[0.9rem] leading-tight" style={{ color: isSel ? "#1A1A2E" : "rgba(26,26,46,0.6)" }}>
                                        {t.label}
                                      </div>
                                      <div className="hidden sm:block" style={{
                                        fontFamily: "IBM Plex Mono, monospace", fontSize: "0.56rem",
                                        color: isSel ? "var(--ms-orange)" : "rgba(26,26,46,0.28)", marginTop: "3px",
                                      }}>
                                        от {kitFloorHintRubM2(t.id).toLocaleString("ru-RU")} ₽/м² · комплект
                                      </div>
                                    </button>
                                    <Link
                                      href={`/zdaniya/${encodeURIComponent(t.id)}`}
                                      className="shrink-0 block text-center py-1.5 sm:py-2 border-t border-[rgba(26,26,46,0.06)] no-underline hover:bg-[rgba(26,26,46,0.03)]"
                                      style={{
                                        fontFamily: "IBM Plex Mono, monospace",
                                        fontSize: "0.5rem",
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase",
                                        color: isSel ? "var(--ms-orange)" : "rgba(26,26,46,0.35)",
                                      }}
                                      onClick={() => {
                                        ymGoal("calculator_zdaniya_more", { building_id: t.id });
                                        gaEvent("calculator_zdaniya_more", { building_id: t.id });
                                      }}
                                    >
                                      Подробнее
                                    </Link>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 — Dimensions */}
                {step === 2 && (
                  <motion.div key="step2" className="p-4 sm:p-6 lg:p-8"
                    initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.22 }}>
                    <h3 className="ms-heading mb-1 text-base sm:text-[1.2rem]" style={{ color: "#1A1A2E" }}>Размеры здания</h3>
                    <p className="mb-4 sm:mb-6 text-xs sm:text-[0.82rem]" style={{ fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.4)", fontWeight: 300 }}>
                      {getBuildingTypeDef(state.type)?.label} · ориентир комплекта от{" "}
                      {state.type ? kitFloorHintRubM2(state.type).toLocaleString("ru-RU") : "—"} ₽/м²
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                      {[
                        { key: "length", label: "Длина",  unit: "м", min: 5,  max: 500 },
                        { key: "width",  label: "Ширина", unit: "м", min: 5,  max: 200 },
                        { key: "height", label: "Высота", unit: "м", min: 3,  max: 30  },
                      ].map(dim => (
                        <div key={dim.key}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" }}>
                            <label htmlFor={`calc-${dim.key}`} style={{
                              fontFamily: "IBM Plex Mono, monospace", fontSize: "0.56rem",
                              letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,26,46,0.38)",
                            }}>{dim.label}</label>
                            <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.4rem", color: "#1A1A2E", lineHeight: 1 }}>
                              {state[dim.key as keyof CalcState] as number}
                              <span style={{ fontSize: "0.65rem", fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.38)", marginLeft: "3px" }}>{dim.unit}</span>
                            </span>
                          </div>
                          <input
                            type="range" aria-label={`${dim.label} ${dim.unit}`}
                            min={dim.min} max={dim.max}
                            value={state[dim.key as keyof CalcState] as number}
                            onChange={e => setState(s => ({ ...s, [dim.key]: Number(e.target.value) }))}
                            className="w-full" style={{ accentColor: "var(--ms-orange)" }}
                          />
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.48rem", color: "rgba(26,26,46,0.22)" }}>{dim.min}</span>
                            <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.48rem", color: "rgba(26,26,46,0.22)" }}>{dim.max}</span>
                          </div>
                          <input
                            id={`calc-${dim.key}`} name={dim.key} type="number"
                            min={dim.min} max={dim.max}
                            value={state[dim.key as keyof CalcState] as number}
                            onChange={e => {
                              const v = clampInt(Number(e.target.value), dim.min, dim.max);
                              setState(s => ({ ...s, [dim.key]: v }));
                            }}
                            className="w-full px-3 py-2 outline-none"
                            style={{
                              background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)",
                              color: "#1A1A2E", fontFamily: "IBM Plex Mono, monospace",
                              fontSize: "0.88rem", borderRadius: "0.5rem",
                            }}
                            onFocus={e => e.currentTarget.style.borderColor = "rgba(237,28,36,0.4)"}
                            onBlur={e => e.currentTarget.style.borderColor = "rgba(26,26,46,0.09)"}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 sm:mt-6 sm:p-4 flex items-center justify-between" style={{
                      background: "rgba(237,28,36,0.04)", border: "1px solid rgba(237,28,36,0.11)",
                      borderRadius: "0.875rem",
                    }}>
                      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.58rem", color: "rgba(26,26,46,0.38)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        Площадь пола
                      </span>
                      <span className="text-[1.35rem] sm:text-[1.7rem]" style={{ fontFamily: "Bebas Neue, sans-serif", color: "var(--ms-orange)", letterSpacing: "0.03em" }}>
                        {(state.length * state.width).toLocaleString("ru-RU")} м²
                      </span>
                    </div>
                    <div className="mt-4 pt-4 sm:mt-8 sm:pt-6" style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}>
                      <h4 className="ms-heading mb-1 text-sm sm:text-[0.95rem]" style={{ color: "#1A1A2E" }}>Параметры для ТЗ и сметы</h4>
                      <p className="mb-3 sm:mb-4 text-xs sm:text-[0.78rem] hidden sm:block" style={{ fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.42)", fontWeight: 300 }}>
                        Как в КП производителей: шаг рам, угол кровли, цоколь. Учитываются в оценке комплекта и попадают в PDF.
                      </p>
                      <p className="mb-3 sm:mb-4 text-xs sm:hidden" style={{ fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.42)", fontWeight: 300 }}>
                        Шаг рам, угол кровли, цоколь — в смету и PDF.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { key: "frameStepM" as const, label: "Шаг рам", unit: "м", min: 4, max: 12, plinthSlider: false },
                          { key: "roofPitchDeg" as const, label: "Угол кровли", unit: "°", min: 6, max: 25, plinthSlider: false },
                          { key: "plinthM" as const, label: "Цоколь", unit: "м", min: 0, max: 12, plinthSlider: true },
                        ].map(g => {
                          const displayVal = g.plinthSlider
                            ? Math.round(state.plinthM * 10) / 10
                            : (state[g.key as "frameStepM" | "roofPitchDeg"] as number);
                          const sliderVal = g.plinthSlider
                            ? Math.min(12, Math.max(0, Math.round(state.plinthM * 10)))
                            : (state[g.key as "frameStepM" | "roofPitchDeg"] as number);
                          return (
                            <div key={g.key}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.56rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(26,26,46,0.38)" }}>{g.label}</span>
                                <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: "1.25rem", color: "#1A1A2E" }}>
                                  {displayVal}{g.unit}
                                </span>
                              </div>
                              <input
                                type="range"
                                aria-label={g.label}
                                min={g.min}
                                max={g.max}
                                step={1}
                                value={sliderVal}
                                onChange={e => {
                                  const v = Number(e.target.value);
                                  if (g.plinthSlider) setState(s => ({ ...s, plinthM: Math.round(v * 10) / 100 }));
                                  else setState(s => ({ ...s, [g.key]: v }));
                                }}
                                className="w-full"
                                style={{ accentColor: "var(--ms-orange)" }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 — Объём работ (как в структуре КП) */}
                {step === 3 && (
                  <motion.div key="step3" className="p-4 sm:p-6 lg:p-8"
                    initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.22 }}>
                    <h3 className="ms-heading mb-1 text-base sm:text-[1.2rem]" style={{ color: "#1A1A2E" }}>Объём работ</h3>
                    <p className="mb-4 sm:mb-6 text-xs sm:text-[0.82rem]" style={{ fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.4)", fontWeight: 300 }}>
                      <span className="sm:hidden">Один вариант: комплект, с монтажом или под ключ.</span>
                      <span className="hidden sm:inline">
                        Один вариант: комплект / комплект+монтаж / под ключ. Смета складывается из статей как в типовом КП (комплект + доставка + монтаж ~33% + фундамент).
                      </span>
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {workPackages.map(pkg => {
                        const isSel = state.workPackage === pkg.id;
                        return (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => setWorkPackage(pkg.id)}
                            className="text-left transition-all duration-200 p-3 sm:p-4"
                            style={{
                              background: isSel ? "rgba(237,28,36,0.07)" : "rgba(26,26,46,0.025)",
                              border: `1.5px solid ${isSel ? "rgba(237,28,36,0.45)" : "rgba(26,26,46,0.07)"}`,
                              borderRadius: "1rem",
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 rounded-full border-2" style={{
                                borderColor: isSel ? "var(--ms-orange)" : "rgba(26,26,46,0.2)",
                                background: isSel ? "var(--ms-orange)" : "transparent",
                              }}>
                                {isSel && <Check size={11} style={{ color: "white" }} />}
                              </div>
                              <div>
                                <div className="ms-heading" style={{ fontSize: "0.98rem", color: isSel ? "#1A1A2E" : "rgba(26,26,46,0.58)" }}>
                                  {WORK_PACKAGE_LABELS[pkg.id]}
                                </div>
                                <div className="hidden sm:block" style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.78rem", color: "rgba(26,26,46,0.38)", fontWeight: 300, marginTop: "4px", lineHeight: 1.55 }}>
                                  {pkg.hint}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 — Options */}
                {step === 4 && (
                  <motion.div key="step4" className="p-4 sm:p-6 lg:p-8"
                    initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.22 }}>
                    <h3 className="ms-heading mb-1 text-base sm:text-[1.2rem]" style={{ color: "#1A1A2E" }}>Доп. опции</h3>
                    <p className="mb-4 sm:mb-6 text-xs sm:text-[0.82rem]" style={{ fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.4)", fontWeight: 300 }}>
                      Необязательно — можно пропустить
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {optionsList.map(opt => {
                        const lockedFund = opt.id === "fundament" && state.workPackage === "pod_klyuch";
                        const isSel = lockedFund || state.options.includes(opt.id);
                        const body = (
                          <>
                            <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200" style={{
                              background: isSel ? "var(--ms-orange)" : "transparent",
                              border: `1.5px solid ${isSel ? "var(--ms-orange)" : "rgba(26,26,46,0.14)"}`,
                              borderRadius: "4px",
                            }}>
                              {isSel && <Check size={11} style={{ color: "white" }} />}
                            </div>
                            <div>
                              <div className="ms-heading text-[0.88rem] sm:text-[0.93rem]" style={{ color: isSel ? "#1A1A2E" : "rgba(26,26,46,0.58)" }}>{opt.label}</div>
                              <div className="hidden sm:block" style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.76rem", color: "rgba(26,26,46,0.38)", fontWeight: 300, marginTop: "2px" }}>{opt.desc}</div>
                              <div className="hidden sm:block" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.56rem", color: isSel ? "var(--ms-orange)" : "rgba(26,26,46,0.28)", marginTop: "5px" }}>
                                {lockedFund ? "включено в «Под ключ»" : opt.hint}
                              </div>
                            </div>
                          </>
                        );
                        if (lockedFund) {
                          return (
                            <div
                              key={opt.id}
                              className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4 text-left"
                              style={{
                                background: "rgba(237,28,36,0.05)",
                                border: "1.5px solid rgba(26,26,46,0.1)",
                                borderRadius: "1rem",
                                cursor: "default",
                              }}
                            >
                              {body}
                            </div>
                          );
                        }
                        return (
                          <button key={opt.id} type="button" onClick={() => toggleOption(opt.id)}
                            className="flex items-start gap-3 p-3 sm:gap-4 sm:p-4 text-left transition-all duration-200"
                            style={{
                              background: isSel ? "rgba(237,28,36,0.07)" : "rgba(26,26,46,0.025)",
                              border: `1.5px solid ${isSel ? "rgba(237,28,36,0.4)" : "rgba(26,26,46,0.07)"}`,
                              borderRadius: "1rem",
                            }}
                          >
                            {body}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 5 — Region */}
                {step === 5 && (
                  <motion.div key="step5" className="p-4 sm:p-6 lg:p-8"
                    initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -28 }} transition={{ duration: 0.22 }}>
                    <h3 className="ms-heading mb-1 text-base sm:text-[1.2rem]" style={{ color: "#1A1A2E" }}>Регион строительства</h3>
                    <p className="mb-4 sm:mb-6 text-xs sm:text-[0.82rem]" style={{ fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.4)", fontWeight: 300 }}>
                      Влияет на коэффициент логистики и монтажа
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {regionsList.map(region => {
                        const isSel = state.region === region;
                        const mult = REGION_MULT[region] || 1.0;
                        return (
                          <button key={region} onClick={() => setState(s => ({ ...s, region }))}
                            className="flex items-center justify-between px-3 py-2.5 sm:px-4 sm:py-3 text-left transition-all duration-200"
                            style={{
                              background: isSel ? "rgba(237,28,36,0.07)" : "rgba(26,26,46,0.025)",
                              border: `1.5px solid ${isSel ? "rgba(237,28,36,0.4)" : "rgba(26,26,46,0.07)"}`,
                              borderRadius: "0.75rem",
                            }}
                          >
                            <span className="text-[0.82rem] sm:text-[0.92rem] leading-tight" style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, color: isSel ? "#1A1A2E" : "rgba(26,26,46,0.58)" }}>
                              {region}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {mult > 1.0 && (
                                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.54rem", color: "rgba(26,26,46,0.28)" }}>
                                  ×{mult.toFixed(2)}
                                </span>
                              )}
                              {isSel && <Check size={14} style={{ color: "var(--ms-orange)" }} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* STEP 6 — Result */}
                {step === 6 && (
                  <motion.div key="step6" className="p-4 sm:p-6 lg:p-8"
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    {!sent ? (
                      <>
                        {/* Dark price card */}
                        <div className="mb-4 p-4 sm:mb-6 sm:p-5 rounded-xl sm:rounded-2xl" style={{
                          background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)",
                          border: "1px solid rgba(237,28,36,0.18)",
                        }}>
                          <div style={{
                            fontFamily: "IBM Plex Mono, monospace", fontSize: "0.52rem",
                            letterSpacing: "0.14em", textTransform: "uppercase",
                            color: "rgba(255,255,255,0.3)", marginBottom: "6px",
                          }}>Предварительная стоимость</div>
                          <motion.div
                            className="text-[clamp(1.45rem,7vw,2.8rem)]"
                            style={{ fontFamily: "Bebas Neue, sans-serif", color: "#ED1C24", lineHeight: 1, marginBottom: "3px" }}
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
                          >
                            {price.min > 0
                              ? `${price.min.toLocaleString("ru-RU")} — ${price.max.toLocaleString("ru-RU")} ₽`
                              : "—"}
                          </motion.div>
                          <div className="mb-3 sm:mb-4 text-[0.55rem] sm:text-[0.58rem]" style={{ fontFamily: "IBM Plex Mono, monospace", color: "rgba(255,255,255,0.28)" }}>
                            Площадь: {state.length * state.width} м²
                            {price.min > 0 && state.length * state.width > 0 ? (
                              <>
                                {" "}· ~{(estimate?.pricePerM2 ?? Math.round((price.min + price.max) / 2 / (state.length * state.width))).toLocaleString("ru-RU")} ₽/м²
                              </>
                            ) : (
                              <>
                                <span className="hidden sm:inline"> · уточните габариты на шаге 2, если сумма не появилась</span>
                                <span className="sm:hidden"> · шаг 2</span>
                              </>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                            {[
                              { label: "Тип",     val: getBuildingTypeDef(state.type)?.label || "" },
                              { label: "Размеры", val: `${state.length}×${state.width}×${state.height} м` },
                              { label: "Объём работ", val: WORK_PACKAGE_LABELS[state.workPackage] },
                              { label: "Регион",  val: state.region },
                            ].map(({ label, val }) => (
                              <div key={label}>
                                <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.5rem", color: "rgba(255,255,255,0.24)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
                                <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600, fontSize: "0.85rem", color: "rgba(255,255,255,0.68)" }}>{val}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contact form */}
                        <div>
                          <div className="ms-label mb-3 sm:mb-4">Получить точный расчёт от инженера</div>
                          <p className="mb-2 sm:mb-3 text-xs sm:text-[0.78rem] hidden sm:block" style={{ fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.45)", fontWeight: 300 }}>
                            Для КП в формате ТЗ (как у промышленных производителей): адрес площадки, ворота/двери и кран — по желанию; попадут в PDF и заявку.
                          </p>
                          <p className="mb-2 sm:mb-3 text-xs sm:hidden" style={{ fontFamily: "Barlow, sans-serif", color: "rgba(26,26,46,0.45)", fontWeight: 300 }}>
                            Адрес, ворота, двери, кран — по желанию, в PDF.
                          </p>
                          <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <input
                              type="text"
                              aria-label="Адрес или район строительства"
                              placeholder="Адрес или район строительства (для раздела 1 КП)"
                              value={kpExtra.constructionSite}
                              onChange={e => setKpExtra(x => ({ ...x, constructionSite: e.target.value }))}
                              className="px-4 py-2.5 outline-none sm:col-span-2"
                              style={{ background: "rgba(26,26,46,0.03)", border: "1px solid rgba(26,26,46,0.08)", color: "#1A1A2E", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem", borderRadius: "0.75rem" }}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                              <input
                                type="text"
                                aria-label="Ворота"
                                placeholder="Ворота (напр. 3×3 м, секционные — 2 шт.)"
                                value={kpExtra.gatesNote}
                                onChange={e => setKpExtra(x => ({ ...x, gatesNote: e.target.value }))}
                                className="px-4 py-2.5 outline-none"
                                style={{ background: "rgba(26,26,46,0.03)", border: "1px solid rgba(26,26,46,0.08)", color: "#1A1A2E", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem", borderRadius: "0.75rem" }}
                              />
                              <input
                                type="text"
                                aria-label="Двери"
                                placeholder="Двери (напр. 1,5×2,1 м — 1 шт.)"
                                value={kpExtra.doorsNote}
                                onChange={e => setKpExtra(x => ({ ...x, doorsNote: e.target.value }))}
                                className="px-4 py-2.5 outline-none"
                                style={{ background: "rgba(26,26,46,0.03)", border: "1px solid rgba(26,26,46,0.08)", color: "#1A1A2E", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem", borderRadius: "0.75rem" }}
                              />
                            </div>
                            <select
                              aria-label="Кран-балка"
                              value={kpExtra.craneLoad}
                              onChange={e => setKpExtra(x => ({ ...x, craneLoad: e.target.value }))}
                              className="px-4 py-2.5 outline-none"
                              style={{ background: "rgba(26,26,46,0.03)", border: "1px solid rgba(26,26,46,0.08)", color: "#1A1A2E", fontFamily: "Barlow, sans-serif", fontSize: "0.85rem", borderRadius: "0.75rem" }}
                            >
                              <option value="">Нагрузка от кран-балки: по умолчанию — без кран-балки</option>
                              <option value="Без кран-балки">Без кран-балки</option>
                              <option value="Кран-балка Q ≤ 3,2 т (уточняется)">Кран-балка Q ≤ 3,2 т (уточняется)</option>
                              <option value="Кран-балка Q ≤ 5,0 т (уточняется)">Кран-балка Q ≤ 5,0 т (уточняется)</option>
                              <option value="Мостовой кран (уточняется по ТЗ)">Мостовой кран (уточняется по ТЗ)</option>
                            </select>
                          </div>
                          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            <input
                              id="calc-name" name="name" type="text" autoComplete="name"
                              aria-label="Ваше имя" placeholder="Ваше имя"
                              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                              className="px-4 py-3 outline-none"
                              style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", color: "#1A1A2E", fontFamily: "Barlow, sans-serif", fontSize: "0.9rem", borderRadius: "0.75rem" }}
                              onFocus={e => e.currentTarget.style.borderColor = "rgba(237,28,36,0.5)"}
                              onBlur={e => e.currentTarget.style.borderColor = "rgba(26,26,46,0.09)"}
                            />
                            <PhoneInput
                              id="calc-phone" aria-label="Телефон"
                              value={form.phone} onChange={val => setForm(f => ({ ...f, phone: val }))} required
                              className="px-4 py-3 outline-none"
                              style={{ background: "rgba(26,26,46,0.04)", border: "1px solid rgba(26,26,46,0.09)", color: "#1A1A2E", fontFamily: "Barlow, sans-serif", fontSize: "0.9rem", borderRadius: "0.75rem" }}
                              onFocus={e => e.currentTarget.style.borderColor = "rgba(237,28,36,0.5)"}
                              onBlur={e => e.currentTarget.style.borderColor = "rgba(26,26,46,0.09)"}
                            />
                            <button type="submit" className="ms-btn-primary sm:col-span-2 justify-center">
                              Получить точный расчёт <ArrowRight size={16} />
                            </button>
                          </form>
                          <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.5rem", color: "rgba(26,26,46,0.2)", letterSpacing: "0.08em", marginTop: "8px" }}>
                            Нажимая кнопку, вы соглашаетесь с{" "}
                            <Link href="/politika-konfidencialnosti" style={{ color: "rgba(26,26,46,0.45)", textDecoration: "underline", textUnderlineOffset: "2px" }}>
                              политикой конфиденциальности
                            </Link>
                          </p>
                        </div>
                      </>
                    ) : (
                      <motion.div className="flex flex-col items-center justify-center py-10 text-center"
                        initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="w-16 h-16 flex items-center justify-center mb-6" style={{
                          background: "rgba(237,28,36,0.09)", border: "1px solid rgba(237,28,36,0.28)", borderRadius: "50%",
                        }}>
                          <Check size={28} style={{ color: "var(--ms-orange)" }} />
                        </div>
                        <h3 className="ms-heading mb-2" style={{ fontSize: "1.4rem", color: "#1A1A2E" }}>Заявка отправлена!</h3>
                        <p style={{ fontFamily: "Barlow, sans-serif", fontSize: "0.9rem", color: "rgba(26,26,46,0.55)", fontWeight: 300, maxWidth: "320px", marginBottom: "24px" }}>
                          Менеджер свяжется с вами в течение 1 рабочего дня с точным расчётом
                        </p>
                        <button
                          onClick={handleDownloadKp}
                          disabled={downloading || !estimate || price.min <= 0}
                          className="ms-btn-primary justify-center"
                          style={{
                            minWidth: "240px",
                            opacity: downloading || !estimate || price.min <= 0 ? 0.45 : 1,
                            cursor: downloading ? "wait" : (!estimate || price.min <= 0 ? "not-allowed" : "pointer"),
                          }}
                        >
                          {downloading ? (
                            <>
                              <svg className="animate-spin" style={{ marginRight: "8px" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                              </svg>
                              Формируется КП...
                            </>
                          ) : (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "6px" }}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              Скачать КП (PDF)
                            </>
                          )}
                        </button>
                        <p style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: "0.5rem", color: "rgba(26,26,46,0.22)", letterSpacing: "0.07em", marginTop: "10px" }}>
                          Коммерческое предложение на основе вашего расчёта
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            {step < 6 && (
              <div className="flex items-center justify-between gap-2 mt-3 sm:mt-4">
                <button onClick={prev} disabled={step === 1}
                  className="flex items-center gap-1.5 sm:gap-2 transition-colors duration-200 text-[0.72rem] sm:text-[0.8rem]"
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif", fontWeight: 600,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    color: step === 1 ? "rgba(26,26,46,0.15)" : "rgba(26,26,46,0.5)",
                    cursor: step === 1 ? "not-allowed" : "pointer",
                  }}>
                  <ArrowLeft size={14} /> Назад
                </button>
                <button onClick={next} disabled={!canNext()} className="ms-btn-primary text-sm sm:text-base px-4 py-2.5 sm:px-5 sm:py-3"
                  style={{ opacity: canNext() ? 1 : 0.38, cursor: canNext() ? "pointer" : "not-allowed" }}>
                  {step === 5 ? "Рассчитать" : "Далее"} <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

          {/* ── Right: Live price panel (desktop only) ── */}
          <div className="hidden lg:block">
            <LivePricePanel state={state} />
          </div>
        </div>
      </div>
    </section>
  );
}

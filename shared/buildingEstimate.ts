/**
 * Оценка стоимости в логике профессионального КП (ПК Веста и аналоги):
 * комплект завода + доставка + монтаж (доля от комплекта) + фундамент + проект/бумага.
 * Одна формула для калькулятора на сайте и для строк PDF.
 */

import { BUILDING_KIT_BASE_RUB_M2 } from "./buildingCatalog";

export const REGION_MULT: Record<string, number> = {
  "Москва и МО": 1.15,
  "Санкт-Петербург": 1.12,
  "Краснодарский край": 1.05,
  Татарстан: 1.02,
  "Свердловская обл.": 1.08,
  "Новосибирская обл.": 1.06,
  "Ростовская обл.": 1.04,
  "Другой регион": 1.0,
};

export const REGION_KM_ROUGH: Record<string, number> = {
  "Москва и МО": 150,
  "Санкт-Петербург": 700,
  "Краснодарский край": 1200,
  Татарстан: 600,
  "Свердловская обл.": 1800,
  "Новосибирская обл.": 3200,
  "Ростовская обл.": 900,
  "Другой регион": 500,
};

/**
 * База комплекта ₽/м² пола (ЛМК + типовой контур ОК), без фундамента и без монтажа.
 * Ключи синхронизированы с `shared/buildingCatalog.ts` (KIT_BASE_RUB_M2).
 */
export const KIT_BASE_RUB_M2: Record<string, number> = {
  ...BUILDING_KIT_BASE_RUB_M2,
};

/** Дополнения к комплекту ₽/м² (не фундамент) */
export const OPT_ADD_RUB_M2: Record<string, number> = {
  uteplenie: 1750,
  pokraska: 520,
  ocinkovka: 880,
  fundament: 0,
};

/** Доля монтажа от стоимости комплекта — как в типовом КП Веста (~33%) */
export const MONTAZH_KIT_RATIO = 0.33;

/** Фундамент: ₽/м² пола × регион, с потолком относительно остальных статей */
export const FUNDAMENT_RUB_M2_BASE = 8400;

export const DESIGN_OFFICE_RUB = 1000;

export type WorkPackageId = "komplekt" | "komplekt_montazh" | "pod_klyuch";

export interface ProjectEstimateInput {
  buildingTypeId: string;
  length: number;
  width: number;
  height: number;
  frameStepM?: number;
  roofPitchDeg?: number;
  workPackage: WorkPackageId;
  options: string[];
  region: string;
}

export interface ProjectEstimateResult {
  area: number;
  kitRub: number;
  deliveryRub: number;
  montazhRub: number;
  fundamentRub: number;
  designRub: number;
  totalRub: number;
  totalMin: number;
  totalMax: number;
  pricePerM2: number;
  servicesForApi: string[];
  optionsForApi: string[];
  hasProekt: boolean;
}

export function estimateDeliveryRub(region: string, area: number): number {
  const km = REGION_KM_ROUGH[region] ?? 500;
  const r = REGION_MULT[region] || 1;
  const trucks = Math.max(3, Math.min(10, Math.ceil(area / 100)));
  const perTruck = Math.round((14500 + km * 48) * r);
  return Math.round((perTruck * trucks) / 1000) * 1000;
}

function heightCoef(heightM: number): number {
  return 1 + Math.max(0, heightM - 6) * 0.028;
}

function geometryCoef(frameStepM: number | undefined, roofPitchDeg: number | undefined): number {
  const step = frameStepM && frameStepM > 0 ? frameStepM : 6;
  const stepAdj = 1 + Math.max(0, 6 / Math.min(step, 6) - 1) * 0.11;
  const pitch = roofPitchDeg ?? 10;
  const pitchAdj = 1 + Math.max(0, pitch - 12) * 0.0025;
  return stepAdj * pitchAdj;
}

export const WORK_PACKAGE_LABELS: Record<WorkPackageId, string> = {
  komplekt: "Комплект завода",
  komplekt_montazh: "Комплект + монтаж",
  pod_klyuch: "Под ключ (СМР + фундамент)",
};

export function estimateProject(input: ProjectEstimateInput): ProjectEstimateResult | null {
  const area = input.length * input.width;
  if (!input.buildingTypeId || area <= 0 || input.length <= 0 || input.width <= 0) return null;

  const r = REGION_MULT[input.region] || 1;
  const base = KIT_BASE_RUB_M2[input.buildingTypeId] ?? KIT_BASE_RUB_M2.other;
  const optAdd = input.options
    .filter(o => o !== "fundament")
    .reduce((acc, o) => acc + (OPT_ADD_RUB_M2[o] || 0), 0);

  const kitPerM2 = base + optAdd;
  const kitRubRaw = area * kitPerM2 * r * heightCoef(input.height) * geometryCoef(input.frameStepM, input.roofPitchDeg);
  let kitRub = Math.round(kitRubRaw / 1000) * 1000;

  const deliveryRub = estimateDeliveryRub(input.region, area);

  const hasMontage = input.workPackage === "komplekt_montazh" || input.workPackage === "pod_klyuch";
  let montazhRub = 0;
  if (hasMontage) {
    montazhRub = Math.round(kitRub * MONTAZH_KIT_RATIO / 1000) * 1000;
  }

  const needFundament =
    input.workPackage === "pod_klyuch" || input.options.includes("fundament");
  let fundamentRub = 0;
  if (needFundament) {
    fundamentRub = Math.round((area * FUNDAMENT_RUB_M2_BASE * r) / 1000) * 1000;
    const cap = Math.round((kitRub + montazhRub + deliveryRub) * 0.52);
    fundamentRub = Math.min(fundamentRub, cap);
  }

  const hasProekt = input.workPackage === "pod_klyuch";
  const designRub = hasProekt ? DESIGN_OFFICE_RUB : 0;

  const totalRub = kitRub + deliveryRub + montazhRub + fundamentRub + designRub;
  const totalMin = Math.round((totalRub * 0.93) / 1000) * 1000;
  const totalMax = Math.round((totalRub * 1.07) / 1000) * 1000;
  const pricePerM2 = Math.round(totalRub / area);

  const servicesForApi =
    input.workPackage === "pod_klyuch"
      ? ["klyuch"]
      : input.workPackage === "komplekt_montazh"
        ? ["izgotovlenie", "montazh"]
        : ["izgotovlenie"];

  const optionsForApi = [...input.options];
  if (input.workPackage === "pod_klyuch" && !optionsForApi.includes("fundament")) {
    optionsForApi.push("fundament");
  }

  return {
    area,
    kitRub,
    deliveryRub,
    montazhRub,
    fundamentRub,
    designRub,
    totalRub,
    totalMin,
    totalMax,
    pricePerM2,
    servicesForApi,
    optionsForApi,
    hasProekt,
  };
}

export function estimateFromKpPayload(payload: {
  buildingTypeId: string;
  length: number;
  width: number;
  height: number;
  region: string;
  options: string[];
  services: string[];
  frameStepM?: number;
  roofPitchDeg?: number;
}): ProjectEstimateResult | null {
  const wp: WorkPackageId = payload.services.includes("klyuch")
    ? "pod_klyuch"
    : payload.services.includes("montazh")
      ? "komplekt_montazh"
      : "komplekt";
  const opts = [...(payload.options || [])];
  return estimateProject({
    buildingTypeId: payload.buildingTypeId,
    length: Number(payload.length),
    width: Number(payload.width),
    height: Number(payload.height),
    frameStepM: payload.frameStepM,
    roofPitchDeg: payload.roofPitchDeg,
    workPackage: wp,
    options: opts,
    region: payload.region || "Другой регион",
  });
}

/** Подсказка «от … ₽/м²» только по комплекту (для карточек типов), без доставки/СМР */
export function kitFloorHintRubM2(typeId: string): number {
  return Math.round((KIT_BASE_RUB_M2[typeId] ?? KIT_BASE_RUB_M2.other) * 0.92);
}

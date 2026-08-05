import puppeteer from "puppeteer";
import {
  estimateFromKpPayload,
  estimateDeliveryRub,
  REGION_MULT,
  REGION_KM_ROUGH,
  KIT_BASE_RUB_M2,
  OPT_ADD_RUB_M2,
} from "../shared/buildingEstimate";
import { mapWebsteelLinesToParts } from "./websteelBreakdown";
import type { WebsteelPriceLine } from "./websteel";

const FREONN_LOGO =
  "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyOC4yLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCA4NDEuOSAyNjguNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgODQxLjkgMjY4LjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtmaWxsOiMyRTMxOTI7fQ0KCS5zdDF7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojRUQxQzI0O30NCgkuc3Qye2ZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6IzJFMzE5Mjt9DQo8L3N0eWxlPg0KPGc+DQoJPGc+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNy42LDEwNi43Yy0wLjQsMC0wLjctMC4yLTAuNy0wLjdWODYuNWMwLjEtMC41LDAuNC0wLjgsMC44LTAuOEgxMTJjMC41LDAuMiwwLjgsMC40LDAuOCwwLjh2MTkuNA0KCQkJYzAsMC41LTAuMywwLjgtMC44LDAuOEgyNy42eiBNMjcsMTI4YzAtMC40LDAuMi0wLjcsMC43LTAuN2g4NC4xYzAuNSwwLDAuOCwwLjIsMC44LDAuN3YyMGMwLDAuNC0wLjMsMC43LTAuOCwwLjdINDguNA0KCQkJYy0wLjQsMC0wLjYsMC4yLTAuNiwwLjZ2NDAuNWMwLDAuNC0wLjIsMC43LTAuNywwLjdIMjcuN2MtMC41LDAtMC44LTAuMy0wLjgtMC44VjEyOHoiLz4NCgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTEzMS44LDEyNy4zaDYyLjdjMi44LDAsNC45LTAuOSw2LjUtMi43YzEuMy0xLjQsMi4yLTMuMSwyLjYtNS4yYzAuNC0yLDAuMy00LTAuMy01LjkNCgkJCWMtMC42LTEuOS0xLjYtMy41LTMtNC44Yy0xLjUtMS4zLTMuNC0yLTUuNy0yaC0yNWMtMC4yLDAtMC40LDAuMS0wLjYsMC4zYy0wLjIsMC4yLTAuMiwwLjQsMCwwLjdsMy42LDUuNA0KCQkJYzAuMSwwLjIsMC4yLDAuNCwwLjEsMC43Yy0wLjEsMC4yLTAuMywwLjMtMC41LDAuM2gtMjEuOWMtMC4zLDAtMC41LTAuMS0wLjYtMC4zYy0wLjgtMS4yLTItMy0zLjYtNS4zYy0xLjYtMi4zLTMuMi00LjktNS03LjUNCgkJCWMtMS44LTIuNy0zLjUtNS4zLTUuMi03LjljLTEuNy0yLjYtMy4xLTQuNy00LjItNi40Yy0wLjItMC4yLTAuMi0wLjQtMC4xLTAuN2MwLjEtMC4yLDAuMy0wLjMsMC41LTAuM2g2MS44DQoJCQljNC45LDAsOS41LDEuMSwxMy44LDMuNGM0LjMsMi4zLDcuOSw1LjMsMTAuOSw5LjFjMi43LDMuNCw0LjYsNy41LDUuNiwxMi4zYzEuMSw0LjgsMS4yLDkuNiwwLjMsMTQuM2MtMC45LDQuOC0yLjgsOS4yLTUuOCwxMy4yDQoJCQljLTMsNC03LjIsNy0xMi42LDguOGMtMS41LDAuNC0zLDAuNy00LjUsMC45Yy0xLjUsMC4yLTMsMC40LTQuNSwwLjZjLTAuMiwwLTAuNCwwLjEtMC41LDAuM2MtMC4xLDAuMi0wLjEsMC40LDAuMSwwLjZsMjYuNiw0MC4yDQoJCQljMC4xLDAuMiwwLjIsMC40LDAuMSwwLjdjLTAuMSwwLjItMC4zLDAuMy0wLjYsMC4zaC0yMS45Yy0wLjMsMC0wLjUtMC4xLTAuNi0wLjNjLTAuNC0wLjctMS41LTIuNC0zLjEtNC45DQoJCQljLTEuNi0yLjUtMy43LTUuNi02LjEtOS4zYy0yLjUtMy43LTUuMi03LjgtOC4zLTEyLjVjLTMuMS00LjYtNi4yLTkuNS05LjYtMTQuNmMtMC4yLTAuMS0wLjMtMC4yLTAuNi0wLjJoLTE5LjYNCgkJCWMtMC40LDAtMC43LDAuMi0wLjcsMC42djQwLjRjMCwwLjUtMC4zLDAuOC0wLjgsMC44aC0xOS40Yy0wLjUsMC0wLjgtMC4zLTAuOC0wLjhWMTI4QzEzMS4xLDEyNy42LDEzMS4zLDEyNy4zLDEzMS44LDEyNy4zeiIvPg0KCQk8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjM5LjQsMTA2LjdjLTAuNCwwLTAuNy0wLjItMC43LTAuN1Y4Ni41YzAuMS0wLjUsMC40LTAuOCwwLjgtMC44aDg0LjNjMC41LDAuMiwwLjgsMC40LDAuOCwwLjh2MTkuNA0KCQkJYzAsMC41LTAuMywwLjgtMC44LDAuOEgyMzkuNHogTTIzOC44LDEyOGMwLTAuNCwwLjItMC43LDAuNy0wLjdoODQuMWMwLjUsMCwwLjgsMC4yLDAuOCwwLjd2MjBjMCwwLjQtMC4zLDAuNy0wLjgsMC43aC02My40DQoJCQljLTAuNCwwLTAuNiwwLjItMC42LDAuNnYxOS4zYzAsMC40LDAuMiwwLjYsMC42LDAuNmg2My42YzAuMiwwLjIsMC40LDAuMywwLjYsMC4zYzAuMSwwLjEsMC4yLDAuMiwwLjIsMC40djE5LjgNCgkJCWMwLDAuNS0wLjMsMC44LTAuOCwwLjhoLTg0LjNjLTAuNSwwLTAuOC0wLjMtMC44LTAuOFYxMjh6Ii8+DQoJCTxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik01NzIuMyw4NS43aDIyLjFjMC4xLDAsMC4zLDAuMSwwLjQsMC4ybDY3LjksNzYuOGMwLjIsMC4yLDAuNSwwLjMsMC43LDAuMmMwLjMtMC4xLDAuNC0wLjMsMC40LTAuN1Y4Ni41DQoJCQljMC4yLTAuNSwwLjUtMC44LDAuOC0wLjhoMTkuOGMwLjUsMC4yLDAuOCwwLjQsMC44LDAuOHYxMDMuMWMwLDAuNS0wLjMsMC44LTAuOCwwLjhoLTI0LjhjLTAuMiwwLTAuMy0wLjEtMC40LTAuMg0KCQkJYy00LjktNS42LTEwLjctMTIuMS0xNy4zLTE5LjRjLTUuNy02LjMtMTIuNS0xNC4xLTIwLjYtMjMuMmMtOC4xLTkuMi0xNy4zLTE5LjYtMjcuNy0zMS41Yy0wLjItMC4yLTAuNC0wLjMtMC42LTAuMg0KCQkJYy0wLjMsMC4xLTAuNCwwLjMtMC40LDAuNlYxOTBjMCwwLjUtMC4zLDAuOC0wLjksMC44aC0xOS4zYy0wLjQsMC0wLjctMC4yLTAuNy0wLjdWODYuM0M1NzEuNiw4NS45LDU3MS44LDg1LjcsNTcyLjMsODUuN3oiLz4NCgkJPHBhdGggY2xhc3M9InN0MCIgZD0iTTcwNC4xLDg1LjdoMjIuMWMwLjEsMCwwLjMsMC4xLDAuNCwwLjJsNjcuOSw3Ni44YzAuMiwwLjIsMC41LDAuMywwLjcsMC4yYzAuMy0wLjEsMC40LTAuMywwLjQtMC43Vjg2LjUNCgkJCWMwLjItMC41LDAuNS0wLjgsMC44LTAuOGgxOS44YzAuNSwwLjIsMC44LDAuNCwwLjgsMC44djEwMy4xYzAsMC41LTAuMywwLjgtMC44LDAuOGgtMjQuOGMtMC4yLDAtMC4zLTAuMS0wLjQtMC4yDQoJCQljLTQuOS01LjYtMTAuNy0xMi4xLTE3LjMtMTkuNGMtNS43LTYuMy0xMi41LTE0LjEtMjAuNi0yMy4yYy04LjEtOS4yLTE3LjMtMTkuNi0yNy43LTMxLjVjLTAuMi0wLjItMC40LTAuMy0wLjYtMC4yDQoJCQljLTAuMywwLjEtMC40LDAuMy0wLjQsMC42VjE5MGMwLDAuNS0wLjMsMC44LTAuOSwwLjhoLTE5LjNjLTAuNCwwLTAuNy0wLjItMC43LTAuN1Y4Ni4zQzcwMy40LDg1LjksNzAzLjYsODUuNyw3MDQuMSw4NS43eiIvPg0KCTwvZz4NCgk8Zz4NCgkJPGc+DQoJCQk8cGF0aCBjbGFzcz0ic3QxIiBkPSJNNTU4LDE0My42Yy0wLjUtMTIuNC0xMi4zLTI0LjMtMzEtMzMuNmMtNy40LTMuNy0xNi02LjUtMjUuMi05LjVjLTEyLjgtNC4yLTQ2LTExLjItNDYtMTEuMmwwLjEsOTcuNw0KCQkJCWMwLDAsMCwwLDAsMGwwLDU5YzM3LjUtMSw3My41LTIxLjcsOTIuMi01Ny4zYzMuMy02LjQsOS40LTIwLjUsOS45LTQyLjJDNTU4LjEsMTQ2LjEsNTU4LDE0NC4xLDU1OCwxNDMuNnoiLz4NCgkJCTxwYXRoIGNsYXNzPSJzdDEiIGQ9Ik00ODUuNSw4N2MxNy4zLDMuMiwzMi45LDguMiw0NS43LDE0LjVjMTIuMSw2LDIxLjgsMTMuMiwyOC4xLDIxLjJjLTQuOS0zMi41LTI0LjgtNjIuNC01Ni4xLTc4LjkNCgkJCQljLTE1LjEtOC0zMS4zLTEyLTQ3LjMtMTIuM2wwLDIwLjFDNDU1LjksNjkuMSw0NjguMiw4My44LDQ4NS41LDg3TDQ4NS41LDg3eiIvPg0KCQk8L2c+DQoJCTxnPg0KCQkJPHBhdGggY2xhc3M9InN0MiIgZD0iTTM0MS45LDE0NC4xYzAuNS0xMi40LDExLjgtMjUuNSwzMS0zMy42YzQ0LjYtMTguNyw3MC45LTIwLjIsNzAuOS0yMC4yczAuMSwzNS40LDAuMSw0NS40bDAsNTEuOA0KCQkJCWMwLDAsMCwwLDAsMGwwLDU5Yy0zNy41LTEtNzMuNS0yMS43LTkyLjItNTcuM2MtMy4zLTYuNC05LjQtMjAuNS05LjktNDIuMkMzNDEuNywxNDYuNiwzNDEuOCwxNDQuNiwzNDEuOSwxNDQuMXoiLz4NCgkJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik00MTQuMiw4Ny41Yy0xNy4zLDMuMi0zMi45LDguMi00NS43LDE0LjVjLTEyLjEsNi0yMS44LDEzLjItMjguMSwyMS4yYzQuOS0zMi41LDI0LjgtNjIuNCw1Ni4xLTc4LjkNCgkJCQljMTUuMS04LDMxLjMtMTIsNDcuMy0xMi4zbDAsMjAuMUM0NDMuOCw2OS42LDQzMS41LDg0LjMsNDE0LjIsODcuNUw0MTQuMiw4Ny41eiIvPg0KCQk8L2c+DQoJPC9nPg0KPC9nPg0KPC9zdmc+DQo=";

export interface KpData {
  appNumber: string;
  date: string;
  clientName: string;
  clientPhone: string;
  buildingType: string;
  buildingTypeId: string;
  length: number;
  width: number;
  height: number;
  services: string[];
  servicesLabels: string[];
  options: string[];
  optionsLabels: string[];
  region: string;
  priceMin: number;
  priceMax: number;
  /** Полный адрес или район площадки (если пусто — в ТЗ подставляется регион) */
  constructionSite?: string;
  /** Тип рамы, по умолчанию как в типовом КП */
  frameType?: string;
  /** Шаг рам / колонн, м */
  frameStepM?: number;
  /** Угол кровли, град. */
  roofPitchDeg?: number;
  /** Высота цоколя, м */
  plinthM?: number;
  /** Текст про тепловой контур */
  thermalContour?: string;
  /** «Без кран-балки» или нагрузка крана */
  craneLoad?: string;
  /** Степень огнестойкости здания */
  fireResistance?: string;
  /** Примечание по воротам для сметы */
  gatesNote?: string;
  /** Примечание по дверям */
  doorsNote?: string;
  /** Строки сметы WebSteel (Project), если получены при live-оценке */
  websteelLines?: WebsteelPriceLine[];
  /** Итог WebSteel, ₽ — для согласования PDF и графика оплат */
  websteelTotalRub?: number;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function computeKpBreakdown(data: KpData) {
  const est = estimateFromKpPayload({
    buildingTypeId: data.buildingTypeId,
    length: data.length,
    width: data.width,
    height: data.height,
    region: data.region,
    options: data.options,
    services: data.services,
    frameStepM: data.frameStepM,
    roofPitchDeg: data.roofPitchDeg,
  });
  const area = Math.max(0, data.length * data.width);
  const regionMult = REGION_MULT[data.region] || 1.0;
  if (!est) {
    return {
      area,
      regionMult,
      totalMid: (data.priceMin + data.priceMax) / 2,
      delivery: estimateDeliveryRub(data.region, Math.max(area, 1)),
      kitMid: 0,
      montazhPart: 0,
      fundamentPart: 0,
      designPaper: 0,
      hasMontazh: false,
      hasFundament: false,
      hasProekt: false,
    };
  }

  const base = {
    area: est.area,
    regionMult,
    totalMid: est.totalRub,
    delivery: est.deliveryRub,
    kitMid: est.kitRub,
    montazhPart: est.montazhRub,
    fundamentPart: est.fundamentRub,
    designPaper: est.designRub,
    hasMontazh: est.montazhRub > 0,
    hasFundament: est.fundamentRub > 0,
    hasProekt: est.hasProekt,
  };

  const wsTotal = data.websteelTotalRub;
  const wsLines = data.websteelLines;

  if (wsTotal && wsTotal > 0 && wsLines && wsLines.length > 0) {
    const p = mapWebsteelLinesToParts(wsLines, wsTotal);
    return {
      ...base,
      totalMid: wsTotal,
      kitMid: p.kitMid > 0 ? p.kitMid : base.kitMid,
      delivery: p.deliveryRub > 0 ? p.deliveryRub : base.delivery,
      montazhPart: p.montazhRub > 0 ? p.montazhRub : base.montazhPart,
      fundamentPart: p.fundamentRub > 0 ? p.fundamentRub : base.fundamentPart,
      hasMontazh: base.hasMontazh || p.montazhRub > 0,
      hasFundament: base.hasFundament || p.fundamentRub > 0,
    };
  }

  if (wsTotal && wsTotal > 0 && est.totalRub > 0) {
    const r = wsTotal / est.totalRub;
    return {
      ...base,
      totalMid: wsTotal,
      kitMid: Math.round(base.kitMid * r / 1000) * 1000,
      delivery: Math.round(base.delivery * r / 1000) * 1000,
      montazhPart: Math.round(base.montazhPart * r / 1000) * 1000,
      fundamentPart: Math.round(base.fundamentPart * r / 1000) * 1000,
    };
  }

  return base;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}

function fmtDate(d: Date): string {
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/** Дата заявки в шапке КП (ДД.ММ.ГГГГ) → локальная полуночь; при ошибке разбора — fallback. */
function parseKpApplicationDate(dateStr: string, fallback: Date): Date {
  const m = String(dateStr)
    .trim()
    .match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) {
    const f = new Date(fallback);
    return new Date(f.getFullYear(), f.getMonth(), f.getDate());
  }
  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3]);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
    const f = new Date(fallback);
    return new Date(f.getFullYear(), f.getMonth(), f.getDate());
  }
  return d;
}

/**
 * Календарные смещения от даты договора / предоплаты 70% (строка 1 графика) — ориентир как в типовом КП
 * (B114900). Интервалы после этапа «остаток 30% до отгрузки» задаются отступами от него, чтобы при
 * наличии фундамента даты шли по порядку строк (фундамент завершён → затем отгрузочный платёж).
 */
const PAY_SCHEDULE_FROM_CONTRACT = {
  /** Дней от даты заявки до ориентира «договор + предоплата 70%» */
  contractFromAppDays: 7,
  designStart: 21,
  designEndKmOk: 53,
  fundament40: 56,
  fundament50: 71,
  fundament10: 86,
  /** Ориентир остатка 30% (как в B114900), если фундамент не сдвигает цепочку */
  productionFinal30: 72,
  /** Доставка: через столько дней после этапа «30% до отгрузки» (в B114900 +2) */
  daysAfterProductionToDelivery: 2,
  /** 1-й платёж монтажа: через столько дней после этапа «30%» (в B114900 +3) */
  daysAfterProductionToMontazh1: 3,
  daysMontazh1ToMontazh2: 12,
  daysMontazh2ToMontazhEnd: 13,
  daysMontazhEndToProjectDone: 5,
  projectDoneNoMontazh: 95,
} as const;

function buildPaymentSchedule(data: KpData, generationNow: Date): string {
  const b = computeKpBreakdown(data);
  const prepay70 = Math.round(b.kitMid * 0.7);
  const final30 = b.kitMid - prepay70;

  const appDate = parseKpApplicationDate(data.date, generationNow);
  const contractDate = addDays(appDate, PAY_SCHEDULE_FROM_CONTRACT.contractFromAppDays);
  const C = contractDate;

  let rows = "";
  let i = 1;

  rows += `<tr>
    <td style="text-align:center;width:4%">${i++}</td>
    <td>Подписание договора с ООО «ЭКС». Предоплата за комплект здания <strong>(70%)</strong>. Закупка материалов и фиксирование цен по договору.</td>
    <td style="text-align:center;font-weight:bold;width:18%">${fmt(prepay70)}</td>
    <td style="text-align:center;width:12%">${fmtDate(C)}</td>
  </tr>`;

  if (b.hasProekt) {
    rows += `<tr>
      <td style="text-align:center">${i++}</td>
      <td>Начало проектирования разделов КМ, ОК (каркас, ограждающие конструкции). КЖ (фундамент) — при необходимости, отдельным соглашением.</td>
      <td style="text-align:center;color:#2E3192;font-weight:bold">ВКЛЮЧЕНО</td>
      <td style="text-align:center">${fmtDate(addDays(C, PAY_SCHEDULE_FROM_CONTRACT.designStart))}</td>
    </tr>`;
    if (b.hasFundament) {
      rows += `<tr>
      <td style="text-align:center">${i++}</td>
      <td>Выдача раздела КЖ (фундамент): уточнение стоимости земляных и фундаментных работ после геологии.</td>
      <td style="text-align:center">—</td>
      <td style="text-align:center">—</td>
    </tr>`;
    }
    rows += `<tr>
      <td style="text-align:center">${i++}</td>
      <td>Завершение проектирования КМ, ОК. Выдача проекта в PDF/DWG.</td>
      <td style="text-align:center;color:#2E3192;font-weight:bold">ГОТОВО</td>
      <td style="text-align:center">${fmtDate(addDays(C, PAY_SCHEDULE_FROM_CONTRACT.designEndKmOk))}</td>
    </tr>`;
  }

  if (b.hasFundament) {
    const f40 = Math.round(b.fundamentPart * 0.4);
    const f50 = Math.round(b.fundamentPart * 0.5);
    const f10 = b.fundamentPart - f40 - f50;
    rows += `<tr>
      <td style="text-align:center">${i++}</td>
      <td>1-я предоплата подрядчику СМР по земельным и фундаментным работам <strong>(40%)</strong>. Начало работ.</td>
      <td style="text-align:center;font-weight:bold">${fmt(f40)}</td>
      <td style="text-align:center">${fmtDate(addDays(C, PAY_SCHEDULE_FROM_CONTRACT.fundament40))}</td>
    </tr>`;
    rows += `<tr>
      <td style="text-align:center">${i++}</td>
      <td>2-я оплата подрядчику СМР по земельным и фундаментным работам <strong>(50%)</strong>.</td>
      <td style="text-align:center;font-weight:bold">${fmt(f50)}</td>
      <td style="text-align:center">${fmtDate(addDays(C, PAY_SCHEDULE_FROM_CONTRACT.fundament50))}</td>
    </tr>`;
    rows += `<tr>
      <td style="text-align:center">${i++}</td>
      <td>Фундамент завершён. Финальная оплата <strong>(10%)</strong> по договору СМР.</td>
      <td style="text-align:center;font-weight:bold">${fmt(f10)}</td>
      <td style="text-align:center">${fmtDate(addDays(C, PAY_SCHEDULE_FROM_CONTRACT.fundament10))}</td>
    </tr>`;
  }

  const productionOffset = b.hasFundament
    ? Math.max(
        PAY_SCHEDULE_FROM_CONTRACT.productionFinal30,
        PAY_SCHEDULE_FROM_CONTRACT.fundament10 + 1,
      )
    : PAY_SCHEDULE_FROM_CONTRACT.productionFinal30;
  const deliveryOffset = productionOffset + PAY_SCHEDULE_FROM_CONTRACT.daysAfterProductionToDelivery;
  const montazh1Offset = productionOffset + PAY_SCHEDULE_FROM_CONTRACT.daysAfterProductionToMontazh1;
  const montazh2Offset = montazh1Offset + PAY_SCHEDULE_FROM_CONTRACT.daysMontazh1ToMontazh2;
  const montazhEndOffset = montazh2Offset + PAY_SCHEDULE_FROM_CONTRACT.daysMontazh2ToMontazhEnd;

  rows += `<tr>
    <td style="text-align:center">${i++}</td>
    <td>Производство комплекта здания завершено. Оплата остатка <strong>(30%)</strong> за 5 рабочих дней до отгрузки.</td>
    <td style="text-align:center;font-weight:bold">${fmt(final30)}</td>
    <td style="text-align:center">${fmtDate(addDays(C, productionOffset))}</td>
  </tr>`;

  rows += `<tr>
    <td style="text-align:center">${i++}</td>
    <td>Доставка металлоконструкций и панелей до площадки строительства. <strong>100%</strong> предоплата (отдельный договор перевозчика, ориентир по расчёту конфигуратора).</td>
    <td style="text-align:center;font-weight:bold">${fmt(b.delivery)}</td>
    <td style="text-align:center">${fmtDate(addDays(C, deliveryOffset))}</td>
  </tr>`;

  if (b.hasMontazh) {
    const m40 = Math.round(b.montazhPart * 0.4);
    const m40b = Math.round(b.montazhPart * 0.4);
    const m20 = b.montazhPart - m40 - m40b;
    rows += `<tr>
      <td style="text-align:center">${i++}</td>
      <td>1-я предоплата подрядчику СМР по монтажу <strong>(40%)</strong>. Начало монтажных работ.</td>
      <td style="text-align:center;font-weight:bold">${fmt(m40)}</td>
      <td style="text-align:center">${fmtDate(addDays(C, montazh1Offset))}</td>
    </tr>`;
    rows += `<tr>
      <td style="text-align:center">${i++}</td>
      <td>2-я оплата подрядчику СМР по монтажу <strong>(40%)</strong>.</td>
      <td style="text-align:center;font-weight:bold">${fmt(m40b)}</td>
      <td style="text-align:center">${fmtDate(addDays(C, montazh2Offset))}</td>
    </tr>`;
    rows += `<tr>
      <td style="text-align:center">${i++}</td>
      <td>Монтаж здания завершён. Финальная оплата <strong>(20%)</strong>.</td>
      <td style="text-align:center;font-weight:bold">${fmt(m20)}</td>
      <td style="text-align:center">${fmtDate(addDays(C, montazhEndOffset))}</td>
    </tr>`;
  }

  rows += `<tr>
    <td style="text-align:center">${i++}</td>
    <td>Заливка полов (при заказе в договоре СМР). Оплаты по графику договора.</td>
    <td style="text-align:center">—</td>
    <td style="text-align:center">—</td>
  </tr>`;

  const doneOffset = b.hasMontazh
    ? montazhEndOffset + PAY_SCHEDULE_FROM_CONTRACT.daysMontazhEndToProjectDone
    : PAY_SCHEDULE_FROM_CONTRACT.projectDoneNoMontazh;
  rows += `<tr style="background:#f0f4ff">
    <td style="text-align:center">${i++}</td>
    <td><strong style="color:#2E3192">ПРОЕКТ ПО СТРОИТЕЛЬСТВУ БЫСТРОВОЗВОДИМОГО ЗДАНИЯ — ЗАВЕРШЁН</strong></td>
    <td style="text-align:center;color:#2E3192;font-weight:bold">ГОТОВО</td>
    <td style="text-align:center">${fmtDate(addDays(C, doneOffset))}</td>
  </tr>`;

  return rows;
}

function buildDesignServicesBlock(data: KpData, b: ReturnType<typeof computeKpBreakdown>): string {
  const km = REGION_KM_ROUGH[data.region] ?? 500;
  return `
  <p style="font-size:9.5px;font-weight:bold;margin:10px 0 4px;text-transform:uppercase">Базовые услуги проектирования здания и фундамента</p>
  <table>
    <tr><th style="text-align:left;padding-left:8px;width:72%">Описание</th><th style="width:28%">Затраты, руб. с НДС</th></tr>
    <tr>
      <td>ПРОЕКТИРОВАНИЕ (КМ стадии Р — каркас, ОК — фасады в PDF/DWG). Раздел КМ стадии П с РПЗ — при необходимости отдельно.</td>
      <td style="text-align:center;color:#2E3192;font-weight:bold">${b.hasProekt ? "БЕСПЛАТНО (при заказе комплекта)" : "Уточняется по выбранному объёму услуг"}</td>
    </tr>
    <tr>
      <td>ПРОЕКТИРОВАНИЕ КЖ (фундамент) в PDF/DWG</td>
      <td style="text-align:center">${b.hasFundament ? "— уточняется после геологии" : "—"}</td>
    </tr>
    <tr><td>ГОСУДАРСТВЕННАЯ / коммерческая экспертиза</td><td style="text-align:center">—</td></tr>
    <tr><td>ЭЛЕКТРОННАЯ ДОСТАВКА ПРОЕКТА</td><td style="text-align:center;color:#2E3192;font-weight:bold">БЕСПЛАТНО</td></tr>
    <tr><td>Экспресс-доставка бумажных альбомов почтой (по запросу)</td><td style="text-align:center">${fmt(b.designPaper)}</td></tr>
    <tr><td>Ориентир доставки груза, км (не геодезия)</td><td style="text-align:center">~${km}</td></tr>
  </table>`;
}

/** PDF: таблица сметы по строкам WebSteel (без синтетического разбиения ЛМК). */
function buildPriceSectionFromWebsteel(data: KpData, b: ReturnType<typeof computeKpBreakdown>): string {
  const lines = data.websteelLines!;
  const designBlock = buildDesignServicesBlock(data, b);
  const partsSummary = [
    b.kitMid > 0 ? `Комплект / конструкции (по строкам WebSteel) ≈ ${fmt(b.kitMid)} руб. с НДС` : null,
    b.delivery > 0 ? `Доставка ≈ ${fmt(b.delivery)} руб. с НДС` : null,
    b.hasMontazh && b.montazhPart > 0 ? `Монтаж ≈ ${fmt(b.montazhPart)} руб. с НДС` : null,
    b.hasFundament && b.fundamentPart > 0 ? `Фундамент / земляные ≈ ${fmt(b.fundamentPart)} руб. с НДС` : null,
  ]
    .filter(Boolean)
    .join("<br>");

  const bodyRows = lines
    .map(
      l => `<tr>
      <td>${escapeHtml(l.label)}</td>
      <td style="text-align:center">поз.</td>
      <td style="text-align:center">1</td>
      <td style="text-align:center">${fmt(l.amountRub)}</td>
      <td style="text-align:center">${fmt(l.amountRub)}</td>
    </tr>`,
    )
    .join("");

  const totalRow = `<tr style="background:#2E3192;color:white">
    <td colspan="4" style="text-align:right;padding-right:12px;font-weight:bold;font-size:11px">
      ИТОГО по конфигуратору WebSteel (ориентир), руб. с НДС
    </td>
    <td style="text-align:center;font-weight:bold;font-size:11px">${fmt(data.priceMin)} — ${fmt(data.priceMax)}</td>
  </tr>`;

  return `
  <div style="font-size:9.5px;margin-bottom:8px;line-height:1.8">
    <strong>Детализация стоимости</strong> — строки, полученные со страницы расчёта WebSteel (ПК Веста) для заданных габаритов и климата.<br>
    ${partsSummary}
  </div>
  ${designBlock}
  <p style="font-size:9.5px;font-weight:bold;margin:12px 0 4px;text-transform:uppercase">Смета WebSteel</p>
  <table>
    <tr>
      <th style="width:48%;text-align:left;padding-left:8px">Наименование</th>
      <th style="width:10%">Ед.изм.</th>
      <th style="width:7%">Кол-во</th>
      <th style="width:17.5%">Цена, руб. с НДС</th>
      <th style="width:17.5%">Стоимость, руб. с НДС</th>
    </tr>
    ${bodyRows}
    ${totalRow}
  </table>`;
}

function buildPriceSection(data: KpData): string {
  const area = data.length * data.width;
  const basePrice = KIT_BASE_RUB_M2[data.buildingTypeId] || KIT_BASE_RUB_M2.other;
  const regionMult = REGION_MULT[data.region] || 1.0;
  const b = computeKpBreakdown(data);

  if (data.websteelLines && data.websteelLines.length > 0) {
    return buildPriceSectionFromWebsteel(data, b);
  }

  const hasProekt = b.hasProekt;

  const kitMin = Math.max(0, Math.round(b.kitMid * 0.97));
  const kitMax = Math.max(kitMin, Math.round(b.kitMid * 1.03));

  const summaryLines = [
    `КОМПЛЕКТ ЗДАНИЯ (ориентир) = <span style="color:#ED1C24;font-weight:bold">${fmt(kitMin)} — ${fmt(kitMax)} руб. с НДС</span> (70% + 30%)`,
    `ДОСТАВКА (ориентир) = <span style="color:#ED1C24;font-weight:bold">${fmt(b.delivery)} руб. с НДС</span> (100%)`,
    b.hasMontazh
      ? `МОНТАЖ = <span style="color:#ED1C24;font-weight:bold">${fmt(b.montazhPart)} руб. с НДС</span> (40% + 40% + 20%)`
      : null,
    b.hasFundament
      ? `ЗЕМЕЛЬНЫЕ И ФУНДАМЕНТНЫЕ РАБОТЫ = <span style="color:#ED1C24;font-weight:bold">${fmt(b.fundamentPart)} руб. с НДС</span> (40% + 50% + 10%)`
      : null,
  ]
    .filter(Boolean)
    .join("<br>");

  const frameRatio = data.buildingTypeId === "karkas" ? 0.85 : 0.42;
  let framePrice = Math.round(basePrice * area * frameRatio * regionMult);
  let wallPrice = Math.round(basePrice * area * 0.35 * regionMult);
  let roofPrice = Math.round(basePrice * area * 0.23 * regionMult);
  let fasonPrice = Math.round(basePrice * area * 0.04 * regionMult);
  let kitParts = framePrice + (data.buildingTypeId === "karkas" ? 0 : wallPrice + roofPrice) + (data.buildingTypeId === "karkas" ? 0 : fasonPrice);
  data.options
    .filter(o => o !== "fundament")
    .forEach(o => {
      kitParts += Math.round((OPT_ADD_RUB_M2[o] || 0) * area * regionMult);
    });
  const scale = kitParts > 0 ? b.kitMid / kitParts : 1;
  framePrice = Math.round(framePrice * scale);
  if (data.buildingTypeId !== "karkas") {
    wallPrice = Math.round(wallPrice * scale);
    roofPrice = Math.round(roofPrice * scale);
    fasonPrice = Math.round(fasonPrice * scale);
  }

  let rows = "";

  rows += `<tr>
    <td>
      <strong>ЛЁГКИЙ МЕТАЛЛОКАРКАС (ЛСТК)</strong> с учётом конструкции под проёмы.<br>
      <span style="font-size:8.5px;color:#555">Колонны рядовые и фахверковые, фермы покрытия (или балки), стеновые и кровельные прогоны, связи, крепёж, фасонные детали. Комплект анкерной группы — уточняется отдельно. Порошковая окраска второстепенных элементов из чёрного металла — по спецификации.</span>
    </td>
    <td style="text-align:center">Компл.</td>
    <td style="text-align:center">1</td>
    <td style="text-align:center">${fmt(framePrice)}</td>
    <td style="text-align:center">${fmt(framePrice)}</td>
  </tr>`;

  if (data.buildingTypeId !== "karkas") {
    rows += `<tr>
      <td><strong>СТЕНОВЫЕ СЭНДВИЧ-ПАНЕЛИ 100 мм</strong>, минеральная вата, негорючие (ОК)</td>
      <td style="text-align:center">Компл.</td>
      <td style="text-align:center">1</td>
      <td style="text-align:center">${fmt(wallPrice)}</td>
      <td style="text-align:center">${fmt(wallPrice)}</td>
    </tr>`;
    rows += `<tr>
      <td><strong>КРОВЕЛЬНЫЕ СЭНДВИЧ-ПАНЕЛИ 120 мм</strong>, минеральная вата, негорючие (ОК)</td>
      <td style="text-align:center">Компл.</td>
      <td style="text-align:center">1</td>
      <td style="text-align:center">${fmt(roofPrice)}</td>
      <td style="text-align:center">${fmt(roofPrice)}</td>
    </tr>`;
    rows += `<tr>
      <td><strong>ФАСОННЫЕ ЭЛЕМЕНТЫ С КРЕПЕЖОМ</strong> (отливы, коньки, углы; элементы оконных проёмов — при необходимости отдельно)</td>
      <td style="text-align:center">Компл.</td>
      <td style="text-align:center">1</td>
      <td style="text-align:center">${fmt(fasonPrice)}</td>
      <td style="text-align:center">${fmt(fasonPrice)}</td>
    </tr>`;
  }

  const OPT_LABELS: Record<string, string> = {
    uteplenie: "УТЕПЛЕНИЕ (минеральная вата 100 мм, негорючая)",
    pokraska: "ПОКРАСКА конструкций (порошковая окраска)",
    ocinkovka: "ОЦИНКОВКА элементов конструкций",
  };
  data.options
    .filter(o => o !== "fundament")
    .forEach(optId => {
      const price = Math.round((OPT_ADD_RUB_M2[optId] || 0) * area * regionMult * scale);
      rows += `<tr>
        <td><strong>${OPT_LABELS[optId] || optId.toUpperCase()}</strong></td>
        <td style="text-align:center">Компл.</td>
        <td style="text-align:center">1</td>
        <td style="text-align:center">${fmt(price)}</td>
        <td style="text-align:center">${fmt(price)}</td>
      </tr>`;
    });

  const gatesText = escapeHtml(data.gatesNote?.trim() || "— уточняется по проекту (не включены в базовую смету конфигуратора)");
  const doorsText = escapeHtml(data.doorsNote?.trim() || "— уточняется по проекту");
  rows += `<tr>
    <td><strong>ВОРОТА</strong><br><span style="font-size:8.5px;color:#555">${gatesText}</span></td>
    <td style="text-align:center">Компл.</td>
    <td style="text-align:center">1</td>
    <td style="text-align:center">—</td>
    <td style="text-align:center">—</td>
  </tr>`;
  rows += `<tr>
    <td><strong>ДВЕРИ</strong><br><span style="font-size:8.5px;color:#555">${doorsText}</span></td>
    <td style="text-align:center">Компл.</td>
    <td style="text-align:center">1</td>
    <td style="text-align:center">—</td>
    <td style="text-align:center">—</td>
  </tr>`;

  if (hasProekt) {
    rows += `<tr>
      <td>
        <strong>ПРОЕКТИРОВАНИЕ</strong> (КМ, ОК)<br>
        <span style="font-size:8.5px;color:#555">Электронная выдача PDF/DWG</span>
      </td>
      <td style="text-align:center">Компл.</td>
      <td style="text-align:center">1</td>
      <td style="text-align:center;color:#2E3192;font-weight:bold">БЕСПЛАТНО</td>
      <td style="text-align:center;color:#2E3192;font-weight:bold">БЕСПЛАТНО</td>
    </tr>`;
  }

  rows += `<tr style="background:#f0f4ff">
    <td colspan="4" style="text-align:right;padding-right:12px;font-weight:bold">
      ИТОГО (комплект здания, ориентир), руб. с НДС
    </td>
    <td style="text-align:center;font-weight:bold">${fmt(kitMin)} — ${fmt(kitMax)}</td>
  </tr>`;

  rows += `<tr><td colspan="5" style="background:#fafafa;font-weight:bold;padding:6px 8px">Услуги доставки (ориентир; точная цена после проектных работ)</td></tr>`;
  rows += `<tr>
    <td>Доставка несущих и ограждающих конструкций до региона: <strong>${escapeHtml(data.region)}</strong>. Погрузка на заводе — по условиям договора.</td>
    <td style="text-align:center">Рейс</td>
    <td style="text-align:center">${Math.max(2, Math.min(10, Math.ceil(area / 160)))}</td>
    <td style="text-align:center">—</td>
    <td style="text-align:center;font-weight:bold">${fmt(b.delivery)}</td>
  </tr>`;

  if (b.hasMontazh) {
    rows += `<tr>
      <td>
        <strong>МОНТАЖ ЗДАНИЯ</strong> (без монтажа проёмов и световых фонарей, если не оговорено):<br>
        <span style="font-size:8.5px;color:#555">Перебазировка инвентаря; геодезия; разгрузка МК; контроль затяжки болтовых соединений динамометрическими ключами; расходные материалы; исполнительная документация по требованиям РФ. Стоимость на новых территориях и при стеснённых условиях площадки может быть выше — уточняется после обследования.</span>
      </td>
      <td style="text-align:center">Компл.</td>
      <td style="text-align:center">1</td>
      <td style="text-align:center">${fmt(b.montazhPart)}</td>
      <td style="text-align:center">${fmt(b.montazhPart)}</td>
    </tr>`;
  }

  if (b.hasFundament) {
    rows += `<tr>
      <td>
        <strong>ПЛИТНЫЙ ФУНДАМЕНТ</strong> (условные грунты, несущая способность до 3 кг/см², перепад высот на участке до 0,3 м):<br>
        <span style="font-size:8.5px;color:#555">Песчано-щебёночное основание с трамбовкой; гидроизоляция; армирование; бетон с виброуплотнением; упрочнение и затирка; нарезка и герметизация усадочных швов; ИД. Точная стоимость — после официальной геологии и проекта КЖ. Вывоз грунта — отдельно.</span>
      </td>
      <td style="text-align:center">Компл.</td>
      <td style="text-align:center">1</td>
      <td style="text-align:center">${fmt(b.fundamentPart)}</td>
      <td style="text-align:center">${fmt(b.fundamentPart)}</td>
    </tr>`;
  }

  const extraServices = b.montazhPart + b.fundamentPart + b.delivery + b.designPaper;
  rows += `<tr style="background:#f6f6f6">
    <td colspan="4" style="text-align:right;padding-right:12px;font-weight:bold">ИТОГО доп. услуги и доставка (ориентир), руб. с НДС</td>
    <td style="text-align:center;font-weight:bold">${fmt(extraServices)}</td>
  </tr>`;

  rows += `<tr style="background:#2E3192;color:white">
    <td colspan="4" style="text-align:right;padding-right:12px;font-weight:bold;font-size:11px">
      ИТОГО (проектирование, изготовление здания с дополнительными услугами и доставкой), руб. с НДС — по конфигуратору:
    </td>
    <td style="text-align:center;font-weight:bold;font-size:11px">${fmt(data.priceMin)} — ${fmt(data.priceMax)}</td>
  </tr>`;

  const designBlock = buildDesignServicesBlock(data, b);

  return `
  <div style="font-size:9.5px;margin-bottom:8px;line-height:1.8">
    <strong>Основные статьи затрат (расшифровка как в профессиональном КП):</strong><br>
    ${summaryLines}
  </div>
  ${designBlock}
  <p style="font-size:9.5px;font-weight:bold;margin:12px 0 4px;text-transform:uppercase">Комплект здания с завода</p>
  <table>
    <tr>
      <th style="width:48%;text-align:left;padding-left:8px">Описание</th>
      <th style="width:10%">Ед.изм.</th>
      <th style="width:7%">Кол-во</th>
      <th style="width:17.5%">Цена, руб. с НДС</th>
      <th style="width:17.5%">Стоимость, руб. с НДС</th>
    </tr>
    ${rows}
  </table>`;
}

function buildHtml(data: KpData): string {
  const area = data.length * data.width;
  const volume = data.length * data.width * data.height;
  const today = new Date();
  const site = escapeHtml((data.constructionSite || data.region || "").trim() || "—");
  const regionEsc = escapeHtml(data.region || "—");
  const typeEsc = escapeHtml(data.buildingType || "—");
  const svcEsc = escapeHtml(data.servicesLabels.join(", ") || "—");
  const optEsc =
    data.optionsLabels.length > 0 ? escapeHtml(data.optionsLabels.join(", ")) : "";
  const frameType = escapeHtml(data.frameType || "Однопролётное");
  const frameStep = data.frameStepM ?? 6;
  const roofPitch = data.roofPitchDeg ?? 10;
  const plinth = data.plinthM ?? 0.3;
  const thermal = escapeHtml(
    data.thermalContour || "Ограждающие конструкции монтируются снаружи несущего каркаса (типовое решение)",
  );
  const crane = escapeHtml(data.craneLoad || "Без кран-балки");
  const fireR = escapeHtml(data.fireResistance || "IV");

  const scheduleRows = buildPaymentSchedule(data, today);
  const priceSection = buildPriceSection(data);

  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 10px;
  color: #222;
  padding: 18mm 14mm 14mm 14mm;
  line-height: 1.4;
}
.header {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
  align-items: flex-start;
}
.header-logo { width: 165px; flex-shrink: 0; padding-top: 2px; }
.header-logo img { width: 150px; height: auto; display: block; }
.header-logo small {
  display: block;
  margin-top: 5px;
  font-size: 7.5px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: #555;
}
.client-box {
  border: 1.5px solid #333;
  padding: 8px 12px;
  flex: 1;
  line-height: 1.7;
}
.company-box { flex: 1; line-height: 1.7; }
h1 {
  text-align: center;
  font-size: 12.5px;
  font-weight: bold;
  margin: 14px 0 3px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}
.subtitle { text-align: center; font-size: 10px; color: #555; margin-bottom: 14px; }
h2 {
  font-size: 11px;
  font-weight: bold;
  margin: 14px 0 7px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9.5px;
  margin-bottom: 10px;
}
td, th {
  border: 1px solid #bbb;
  padding: 5px 8px;
  vertical-align: top;
}
th {
  background: #efefef;
  font-weight: bold;
  text-align: center;
}
.spec-label { background: #fafafa; width: 58%; }
.spec-value { text-align: center; width: 42%; }
.disclaimer {
  font-size: 8px;
  color: #444;
  margin-top: 12px;
  text-align: justify;
  line-height: 1.55;
  border-top: 1px solid #ddd;
  padding-top: 8px;
}
.page-footer {
  margin-top: 14px;
  border-top: 2.5px solid #2E3192;
  padding-top: 6px;
  font-size: 8px;
  color: #666;
  display: flex;
  justify-content: space-between;
}
b { font-weight: bold; }
.red { color: #ED1C24; }
.blue { color: #2E3192; }
</style>
</head>
<body>

<!-- ШАПКА -->
<div class="header">
  <div class="header-logo">
    <img src="${FREONN_LOGO}" alt="FREONN">
    <small>Строительство промышленных зданий</small>
  </div>
  <div class="client-box">
    <b>Номер заявки: <span class="red">${data.appNumber}</span></b><br>
    Дата заявки: ${data.date}<br>
    Тип заявки: ОНЛАЙН-РАСЧЁТ<br>
    <br>
    Клиент: <b>${escapeHtml(data.clientName)}</b><br>
    Телефон: <b>${escapeHtml(data.clientPhone)}</b>
  </div>
  <div class="company-box">
    ПРОИЗВОДИТЕЛЬ: <b>ООО «ЭКС»</b><br>
    Тел: <b>8(800)101-2009</b><br>
    <span style="font-size:8.5px;color:#666">(бесплатно по РФ, с 9:00 до 20:00 МСК)</span><br>
    E-mail: freonn@internet.ru<br>
    Web: https://freonn.pro<br>
    <br>
    <span style="font-size:8.5px">Адрес: 117105, г. Москва,<br>Варшавское шоссе, д. 125Ж</span><br>
    <span style="font-size:8.5px">ИНН: 3604084591 | ОГРН: 1243600003569</span>
  </div>
</div>

<!-- ЗАГОЛОВОК -->
<h1>Коммерческое предложение и техническое задание</h1>
<div class="subtitle">Приложение №1 к заявке ${data.appNumber} от ${data.date}</div>

<!-- РАЗДЕЛ 1 -->
<h2>1. Размеры здания и типы стальных конструкций:</h2>
<table>
  <tr><td class="spec-label">СТРАНА</td><td class="spec-value">Россия</td></tr>
  <tr><td class="spec-label">РЕГИОН СТРОИТЕЛЬСТВА</td><td class="spec-value">${regionEsc}</td></tr>
  <tr><td class="spec-label">МЕСТО / АДРЕС СТРОИТЕЛЬСТВА (по данным клиента)</td><td class="spec-value">${site}</td></tr>
  <tr><td class="spec-label">СТРАНА ПРОИСХОЖДЕНИЯ ТОВАРА</td><td class="spec-value">Россия</td></tr>
  <tr><td class="spec-label">КОД ТН ВЭД (ориентир)</td><td class="spec-value">9406 90 000 8 — уточняется по спецификации поставки</td></tr>
  <tr><td class="spec-label">ТИП РАМЫ</td><td class="spec-value">${frameType}</td></tr>
  <tr><td class="spec-label">ТИП КОНСТРУКЦИИ (кровля)</td><td class="spec-value">Двухскатная</td></tr>
  <tr><td class="spec-label">ТИП ЗДАНИЯ</td><td class="spec-value">${typeEsc}</td></tr>
  <tr>
    <td class="spec-label">ШИРИНА, м. (стороны A, C)<br><span style="font-size:8.5px;color:#666">Привязка по внешним граням ОК (или по несущему каркасу, если обшивка не учитывается)</span></td>
    <td class="spec-value">${data.width}</td>
  </tr>
  <tr>
    <td class="spec-label">ДЛИНА, м. (стороны B, D)<br><span style="font-size:8.5px;color:#666">Привязка по внешним граням ОК</span></td>
    <td class="spec-value">${data.length}</td>
  </tr>
  <tr>
    <td class="spec-label">ВНУТРЕННЯЯ ВЫСОТА СТЕНЫ, м.<br><span style="font-size:8.5px;color:#666">До нижних несущих конструкций покрытия; промежутки по длине — на стадии КМ</span></td>
    <td class="spec-value">${data.height}</td>
  </tr>
  <tr><td class="spec-label">ШАГ РАМ / ШАГ КОЛОНН, м.</td><td class="spec-value">${frameStep}</td></tr>
  <tr><td class="spec-label">ВЫСОТА ЦОКОЛЯ, м.</td><td class="spec-value">${String(plinth).replace(".", ",")}</td></tr>
  <tr><td class="spec-label">УГОЛ КРОВЛИ, град.</td><td class="spec-value">${roofPitch}</td></tr>
  <tr><td class="spec-label">ТЕПЛОВОЙ КОНТУР</td><td class="spec-value">${thermal}</td></tr>
  <tr><td class="spec-label">ОБЩАЯ ПЛОЩАДЬ ЗДАНИЯ, кв.м.</td><td class="spec-value">${area}</td></tr>
  <tr><td class="spec-label">ОБЩИЙ ОБЪЁМ ЗДАНИЯ, куб.м.</td><td class="spec-value">${volume}</td></tr>
  <tr><td class="spec-label">КОЛИЧЕСТВО ЭТАЖЕЙ</td><td class="spec-value">1</td></tr>
  <tr><td class="spec-label">НАГРУЗКА ОТ КРАН-БАЛКИ</td><td class="spec-value">${crane}</td></tr>
  <tr><td class="spec-label">СТЕПЕНЬ ОГНЕСТОЙКОСТИ ЗДАНИЯ (целевой класс)</td><td class="spec-value">${fireR}</td></tr>
  <tr>
    <td class="spec-label">ТИП СТРОИТЕЛЬНОЙ ТЕХНОЛОГИИ</td>
    <td class="spec-value">ЛСТК (колонны, фермы, прогоны — из холодногнутых оцинкованных профилей)</td>
  </tr>
  <tr><td class="spec-label">АНТИКОРРОЗИОННАЯ ЗАЩИТА (элементы из чёрного металла)</td><td class="spec-value">Порошковая окраска (по спецификации)</td></tr>
  <tr><td class="spec-label">ТЕХНОЛОГИЯ ИЗГОТОВЛЕНИЯ (чёрный металл)</td><td class="spec-value">Резка на станках с ЧПУ (по применимости к узлам)</td></tr>
  <tr><td class="spec-label">ВЫБРАННЫЕ УСЛУГИ</td><td class="spec-value">${svcEsc}</td></tr>
  ${
    data.optionsLabels.length > 0
      ? `<tr><td class="spec-label">ДОПОЛНИТЕЛЬНЫЕ ОПЦИИ</td><td class="spec-value">${optEsc}</td></tr>`
      : ""
  }
</table>

<!-- РАЗДЕЛ 2 -->
<h2>2. Предварительный график организации платежей, проектных, производственных и строительных работ:</h2>
<table>
  <tr>
    <th style="width:4%">№</th>
    <th style="text-align:left;padding-left:10px;width:66%">Описание</th>
    <th style="width:18%">Затраты, руб. с НДС</th>
    <th style="width:12%">Дата</th>
  </tr>
  ${scheduleRows}
</table>
<p style="font-size:8px;color:#666;margin:-5px 0 10px;text-align:right;font-style:italic">* Сроки приблизительные, уточняются при подписании договора</p>

<!-- РАЗДЕЛ 3 -->
<h2>3. Цены на здание и услуги:</h2>
${priceSection}

<!-- ДИСКЛЕЙМЕР -->
<div class="disclaimer">
  <b>ВАЖНО!</b> Сроки и стоимость продукции фиксируются только короткий период времени и могут измениться в любой момент. Из-за непредсказуемой ситуации на рынке металла в России ООО «ЭКС» не в состоянии фиксировать цену на здание длительное время. Данное коммерческое предложение сформировано по результатам предварительного онлайн-расчёта с учётом параметров, указанных в конфигураторе, и является индикативным (не является офертой в соответствии со ст. 435 ГК РФ) и не влечёт за собой обязательств ООО «ЭКС» по заключению договора на условиях настоящего предложения. В случае согласия с настоящим предложением окончательные условия поставки согласовываются и фиксируются в договоре поставки на момент обращения клиента. Цены на <b>ФУНДАМЕНТ</b> и <b>ПОЛЫ</b> выдаются под «условные грунты»; для точного расчёта нужна официальная геология с геодезией. Ориентир по доставке — до уточнения маршрута и габаритов груза. Часто поставка комплекта здания и СМР оформляются <b>двумя договорами</b>; при одном договоре (генподряд) цены могут отличаться. Предложение действительно в течение <b>7 рабочих дней</b> с даты формирования.
</div>

<!-- НИЖНИЙ КОЛОНТИТУЛ -->
<div class="page-footer">
  <span>© ООО «ЭКС» · freonn.pro · 8(800)101-2009 (бесплатно по РФ)</span>
  <span>КП ${data.appNumber} от ${data.date}</span>
</div>

</body>
</html>`;
}

export async function generateKpPdf(data: KpData): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(buildHtml(data), { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

import { describe, it, expect } from "vitest";
import { mapWebsteelLinesToParts } from "./websteelBreakdown";

describe("mapWebsteelLinesToParts", () => {
  it("splits delivery, montazh, fundament and puts remainder in kit", () => {
    const total = 10_000_000;
    const p = mapWebsteelLinesToParts(
      [
        { label: "Доставка до объекта", amountRub: 500_000 },
        { label: "Монтаж здания", amountRub: 2_000_000 },
        { label: "Земельные и фундаментные работы", amountRub: 1_000_000 },
        { label: "Комплект здания (металлокаркас)", amountRub: 3_000_000 },
      ],
      total
    );
    expect(p.deliveryRub).toBe(500_000);
    expect(p.montazhRub).toBe(2_000_000);
    expect(p.fundamentRub).toBe(1_000_000);
    // Комплект в итоге — остаток до total после фиксированных статей
    expect(p.kitMid).toBe(6_500_000);
  });

  it("when only unclassified lines, kit absorbs total minus fixed buckets", () => {
    const total = 5_000_000;
    const p = mapWebsteelLinesToParts([{ label: "Прочие услуги", amountRub: 1_000_000 }], total);
    expect(p.deliveryRub).toBe(0);
    expect(p.montazhRub).toBe(0);
    expect(p.fundamentRub).toBe(0);
    expect(p.kitMid).toBe(total);
  });

  it("ignores non-positive amounts", () => {
    const p = mapWebsteelLinesToParts(
      [
        { label: "Доставка", amountRub: 100 },
        { label: "Пусто", amountRub: 0 },
        { label: "NaN", amountRub: NaN },
      ],
      1_000
    );
    expect(p.deliveryRub).toBe(100);
    expect(p.kitMid).toBe(900);
  });
});

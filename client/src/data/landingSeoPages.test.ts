import { describe, expect, it } from "vitest";
import { landingPages } from "./landingPages";
import { allLandingSubpages } from "./landingSubpages";

const expectedSeoSlugs = [
  "/angary/dlya-proizvodstva",
  "/angary/dlya-selhoz",
  "/angary/dlya-hraneniya",
  "/sklady/fulfillment",
  "/sklady/for-ecommerce",
  "/sklady/dlya-logistiki",
  "/proizvodstvennye-zdaniya/pishchevaya",
  "/proizvodstvennye-zdaniya/metallurgiya",
  "/proizvodstvennye-zdaniya/lesopil",
  "/proizvodstvennye-zdaniya/elektronika",
  "/selskokhozyaystvennye-zdaniya/teplichnye",
  "/selskokhozyaystvennye-zdaniya/fermerskie",
  "/torgovye-zdaniya/market",
  "/torgovye-zdaniya/avtosoz",
  "/sportivnye-sooruzheniya/tennis",
  "/sportivnye-sooruzheniya/fitness",
  "/bystrovozvodimye-zdaniya/mini-sklady",
  "/bystrovozvodimye-zdaniya/mini-angary",
  "/sendvich-paneli/teplichnye",
  "/sendvich-paneli/proizvodstvennye",
  "/metallokonstruktsii/fundamenty",
  "/metallokonstruktsii/krany",
  "/navesy/parkovki",
  "/navesy/avtoservisy",
] as const;

describe("SEO landing subpages", () => {
  it("registers the new SEO landing slugs", () => {
    const existingSlugs = new Set([
      ...landingPages.map((page) => page.slug),
      ...allLandingSubpages.map((page) => page.slug),
    ]);

    for (const slug of expectedSeoSlugs) {
      expect(existingSlugs.has(slug)).toBe(true);
    }

    expect(expectedSeoSlugs).toHaveLength(24);
  });
});

import { z } from "zod";

function optTrimmed(max: number) {
  return z
    .unknown()
    .optional()
    .transform((v): string | undefined => {
      if (v === undefined || v === null) return undefined;
      if (typeof v !== "string") return undefined;
      const t = v.trim();
      if (!t) return undefined;
      return t.slice(0, max);
    });
}

/** Тело POST /api/generate-kp — строгая валидация до Puppeteer/PDF. */
export const generateKpBodySchema = z.object({
  clientName: z.string().trim().min(1).max(200),
  clientPhone: z.string().trim().min(5).max(40),
  buildingType: z.string().max(400).optional(),
  buildingTypeId: z.string().trim().min(1).max(80),
  length: z.coerce.number().finite().min(3).max(400),
  width: z.coerce.number().finite().min(3).max(400),
  height: z.coerce.number().finite().min(2).max(60),
  services: z.array(z.string().max(64)).max(20).optional(),
  servicesLabels: z.array(z.string().max(120)).max(20).optional(),
  options: z.array(z.string().max(64)).max(40).optional(),
  optionsLabels: z.array(z.string().max(120)).max(40).optional(),
  region: z.string().trim().max(120).optional(),
  priceMin: z.coerce.number().finite().min(0).max(5e12).optional(),
  priceMax: z.coerce.number().finite().min(0).max(5e12).optional(),
  constructionSite: optTrimmed(2000),
  frameType: optTrimmed(200),
  frameStepM: z.coerce.number().finite().min(3).max(24).optional(),
  roofPitchDeg: z.coerce.number().finite().min(0).max(60).optional(),
  plinthM: z.coerce.number().finite().min(0).max(10).optional(),
  thermalContour: optTrimmed(200),
  craneLoad: optTrimmed(200),
  fireResistance: optTrimmed(200),
  gatesNote: optTrimmed(2000),
  doorsNote: optTrimmed(2000),
  latitude: z.coerce.number().finite().min(-90).max(90).optional(),
  longitude: z.coerce.number().finite().min(-180).max(180).optional(),
});

export type GenerateKpBody = z.infer<typeof generateKpBodySchema>;

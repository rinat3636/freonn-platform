import { freonnFetch } from "./api";

const WORK_PACKAGE_TO_SCOPE: Record<string, "kit" | "kit_install" | "turnkey"> = {
  komplekt: "kit",
  komplekt_montazh: "kit_install",
  pod_klyuch: "turnkey",
};

export async function submitMetalstroyRequest(input: {
  buildingType: string;
  lengthM?: number;
  widthM?: number;
  heightM?: number;
  workPackage?: string;
  region?: string;
  comment?: string;
}) {
  const workScope = input.workPackage
    ? WORK_PACKAGE_TO_SCOPE[input.workPackage]
    : undefined;
  return freonnFetch<{ requestId: string; notified: boolean }>("/api/v1/requests", {
    method: "POST",
    body: JSON.stringify({
      direction: "metalstroy",
      buildingType: input.buildingType,
      lengthM: input.lengthM,
      widthM: input.widthM,
      heightM: input.heightM,
      workScope,
      region: input.region,
      comment: input.comment,
    }),
  });
}

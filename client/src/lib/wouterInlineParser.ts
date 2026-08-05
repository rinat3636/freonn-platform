function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, (c) => "\\" + c);
}

const PARAM_RE = /:([A-Za-z0-9_]+)/g;

export function parseRoute(
  route: string,
  loose?: boolean,
): { pattern: RegExp; keys: string[] } {
  if (route === "/") {
    const pattern = loose ? /^(?=$|\/)/i : /^\/?$/i;
    return { pattern, keys: [] };
  }

  if (route === "*" || !route) {
    const pattern = loose ? /^\/(.*)(?=$|\/)/i : /^\/(.*)\/?$/i;
    return { pattern, keys: ["*"] };
  }

  const keys: string[] = [];
  const segments = route.split("/").filter(Boolean);
  let src = "";

  for (const segment of segments) {
    src += "/";
    let segmentSrc = "";
    let match: RegExpExecArray | null;
    let last = 0;

    PARAM_RE.lastIndex = 0;
    while ((match = PARAM_RE.exec(segment)) !== null) {
      segmentSrc += escapeRegex(segment.slice(last, match.index));
      segmentSrc += "([^/]+?)";
      keys.push(match[1]);
      last = PARAM_RE.lastIndex;
    }
    segmentSrc += escapeRegex(segment.slice(last));
    src += segmentSrc;
  }

  const suffix = loose ? "(?=$|/)" : "/?$";
  const pattern = new RegExp(`^${src}${suffix}`, "i");
  return { pattern, keys };
}

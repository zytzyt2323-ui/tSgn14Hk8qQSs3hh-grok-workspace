export function safePath(raw?: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return "/";
  }
  return raw;
}

export function parseJoinCode(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/join\/([A-Za-z0-9]+)/i);
    if (match?.[1]) return match[1].toUpperCase();
  } catch {
    /* not a URL */
  }
  const pathMatch = trimmed.match(/\/join\/([A-Za-z0-9]+)/i);
  if (pathMatch?.[1]) return pathMatch[1].toUpperCase();
  return trimmed.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function joinPath(code: string): string {
  return `/join/${code.toUpperCase()}`;
}

export function joinUrl(code: string, origin = typeof window !== "undefined" ? window.location.origin : ""): string {
  return `${origin}${joinPath(code)}`;
}

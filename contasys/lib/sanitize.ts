const ENTITY_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ENTITY_MAP[ch] || ch);
}

export function sanitizarString(input: string): string {
  return escapeHtml(input.trim());
}

export function sanitizarOpcional(input: string | null | undefined): string | null {
  if (!input) return null;
  return sanitizarString(input);
}

export function limpiarInput<T extends Record<string, unknown>>(obj: T, campos: (keyof T)[]): T {
  const result = { ...obj };
  for (const campo of campos) {
    const val = result[campo];
    if (typeof val === "string") {
      result[campo] = sanitizarString(val) as T[keyof T];
    }
  }
  return result;
}

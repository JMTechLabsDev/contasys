import { createHash, randomBytes } from "crypto";

export function hashString(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function generateApiKey(): string {
  return randomBytes(32).toString("hex");
}

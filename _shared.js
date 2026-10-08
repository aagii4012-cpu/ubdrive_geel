// Shared helpers for ENEREl game API (Cloudflare Pages Functions).
// Files starting with "_" are not exposed as routes.

export const MAX_NAME_LENGTH = 16;
export const MAX_SCORE = 12000; // must match MAX_POSSIBLE_SCORE in game.js and CHECK in schema.sql
const NAME_PATTERN = /^[\p{L}\p{N} _.\-']+$/u;

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extraHeaders
    }
  });
}

export function errorResponse(status, code, message) {
  return json({ ok: false, error: code, message }, status);
}

export function normalizeName(raw) {
  if (typeof raw !== "string") return "";
  return raw
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F-\u009F​-‏‪-‮⁠-⁯﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns an error message (string) or null when valid.
export function validateName(name) {
  if (!name) return "Нэрээ оруулна уу.";
  if ([...name].length > MAX_NAME_LENGTH) return `Нэр ${MAX_NAME_LENGTH} тэмдэгтээс хэтрэхгүй.`;
  if (!NAME_PATTERN.test(name)) return "Нэрэнд зөвхөн үсэг, тоо, зай, _ . - ' ашиглана.";
  return null;
}

export function validateScore(value, max = MAX_SCORE) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Оноо тоо байх ёстой.";
  if (!Number.isInteger(value)) return "Оноо бүхэл тоо байх ёстой.";
  if (value < 0) return "Оноо сөрөг байж болохгүй.";
  if (value > max) return "Оноо боломжит дээд хэмжээнээс их байна.";
  return null;
}

export function dbMissing() {
  return errorResponse(
    503,
    "db_not_bound",
    "D1 database холбогдоогүй байна. Cloudflare Pages → Settings → Bindings дээр DB нэртэй D1 binding нэмнэ үү."
  );
}

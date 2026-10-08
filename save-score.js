// POST /api/tegtat/save-score  { "name": "BAT", "score": 2450 }
// TEGTAT 3D driving game. Stores ONLY name, score, created_at in D1 table tegtat_scores.
import { json, errorResponse, normalizeName, validateName, validateScore, dbMissing } from "../_shared.js";

const TEGTAT_MAX_SCORE = 5000; // must match MAX_SCORE in tegtat.js and CHECK in schema.sql
const MAX_BODY_BYTES = 1024;
const SAME_NAME_COOLDOWN_MS = 5000;

export async function onRequestPost({ request, env }) {
  if (!env.DB) return dbMissing();
  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().includes("application/json")) {
    return errorResponse(415, "unsupported_media_type", "Content-Type нь application/json байх ёстой.");
  }
  let text;
  try { text = await request.text(); } catch { return errorResponse(400, "bad_body", "Хүсэлтийн биеийг уншиж чадсангүй."); }
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return errorResponse(413, "body_too_large", "Хүсэлт хэт том байна.");
  let body;
  try { body = JSON.parse(text); } catch { return errorResponse(400, "invalid_json", "JSON буруу байна."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return errorResponse(400, "invalid_body", "JSON объект илгээнэ үү.");

  const name = normalizeName(body.name);
  const nameError = validateName(name);
  if (nameError) return errorResponse(400, "invalid_name", nameError);
  const score = body.score;
  const scoreError = validateScore(score, TEGTAT_MAX_SCORE);
  if (scoreError) return errorResponse(400, "invalid_score", scoreError);

  try {
    const since = new Date(Date.now() - SAME_NAME_COOLDOWN_MS).toISOString();
    const recent = await env.DB.prepare("SELECT id FROM tegtat_scores WHERE name = ?1 AND created_at > ?2 LIMIT 1").bind(name, since).first();
    if (recent) return errorResponse(429, "too_many_requests", "Хэт ойр ойрхон хадгалж байна. Түр хүлээгээд дахин оролдоно уу.");

    const createdAt = new Date().toISOString();
    const result = await env.DB.prepare("INSERT INTO tegtat_scores (name, score, created_at) VALUES (?1, ?2, ?3)").bind(name, score, createdAt).run();
    const id = result.meta && result.meta.last_row_id;
    const rankRow = await env.DB.prepare(
      `SELECT COUNT(*) AS better FROM tegtat_scores
       WHERE score > ?1 OR (score = ?1 AND (created_at < ?2 OR (created_at = ?2 AND id < ?3)))`
    ).bind(score, createdAt, id).first();
    const rank = (rankRow ? Number(rankRow.better) : 0) + 1;
    return json({ ok: true, id, name, score, created_at: createdAt, rank }, 201);
  } catch (err) {
    console.error("tegtat save-score failed", err);
    return errorResponse(500, "db_error", "Оноо хадгалах үед алдаа гарлаа.");
  }
}

export async function onRequest() {
  return errorResponse(405, "method_not_allowed", "Зөвхөн POST хүсэлт зөвшөөрнө.");
}

// GET /api/tegtat/leaderboard → { ok: true, scores: [{ id, name, score, created_at }] } (TOP 10)
import { json, errorResponse, dbMissing } from "../_shared.js";

export async function onRequestGet({ env }) {
  if (!env.DB) return dbMissing();
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, name, score, created_at FROM tegtat_scores
       ORDER BY score DESC, created_at ASC, id ASC
       LIMIT 10`
    ).all();
    return json({ ok: true, scores: results || [] });
  } catch (err) {
    console.error("tegtat leaderboard failed", err);
    return errorResponse(500, "db_error", "Leaderboard уншихад алдаа гарлаа.");
  }
}

export async function onRequest() {
  return errorResponse(405, "method_not_allowed", "Зөвхөн GET хүсэлт зөвшөөрнө.");
}

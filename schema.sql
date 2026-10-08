-- ENEREl 2D Mini Game — Cloudflare D1 schema
-- Хадгалах өгөгдөл: зөвхөн nickname, оноо, огноо. IP, төхөөрөмж, имэйл, утас ХАДГАЛАХГҮЙ.

CREATE TABLE IF NOT EXISTS game_scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL CHECK (length(name) BETWEEN 1 AND 16),
  score      INTEGER NOT NULL CHECK (score >= 0 AND score <= 12000),
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- TOP 10 query-д зориулсан индекс (score DESC, тэнцвэл эрт хадгалсан нь өмнө)
CREATE INDEX IF NOT EXISTS idx_game_scores_rank
  ON game_scores (score DESC, created_at ASC);

-- Нэг нэрээр хэт ойр ойрхон хадгалахыг шалгахад
CREATE INDEX IF NOT EXISTS idx_game_scores_name_time
  ON game_scores (name, created_at);

-- ---------------------------------------------------------------------------
-- TEGTAT 3D driving game (тусдаа leaderboard; 2D тоглоомын game_scores-тэй холилдохгүй)
CREATE TABLE IF NOT EXISTS tegtat_scores (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL CHECK (length(name) BETWEEN 1 AND 16),
  score      INTEGER NOT NULL CHECK (score >= 0 AND score <= 5000),
  created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS idx_tegtat_scores_rank ON tegtat_scores (score DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_tegtat_scores_name_time ON tegtat_scores (name, created_at);

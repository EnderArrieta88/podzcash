import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/db";

const DB_PATH = path.resolve(
  process.cwd(),
  process.env.SEARCH_DB_PATH ?? "./.data/search.db",
);

type GlobalWithSearch = typeof globalThis & {
  podzcashSearchDb?: Database.Database;
};

const globalForSearch = globalThis as GlobalWithSearch;

function getDb(): Database.Database {
  if (globalForSearch.podzcashSearchDb) return globalForSearch.podzcashSearchDb;

  mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS episodes USING fts5(
      episodeId UNINDEXED,
      title,
      description,
      tags,
      channel,
      tokenize = 'unicode61 remove_diacritics 2'
    );
  `);

  globalForSearch.podzcashSearchDb = db;
  return db;
}

type IndexRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  channel: { displayName: string };
  tags: { tag: { name: string } }[];
};

function writeRow(row: IndexRow): void {
  const db = getDb();
  db.prepare("DELETE FROM episodes WHERE episodeId = ?").run(row.id);

  if (row.status !== "published") return;

  db.prepare(
    "INSERT INTO episodes (episodeId, title, description, tags, channel) VALUES (?, ?, ?, ?, ?)",
  ).run(
    row.id,
    row.title,
    row.description ?? "",
    row.tags.map(({ tag }) => tag.name).join(" "),
    row.channel.displayName,
  );
}

function indexSelect() {
  return {
    id: true,
    title: true,
    description: true,
    status: true,
    channel: { select: { displayName: true } },
    tags: { select: { tag: { select: { name: true } } } },
  } as const;
}

export async function indexEpisode(episodeId: string): Promise<void> {
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: indexSelect(),
  });

  if (!episode) {
    removeFromIndex(episodeId);
    return;
  }

  writeRow(episode);
}

export function removeFromIndex(episodeId: string): void {
  getDb().prepare("DELETE FROM episodes WHERE episodeId = ?").run(episodeId);
}

export async function reindexChannel(channelId: string): Promise<void> {
  const episodes = await prisma.episode.findMany({
    where: { channelId },
    select: indexSelect(),
  });

  for (const episode of episodes) writeRow(episode);
}

export async function reindexAll(): Promise<number> {
  const episodes = await prisma.episode.findMany({ select: indexSelect() });
  const db = getDb();

  const rebuild = db.transaction((rows: IndexRow[]) => {
    db.prepare("DELETE FROM episodes").run();
    for (const row of rows) {
      if (row.status !== "published") continue;
      db.prepare(
        "INSERT INTO episodes (episodeId, title, description, tags, channel) VALUES (?, ?, ?, ?, ?)",
      ).run(
        row.id,
        row.title,
        row.description ?? "",
        row.tags.map(({ tag }) => tag.name).join(" "),
        row.channel.displayName,
      );
    }
  });

  rebuild(episodes);
  return episodes.filter((row) => row.status === "published").length;
}

/**
 * Convierte la búsqueda del usuario en una consulta FTS5 segura: cada palabra
 * entre comillas (sin operadores) y con prefijo, para que "pod" encuentre
 * "podcast".
 */
function toFtsQuery(input: string): string {
  const tokens = input
    .replace(/["*(){}:^~]/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (tokens.length === 0) return "";

  return tokens.map((token) => `"${token}"*`).join(" ");
}

export function searchEpisodeIds(query: string, limit = 200): string[] {
  const term = toFtsQuery(query);
  if (!term) return [];

  try {
    const rows = getDb()
      .prepare(
        "SELECT episodeId FROM episodes WHERE episodes MATCH ? ORDER BY bm25(episodes) LIMIT ?",
      )
      .all(term, limit) as { episodeId: string }[];

    return rows.map((row) => row.episodeId);
  } catch {
    // Consulta FTS inválida: se trata como "sin resultados".
    return [];
  }
}

/**
 * Si el índice está vacío (primer arranque o archivo borrado) lo reconstruye.
 */
export async function ensureIndex(): Promise<void> {
  const db = getDb();
  const { count } = db
    .prepare("SELECT count(*) AS count FROM episodes")
    .get() as { count: number };

  if (count > 0) return;

  const published = await prisma.episode.count({
    where: { status: "published" },
  });
  if (published > 0) await reindexAll();
}

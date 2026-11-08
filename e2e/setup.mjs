import { execSync } from "node:child_process";
import { randomBytes, scryptSync } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const root = process.cwd();
const databaseFile = path.join(root, "prisma", "e2e.db");
const databaseUrl = "file:./prisma/e2e.db";
const mediaRoot = path.join(root, ".media-e2e");
const searchDir = path.join(root, ".data-e2e");

for (const suffix of ["", "-journal", "-wal", "-shm"]) {
  rmSync(`${databaseFile}${suffix}`, { force: true });
}

rmSync(mediaRoot, { recursive: true, force: true });
rmSync(searchDir, { recursive: true, force: true });

execSync("npx prisma migrate deploy", {
  cwd: root,
  env: { ...process.env, DATABASE_URL: databaseUrl },
  stdio: "inherit",
  shell: true,
});

const password = "e2e-password-123";
const salt = randomBytes(16);
const key = scryptSync(password.normalize("NFKC"), salt, 64);
const passwordHash = `scrypt:${salt.toString("base64url")}:${key.toString("base64url")}`;

const now = new Date().toISOString();
const userId = "e2e_user";
const channelId = "e2e_channel";
const episodeId = "e2e_episode";
const audioPath = "audio/e2e_channel/e2e.wav";
const zcashAddress =
  "u1xfe95y0lw3eznadwvv5k4f26xq0h5ppucyeucmnzuff2r8l2jmg7v5pqlvnvkl645ucpejjvsgg8rh2zpw9f055cp0zpl7w8hqt6pwsy";

function makeWav(seconds = 4, sampleRate = 8000) {
  const samples = seconds * sampleRate;
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

const audio = makeWav();
const audioFile = path.join(mediaRoot, audioPath);
mkdirSync(path.dirname(audioFile), { recursive: true });
writeFileSync(audioFile, audio);

const analyticsAudioPath = "audio/e2e_channel/analytics.wav";
const analyticsAudioFile = path.join(mediaRoot, analyticsAudioPath);
writeFileSync(analyticsAudioFile, audio);

const coverPath = "covers/e2e_channel/cover.png";
const coverFile = path.join(mediaRoot, coverPath);
mkdirSync(path.dirname(coverFile), { recursive: true });
writeFileSync(
  coverFile,
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    "base64",
  ),
);

const db = new Database(databaseFile);

db.prepare(
  `INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "status", "createdAt", "updatedAt")
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
).run(
  userId,
  "e2e@podzcash.local",
  passwordHash,
  "E2E Tester",
  "creator",
  "active",
  now,
  now,
);

db.prepare(
  `INSERT INTO "Channel" ("id", "handle", "displayName", "bio", "zcashAddress", "userId", "createdAt", "updatedAt")
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
).run(
  channelId,
  "e2e-canal",
  "Canal E2E",
  "Canal creado por el smoke test.",
  zcashAddress,
  userId,
  now,
  now,
);

db.prepare(
  `INSERT INTO "Episode" ("id", "channelId", "title", "slug", "description", "kind", "audioPath", "coverKey", "durationSec", "fileSize", "mimeType", "status", "publishedAt", "playCount", "createdAt", "updatedAt")
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(
  episodeId,
  channelId,
  "Episodio de prueba E2E",
  "episodio-de-prueba-e2e",
  "Episodio publicado por el smoke test.",
  "podcast",
  audioPath,
  coverPath,
  4,
  audio.length,
  "audio/wav",
  "published",
  now,
  0,
  now,
  now,
);

db.prepare(
  `INSERT INTO "Episode" ("id", "channelId", "title", "slug", "description", "kind", "audioPath", "coverKey", "durationSec", "fileSize", "mimeType", "status", "publishedAt", "playCount", "createdAt", "updatedAt")
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(
  "e2e_analytics_episode",
  channelId,
  "Episodio de analítica E2E",
  "analitica-e2e",
  "Episodio publicado para probar métricas.",
  "podcast",
  analyticsAudioPath,
  null,
  4,
  audio.length,
  "audio/wav",
  "published",
  now,
  0,
  now,
  now,
);

db.close();

console.log(
  JSON.stringify(
    {
      ok: true,
      database: databaseFile,
      mediaRoot,
      user: "e2e@podzcash.local",
      channel: "e2e-canal",
      episode: "episodio-de-prueba-e2e",
    },
    null,
    2,
  ),
);

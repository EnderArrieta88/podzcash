/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `bannerUrl` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `coverUrl` on the `Episode` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarKey" TEXT,
    "bannerKey" TEXT,
    "zcashAddress" TEXT,
    "links" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("bio", "createdAt", "displayName", "handle", "id", "links", "updatedAt", "userId", "zcashAddress") SELECT "bio", "createdAt", "displayName", "handle", "id", "links", "updatedAt", "userId", "zcashAddress" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_handle_key" ON "Channel"("handle");
CREATE UNIQUE INDEX "Channel_userId_key" ON "Channel"("userId");
CREATE TABLE "new_Episode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'podcast',
    "audioPath" TEXT NOT NULL,
    "coverKey" TEXT,
    "durationSec" INTEGER,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" DATETIME,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Episode_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Episode" ("audioPath", "channelId", "createdAt", "description", "durationSec", "fileSize", "id", "kind", "mimeType", "playCount", "publishedAt", "slug", "status", "title", "updatedAt") SELECT "audioPath", "channelId", "createdAt", "description", "durationSec", "fileSize", "id", "kind", "mimeType", "playCount", "publishedAt", "slug", "status", "title", "updatedAt" FROM "Episode";
DROP TABLE "Episode";
ALTER TABLE "new_Episode" RENAME TO "Episode";
CREATE INDEX "Episode_status_publishedAt_idx" ON "Episode"("status", "publishedAt");
CREATE INDEX "Episode_channelId_status_idx" ON "Episode"("channelId", "status");
CREATE UNIQUE INDEX "Episode_channelId_slug_key" ON "Episode"("channelId", "slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "PlaybackProgress" (
    "userId" TEXT NOT NULL,
    "episodeId" TEXT NOT NULL,
    "positionSec" REAL NOT NULL DEFAULT 0,
    "durationSec" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("userId", "episodeId"),
    CONSTRAINT "PlaybackProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaybackProgress_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PlaybackProgress_userId_updatedAt_idx" ON "PlaybackProgress"("userId", "updatedAt");

-- AlterTable
ALTER TABLE "Report" ADD COLUMN "reporterId" TEXT;

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
    "feedLanguage" TEXT NOT NULL DEFAULT 'es',
    "feedCategory" TEXT NOT NULL DEFAULT 'Technology',
    "feedExplicit" BOOLEAN NOT NULL DEFAULT false,
    "ownerEmail" TEXT,
    "block" BOOLEAN NOT NULL DEFAULT false,
    "newFeedUrl" TEXT,
    "links" TEXT,
    "commentNotify" TEXT NOT NULL DEFAULT 'inbox',
    "commentsSeenAt" DATETIME,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Channel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Channel" ("avatarKey", "bannerKey", "bio", "block", "createdAt", "displayName", "feedCategory", "feedExplicit", "feedLanguage", "handle", "id", "links", "newFeedUrl", "ownerEmail", "updatedAt", "userId", "zcashAddress") SELECT "avatarKey", "bannerKey", "bio", "block", "createdAt", "displayName", "feedCategory", "feedExplicit", "feedLanguage", "handle", "id", "links", "newFeedUrl", "ownerEmail", "updatedAt", "userId", "zcashAddress" FROM "Channel";
DROP TABLE "Channel";
ALTER TABLE "new_Channel" RENAME TO "Channel";
CREATE UNIQUE INDEX "Channel_handle_key" ON "Channel"("handle");
CREATE UNIQUE INDEX "Channel_userId_key" ON "Channel"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

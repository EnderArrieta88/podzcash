-- Campos de feed por canal y por episodio.
-- SQLite permite ADD COLUMN con DEFAULT no nulo; los canales existentes
-- heredan valores seguros.

ALTER TABLE "Channel" ADD COLUMN "feedLanguage" TEXT NOT NULL DEFAULT 'es';
ALTER TABLE "Channel" ADD COLUMN "feedCategory" TEXT NOT NULL DEFAULT 'Technology';
ALTER TABLE "Channel" ADD COLUMN "feedExplicit" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "Channel" ADD COLUMN "ownerEmail" TEXT;
ALTER TABLE "Channel" ADD COLUMN "block" BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE "Channel" ADD COLUMN "newFeedUrl" TEXT;

ALTER TABLE "Episode" ADD COLUMN "season" INTEGER;
ALTER TABLE "Episode" ADD COLUMN "episodeNumber" INTEGER;
ALTER TABLE "Episode" ADD COLUMN "episodeType" TEXT NOT NULL DEFAULT 'full';
ALTER TABLE "Episode" ADD COLUMN "explicit" BOOLEAN;

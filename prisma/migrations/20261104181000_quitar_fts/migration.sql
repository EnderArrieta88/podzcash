-- Se descarta el índice FTS dentro de la base principal: Prisma lo interpreta
-- como deriva porque no puede modelar tablas virtuales. El índice vive ahora en
-- su propio archivo (.data/search.db), gestionado por src/lib/search-index.ts.

DROP TRIGGER IF EXISTS episode_fts_insert;
DROP TRIGGER IF EXISTS episode_fts_update;
DROP TRIGGER IF EXISTS episode_fts_delete;
DROP TRIGGER IF EXISTS episode_tag_fts_insert;
DROP TRIGGER IF EXISTS episode_tag_fts_delete;
DROP TRIGGER IF EXISTS channel_fts_update;
DROP TRIGGER IF EXISTS tag_fts_update;

DROP TABLE IF EXISTS "EpisodeFts";
DROP TABLE IF EXISTS "_EpisodeFts";

-- Prisma ignora las tablas cuyo nombre empieza con "_" (como _prisma_migrations),
-- así que la tabla FTS se renombra para que no aparezca como deriva.

DROP TRIGGER IF EXISTS episode_fts_insert;
DROP TRIGGER IF EXISTS episode_fts_update;
DROP TRIGGER IF EXISTS episode_fts_delete;
DROP TRIGGER IF EXISTS episode_tag_fts_insert;
DROP TRIGGER IF EXISTS episode_tag_fts_delete;
DROP TRIGGER IF EXISTS channel_fts_update;
DROP TRIGGER IF EXISTS tag_fts_update;

DROP TABLE IF EXISTS "EpisodeFts";

CREATE VIRTUAL TABLE "_EpisodeFts" USING fts5(
  episodeId UNINDEXED,
  title,
  description,
  tags,
  channel,
  tokenize = 'unicode61 remove_diacritics 2'
);

INSERT INTO _EpisodeFts (episodeId, title, description, tags, channel)
SELECT
  e.id,
  e.title,
  COALESCE(e.description, ''),
  COALESCE((
    SELECT group_concat(t.name, ' ')
    FROM EpisodeTag et
    JOIN Tag t ON t.id = et.tagId
    WHERE et.episodeId = e.id
  ), ''),
  c.displayName
FROM Episode e
JOIN Channel c ON c.id = e.channelId;

CREATE TRIGGER episode_fts_insert AFTER INSERT ON Episode BEGIN
  INSERT INTO _EpisodeFts (episodeId, title, description, tags, channel)
  SELECT
    e.id,
    e.title,
    COALESCE(e.description, ''),
    COALESCE((
      SELECT group_concat(t.name, ' ')
      FROM EpisodeTag et
      JOIN Tag t ON t.id = et.tagId
      WHERE et.episodeId = e.id
    ), ''),
    c.displayName
  FROM Episode e
  JOIN Channel c ON c.id = e.channelId
  WHERE e.id = NEW.id;
END;

CREATE TRIGGER episode_fts_update AFTER UPDATE ON Episode BEGIN
  DELETE FROM _EpisodeFts WHERE episodeId = NEW.id;

  INSERT INTO _EpisodeFts (episodeId, title, description, tags, channel)
  SELECT
    e.id,
    e.title,
    COALESCE(e.description, ''),
    COALESCE((
      SELECT group_concat(t.name, ' ')
      FROM EpisodeTag et
      JOIN Tag t ON t.id = et.tagId
      WHERE et.episodeId = e.id
    ), ''),
    c.displayName
  FROM Episode e
  JOIN Channel c ON c.id = e.channelId
  WHERE e.id = NEW.id;
END;

CREATE TRIGGER episode_fts_delete AFTER DELETE ON Episode BEGIN
  DELETE FROM _EpisodeFts WHERE episodeId = OLD.id;
END;

CREATE TRIGGER episode_tag_fts_insert AFTER INSERT ON EpisodeTag BEGIN
  DELETE FROM _EpisodeFts WHERE episodeId = NEW.episodeId;

  INSERT INTO _EpisodeFts (episodeId, title, description, tags, channel)
  SELECT
    e.id,
    e.title,
    COALESCE(e.description, ''),
    COALESCE((
      SELECT group_concat(t.name, ' ')
      FROM EpisodeTag et
      JOIN Tag t ON t.id = et.tagId
      WHERE et.episodeId = e.id
    ), ''),
    c.displayName
  FROM Episode e
  JOIN Channel c ON c.id = e.channelId
  WHERE e.id = NEW.episodeId;
END;

CREATE TRIGGER episode_tag_fts_delete AFTER DELETE ON EpisodeTag BEGIN
  DELETE FROM _EpisodeFts WHERE episodeId = OLD.episodeId;

  INSERT INTO _EpisodeFts (episodeId, title, description, tags, channel)
  SELECT
    e.id,
    e.title,
    COALESCE(e.description, ''),
    COALESCE((
      SELECT group_concat(t.name, ' ')
      FROM EpisodeTag et
      JOIN Tag t ON t.id = et.tagId
      WHERE et.episodeId = e.id
    ), ''),
    c.displayName
  FROM Episode e
  JOIN Channel c ON c.id = e.channelId
  WHERE e.id = OLD.episodeId;
END;

CREATE TRIGGER channel_fts_update AFTER UPDATE OF displayName ON Channel BEGIN
  DELETE FROM _EpisodeFts
  WHERE episodeId IN (SELECT id FROM Episode WHERE channelId = NEW.id);

  INSERT INTO _EpisodeFts (episodeId, title, description, tags, channel)
  SELECT
    e.id,
    e.title,
    COALESCE(e.description, ''),
    COALESCE((
      SELECT group_concat(t.name, ' ')
      FROM EpisodeTag et
      JOIN Tag t ON t.id = et.tagId
      WHERE et.episodeId = e.id
    ), ''),
    c.displayName
  FROM Episode e
  JOIN Channel c ON c.id = e.channelId
  WHERE e.channelId = NEW.id;
END;

CREATE TRIGGER tag_fts_update AFTER UPDATE OF name ON Tag BEGIN
  DELETE FROM _EpisodeFts
  WHERE episodeId IN (SELECT episodeId FROM EpisodeTag WHERE tagId = NEW.id);

  INSERT INTO _EpisodeFts (episodeId, title, description, tags, channel)
  SELECT
    e.id,
    e.title,
    COALESCE(e.description, ''),
    COALESCE((
      SELECT group_concat(t.name, ' ')
      FROM EpisodeTag et
      JOIN Tag t ON t.id = et.tagId
      WHERE et.episodeId = e.id
    ), ''),
    c.displayName
  FROM Episode e
  JOIN Channel c ON c.id = e.channelId
  WHERE e.id IN (SELECT episodeId FROM EpisodeTag WHERE tagId = NEW.id);
END;

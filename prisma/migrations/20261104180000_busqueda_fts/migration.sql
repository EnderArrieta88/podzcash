-- Búsqueda full-text (FTS5) sobre episodios.
-- Se mantiene sincronizada con triggers, así el código de la app no tiene que
-- acordarse de indexar a mano.

CREATE VIRTUAL TABLE "EpisodeFts" USING fts5(
  episodeId UNINDEXED,
  title,
  description,
  tags,
  channel,
  tokenize = 'unicode61 remove_diacritics 2'
);

-- Rellena con lo que ya existe.
INSERT INTO EpisodeFts (episodeId, title, description, tags, channel)
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

-- Episodio creado.
CREATE TRIGGER episode_fts_insert AFTER INSERT ON Episode BEGIN
  INSERT INTO EpisodeFts (episodeId, title, description, tags, channel)
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

-- Episodio editado.
CREATE TRIGGER episode_fts_update AFTER UPDATE ON Episode BEGIN
  DELETE FROM EpisodeFts WHERE episodeId = NEW.id;

  INSERT INTO EpisodeFts (episodeId, title, description, tags, channel)
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

-- Episodio borrado.
CREATE TRIGGER episode_fts_delete AFTER DELETE ON Episode BEGIN
  DELETE FROM EpisodeFts WHERE episodeId = OLD.id;
END;

-- Etiqueta agregada a un episodio.
CREATE TRIGGER episode_tag_fts_insert AFTER INSERT ON EpisodeTag BEGIN
  DELETE FROM EpisodeFts WHERE episodeId = NEW.episodeId;

  INSERT INTO EpisodeFts (episodeId, title, description, tags, channel)
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

-- Etiqueta quitada de un episodio.
CREATE TRIGGER episode_tag_fts_delete AFTER DELETE ON EpisodeTag BEGIN
  DELETE FROM EpisodeFts WHERE episodeId = OLD.episodeId;

  INSERT INTO EpisodeFts (episodeId, title, description, tags, channel)
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

-- El canal cambió de nombre: se reindexan sus episodios.
CREATE TRIGGER channel_fts_update AFTER UPDATE OF displayName ON Channel BEGIN
  DELETE FROM EpisodeFts
  WHERE episodeId IN (SELECT id FROM Episode WHERE channelId = NEW.id);

  INSERT INTO EpisodeFts (episodeId, title, description, tags, channel)
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

-- La etiqueta cambió de nombre: se reindexan los episodios que la usan.
CREATE TRIGGER tag_fts_update AFTER UPDATE OF name ON Tag BEGIN
  DELETE FROM EpisodeFts
  WHERE episodeId IN (SELECT episodeId FROM EpisodeTag WHERE tagId = NEW.id);

  INSERT INTO EpisodeFts (episodeId, title, description, tags, channel)
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

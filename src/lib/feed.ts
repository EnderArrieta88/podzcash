// Categorías de primer nivel aceptadas por Apple Podcasts.
export const PODCAST_CATEGORIES = [
  "Arts",
  "Business",
  "Comedy",
  "Education",
  "Fiction",
  "Government",
  "Health & Fitness",
  "History",
  "Kids & Family",
  "Leisure",
  "Music",
  "News",
  "Religion & Spirituality",
  "Science",
  "Society & Culture",
  "Sports",
  "Technology",
  "True Crime",
  "TV & Film",
] as const;

export type PodcastCategory = (typeof PODCAST_CATEGORIES)[number];

// Tipos de episodio de Apple Podcasts.
export const EPISODE_TYPES = ["full", "trailer", "bonus"] as const;

export type EpisodeType = (typeof EPISODE_TYPES)[number];

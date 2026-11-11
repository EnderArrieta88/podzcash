export type EpisodeCommentItem = {
  id: string;
  userId: string;
  body: string;
  createdAt: Date;
  user: { name: string };
};

export type EpisodeCommentsPage = {
  items: EpisodeCommentItem[];
  total: number;
  page: number;
  pageCount: number;
};

export type ChannelCommentItem = EpisodeCommentItem & {
  episode: { id: string; title: string; slug: string; status: string };
};

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { ensureFeedSchema } = await import("./lib/feed-migration");
  ensureFeedSchema();

  const { ensureCommentsSchema } = await import("./lib/comments-migration");
  ensureCommentsSchema();
}

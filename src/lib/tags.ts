const MAX_TAGS = 8;
const MAX_TAG_LENGTH = 30;

export function parseTags(raw: FormDataEntryValue | null): string[] {
  if (typeof raw !== "string") return [];

  const seen = new Set<string>();
  const tags: string[] = [];

  for (const part of raw.split(",")) {
    const name = part.trim().replace(/\s+/g, " ").slice(0, MAX_TAG_LENGTH);

    if (!name) continue;

    const key = name.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    tags.push(name);

    if (tags.length === MAX_TAGS) break;
  }

  return tags;
}

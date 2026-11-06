export type ActionState = {
  ok?: boolean;
  error?: string;
  /** Código estable para que la UI reaccione sin comparar textos. */
  code?: "unverified";
  fields?: Record<string, string>;
} | null;

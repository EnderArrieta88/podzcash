export type ActionState = {
  ok?: boolean;
  error?: string;
  fields?: Record<string, string>;
} | null;

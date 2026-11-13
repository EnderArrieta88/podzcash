"use client";

import {
  FieldError,
  FieldHint,
  Input,
  Label,
  Textarea,
} from "@/components/ui/field";
import type { StudioEpisodesContent } from "@/lib/i18n/studio-episodes";
import type { EpisodeMeta } from "./meta";

type Labels = StudioEpisodesContent["form"];

export function MetadataFields({
  meta,
  fields,
  labels,
  onChange,
}: {
  meta: EpisodeMeta;
  fields: Record<string, string> | undefined;
  labels: Labels;
  onChange: (field: keyof EpisodeMeta, value: string) => void;
}) {
  return (
    <>
      <div>
        <Label htmlFor="title">{labels.title}</Label>
        <Input
          id="title"
          name="title"
          value={meta.title}
          onChange={(event) => onChange("title", event.target.value)}
          required
          maxLength={140}
          placeholder={labels.titlePlaceholder}
        />
        <FieldError>{fields?.title}</FieldError>
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium text-text">
          {labels.kind}
        </span>
        <div className="flex gap-3">
          {[
            { value: "podcast", label: labels.podcast },
            { value: "music", label: labels.music },
          ].map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface-2 px-4 py-2.5 text-sm transition-colors has-checked:border-brand has-checked:bg-brand-soft/50 has-checked:text-brand"
            >
              <input
                type="radio"
                name="kind"
                value={option.value}
                checked={meta.kind === option.value}
                onChange={() => onChange("kind", option.value)}
                className="accent-[var(--color-brand)]"
              />
              {option.label}
            </label>
          ))}
        </div>
        <FieldError>{fields?.kind}</FieldError>
      </div>

      <div>
        <Label htmlFor="description">{labels.description}</Label>
        <Textarea
          id="description"
          name="description"
          value={meta.description}
          onChange={(event) => onChange("description", event.target.value)}
          rows={5}
          maxLength={5000}
          placeholder={labels.descriptionPlaceholder}
        />
        <FieldError>{fields?.description}</FieldError>
      </div>

      <div>
        <Label htmlFor="tags">{labels.tags}</Label>
        <Input
          id="tags"
          name="tags"
          value={meta.tags}
          onChange={(event) => onChange("tags", event.target.value)}
          maxLength={240}
          placeholder={labels.tagsPlaceholder}
        />
        <FieldHint>{labels.tagsHint}</FieldHint>
        <FieldError>{fields?.tags}</FieldError>
      </div>
    </>
  );
}

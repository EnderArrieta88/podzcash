"use client";

import {
  FieldError,
  FieldHint,
  Input,
  Label,
  Select,
} from "@/components/ui/field";
import type { StudioEpisodesContent } from "@/lib/i18n/studio-episodes";
import type { EpisodeMeta } from "./meta";

type Labels = StudioEpisodesContent["form"];

export function FeedFields({
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
    <div className="rounded-xl border border-border bg-surface-2/60 p-4">
      <h2 className="font-heading text-sm font-semibold">
        {labels.feedSection}
      </h2>
      <p className="mt-1 text-xs text-muted">{labels.feedSectionHint}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="season">{labels.season}</Label>
          <Input
            id="season"
            name="season"
            type="number"
            min={0}
            max={9999}
            value={meta.season}
            onChange={(event) => onChange("season", event.target.value)}
            inputMode="numeric"
          />
          <FieldError>{fields?.season}</FieldError>
        </div>

        <div>
          <Label htmlFor="episodeNumber">{labels.episodeNumber}</Label>
          <Input
            id="episodeNumber"
            name="episodeNumber"
            type="number"
            min={1}
            max={99999}
            value={meta.episodeNumber}
            onChange={(event) => onChange("episodeNumber", event.target.value)}
            inputMode="numeric"
          />
          <FieldError>{fields?.episodeNumber}</FieldError>
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="episodeType">{labels.episodeType}</Label>
        <Select
          id="episodeType"
          name="episodeType"
          value={meta.episodeType}
          onChange={(event) => onChange("episodeType", event.target.value)}
        >
          <option value="full">{labels.typeFull}</option>
          <option value="trailer">{labels.typeTrailer}</option>
          <option value="bonus">{labels.typeBonus}</option>
        </Select>
        <FieldError>{fields?.episodeType}</FieldError>
        <FieldHint>{labels.episodeTypeHint}</FieldHint>
      </div>

      <div className="mt-4">
        <Label htmlFor="explicit">{labels.explicit}</Label>
        <Select
          id="explicit"
          name="explicit"
          value={meta.explicit}
          onChange={(event) => onChange("explicit", event.target.value)}
        >
          <option value="">{labels.explicitInherit}</option>
          <option value="true">{labels.explicitYes}</option>
          <option value="false">{labels.explicitNo}</option>
        </Select>
        <FieldError>{fields?.explicit}</FieldError>
        <FieldHint>{labels.explicitHint}</FieldHint>
      </div>
    </div>
  );
}

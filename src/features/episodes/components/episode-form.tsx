"use client";

import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { saveEpisodeAction } from "@/features/episodes/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StudioEpisodesContent } from "@/lib/i18n/studio-episodes";
import type { EpisodeFormValues } from "../types";
import { AudioField } from "./episode-form/audio-field";
import { CoverField } from "./episode-form/cover-field";
import { FeedFields } from "./episode-form/feed-fields";
import { MetadataFields } from "./episode-form/metadata-fields";
import { buildEpisodeMeta, type EpisodeMeta } from "./episode-form/meta";
import { useEpisodeUpload } from "./episode-form/use-episode-upload";

type EpisodeFormLabels = StudioEpisodesContent["form"];

export function EpisodeForm({
  episode,
  labels,
}: {
  episode: EpisodeFormValues | null;
  labels: EpisodeFormLabels;
}) {
  const [state, action] = useActionState(saveEpisodeAction, null);

  const {
    audio,
    cover,
    duration,
    uploading,
    audioProgress,
    coverProgress,
    uploadError,
    dragging,
    audioInput,
    coverInput,
    handleAudio,
    handleCover,
    removeAudio,
    setDragging,
  } = useEpisodeUpload(episode, labels);

  const [meta, setMeta] = useState(() => buildEpisodeMeta(episode));

  function updateMeta(field: keyof EpisodeMeta, value: string) {
    setMeta((current) => ({ ...current, [field]: value }));
  }

  const busy = uploading !== null;
  const canSave = Boolean(audio) && !busy;

  return (
    <form action={action} className="space-y-7">
      <input type="hidden" name="id" value={episode?.id ?? ""} />
      <input type="hidden" name="audioKey" value={audio?.key ?? ""} />
      <input type="hidden" name="mimeType" value={audio?.mimeType ?? ""} />
      <input type="hidden" name="fileSize" value={audio?.size ?? ""} />
      <input type="hidden" name="durationSec" value={duration ?? ""} />
      <input type="hidden" name="coverKey" value={cover?.key ?? ""} />

      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      {uploadError && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {uploadError}
        </p>
      )}

      <AudioField
        audio={audio}
        duration={duration}
        uploading={uploading}
        progress={audioProgress}
        dragging={dragging}
        labels={labels}
        error={state?.fields?.audio}
        inputRef={audioInput}
        onFile={(file) => void handleAudio(file)}
        onDraggingChange={setDragging}
        onRemove={removeAudio}
      />

      <CoverField
        cover={cover}
        uploading={uploading}
        progress={coverProgress}
        labels={labels}
        error={state?.fields?.cover}
        inputRef={coverInput}
        onFile={(file) => void handleCover(file)}
      />

      <MetadataFields
        meta={meta}
        fields={state?.fields}
        labels={labels}
        onChange={updateMeta}
      />

      <FeedFields
        meta={meta}
        fields={state?.fields}
        labels={labels}
        onChange={updateMeta}
      />

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <SubmitButton
          name="intent"
          value="publish"
          pendingLabel={labels.publishing}
          disabled={!canSave}
        >
          <CheckCircle2 size={15} />
          {labels.publish}
        </SubmitButton>

        <SubmitButton
          name="intent"
          value="draft"
          variant="secondary"
          pendingLabel={labels.saving}
          disabled={!canSave}
        >
          {labels.saveDraft}
        </SubmitButton>

        {!audio && <p className="text-xs text-subtle">{labels.needAudio}</p>}
      </div>
    </form>
  );
}

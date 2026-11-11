"use client";

import { useActionState, useState } from "react";
import { saveChannelAction } from "@/app/(app)/estudio/actions";
import type { ChannelLink } from "@/lib/links";
import { AvatarField } from "@/components/studio/avatar-field";
import { BannerField } from "@/components/studio/banner-field";
import { LinksEditor } from "@/components/studio/links-editor";
import {
  FieldError,
  FieldHint,
  Input,
  Label,
  Select,
  Textarea,
} from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { PODCAST_CATEGORIES } from "@/lib/feed";
import type { ChannelFormLabels } from "@/lib/i18n/studio-channel";

type ChannelFormProps = {
  channel: {
    handle: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    zcashAddress: string | null;
    feedLanguage: string;
    feedCategory: string;
    feedExplicit: boolean;
    ownerEmail: string | null;
    block: boolean;
    newFeedUrl: string | null;
  } | null;
  links: ChannelLink[];
  labels: ChannelFormLabels;
};

export function ChannelForm({ channel, links, labels }: ChannelFormProps) {
  const [state, action] = useActionState(saveChannelAction, null);

  // Campos controlados: React resetea los formularios no controlados después de
  // una Server Action, y en un error de validación se perdería lo escrito.
  const [values, setValues] = useState({
    displayName: channel?.displayName ?? "",
    handle: channel?.handle ?? "",
    bio: channel?.bio ?? "",
    zcashAddress: channel?.zcashAddress ?? "",
    feedLanguage: channel?.feedLanguage ?? "es",
    feedCategory: channel?.feedCategory ?? "Technology",
    feedExplicit: channel?.feedExplicit ?? false,
    ownerEmail: channel?.ownerEmail ?? "",
    block: channel?.block ?? false,
    newFeedUrl: channel?.newFeedUrl ?? "",
  });

  function update<K extends keyof typeof values>(
    field: K,
    value: (typeof values)[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <form action={action} className="space-y-6">
      {state?.ok && (
        <p className="rounded-[10px] border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm text-success">
          {labels.saved}
        </p>
      )}

      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <AvatarField
        initialUrl={channel?.avatarUrl ?? null}
        labels={{
          avatar: labels.avatar,
          avatarAlt: labels.avatarAlt,
          uploadImage: labels.uploadImage,
          avatarHint: labels.avatarHint,
        }}
      />
      <FieldError>{state?.fields?.avatar}</FieldError>

      <BannerField
        initialUrl={channel?.bannerUrl ?? null}
        labels={{
          banner: labels.banner,
          bannerAlt: labels.bannerAlt,
          uploadBanner: labels.uploadBanner,
          bannerHint: labels.bannerHint,
        }}
      />
      <FieldError>{state?.fields?.banner}</FieldError>

      <div>
        <Label htmlFor="displayName">{labels.displayName}</Label>
        <Input
          id="displayName"
          name="displayName"
          value={values.displayName}
          onChange={(event) => update("displayName", event.target.value)}
          required
          maxLength={60}
          placeholder={labels.displayNamePlaceholder}
        />
        <FieldError>{state?.fields?.displayName}</FieldError>
      </div>

      <div>
        <Label htmlFor="handle">{labels.username}</Label>
        <div className="flex items-center gap-2">
          <span className="shrink-0 font-mono text-sm text-subtle">
            /canal/@
          </span>
          <Input
            id="handle"
            name="handle"
            value={values.handle}
            onChange={(event) => update("handle", event.target.value)}
            required
            minLength={3}
            maxLength={30}
            placeholder={labels.usernamePlaceholder}
            className="font-mono"
          />
        </div>
        <FieldError>{state?.fields?.handle}</FieldError>
        <FieldHint>{labels.usernameHint}</FieldHint>
      </div>

      <div>
        <Label htmlFor="bio">{labels.bio}</Label>
        <Textarea
          id="bio"
          name="bio"
          value={values.bio}
          onChange={(event) => update("bio", event.target.value)}
          rows={4}
          maxLength={500}
          placeholder={labels.bioPlaceholder}
        />
        <FieldError>{state?.fields?.bio}</FieldError>
      </div>

      <LinksEditor
        initial={links}
        labels={{
          links: labels.links,
          optional: labels.optional,
          linkLabel: labels.linkLabel,
          linkUrl: labels.linkUrl,
          linkLabelAria: labels.linkLabelAria,
          linkUrlAria: labels.linkUrlAria,
          removeLink: labels.removeLink,
          addLink: labels.addLink,
        }}
      />
      <FieldError>{state?.fields?.links}</FieldError>

      <div className="rounded-xl border border-border bg-surface-2/60 p-4">
        <Label htmlFor="zcashAddress">
          {labels.zcashAddress}{" "}
          <span className="font-normal text-subtle">{labels.optional}</span>
        </Label>
        <Input
          id="zcashAddress"
          name="zcashAddress"
          value={values.zcashAddress}
          onChange={(event) => update("zcashAddress", event.target.value)}
          placeholder={labels.zcashPlaceholder}
          className="font-mono text-xs"
          spellCheck={false}
          autoComplete="off"
        />
        <FieldError>{state?.fields?.zcashAddress}</FieldError>
        <FieldHint>{labels.zcashHint}</FieldHint>
      </div>

      <div className="rounded-xl border border-border bg-surface-2/60 p-4">
        <h2 className="font-heading text-sm font-semibold">
          {labels.feedSection}
        </h2>
        <p className="mt-1 text-xs text-muted">{labels.feedSectionHint}</p>

        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="feedLanguage">{labels.feedLanguage}</Label>
            <Input
              id="feedLanguage"
              name="feedLanguage"
              value={values.feedLanguage}
              onChange={(event) => update("feedLanguage", event.target.value)}
              maxLength={10}
              spellCheck={false}
              autoComplete="off"
              placeholder="es"
            />
            <FieldError>{state?.fields?.feedLanguage}</FieldError>
            <FieldHint>{labels.feedLanguageHint}</FieldHint>
          </div>

          <div>
            <Label htmlFor="feedCategory">{labels.feedCategory}</Label>
            <Select
              id="feedCategory"
              name="feedCategory"
              value={values.feedCategory}
              onChange={(event) => update("feedCategory", event.target.value)}
            >
              {PODCAST_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <FieldError>{state?.fields?.feedCategory}</FieldError>
            <FieldHint>{labels.feedCategoryHint}</FieldHint>
          </div>

          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              name="feedExplicit"
              checked={values.feedExplicit}
              onChange={(event) => update("feedExplicit", event.target.checked)}
              className="mt-0.5 size-4 accent-[var(--color-brand)]"
            />
            <span>
              <span className="block font-medium text-text">
                {labels.feedExplicit}
              </span>
              <span className="block text-xs text-subtle">
                {labels.feedExplicitHint}
              </span>
            </span>
          </label>

          <div>
            <Label htmlFor="ownerEmail">{labels.ownerEmail}</Label>
            <Input
              id="ownerEmail"
              name="ownerEmail"
              type="email"
              value={values.ownerEmail}
              onChange={(event) => update("ownerEmail", event.target.value)}
              autoComplete="email"
              placeholder="hola@ejemplo.com"
            />
            <FieldError>{state?.fields?.ownerEmail}</FieldError>
            <FieldHint>{labels.ownerEmailHint}</FieldHint>
          </div>

          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              name="block"
              checked={values.block}
              onChange={(event) => update("block", event.target.checked)}
              className="mt-0.5 size-4 accent-[var(--color-brand)]"
            />
            <span>
              <span className="block font-medium text-text">
                {labels.block}
              </span>
              <span className="block text-xs text-subtle">
                {labels.blockHint}
              </span>
            </span>
          </label>

          <div>
            <Label htmlFor="newFeedUrl">{labels.newFeedUrl}</Label>
            <Input
              id="newFeedUrl"
              name="newFeedUrl"
              type="url"
              value={values.newFeedUrl}
              onChange={(event) => update("newFeedUrl", event.target.value)}
              placeholder="https://..."
              spellCheck={false}
            />
            <FieldError>{state?.fields?.newFeedUrl}</FieldError>
            <FieldHint>{labels.newFeedUrlHint}</FieldHint>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <SubmitButton pendingLabel={labels.saving}>
          {channel ? labels.save : labels.create}
        </SubmitButton>
        {!channel && <p className="text-xs text-subtle">{labels.editLater}</p>}
      </div>
    </form>
  );
}

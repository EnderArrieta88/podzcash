"use client";

import { useActionState } from "react";
import Link from "next/link";
import { joinWaitlistAction } from "@/features/waitlist/actions";
import { FieldError, Input, Label, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import type { WaitlistContent } from "@/lib/i18n/waitlist";

export function WaitlistForm({ labels }: { labels: WaitlistContent }) {
  const [state, action] = useActionState(joinWaitlistAction, null);

  if (state?.ok) {
    return (
      <div>
        <p className="rounded-xl border border-jade/30 bg-jade-soft px-4 py-3 text-sm font-medium text-jade-bright">
          {labels.successTitle}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {labels.successBody}
        </p>
        <Link
          href="/"
          className="mt-5 inline-block text-sm text-brand hover:underline"
        >
          {labels.backHome}
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <div aria-hidden="true" className="hidden">
        <label htmlFor="waitlist-website">Website</label>
        <input
          id="waitlist-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <Label htmlFor="waitlist-name">{labels.name}</Label>
        <Input
          id="waitlist-name"
          name="name"
          required
          maxLength={60}
          placeholder={labels.namePlaceholder}
        />
        <FieldError>{state?.fields?.name}</FieldError>
      </div>

      <div>
        <Label htmlFor="waitlist-email">{labels.email}</Label>
        <Input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={labels.emailPlaceholder}
        />
        <FieldError>{state?.fields?.email}</FieldError>
      </div>

      <div>
        <Label htmlFor="waitlist-role">{labels.role}</Label>
        <select
          id="waitlist-role"
          name="role"
          defaultValue="podcast"
          className="h-11 w-full rounded-[10px] border border-border bg-surface-2 px-3.5 text-sm text-text outline-none transition-colors focus:border-brand focus:ring-4 focus:ring-brand/15"
        >
          <option value="podcast">{labels.roles.podcast}</option>
          <option value="music">{labels.roles.music}</option>
          <option value="other">{labels.roles.other}</option>
        </select>
        <FieldError>{state?.fields?.role}</FieldError>
      </div>

      <div>
        <Label htmlFor="waitlist-note">
          {labels.note}{" "}
          <span className="font-normal text-subtle">{labels.noteOptional}</span>
        </Label>
        <Textarea
          id="waitlist-note"
          name="note"
          rows={4}
          maxLength={400}
          placeholder={labels.notePlaceholder}
        />
        <FieldError>{state?.fields?.note}</FieldError>
      </div>

      <SubmitButton className="w-full" pendingLabel={labels.pending}>
        {labels.submit}
      </SubmitButton>
    </form>
  );
}

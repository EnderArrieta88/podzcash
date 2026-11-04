"use client";

import { useActionState, useState } from "react";
import { saveChannelAction } from "@/app/estudio/actions";
import type { ChannelLink } from "@/lib/links";
import { AvatarField } from "@/components/studio/avatar-field";
import { LinksEditor } from "@/components/studio/links-editor";
import { FieldError, FieldHint, Input, Label, Textarea } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";

type ChannelFormProps = {
  channel: {
    handle: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    zcashAddress: string | null;
  } | null;
  links: ChannelLink[];
};

export function ChannelForm({ channel, links }: ChannelFormProps) {
  const [state, action] = useActionState(saveChannelAction, null);

  // Campos controlados: React resetea los formularios no controlados después de
  // una Server Action, y en un error de validación se perdería lo escrito.
  const [values, setValues] = useState({
    displayName: channel?.displayName ?? "",
    handle: channel?.handle ?? "",
    bio: channel?.bio ?? "",
    zcashAddress: channel?.zcashAddress ?? "",
  });

  function update(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  return (
    <form action={action} className="space-y-6">
      {state?.ok && (
        <p className="rounded-[10px] border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm text-success">
          Canal guardado.
        </p>
      )}

      {state?.error && (
        <p className="rounded-[10px] border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          {state.error}
        </p>
      )}

      <AvatarField initialUrl={channel?.avatarUrl ?? null} />
      <FieldError>{state?.fields?.avatar}</FieldError>

      <div>
        <Label htmlFor="displayName">Nombre del canal</Label>
        <Input
          id="displayName"
          name="displayName"
          value={values.displayName}
          onChange={(event) => update("displayName", event.target.value)}
          required
          maxLength={60}
          placeholder="Zcash en Español"
        />
        <FieldError>{state?.fields?.displayName}</FieldError>
      </div>

      <div>
        <Label htmlFor="handle">Handle</Label>
        <div className="flex items-center gap-2">
          <span className="shrink-0 font-mono text-sm text-subtle">
            /c/
          </span>
          <Input
            id="handle"
            name="handle"
            value={values.handle}
            onChange={(event) => update("handle", event.target.value)}
            required
            minLength={3}
            maxLength={30}
            placeholder="zcash-es"
            className="font-mono"
          />
        </div>
        <FieldError>{state?.fields?.handle}</FieldError>
        <FieldHint>
          Es la dirección de tu canal. Solo minúsculas, números y guiones.
        </FieldHint>
      </div>

      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={values.bio}
          onChange={(event) => update("bio", event.target.value)}
          rows={4}
          maxLength={500}
          placeholder="Cuéntale a la comunidad de qué hablas o qué música haces."
        />
        <FieldError>{state?.fields?.bio}</FieldError>
      </div>

      <LinksEditor initial={links} />
      <FieldError>{state?.fields?.links}</FieldError>

      <div className="rounded-xl border border-border bg-surface-2/60 p-4">
        <Label htmlFor="zcashAddress">
          Dirección Zcash{" "}
          <span className="font-normal text-subtle">(opcional)</span>
        </Label>
        <Input
          id="zcashAddress"
          name="zcashAddress"
          value={values.zcashAddress}
          onChange={(event) => update("zcashAddress", event.target.value)}
          placeholder="u1… · zs1… · t1… · t3…"
          className="font-mono text-xs"
          spellCheck={false}
          autoComplete="off"
        />
        <FieldError>{state?.fields?.zcashAddress}</FieldError>
        <FieldHint>
          Activa las donaciones de tu canal. Validamos el checksum al guardar.
          Ideal una dirección unificada (u1) o Sapling (zs1) para que el monto y
          el memo queden protegidos.
        </FieldHint>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <SubmitButton>{channel ? "Guardar cambios" : "Crear canal"}</SubmitButton>
        {!channel && (
          <p className="text-xs text-subtle">
            Podrás editarlo cuando quieras.
          </p>
        )}
      </div>
    </form>
  );
}

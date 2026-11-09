"use client";

/**
 * Botón de envío con confirmación del navegador. Se usa dentro de un formulario
 * que ya tiene su server action.
 */
export function ConfirmButton({
  label,
  confirmLabel,
  className,
}: {
  label: string;
  confirmLabel: string;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmLabel)) event.preventDefault();
      }}
      className={className}
    >
      {label}
    </button>
  );
}

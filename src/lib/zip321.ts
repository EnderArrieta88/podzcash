export type PaymentRequest = {
  address: string;
  amount?: number;
  memo?: string;
  message?: string;
};

export const MAX_MEMO_BYTES = 512;

/**
 * Longitud real del memo en UTF-8. ZIP-321 limita el memo a 512 bytes, no a
 * 512 caracteres: un emoji puede ocupar 4 bytes.
 */
export function memoByteLength(memo: string): number {
  return new TextEncoder().encode(memo).length;
}

function formatAmount(amount: number): string {
  return amount.toFixed(8).replace(/0+$/, "").replace(/\.$/, "");
}

/**
 * Codifica en base64url sin padding, como pide ZIP-321 para el memo.
 * btoa trabaja con latin1, así que primero pasamos el texto a UTF-8.
 */
export function encodeMemo(memo: string): string {
  const bytes = new TextEncoder().encode(memo);

  if (bytes.length > MAX_MEMO_BYTES) {
    throw new RangeError(
      `El memo supera los ${MAX_MEMO_BYTES} bytes permitidos por ZIP-321.`,
    );
  }

  let binary = "";

  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

/**
 * Construye una URI ZIP-321:
 * zcash:<dirección>?amount=<zec>&memo=<base64url>&message=<texto>
 */
export function buildPaymentUri({
  address,
  amount,
  memo,
  message,
}: PaymentRequest): string {
  const params: string[] = [];

  if (amount && amount > 0) {
    params.push(`amount=${formatAmount(amount)}`);
  }

  if (memo?.trim()) {
    params.push(`memo=${encodeMemo(memo.trim())}`);
  }

  if (message?.trim()) {
    params.push(`message=${encodeURIComponent(message.trim())}`);
  }

  return `zcash:${address}${params.length ? `?${params.join("&")}` : ""}`;
}

export const AMOUNT_PRESETS = [0.01, 0.05, 0.1, 0.5] as const;

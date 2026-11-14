import type { Locale } from "./config";

const es = {
  notFound: "Canal no encontrado",
  metaTitle: (name: string) => `Apoyar a ${name}`,
  metaDescription: (name: string) =>
    `Dona ZEC directamente a ${name} en PodZcash.`,
  noAddressTitle: (name: string) => `${name} todavía no acepta donaciones`,
  noAddressBody:
    "Cuando el creador añada su dirección de Zcash, va a aparecer aquí.",
  backToChannel: "Volver al canal",
  title: (name: string) => `Apoyar a ${name}`,
  subtitle: "Donación directa en ZEC, de persona a persona.",
  notes: [
    {
      title: "Sin custodia",
      body: "El pago va directo a la wallet del creador. PodZcash nunca retiene el dinero.",
    },
    {
      title: "Sin cuenta",
      body: "No hace falta registrarse ni iniciar sesión para donar.",
    },
    {
      title: "Privacidad",
      body: "Con una dirección protegida, el monto y el memo quedan cifrados. Con una transparente, son públicos.",
    },
  ],
  box: {
    qrAlt: "Código QR para donar a",
    generating: "Generando QR…",
    scanHint: "Escanea con Zashi, Zingo o Ywallet",
    addressLabel: "Dirección Zcash",
    verified: "verificada",
    copyAria: "Copiar dirección",
    amount: "Monto",
    optional: "(opcional)",
    other: "Otro",
    amountAria: "Monto en ZEC",
    amountInvalid: "Ingresa un monto mayor que 0 y menor que 1.000.000.",
    memoLabel: "Mensaje en el memo",
    memoPlaceholder: "Gracias por el episodio",
    memoHint:
      "Solo funciona con transacciones protegidas y algunas wallets lo ignoran.",
    openWallet: "Abrir en wallet",
    copied: "Copiado",
    copyUri: "Copiar enlace zcash:",
  },
};

export type DonationBoxLabels = typeof es.box;

type DonateContent = typeof es;

const en: DonateContent = {
  notFound: "Channel not found",
  metaTitle: (name: string) => `Support ${name}`,
  metaDescription: (name: string) =>
    `Donate ZEC directly to ${name} on PodZcash.`,
  noAddressTitle: (name: string) => `${name} does not accept donations yet`,
  noAddressBody:
    "Once the creator adds their Zcash address, it will show up here.",
  backToChannel: "Back to channel",
  title: (name: string) => `Support ${name}`,
  subtitle: "Direct ZEC donation, person to person.",
  notes: [
    {
      title: "Non-custodial",
      body: "Payment goes straight to the creator's wallet. PodZcash never holds the money.",
    },
    {
      title: "No account",
      body: "No sign-up or sign-in needed to donate.",
    },
    {
      title: "Privacy",
      body: "With a shielded address, the amount and memo stay encrypted. With a transparent one, they are public.",
    },
  ],
  box: {
    qrAlt: "QR code to donate to",
    generating: "Generating QR…",
    scanHint: "Scan with Zashi, Zingo or Ywallet",
    addressLabel: "Zcash address",
    verified: "verified",
    copyAria: "Copy address",
    amount: "Amount",
    optional: "(optional)",
    other: "Other",
    amountAria: "Amount in ZEC",
    amountInvalid: "Enter an amount greater than 0 and less than 1,000,000.",
    memoLabel: "Memo message",
    memoPlaceholder: "Thanks for the episode",
    memoHint:
      "Only works with shielded transactions and some wallets ignore it.",
    openWallet: "Open in wallet",
    copied: "Copied",
    copyUri: "Copy zcash: link",
  },
};

export const donateContent: Record<Locale, DonateContent> = { es, en };

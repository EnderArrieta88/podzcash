import type { Locale } from "./config";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalDocument = {
  metaTitle: string;
  metaDescription: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
  contactTitle: string;
  contactBody: string;
  backHome: string;
};

export type AboutContent = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  whatTitle: string;
  whatBody: string[];
  principles: { title: string; body: string }[];
  teamTitle: string;
  teamBody: string;
  teamName: string;
  teamRole: string;
  statusTitle: string;
  statusBody: string;
  collaborateTitle: string;
  collaborateBody: string;
  contactTitle: string;
  contactBody: string;
  independenceTitle: string;
  independenceBody: string;
  backHome: string;
  links: {
    project: string;
    repository: string;
    contributing: string;
    conduct: string;
    security: string;
  };
};

export type SiteLegalContent = {
  about: AboutContent;
  privacy: LegalDocument;
  terms: LegalDocument;
};

const es: SiteLegalContent = {
  about: {
    metaTitle: "Acerca",
    metaDescription:
      "Quién está detrás de PodZcash, por qué existe y cómo se relaciona con Zcash.",
    eyebrow: "Acerca",
    title: "Audio para Zcash, hecho de forma independiente",
    intro:
      "PodZcash es una plataforma de podcasts y música para el ecosistema Zcash. Este espacio explica quién la construye, qué principios sigue y cómo contactar.",
    whatTitle: "Qué es PodZcash",
    whatBody: [
      "PodZcash nació como una idea a finales de 2023 y empezó a construirse en febrero de 2025. La beta está en producción y funciona por invitación.",
      "Cada creador tiene un canal con dirección propia, publica audio y puede recibir ZEC directo a su wallet. La plataforma no custodia fondos, no cobra comisiones y no intermedia en los pagos.",
      "El audio se distribuye por RSS y un reproductor embebible, para que el contenido no quede encerrado dentro de una sola aplicación.",
    ],
    principles: [
      {
        title: "Sin custodia",
        body: "Las donaciones van de wallet a wallet. PodZcash no guarda claves ni retiene fondos.",
      },
      {
        title: "Código abierto",
        body: "El código está publicado bajo licencia MIT y el desarrollo sigue un flujo de PR y CI.",
      },
      {
        title: "Privacidad por diseño",
        body: "Se recomiendan direcciones protegidas y no se usan rastreadores publicitarios.",
      },
      {
        title: "Distribución abierta",
        body: "RSS, embeds y enlaces directos: el contenido circula fuera de la plataforma.",
      },
    ],
    teamTitle: "Quién lo construye",
    teamBody:
      "PodZcash es un proyecto independiente liderado por su fundador, con apoyo puntual de diseñadores y creadores cuando hace falta.",
    teamName: "Ender Arrieta",
    teamRole: "Fundador y desarrollador",
    statusTitle: "Estado actual",
    statusBody:
      "Beta cerrada en producción, bilingüe español/inglés. El plan de producto y financiamiento está publicado en la página del proyecto.",
    collaborateTitle: "Cómo colaborar",
    collaborateBody:
      "Puedes abrir un issue o un pull request en GitHub. Antes de contribuir, revisa la guía de contribución y el código de conducta.",
    contactTitle: "Contacto",
    contactBody:
      "Para consultas generales, escribe a hola@podzcash.online. Para vulnerabilidades de seguridad, usa el canal privado indicado en SECURITY.md.",
    independenceTitle: "Independencia y marca",
    independenceBody:
      "PodZcash es un proyecto independiente. No está afiliado, patrocinado ni respaldado por Zcash Foundation ni por Electric Coin Company. Zcash es una marca de Zcash Foundation y aquí se usa de forma descriptiva para indicar compatibilidad. El uso del nombre y del dominio se revisa conforme a la política de marcas de Zcash.",
    backHome: "Volver al inicio",
    links: {
      project: "Ver el proyecto",
      repository: "Ver repositorio",
      contributing: "Guía de contribución",
      conduct: "Código de conducta",
      security: "Política de seguridad",
    },
  },
  privacy: {
    metaTitle: "Privacidad",
    metaDescription:
      "Qué datos trata PodZcash, para qué los usa, cuánto tiempo los conserva y cómo ejercer tus derechos.",
    title: "Política de privacidad",
    updated: "Última actualización: 5 de noviembre de 2026",
    intro:
      "Esta política explica qué datos personales trata PodZcash, con qué finalidad y cómo puedes ejercer tus derechos. Está escrita para que se entienda sin jerga innecesaria.",
    sections: [
      {
        title: "1. Responsable",
        paragraphs: [
          "PodZcash es un proyecto independiente. El responsable del tratamiento es Ender Arrieta. Puedes escribir a hola@podzcash.online para cualquier consulta sobre privacidad.",
        ],
      },
      {
        title: "2. Qué datos tratamos",
        paragraphs: [
          "Tratamos únicamente los datos necesarios para operar la plataforma:",
        ],
        bullets: [
          "Datos de cuenta: nombre, email y hash de la contraseña. Nunca guardamos la contraseña en texto plano.",
          "Datos del canal: nombre visible, nombre de usuario, bio, enlaces, avatar, portada y dirección Zcash pública, si el creador decide añadirla.",
          "Contenido: audio, portadas, títulos, descripciones y etiquetas que el creador sube o publica.",
          "Datos técnicos: cookies funcionales, dirección IP y datos de la conexión usados para autenticar, limitar abuso y proteger el servicio.",
          "Comunicaciones: mensajes que nos envías para soporte, reportes o seguridad.",
        ],
      },
      {
        title: "3. Para qué los usamos",
        bullets: [
          "Crear y mantener tu cuenta, autenticarte y gestionar tu canal.",
          "Almacenar y servir el audio, las portadas, el feed RSS y el reproductor embebido.",
          "Generar el QR y el enlace ZIP-321 de donación cuando el creador añade una dirección Zcash.",
          "Prevenir spam, abuso, fraude y accesos no autorizados.",
          "Responder consultas, reportes de contenido y reportes de seguridad.",
          "Cumplir obligaciones legales que resulten aplicables.",
        ],
      },
      {
        title: "4. Base jurídica",
        paragraphs: [
          "Según el caso, tratamos datos para ejecutar el servicio que solicitas, con tu consentimiento (por ejemplo, la cookie de idioma), por interés legítimo en mantener la plataforma segura y, cuando corresponda, para cumplir una obligación legal.",
        ],
      },
      {
        title: "5. Conservación",
        paragraphs: [
          "Mantenemos los datos mientras tu cuenta esté activa. Si solicitas el borrado, eliminamos o anonimizamos los datos asociados, salvo aquellos que debamos conservar por obligación legal o por copias de seguridad técnicas, que se sobrescriben en el ciclo habitual.",
          "Los datos técnicos de rate limiting se mantienen en memoria y no se usan para publicidad ni para elaborar perfiles.",
        ],
      },
      {
        title: "6. Terceros y transferencias",
        paragraphs: [
          "Usamos proveedores de hosting y almacenamiento para operar el servicio. No vendemos datos personales ni los compartimos con anunciantes.",
          "El código fuente se aloja en GitHub. Las direcciones y transacciones de Zcash son públicas por naturaleza; si se usa una dirección transparente, el monto y el memo pueden ser visibles en la blockchain. Por eso la plataforma recomienda direcciones protegidas.",
          "PodZcash no custodia fondos, no ejecuta pagos y no recibe claves privadas de los creadores.",
        ],
      },
      {
        title: "7. Cookies",
        paragraphs: [
          "Usamos una cookie funcional llamada podzcash_locale para recordar tu idioma (español o inglés). No usamos cookies publicitarias ni rastreadores de terceros.",
          "Puedes borrar la cookie desde tu navegador. La plataforma seguirá funcionando y volverá al idioma predeterminado.",
        ],
      },
      {
        title: "8. Donaciones",
        paragraphs: [
          "Las donaciones son transferencias directas entre el oyente y el creador. PodZcash solo genera un QR y un enlace ZIP-321; no procesa, retiene ni reembolsa pagos.",
          "La información de una transacción puede ser pública en la blockchain de Zcash. La plataforma no puede eliminarla ni modificarla.",
        ],
      },
      {
        title: "9. Tus derechos",
        paragraphs: [
          "Puedes solicitar acceso, rectificación, eliminación, portabilidad u oposición al tratamiento de tus datos, y retirar un consentimiento cuando sea la base jurídica. Escríbenos a hola@podzcash.online.",
          "También puedes presentar una reclamación ante la autoridad de protección de datos que corresponda en tu jurisdicción.",
        ],
      },
      {
        title: "10. Seguridad",
        paragraphs: [
          "Aplicamos medidas razonables: hash de contraseñas con scrypt, cookies de sesión httpOnly, límites de intentos y controles de permisos. Ningún sistema es completamente infalible; si detectas un problema, usa el canal privado de SECURITY.md.",
        ],
      },
      {
        title: "11. Cambios",
        paragraphs: [
          "Podemos actualizar esta política para reflejar cambios en el servicio o en la ley. Publicaremos la versión vigente en esta página con su fecha de actualización.",
        ],
      },
    ],
    contactTitle: "Contacto de privacidad",
    contactBody:
      "Para ejercer tus derechos o hacer una consulta, escribe a hola@podzcash.online.",
    backHome: "Volver al inicio",
  },
  terms: {
    metaTitle: "Términos del servicio",
    metaDescription:
      "Reglas de uso de PodZcash: cuentas, contenido, donaciones, moderación y responsabilidad.",
    title: "Términos del servicio",
    updated: "Última actualización: 5 de noviembre de 2026",
    intro:
      "Estos términos describen las reglas para usar PodZcash. Al crear una cuenta, publicar contenido o usar la plataforma, aceptas estas condiciones.",
    sections: [
      {
        title: "1. Aceptación",
        paragraphs: [
          "Al usar PodZcash aceptas estos términos y la política de privacidad. Si no estás de acuerdo, no uses el servicio.",
          "Debes tener la edad legal para celebrar un contrato en tu jurisdicción y capacidad para aceptar estas condiciones.",
        ],
      },
      {
        title: "2. Qué es PodZcash",
        paragraphs: [
          "PodZcash es una plataforma para publicar, escuchar y distribuir podcasts y música. Permite a los creadores compartir su contenido y recibir apoyo directo en ZEC.",
          "PodZcash no es una wallet, un exchange, un proveedor de servicios de pago ni un custodio de fondos. No ofrece asesoramiento financiero, fiscal ni legal.",
        ],
      },
      {
        title: "3. Cuentas",
        bullets: [
          "El registro es por invitación. Debes proporcionar información veraz y mantenerla actualizada.",
          "Eres responsable de la seguridad de tu contraseña y de la actividad de tu cuenta.",
          "No puedes vender, transferir ni compartir tu cuenta sin autorización.",
          "Podemos suspender o limitar una cuenta por incumplimiento, abuso o riesgo para la plataforma o para terceros.",
        ],
      },
      {
        title: "4. Contenido del creador",
        paragraphs: [
          "Conservas la titularidad de tu contenido. Al publicarlo, nos concedes una licencia no exclusiva, mundial y gratuita para alojarlo, reproducirlo, distribuirlo por RSS, mostrarlo en el reproductor embebido y promoverlo dentro de la plataforma.",
          "Declaras que tienes los derechos necesarios sobre el audio, las imágenes, la música y los textos que subes, y que no infringes derechos de terceros.",
          "Podemos retirar contenido que incumpla estos términos o la ley, y podemos suspender cuentas reincidentes.",
        ],
      },
      {
        title: "5. Conducta y contenido prohibido",
        bullets: [
          "Contenido ilegal, fraudulento, malware o que incite a la violencia.",
          "Acoso, amenazas, discurso de odio o discriminación.",
          "Spam, manipulación de reproducciones o cuentas falsas.",
          "Contenido sexual explícito sin las advertencias y restricciones que correspondan.",
          "Contenido que infrinja derechos de autor, marcas u otros derechos de terceros.",
          "Suplantación de identidad o uso no autorizado del nombre o la imagen de otra persona.",
        ],
      },
      {
        title: "6. Derechos de autor",
        paragraphs: [
          "Si crees que un contenido infringe tus derechos, usa el formulario de reporte del episodio o escribe a hola@podzcash.online con la información necesaria para identificar el contenido y acreditar tu derecho.",
          "Podemos retirar el contenido mientras revisamos el reporte y tomar medidas contra cuentas reincidentes.",
        ],
      },
      {
        title: "7. Donaciones",
        paragraphs: [
          "Las donaciones son transferencias directas entre el oyente y el creador. PodZcash solo genera el QR y el enlace ZIP-321; no custodia, retiene, convierte ni reembolsa fondos.",
          "Las transacciones son irreversibles. Cada creador es responsable de sus obligaciones fiscales y de verificar los pagos en su wallet.",
          "La plataforma no garantiza que una wallet acepte el enlace ni que una transacción se complete.",
        ],
      },
      {
        title: "8. Disponibilidad y beta",
        paragraphs: [
          "El servicio se ofrece tal como está y puede cambiar, suspenderse o interrumpirse. No garantizamos disponibilidad continua ni ausencia de errores.",
          "Podemos modificar funciones, límites de almacenamiento o requisitos técnicos para proteger la plataforma o mejorar el servicio.",
        ],
      },
      {
        title: "9. Propiedad intelectual",
        paragraphs: [
          "El código de PodZcash se publica bajo licencia MIT. Las marcas, el nombre y los elementos gráficos del proyecto no se ceden por el uso del servicio.",
          "Las sugerencias y comentarios que envíes pueden usarse para mejorar el proyecto sin obligación de compensación.",
        ],
      },
      {
        title: "10. Responsabilidad",
        paragraphs: [
          "En la medida permitida por la ley, PodZcash no será responsable de daños indirectos, pérdida de datos, lucro cesante o daños derivados de transacciones en Zcash, wallets de terceros o contenido publicado por usuarios.",
          "Nada en estos términos limita derechos que la ley te reconozca de forma imperativa.",
        ],
      },
      {
        title: "11. Suspensión y terminación",
        paragraphs: [
          "Puedes dejar de usar el servicio y solicitar el borrado de tu cuenta. Podemos suspender o terminar el acceso por incumplimiento, riesgo de seguridad o obligación legal.",
          "Al terminar, el contenido puede dejar de estar disponible. Las copias de seguridad técnicas se sobrescriben en el ciclo habitual.",
        ],
      },
      {
        title: "12. Cambios y ley aplicable",
        paragraphs: [
          "Podemos actualizar estos términos. Publicaremos la versión vigente en esta página con su fecha de actualización.",
          "Estos términos se interpretan conforme a la legislación aplicable en el domicilio del responsable del proyecto, sin perjuicio de los derechos que te correspondan como consumidor.",
        ],
      },
    ],
    contactTitle: "Contacto",
    contactBody:
      "Para consultas sobre estos términos, escribe a hola@podzcash.online.",
    backHome: "Volver al inicio",
  },
};

const en: SiteLegalContent = {
  about: {
    metaTitle: "About",
    metaDescription:
      "Who builds PodZcash, why it exists and how it relates to Zcash.",
    eyebrow: "About",
    title: "Audio for Zcash, built independently",
    intro:
      "PodZcash is a podcast and music platform for the Zcash ecosystem. This page explains who builds it, which principles it follows and how to get in touch.",
    whatTitle: "What PodZcash is",
    whatBody: [
      "PodZcash started as an idea in late 2023 and began to be built in February 2025. The beta is live and invite-only.",
      "Every creator has a channel with its own address, publishes audio and can receive ZEC directly to their wallet. The platform does not custody funds, charge fees or intermediate payments.",
      "Audio is distributed through RSS and an embeddable player, so content is not locked inside a single app.",
    ],
    principles: [
      {
        title: "Non-custodial",
        body: "Donations go wallet to wallet. PodZcash does not hold keys or retain funds.",
      },
      {
        title: "Open source",
        body: "The code is published under the MIT license and development follows a PR and CI workflow.",
      },
      {
        title: "Privacy by design",
        body: "Shielded addresses are recommended and no advertising trackers are used.",
      },
      {
        title: "Open distribution",
        body: "RSS, embeds and direct links: content circulates outside the platform.",
      },
    ],
    teamTitle: "Who builds it",
    teamBody:
      "PodZcash is an independent project led by its founder, with occasional support from designers and creators when needed.",
    teamName: "Ender Arrieta",
    teamRole: "Founder and developer",
    statusTitle: "Current status",
    statusBody:
      "Closed beta in production, bilingual Spanish/English. The product and funding plan is published on the project page.",
    collaborateTitle: "How to contribute",
    collaborateBody:
      "You can open an issue or a pull request on GitHub. Before contributing, read the contribution guide and the code of conduct.",
    contactTitle: "Contact",
    contactBody:
      "For general questions, write to hola@podzcash.online. For security vulnerabilities, use the private channel described in SECURITY.md.",
    independenceTitle: "Independence and trademark",
    independenceBody:
      "PodZcash is an independent project. It is not affiliated with, sponsored by or endorsed by the Zcash Foundation or Electric Coin Company. Zcash is a trademark of the Zcash Foundation and is used here descriptively to indicate compatibility. Use of the name and domain is being reviewed under the Zcash trademark policy.",
    backHome: "Back to home",
    links: {
      project: "View the project",
      repository: "View repository",
      contributing: "Contribution guide",
      conduct: "Code of conduct",
      security: "Security policy",
    },
  },
  privacy: {
    metaTitle: "Privacy",
    metaDescription:
      "What data PodZcash processes, why, how long it keeps it and how to exercise your rights.",
    title: "Privacy policy",
    updated: "Last updated: November 5, 2026",
    intro:
      "This policy explains what personal data PodZcash processes, for what purpose and how you can exercise your rights. It is written to be understood without unnecessary jargon.",
    sections: [
      {
        title: "1. Controller",
        paragraphs: [
          "PodZcash is an independent project. The data controller is Ender Arrieta. You can write to hola@podzcash.online for any privacy question.",
        ],
      },
      {
        title: "2. What data we process",
        paragraphs: [
          "We only process the data needed to operate the platform:",
        ],
        bullets: [
          "Account data: name, email and password hash. We never store passwords in plain text.",
          "Channel data: display name, username, bio, links, avatar, cover and public Zcash address if the creator chooses to add one.",
          "Content: audio, covers, titles, descriptions and tags uploaded or published by the creator.",
          "Technical data: functional cookies, IP address and connection data used to authenticate, rate-limit abuse and protect the service.",
          "Communications: messages you send us for support, reports or security.",
        ],
      },
      {
        title: "3. Why we use it",
        bullets: [
          "Create and maintain your account, authenticate you and manage your channel.",
          "Store and serve audio, covers, the RSS feed and the embeddable player.",
          "Generate the donation QR and ZIP-321 link when a creator adds a Zcash address.",
          "Prevent spam, abuse, fraud and unauthorized access.",
          "Respond to support requests, content reports and security reports.",
          "Comply with legal obligations where applicable.",
        ],
      },
      {
        title: "4. Legal basis",
        paragraphs: [
          "Depending on the case, we process data to perform the service you request, with your consent (for example, the language cookie), for our legitimate interest in keeping the platform secure and, where applicable, to comply with a legal obligation.",
        ],
      },
      {
        title: "5. Retention",
        paragraphs: [
          "We keep data while your account is active. If you request deletion, we delete or anonymize the associated data, except where we must keep it for a legal obligation or technical backups, which are overwritten in the normal cycle.",
          "Technical rate-limiting data is kept in memory and is not used for advertising or profiling.",
        ],
      },
      {
        title: "6. Third parties and transfers",
        paragraphs: [
          "We use hosting and storage providers to operate the service. We do not sell personal data or share it with advertisers.",
          "The source code is hosted on GitHub. Zcash addresses and transactions are public by nature; if a transparent address is used, the amount and memo may be visible on the blockchain. This is why the platform recommends shielded addresses.",
          "PodZcash does not custody funds, execute payments or receive creators' private keys.",
        ],
      },
      {
        title: "7. Cookies",
        paragraphs: [
          "We use one functional cookie called podzcash_locale to remember your language (Spanish or English). We do not use advertising cookies or third-party trackers.",
          "You can delete the cookie from your browser. The platform will keep working and return to the default language.",
        ],
      },
      {
        title: "8. Donations",
        paragraphs: [
          "Donations are direct transfers between the listener and the creator. PodZcash only generates a QR and a ZIP-321 link; it does not process, retain or refund payments.",
          "Transaction information may be public on the Zcash blockchain. The platform cannot delete or modify it.",
        ],
      },
      {
        title: "9. Your rights",
        paragraphs: [
          "You can request access, rectification, deletion, portability or objection to processing, and withdraw consent where that is the legal basis. Write to hola@podzcash.online.",
          "You may also file a complaint with the data protection authority that applies in your jurisdiction.",
        ],
      },
      {
        title: "10. Security",
        paragraphs: [
          "We apply reasonable measures: scrypt password hashing, httpOnly session cookies, attempt limits and permission controls. No system is completely infallible; if you find a problem, use the private channel in SECURITY.md.",
        ],
      },
      {
        title: "11. Changes",
        paragraphs: [
          "We may update this policy to reflect changes in the service or the law. The current version will be published on this page with its update date.",
        ],
      },
    ],
    contactTitle: "Privacy contact",
    contactBody:
      "To exercise your rights or ask a question, write to hola@podzcash.online.",
    backHome: "Back to home",
  },
  terms: {
    metaTitle: "Terms of service",
    metaDescription:
      "PodZcash rules: accounts, content, donations, moderation and liability.",
    title: "Terms of service",
    updated: "Last updated: November 5, 2026",
    intro:
      "These terms describe the rules for using PodZcash. By creating an account, publishing content or using the platform, you accept these conditions.",
    sections: [
      {
        title: "1. Acceptance",
        paragraphs: [
          "By using PodZcash you accept these terms and the privacy policy. If you do not agree, do not use the service.",
          "You must have the legal age to enter into a contract in your jurisdiction and the capacity to accept these conditions.",
        ],
      },
      {
        title: "2. What PodZcash is",
        paragraphs: [
          "PodZcash is a platform for publishing, listening to and distributing podcasts and music. It lets creators share content and receive direct support in ZEC.",
          "PodZcash is not a wallet, an exchange, a payment service provider or a custodian of funds. It does not provide financial, tax or legal advice.",
        ],
      },
      {
        title: "3. Accounts",
        bullets: [
          "Registration is invite-only. You must provide accurate information and keep it up to date.",
          "You are responsible for the security of your password and for activity on your account.",
          "You may not sell, transfer or share your account without authorization.",
          "We may suspend or limit an account for violations, abuse or risk to the platform or third parties.",
        ],
      },
      {
        title: "4. Creator content",
        paragraphs: [
          "You retain ownership of your content. By publishing it, you grant us a non-exclusive, worldwide, royalty-free license to host, reproduce, distribute it through RSS, display it in the embeddable player and promote it within the platform.",
          "You represent that you have the necessary rights to the audio, images, music and text you upload and that you do not infringe third-party rights.",
          "We may remove content that violates these terms or the law, and we may suspend repeat infringers.",
        ],
      },
      {
        title: "5. Conduct and prohibited content",
        bullets: [
          "Illegal, fraudulent or malware content, or content that incites violence.",
          "Harassment, threats, hate speech or discrimination.",
          "Spam, play manipulation or fake accounts.",
          "Explicit sexual content without the appropriate warnings and restrictions.",
          "Content that infringes copyright, trademarks or other third-party rights.",
          "Impersonation or unauthorized use of another person's name or image.",
        ],
      },
      {
        title: "6. Copyright",
        paragraphs: [
          "If you believe content infringes your rights, use the episode report form or write to hola@podzcash.online with the information needed to identify the content and prove your right.",
          "We may remove the content while we review the report and take action against repeat infringers.",
        ],
      },
      {
        title: "7. Donations",
        paragraphs: [
          "Donations are direct transfers between the listener and the creator. PodZcash only generates the QR and ZIP-321 link; it does not custody, retain, convert or refund funds.",
          "Transactions are irreversible. Each creator is responsible for their tax obligations and for verifying payments in their wallet.",
          "The platform does not guarantee that a wallet will accept the link or that a transaction will complete.",
        ],
      },
      {
        title: "8. Availability and beta",
        paragraphs: [
          "The service is provided as is and may change, be suspended or be interrupted. We do not guarantee continuous availability or freedom from errors.",
          "We may change features, storage limits or technical requirements to protect the platform or improve the service.",
        ],
      },
      {
        title: "9. Intellectual property",
        paragraphs: [
          "PodZcash code is published under the MIT license. The project's trademarks, name and graphic elements are not transferred by using the service.",
          "Suggestions and comments you send may be used to improve the project without compensation.",
        ],
      },
      {
        title: "10. Liability",
        paragraphs: [
          "To the extent permitted by law, PodZcash will not be liable for indirect damages, data loss, lost profits or damages arising from Zcash transactions, third-party wallets or content published by users.",
          "Nothing in these terms limits rights that the law grants you on a mandatory basis.",
        ],
      },
      {
        title: "11. Suspension and termination",
        paragraphs: [
          "You may stop using the service and request deletion of your account. We may suspend or terminate access for violations, security risk or legal obligation.",
          "After termination, content may no longer be available. Technical backups are overwritten in the normal cycle.",
        ],
      },
      {
        title: "12. Changes and governing law",
        paragraphs: [
          "We may update these terms. The current version will be published on this page with its update date.",
          "These terms are interpreted under the laws applicable at the project controller's domicile, without prejudice to your rights as a consumer.",
        ],
      },
    ],
    contactTitle: "Contact",
    contactBody:
      "For questions about these terms, write to hola@podzcash.online.",
    backHome: "Back to home",
  },
};

export const siteLegalContent: Record<Locale, SiteLegalContent> = { es, en };

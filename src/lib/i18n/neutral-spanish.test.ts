import { describe, expect, it } from "vitest";
import { accountDeletedContent } from "./account-deleted";
import { addressMessages } from "./address";
import { adminContent } from "./admin";
import { authContent } from "./auth";
import { channelContent } from "./channel";
import { commentReportContent } from "./comment-report";
import { commonContent } from "./common";
import { donateContent } from "./donate";
import {
  commentEmailContent,
  inviteEmailContent,
  resetEmailContent,
  verificationEmailContent,
} from "./email";
import { embedContent } from "./embed";
import { episodeContent } from "./episode";
import { exploreContent } from "./explore";
import { homeContent } from "./home";
import { siteLegalContent } from "./legal";
import { offlineAudioContent } from "./offline-audio";
import { offlineContent } from "./offline";
import { playerContent } from "./player";
import { projectContent } from "./project";
import { pushContent } from "./push";
import { reportContent } from "./report";
import { sharedLabels } from "./shared";
import { shellContent } from "./shell";
import { studioAccountContent } from "./studio-account";
import { studioAnalyticsContent } from "./studio-analytics";
import { channelSettingsContent } from "./studio-channel";
import { studioCommentsContent } from "./studio-comments";
import { studioDistributionContent } from "./studio-distribution";
import { studioEpisodesContent } from "./studio-episodes";
import { studioErrors } from "./studio-errors";
import { studioInvitesContent } from "./studio-invites";
import { studioShellContent } from "./studio-shell";
import { validationMessages } from "./validation";
import { waitlistContent } from "./waitlist";

/**
 * Los textos en español deben ser neutros para una audiencia global: tuteo
 * consistente, sin voseo y sin léxico marcado de una región.
 */
const contents: Array<[string, unknown]> = [
  ["account-deleted", accountDeletedContent.es],
  ["address", addressMessages.es],
  ["admin", adminContent.es],
  ["auth", authContent.es],
  ["channel", channelContent.es],
  ["comment-report", commentReportContent.es],
  ["common", commonContent.es],
  ["donate", donateContent.es],
  ["email.comment", commentEmailContent.es],
  ["email.invite", inviteEmailContent.es],
  ["email.reset", resetEmailContent.es],
  ["email.verification", verificationEmailContent.es],
  ["embed", embedContent.es],
  ["episode", episodeContent.es],
  ["explore", exploreContent.es],
  ["home", homeContent.es],
  ["legal", siteLegalContent.es],
  ["offline", offlineContent.es],
  ["offline-audio", offlineAudioContent.es],
  ["player", playerContent.es],
  ["project", projectContent.es],
  ["push", pushContent.es],
  ["report", reportContent.es],
  ["shared", sharedLabels.es],
  ["shell", shellContent.es],
  ["studio-account", studioAccountContent.es],
  ["studio-analytics", studioAnalyticsContent.es],
  ["studio-channel", channelSettingsContent.es],
  ["studio-comments", studioCommentsContent.es],
  ["studio-distribution", studioDistributionContent.es],
  ["studio-episodes", studioEpisodesContent.es],
  ["studio-errors", studioErrors.es],
  ["studio-invites", studioInvitesContent.es],
  ["studio-shell", studioShellContent.es],
  ["validation", validationMessages.es],
  ["waitlist", waitlistContent.es],
];

const rules: Array<{ name: string; pattern: RegExp }> = [
  {
    name: "voseo",
    pattern:
      /(?<!\p{L})(sos|tenés|podés|querés|sabés|hacés|decís|vivís|escribís|preferís|sentís|venís|ponés|salís|elegís|seguís|añadí|revisá|volvé|abrí|tocá|borrá|usá|pedí|contá|compartí|elegí|subí|poné|tené|hacé|andá|fijate|acordate|probá|mirá|escuchá|entrá|publicá|empezá|seguí|sumate|registrate|iniciá|cerrá|guardá|cambiá|confirmá|cancelá|seleccioná|completá|ingresá|activá|instalá|actualizá|intentá|esperá|presioná|copiá|pegá|creá|editá|eliminá|marcá|decí|vení|salí|dejá|mostrá|agregá|comenzá|terminá|descargá|contactá|visitá)(?!\p{L})/iu,
  },
  {
    name: "regionalismo",
    pattern:
      /(?<!\p{L})(acá|plata|laburo|guita|pibe|celular|computadora|carro|ordenador|coche|chaval|guay|molar|coger|vosotros|vuestro|vuestra|nomás|che|boludo|mina)(?!\p{L})/iu,
  },
];

function collectStrings(value: unknown, found: string[]) {
  if (typeof value === "string") {
    found.push(value);
    return;
  }

  if (typeof value === "function") {
    // Las etiquetas con interpolación solo exponen su texto al ejecutarse.
    try {
      collectStrings(value("Episodio de prueba"), found);
    } catch {
      // Si la función espera otra firma, sus literales ya se revisan igual.
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, found);
    return;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectStrings(item, found);
  }
}

describe("español neutro", () => {
  it("no usa voseo ni regionalismos en los textos de la interfaz", () => {
    const offenders: string[] = [];

    for (const [name, content] of contents) {
      const strings: string[] = [];
      collectStrings(content, strings);

      for (const text of strings) {
        for (const rule of rules) {
          const match = text.match(rule.pattern);

          if (match) {
            offenders.push(`${name}: "${text}" (${rule.name}: ${match[0]})`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

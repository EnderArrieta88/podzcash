import { describe, expect, it } from "vitest";
import {
  isMobileUserAgent,
  pushSubscriptionSchema,
  waitlistPushPayload,
} from "./push-payload";

const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
const WINDOWS =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";
const MAC =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";

const subscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
  keys: {
    p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
    auth: "tBHItJI5svbpez7KI4CCXg",
  },
};

describe("push de la lista de espera", () => {
  it("solo acepta teléfonos como dispositivos", () => {
    expect(isMobileUserAgent(ANDROID)).toBe(true);
    expect(isMobileUserAgent(IPHONE)).toBe(true);
    expect(isMobileUserAgent(WINDOWS)).toBe(false);
    expect(isMobileUserAgent(MAC)).toBe(false);
    expect(isMobileUserAgent(null)).toBe(false);
    expect(isMobileUserAgent("")).toBe(false);
  });

  it("valida la suscripción del navegador", () => {
    expect(pushSubscriptionSchema.safeParse(subscription).success).toBe(true);

    expect(
      pushSubscriptionSchema.safeParse({
        endpoint: "http://insecure.example/push",
        keys: subscription.keys,
      }).success,
    ).toBe(false);

    expect(
      pushSubscriptionSchema.safeParse({
        endpoint: subscription.endpoint,
        keys: { p256dh: "corto", auth: "corto" },
      }).success,
    ).toBe(false);
  });

  it("arma un aviso con el nombre y sin el email", () => {
    const payload = waitlistPushPayload({
      name: "Ana",
      email: "ana@example.com",
      role: "podcast",
      note: "Quiere publicar entrevistas",
    });

    expect(payload.title).toBe("Nueva solicitud en la lista de espera");
    expect(payload.body).toContain("Ana");
    expect(payload.url).toBe("/estudio/admin");
    expect(JSON.stringify(payload)).not.toContain("ana@example.com");
  });
});

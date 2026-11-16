-- 2FA TOTP para cuentas.
ALTER TABLE "User" ADD COLUMN "totpSecret" TEXT;
ALTER TABLE "User" ADD COLUMN "totpEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "totpRecoveryCodes" TEXT;
ALTER TABLE "User" ADD COLUMN "totpPendingSecret" TEXT;

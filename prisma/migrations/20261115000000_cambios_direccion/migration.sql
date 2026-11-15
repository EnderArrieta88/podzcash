-- Historial de cambios de la dirección Zcash de un canal.
CREATE TABLE "ChannelAddressChange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channelId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "previousAddress" TEXT,
    "newAddress" TEXT,
    "ip" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChannelAddressChange_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChannelAddressChange_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "ChannelAddressChange_channelId_createdAt_idx"
    ON "ChannelAddressChange"("channelId", "createdAt");

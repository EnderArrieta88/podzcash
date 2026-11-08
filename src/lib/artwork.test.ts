import { describe, expect, it } from "vitest";
import { validateArtwork } from "./artwork";

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function png(width: number, height: number, colorType = 2): Buffer {
  const buffer = Buffer.alloc(33);
  PNG_SIGNATURE.copy(buffer, 0);
  buffer.writeUInt32BE(13, 8);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  buffer[24] = 8;
  buffer[25] = colorType;
  return buffer;
}

function jpeg(width: number, height: number, components = 3): Buffer {
  const buffer = Buffer.alloc(2 + 4 + 15 + 2);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  buffer[3] = 0xc0;
  buffer.writeUInt16BE(17, 4);
  buffer[6] = 8;
  buffer.writeUInt16BE(height, 7);
  buffer.writeUInt16BE(width, 9);
  buffer[11] = components;
  buffer[12] = 1;
  buffer[13] = 0x11;
  buffer[14] = 0;
  buffer[15] = 2;
  buffer[16] = 0x11;
  buffer[17] = 1;
  buffer[18] = 3;
  buffer[19] = 0x11;
  buffer[20] = 1;
  buffer[21] = 0xff;
  buffer[22] = 0xd9;
  return buffer;
}

describe("validateArtwork", () => {
  it("acepta PNG y JPEG cuadrados RGB de 1400 a 3000 px", () => {
    expect(validateArtwork(png(1400, 1400))).toEqual({
      ok: true,
      width: 1400,
      height: 1400,
    });
    expect(validateArtwork(png(3000, 3000, 6))).toEqual({
      ok: true,
      width: 3000,
      height: 3000,
    });
    expect(validateArtwork(jpeg(1500, 1500))).toEqual({
      ok: true,
      width: 1500,
      height: 1500,
    });
  });

  it("rechaza formatos que no son JPG o PNG", () => {
    const webp = Buffer.from("RIFF0000WEBP", "ascii");
    const gif = Buffer.from("GIF89a", "ascii");

    expect(validateArtwork(webp)).toEqual({
      ok: false,
      error: "artworkFormat",
    });
    expect(validateArtwork(gif)).toEqual({
      ok: false,
      error: "artworkFormat",
    });
    expect(validateArtwork(Buffer.from("no-es-una-imagen"))).toEqual({
      ok: false,
      error: "artworkFormat",
    });
  });

  it("rechaza artwork que no es cuadrado o está fuera de rango", () => {
    for (const [width, height] of [
      [1200, 1200],
      [1400, 1500],
      [3100, 3100],
      [3000, 1400],
    ]) {
      expect(validateArtwork(png(width, height))).toEqual({
        ok: false,
        error: "artworkDimensions",
      });
    }
  });

  it("rechaza artwork que no está en RGB", () => {
    expect(validateArtwork(png(1400, 1400, 0))).toEqual({
      ok: false,
      error: "artworkColor",
    });
    expect(validateArtwork(png(1400, 1400, 3))).toEqual({
      ok: false,
      error: "artworkColor",
    });
    expect(validateArtwork(jpeg(1400, 1400, 4))).toEqual({
      ok: false,
      error: "artworkColor",
    });
  });
});

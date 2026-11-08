export type ArtworkError =
  | "artworkFormat"
  | "artworkDimensions"
  | "artworkColor";

export type ArtworkValidation =
  | { ok: true; width: number; height: number }
  | { ok: false; error: ArtworkError };

type ImageInfo = {
  format: "png" | "jpeg" | "webp" | "gif" | "unknown";
  width?: number;
  height?: number;
  color?: "rgb" | "gray" | "cmyk" | "palette" | "unknown";
};

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function inspectPng(buffer: Buffer): ImageInfo {
  if (buffer.length < 26 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return { format: "unknown" };
  }

  const colorType = buffer[25];
  const color =
    colorType === 2 || colorType === 6
      ? "rgb"
      : colorType === 0 || colorType === 4
        ? "gray"
        : colorType === 3
          ? "palette"
          : "unknown";

  return {
    format: "png",
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    color,
  };
}

function inspectJpeg(buffer: Buffer): ImageInfo {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return { format: "unknown" };
  }

  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    const length = buffer.readUInt16BE(offset + 2);

    if (length < 2 || offset + 2 + length > buffer.length) break;

    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isStartOfFrame && offset + 10 < buffer.length) {
      const components = buffer[offset + 9];
      return {
        format: "jpeg",
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
        color: components === 3 ? "rgb" : components === 4 ? "cmyk" : "gray",
      };
    }

    offset += 2 + length;
  }

  return { format: "jpeg" };
}

function inspectImage(buffer: Buffer): ImageInfo {
  if (buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP") {
    return { format: "webp" };
  }

  if (buffer.subarray(0, 3).toString("ascii") === "GIF") {
    return { format: "gif" };
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return inspectJpeg(buffer);
  }

  return inspectPng(buffer);
}

/**
 * Valida el artwork de portada de un episodio según Apple Podcasts:
 * JPG o PNG, cuadrado, RGB y entre 1400 y 3000 px por lado.
 */
export function validateArtwork(buffer: Buffer): ArtworkValidation {
  const info = inspectImage(buffer);

  if (info.format !== "jpeg" && info.format !== "png") {
    return { ok: false, error: "artworkFormat" };
  }

  if (!info.width || !info.height) {
    return { ok: false, error: "artworkFormat" };
  }

  if (
    info.width !== info.height ||
    info.width < 1400 ||
    info.width > 3000 ||
    info.height < 1400 ||
    info.height > 3000
  ) {
    return { ok: false, error: "artworkDimensions" };
  }

  if (info.color !== "rgb") {
    return { ok: false, error: "artworkColor" };
  }

  return { ok: true, width: info.width, height: info.height };
}

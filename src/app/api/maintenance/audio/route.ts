import { readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { episodePath } from "@/lib/routes";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Ruta temporal de mantenimiento para reemplazar el audio WAV por MP3.
// Se elimina inmediatamente después de la migración.
const TOKEN = "a28a47276e5e414d8c6c9804b36f5f500e39296507c84490a5e90afc0b5f5cf7";
const EPISODE_ID = "cmw2eorpx00004cvhmm7ssa09";
const AUDIO_DIR = "audio/cmw2e96lx0000scvhvebqjx42";
const AUDIO_FILE = "bbf4b2a5-e655-4da1-b440-0500632f6f69";
const NEW_KEY = `${AUDIO_DIR}/${AUDIO_FILE}.mp3`;
const OLD_KEY = `${AUDIO_DIR}/${AUDIO_FILE}.wav`;
const SOURCE = path.join(process.cwd(), "public", "maintenance-audio.bin");

export async function POST(request: Request) {
  if (request.headers.get("x-maintenance-token") !== TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const data = await readFile(SOURCE);

    await storage.put(NEW_KEY, data);

    await prisma.episode.update({
      where: { id: EPISODE_ID },
      data: {
        audioPath: NEW_KEY,
        mimeType: "audio/mpeg",
        fileSize: data.length,
      },
    });

    await storage.remove(OLD_KEY);
    await unlink(SOURCE).catch(() => {});

    revalidatePath(
      episodePath("ender-arrieta", "custodia-propia-como-proteger-tus-zec"),
    );

    return NextResponse.json({ ok: true, bytes: data.length, key: NEW_KEY });
  } catch (error) {
    console.error("[maintenance] No se pudo migrar el audio:", error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

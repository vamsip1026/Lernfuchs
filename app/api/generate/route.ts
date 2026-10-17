import { NextResponse } from "next/server";
import { generateTestPaper } from "@/lib/anthropic";
import { hatZugang } from "@/lib/auth";
import { GenerateRequestSchema } from "@/lib/schema";

// Generierung kann je nach Modell/Länge etwas dauern.
export const maxDuration = 120;

export async function POST(request: Request) {
  if (!hatZugang(request)) {
    return NextResponse.json(
      { error: "Zugangscode fehlt oder ist falsch." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bitte Klasse, Fach und Thema auswählen." },
      { status: 400 },
    );
  }

  try {
    const paper = await generateTestPaper(parsed.data);
    return NextResponse.json(paper);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Beim Erstellen des Tests ist ein Fehler aufgetreten.";
    console.error("Generierung fehlgeschlagen:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

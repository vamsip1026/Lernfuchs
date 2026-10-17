import { NextResponse } from "next/server";
import { suggestSubtopics } from "@/lib/anthropic";
import { hatZugang } from "@/lib/auth";
import { SubtopicRequestSchema } from "@/lib/schema";

export const maxDuration = 60;

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
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = SubtopicRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Bitte zuerst Klasse, Fach und Thema wählen." },
      { status: 400 },
    );
  }

  try {
    const unterthemen = await suggestSubtopics(parsed.data);
    return NextResponse.json({ unterthemen });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Beim Vorschlagen der Unterthemen ist ein Fehler aufgetreten.";
    console.error("Unterthemen-Vorschlag fehlgeschlagen:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

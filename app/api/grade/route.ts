import { NextResponse } from "next/server";
import { gradeAnswers } from "@/lib/anthropic";
import { hatZugang } from "@/lib/auth";
import { GradeRequestSchema } from "@/lib/schema";

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
    return NextResponse.json({ error: "Ungültige Anfrage." }, { status: 400 });
  }

  const parsed = GradeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Keine Antworten zum Bewerten." },
      { status: 400 },
    );
  }

  try {
    const results = await gradeAnswers(parsed.data.answers);
    return NextResponse.json({ results });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Die Bewertung ist fehlgeschlagen.";
    console.error("Bewertung fehlgeschlagen:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

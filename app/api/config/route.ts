import { NextResponse } from "next/server";

// Verrät dem Client nur, OB ein Zugangscode nötig ist (kein Geheimnis).
export function GET() {
  return NextResponse.json({
    passcodeRequired: Boolean(process.env.APP_PASSWORT),
  });
}

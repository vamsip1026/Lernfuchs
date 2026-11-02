// Einfacher Zugangscode-Schutz für die API-Routen. Verhindert, dass bei einer
// öffentlichen URL Fremde API-Credits verbrauchen.
//
// Aktiv nur, wenn die Umgebungsvariable APP_PASSWORT gesetzt ist. Ist sie leer
// (z. B. lokale Entwicklung), ist der Schutz aus und alles funktioniert wie
// bisher. Der Client sendet den Code im Header "x-app-passwort".
export function hatZugang(request: Request): boolean {
  const erwartet = process.env.APP_PASSWORT?.trim();
  if (!erwartet) return true; // kein Code konfiguriert → kein Schutz
  return (request.headers.get("x-app-passwort") ?? "").trim() === erwartet;
}

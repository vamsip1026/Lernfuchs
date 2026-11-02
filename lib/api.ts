// Gespeicherter Zugangscode (nur wirksam, wenn der Server APP_PASSWORT gesetzt hat).
export const PASS_KEY = "app_passwort";

/** POST an eine eigene API-Route, mit Zugangscode als Header (falls vorhanden). */
export async function apiFetch(url: string, body: unknown): Promise<Response> {
  const code =
    typeof window !== "undefined"
      ? (localStorage.getItem(PASS_KEY) ?? "").trim()
      : "";
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(code ? { "x-app-passwort": code } : {}),
    },
    body: JSON.stringify(body),
  });
}

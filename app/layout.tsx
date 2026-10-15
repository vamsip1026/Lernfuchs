import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lernfuchs – Übungstests",
  description:
    "Erstelle Übungstests nach Klasse, Fach und Thema (Gymnasium Bayern).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}

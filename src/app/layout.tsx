import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAKS-SHOP",
  description: "GSHOPMAKSSSp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

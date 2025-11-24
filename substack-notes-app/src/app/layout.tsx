import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Substack Notes Manager",
  description: "Manage, schedule, and publish your Substack Notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

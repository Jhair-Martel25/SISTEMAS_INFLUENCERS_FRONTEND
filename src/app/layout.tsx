import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { ThemeToggleFlotante } from "@/components/shared/ThemeToggle";
import { SCRIPT_TEMA_INICIAL } from "@/hooks/useTema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sembrando Perú",
  description:
    "Automatiza validaciones, campañas, agendas y seguimiento con nuestra plataforma inteligente diseñada para el cambio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>
          <AuthBootstrap />
          {children}
          <ThemeToggleFlotante />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
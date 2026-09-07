import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthBootstrap } from "@/features/auth/components/AuthBootstrap";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import ChatbotWidget from "@/components/shared/ChatbotWidget"; // Ajusta la ruta si lo guardaste en otro folder

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
    >
      <body className="min-h-screen antialiased">
        <Providers>
          <AuthBootstrap />
          {children}
          <Toaster />
          <ChatbotWidget />
        </Providers>
      </body>
    </html>
  );
}
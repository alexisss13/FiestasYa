import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FiestasYa | Artículos de Fiesta en Trujillo",
  description: "La mejor tienda de globos y decoración en Trujillo, Perú.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
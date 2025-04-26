import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SocketProvider from "@/providers/SocketProvider";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EmotiVerse",
  description: "Emotions Unleashed. Connections Redefined.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}

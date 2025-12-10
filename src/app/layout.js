// app/layout.js (SERVER COMPONENT - NO "use client")
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SocieteProvider } from "../context/SocieteContext";
import { ProjetProvider } from "../context/ProjetContext";
import { Toaster } from "react-hot-toast";
import { NotificationProvider } from "../context/NotificationContext";
import ClientWrapper from "./ClientWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "ERP Immobilier",
  description: "ERP Immobilier",
  image: "/images/logo.PNG",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SocieteProvider>
            <ProjetProvider>
              <NotificationProvider>
                {/* Toaster must be inside client component */}
                <ClientWrapper>
                  {children}
                </ClientWrapper>
              </NotificationProvider>
            </ProjetProvider>
          </SocieteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
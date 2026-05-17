import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";
import "./globals.css";
import { GlobalNav } from "./components/ui/GlobalNav";

const ibmPlexSans = IBM_Plex_Sans({
    variable: "--font-ibm-plex-sans",
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
});

const ibmPlexSerif = IBM_Plex_Serif({
    variable: "--font-ibm-plex-serif",
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
    variable: "--font-ibm-plex-mono",
    weight: ["400", "500"],
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ISMP 3D Anatomy",
    description: "Plataforma educativa de anatomía 3D interactiva",
    icons: {
        icon: "/favicon.ico",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body
                className={`${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable} antialiased`}
            >
                <GlobalNav />
                {children}
            </body>
        </html>
    );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AppTopNav } from "@/components/app/app-top-nav";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Manna Alive · Sistema de Importação",
    description: "Painel interno para avaliação de produtos e simulação de importação.",
};

// aplica 'dark' antes da hidratação para evitar flash
const setInitialTheme = `
(function () {
  try {
    const key = 'autentika-theme';
    const stored = localStorage.getItem(key);
    if (stored === 'dark') { document.documentElement.classList.add('dark'); return; }
    if (stored === 'light') { document.documentElement.classList.remove('dark'); return; }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    }
  } catch {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
        <head><script dangerouslySetInnerHTML={{ __html: setInitialTheme }} /></head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="autentika-theme">
            <div className="min-h-screen bg-background text-foreground">
                <AppTopNav/>
                <div className="mx-auto max-w-6xl px-6 py-6">{children}</div>
            </div>
        </ThemeProvider>
        </body>
        </html>
);
}

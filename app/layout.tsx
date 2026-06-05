import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar, MobileTopBar } from "@/components/app-sidebar";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({ variable: "--font-sans", subsets: ["latin"], display: "swap" });
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LPGP Connect — CRM",
  description:
    "Internal CRM for LPGP Connect — LPs, GPs and Solution Providers across finance, capital markets and private markets.",
};

// Set the theme class before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <MobileTopBar />
            <main className="flex-1 w-full">{children}</main>
            <SiteFooter />
          </div>
        </div>
      </body>
    </html>
  );
}

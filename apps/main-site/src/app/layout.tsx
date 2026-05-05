import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://home4stay.homes"),
  title: "Home4Stay | Find your perfect stay",
  description: "Book homestays, hotels, and villas on Home4Stay.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/logo/logo-icon.png",
    apple: "/logo/logo-icon.png",
  },
  openGraph: {
    url: "https://home4stay.homes",
    siteName: "Home4Stay",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem("theme");
                  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                  const theme = (stored === "dark" || stored === "light")
                    ? stored
                    : (systemDark ? "dark" : "light");

                  document.documentElement.setAttribute("data-theme", theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg)]">
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

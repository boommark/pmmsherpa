import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthRedirectHandler } from "@/components/auth/AuthRedirectHandler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pmmsherpa.com"),
  title: {
    default: "PMM Sherpa - Stop Guessing, Start Converting",
    template: "%s | PMM Sherpa",
  },
  description:
    "The AI Assistant for World Class GTM. Expert guidance on positioning, messaging, GTM strategy, competitive analysis, and more — powered by 38,000+ curated PMM insights.",
  keywords: [
    "product marketing",
    "PMM",
    "positioning",
    "messaging",
    "go-to-market",
    "GTM",
    "competitive analysis",
    "AI assistant",
    "product marketing manager",
  ],
  authors: [{ name: "PMM Sherpa" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: "PMM Sherpa - Stop Guessing, Start Converting",
    description: "The AI Assistant for World Class GTM.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/pmmsherpa-logo-round.png",
        width: 512,
        height: 512,
        alt: "PMM Sherpa",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "PMM Sherpa - Stop Guessing, Start Converting",
    description: "The AI Assistant for World Class GTM.",
    images: ["/pmmsherpa-logo-round.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Script to apply theme before React hydration (prevents flash on mobile and desktop)
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme') || 'system';
      var isDark = theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${inter.className} antialiased`}>
        <AuthRedirectHandler />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

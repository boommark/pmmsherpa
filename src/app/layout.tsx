import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const ibmPlex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: {
    default: "PMMSherpa - Your Product Marketing AI Assistant",
    template: "%s | PMMSherpa",
  },
  description:
    "PMMSherpa is your AI-powered product marketing assistant. Get expert guidance on positioning, messaging, GTM strategy, competitive analysis, and more from 1,200+ PMM resources.",
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
  authors: [{ name: "PMMSherpa" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    viewportFit: "cover",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32', type: 'image/x-icon' },
      { url: '/icon', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    title: "PMMSherpa - Your Product Marketing AI Assistant",
    description:
      "Get expert PMM guidance powered by AI. Positioning, messaging, GTM strategy, and more.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PMMSherpa - Your Product Marketing AI Assistant",
    description:
      "Get expert PMM guidance powered by AI. Positioning, messaging, GTM strategy, and more.",
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
      <body className={`${ibmPlex.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

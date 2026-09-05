import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { WebVitals } from "@/components/common/WebVitals";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://Amplizo.ai"),
  title: { default: "Amplizo - Independent Live Chat Platform for Business", template: "%s | Amplizo" },
  description: "AI-powered live chat platform. Connect with website visitors instantly without WhatsApp, Telegram, or any external dependency. Real-time messaging, voice notes, file sharing.",
  keywords: ["live chat", "AI chat", "customer support", "whatsapp alternative", "independent chat", "real-time messaging", "customer engagement", "AI agents", "business chat"],
  authors: [{ name: "Amplizo" }],
  creator: "Amplizo",
  publisher: "Amplizo",
  openGraph: { type: "website", locale: "en_IN", url: "https://Amplizo.ai", siteName: "Amplizo", title: "Amplizo - Independent Live Chat Platform", description: "AI-powered live chat for your business. No WhatsApp. No Telegram. Pure independent communication.", images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: "Amplizo Platform" }] },
  twitter: { card: "summary_large_image", title: "Amplizo - Independent Live Chat Platform", description: "AI-powered live chat for your business. No external dependencies.", images: ["/og-image.svg"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } },
  alternates: { canonical: "https://Amplizo.ai" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#4f46e5" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('amplizo-ui');
                  var darkMode = false;
                  if (saved) {
                    var parsed = JSON.parse(saved);
                    darkMode = parsed.state && parsed.state.darkMode;
                  }
                  if (!darkMode) {
                    darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  }
                  if (darkMode) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Amplizo", applicationCategory: "BusinessApplication", operatingSystem: "Web", description: "AI-powered independent live chat platform for businesses", offers: { "@type": "AggregateOffer", priceCurrency: "INR", lowPrice: "999", highPrice: "7999", offerCount: "3" }, aggregateRating: { "@type": "AggregateRating", ratingValue: "4.8", ratingCount: "2847" } }) }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <Suspense fallback={null}>
            <WebVitals />
          </Suspense>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

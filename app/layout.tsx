import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Additional fonts for global use
const bebasNeue = Geist({
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});

const dmSans = Geist({
  variable: "--font-dm-sans", 
  subsets: ["latin"],
});

const mulish = Geist({
  variable: "--font-mulish",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Youth Alive Giving - Faith Tabernacle | Give Online",
  description: "Support Faith Tabernacle Youth Alive ministry through secure online giving. Give your tithes, offerings, and donations easily with multiple payment options including cards, bank transfers, and mobile money.",
  keywords: "Youth Alive, Faith Tabernacle, online giving, tithes, offerings, donations, church giving, mobile money, secure payments",
  authors: [{ name: "Faith Tabernacle Youth Alive" }],
  creator: "Faith Tabernacle Youth Alive",
  publisher: "Faith Tabernacle",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://give.youthalive.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Youth Alive Giving - Faith Tabernacle",
    description: "Support Faith Tabernacle Youth Alive ministry through secure online giving. Multiple payment options available.",
    url: 'https://give.youthalive.org',
    siteName: 'Youth Alive Giving',
    images: [
      {
        url: '/youth-alive-logo.png',
        width: 1200,
        height: 630,
        alt: 'Youth Alive Giving Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Youth Alive Giving - Faith Tabernacle",
    description: "Support Faith Tabernacle Youth Alive ministry through secure online giving.",
    images: ['/youth-alive-logo.png'],
    creator: '@youthalive',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  category: 'church',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Fonts */}
  
              <link href="https://fonts.googleapis.com/css2?family=Mulish:ital,wght@0,200..1000;1,200..1000&display=swap" rel="stylesheet"></link>
        {/* Favicon and App Icons */}
        <link rel="icon" type="image/x-icon" href="/youth-alive-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/youth-alive-logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/youth-alive-logo.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/youth-alive-logo.png" />
        
        {/* Additional Meta Tags */}
        <meta name="theme-color" content="#50034D" />
        <meta name="msapplication-TileColor" content="#50034D" />
        <meta name="msapplication-TileImage" content="/youth-alive-logo.png" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Security Headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Viewport for mobile optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${dmSans.variable} ${mulish.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
                color: '#fff',
              },
            },
            error: {
              duration: 5000,
              style: {
                background: '#EF4444',
                color: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

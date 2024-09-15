import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Next Todo",
  description: "Yet another todo app, but this time with Next.js and Cloudflare and v0.dev.",
  icons: {
    icon: '/icon.ico',
    apple: '/apple-icon.jpeg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1.0,
  minimumScale: 1.0,
  maximumScale: 1.0,
  userScalable: 'no',
};

export const appleWebApp = {
  capable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}

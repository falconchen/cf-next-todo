import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CF Next ToDo",
  description: "Try develop a todo app with Next.js and Cloudflare, Thanks to v0.dev and Cursor.",
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
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}

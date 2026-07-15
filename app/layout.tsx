import type { Metadata } from "next";
import { Inter, Playpen_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const playpenSans = Playpen_Sans({ 
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: '--font-playpen-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Oak Jobs - NGO Jobsite",
  description: "Find your next NGO career opportunity with Oak Jobs - Nigeria's leading NGO job board",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${playpenSans.variable} ${inter.variable}`}
        suppressHydrationWarning
        style={{ fontFamily: 'var(--font-playpen-sans), "Inter", "Segoe UI", sans-serif' }}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
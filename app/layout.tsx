import type { Metadata } from "next";
import { Inter, Playpen_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });
const playpenSans = Playpen_Sans({ 
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: '--font-playpen-sans',
});

export const metadata: Metadata = {
  title: "Oak Jobs - Find Your Dream Job",
  description: "Discover your next career opportunity with Oak Jobs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${playpenSans.variable} ${inter.className}`}
        suppressHydrationWarning
      >
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
};
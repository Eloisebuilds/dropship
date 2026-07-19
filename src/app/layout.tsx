import type { Metadata } from "next";
import { Montserrat, Anton, Roboto } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import ChatWidget from "@/components/ChatWidget";
import { CartProvider } from "@/lib/cart";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "FavorItems — Clean Smarter",
  description: "The 360° Microfiber Floor Mop. Wet & dry cleaning, self-cleaning system, and a built-in tank.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${anton.variable} ${roboto.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
          <ChatWidget />
        </CartProvider>
      </body>
    </html>
  );
}

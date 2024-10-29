import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { BalanceDisplay } from "@/components/BalanceDisplay";
import { TransactionProvider } from '@/contexts/TransactionContext';
import { ProfileProvider } from '@/contexts/ProfileContext';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Trust0 Marketplace",
  description: "A platform for commodities trading with instant payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          :root {
            --chart-1: 222.2 47.4% 11.2%;
            --color-price: hsl(222.2 47.4% 11.2%);
          }
          .dark {
            --chart-1: 210 40% 98%;
            --color-price: hsl(210 40% 98%);
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <ProfileProvider>
          <TransactionProvider>
            <header className="bg-primary text-primary-foreground p-4">
              <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-2xl font-bold">Trust0</Link>
                <nav className="flex items-center space-x-4">
                  <Button variant="ghost" asChild>
                    <Link href="/listings">Listings</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/my-profile">Profile</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/history">History</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/admin">Admin</Link>
                  </Button>
                  <BalanceDisplay />
                </nav>
              </div>
            </header>
            <main className="flex-grow container mx-auto px-4 py-8">
              {children}
            </main>
            <footer className="bg-primary text-primary-foreground p-4 mt-auto">
              <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Trust0 Marketplace. All rights reserved.</p>
              </div>
            </footer>
          </TransactionProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
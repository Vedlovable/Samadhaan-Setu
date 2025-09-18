import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import ClientProviders from "@/components/ClientProviders";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Samadhaan Setu",
  description: "Report and resolve civic issues with Samadhaan Setu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "Samadhaan Setu", "version": "1.0.0"}'
        />
        <ClientProviders>
          <Navbar />
          <main className="mx-auto max-w-6xl w-full px-4 py-6">{children}</main>
          <Footer />
        </ClientProviders>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
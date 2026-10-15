import type { Metadata, Viewport } from "next";
import { Montserrat, Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";
import ToastProvider from "@/components/shared/ToastProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bluefixxllp.com"),
  title: "BlueFixx | Trusted hands for every job",
  description:
    "BlueFixx connects verified professionals, customers, and apprentices in one unified marketplace. Find reliable services and skilled workers today.",
  keywords: [
    "home services",
    "verified professionals",
    "handyman",
    "plumber",
    "electrician",
    "artisans",
    "apprenticeships",
    "BlueFixx",
  ],
  icons: {
    icon: "/icons/logoMain.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-neutral-1000">
        <AuthProvider>
          {children}
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  );
}

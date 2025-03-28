import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/theme-provider";
import { Navbar } from "./components/Navbar";
import prisma from "./lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { Toaster } from "sonner"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://firepocket.vercel.app/'),
  title: "FirePocket",
  description: "A bookmark saving app that also provide summaries.",
  openGraph: {
    title: "FirePocket",
    description: "A bookmark saving app that also provide summaries.",
    url:"https://firepocket.vercel.app/",
    siteName:"FirePocket",
    images:[
      {
        url:"/page-thumbnail.png",
        width:1260,
        height:800,
      }
    ]
  },
  twitter: {
    title: "FirePocket",
    description: "A bookmark saving app that also provide summaries.",
    images: ['https://firepocket.vercel.app/page-thumbnail.png'], 
  },
  icons: {
    icon: ['/favicon.ico?v=4'],
    apple: ['/apple-touch-icon.png'],
    shortcut:['/apple-touch-icon.png'],
  },
  manifest:"/site.webmanifest"
};

async function getData(userId: string) {
  noStore();
  if (userId) {
    const data = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        colorScheme: true,
      },
    });
    return data;
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const data = await getData(user?.id as string);
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${data?.colorScheme ?? "theme-orange"}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

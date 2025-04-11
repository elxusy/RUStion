import "~/styles/globals.css";

import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Notion Clone",
    description: "Minimal dark Notion clone",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <html lang="en">
      <body className={`${inter.className} bg-zinc-900 text-zinc-100 min-h-screen`}>
      {children}
      </body>
      </html>
  );
}

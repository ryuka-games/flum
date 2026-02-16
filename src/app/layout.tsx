import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flum",
  description: "Discord-style real-time feed reader",
};

/** localStorage → data-theme を描画前に設定（FOUC 防止） */
const themeScript = `(function(){
  var t=localStorage.getItem('flum-theme');
  if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}
  else if(matchMedia('(prefers-color-scheme:light)').matches){document.documentElement.dataset.theme='light'}
  else{document.documentElement.dataset.theme='dark'}
})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

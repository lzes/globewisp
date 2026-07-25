import type { Metadata } from "next";
import "./globals.css";

const title = "MEM//ATLAS — 个人环球旅行记忆";
const description =
  "以世界地图、国家相册与全球飞行航线，记录持续展开的个人旅行记忆。";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://kai-light-archive.zeshunlee01.chatgpt.site";
const ogImage = `${siteUrl}/og.jpg`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "zh_CN",
    images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

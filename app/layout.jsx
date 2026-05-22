import Script from "next/script";

export const metadata = {
  title: "Bellovore Cinematic Portal",
  description: "A full cinematic 3D portal concept for the Bellovore universe.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/assets/intro-gateway.webp" />
        <link rel="preload" as="image" href="/assets/emblem.png" />
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body className="intro-active">
        {children}
        <Script src="/app.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}

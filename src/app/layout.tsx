import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Banff Road Trip",
  description: "Family road trip activity app — Banff, June 17–19",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Banff Trip",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){if(!('serviceWorker'in navigator))return;var reloading=false;navigator.serviceWorker.addEventListener('controllerchange',function(){if(!reloading){reloading=true;window.location.reload();}});window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then(function(reg){reg.update();function trySkip(sw){if(!sw)return;sw.addEventListener('statechange',function(){if(sw.state==='installed')sw.postMessage({type:'SKIP_WAITING'});});}if(reg.waiting)reg.waiting.postMessage({type:'SKIP_WAITING'});reg.addEventListener('updatefound',function(){trySkip(reg.installing);});}).catch(console.error);});})();`
          }}
        />
      </body>
    </html>
  );
}

// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TrustShield — Background Verification Platform",
  description: "Enterprise background verification and identity compliance platform",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#fff",
              color: "#0d1117",
              border: "1px solid #e2e6ec",
              borderRadius: "8px",
              fontSize: "13.5px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            },
            success: { iconTheme: { primary: "#16a34a", secondary: "#fff" } },
            error: { iconTheme: { primary: "#dc2626", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}

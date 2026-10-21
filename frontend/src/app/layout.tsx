import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mohmed Husain Pasheriya | AI Systems Engineer & Portfolio Agent",
  description:
    "Interactive portfolio of Mohmed Husain Pasheriya. Talk directly to my AI twin to explore projects, multi-agent architectures, hackathon wins, and backend systems.",
  keywords: [
    "Mohmed Husain Pasheriya",
    "AI Backend Engineer",
    "Agentic AI",
    "LangGraph",
    "FastAPI",
    "IIIT Vadodara",
    "CleaniSense",
  ],
  authors: [{ name: "Mohmed Husain Pasheriya", url: "https://mohmed-husain.in" }],
  openGraph: {
    title: "Mohmed Husain Pasheriya | AI Systems Engineer",
    description: "Talk to my AI twin to discover my projects, research, and skills in real time.",
    url: "https://mohmed-husain.in",
    siteName: "Mohmed Husain AI Agent",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}

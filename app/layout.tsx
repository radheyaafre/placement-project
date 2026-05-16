import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { NavigationFeedback } from "@/components/navigation-feedback";
import { getAppUrl } from "@/lib/env";

const siteUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SamyakLabs.AI | Placement Prep, AI Training, and Internships in Nashik",
    template: "%s | SamyakLabs.AI"
  },
  description:
    "SamyakLabs.AI offers a placement preparation portal with weekly sprint-style guided practice, AI training, GenAI training, diploma and degree classes, 1:1 mentoring, Codex guidance, AI-based development support, and internship-focused programs for students in Nashik and beyond.",
  keywords: [
    "best placement preparation app",
    "placement preparation app in Nashik",
    "placement institute in Nashik",
    "internship in Nashik",
    "AI internship in Nashik",
    "AI training in Nashik",
    "virtual AI training",
    "Gen AI training",
    "1:1 mentoring",
    "diploma classes Nashik",
    "degree classes Nashik",
    "Codex training",
    "AI based development",
    "diploma internships Nashik",
    "degree internship Nashik",
    "KKW internship",
    "placement prep app",
    "SamyakLabs AI"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "SamyakLabs.AI",
    description:
      "Placement preparation, AI training, GenAI training, diploma and degree classes, student internships, and practical learning support for students in Nashik and online.",
    url: siteUrl,
    siteName: "SamyakLabs.AI",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SamyakLabs.AI",
    description:
      "Placement prep, AI training, GenAI training, mentoring, and internship-focused learning for students in Nashik and beyond."
  },
  category: "education"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavigationFeedback />
        <div className="root-shell">{children}</div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";

import "@/app/globals.css";
import { NavigationFeedback } from "@/components/navigation-feedback";

export const metadata: Metadata = {
  title: "Placement Prep",
  description:
    "A 90-day motivation-based placement preparation tracker for aptitude, DSA, SQL, and HR practice."
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

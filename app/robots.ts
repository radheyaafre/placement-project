import type { MetadataRoute } from "next";

import { getAppUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getAppUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/internships", "/ai-training", "/placement-prep", "/services"],
        disallow: [
          "/dashboard",
          "/progress",
          "/settings",
          "/onboarding",
          "/admin",
          "/mission",
          "/preview",
          "/auth"
        ]
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl
  };
}

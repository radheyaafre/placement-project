"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/progress", label: "Progress" },
    { href: "/settings", label: "Settings" },
    { href: "/onboarding", label: "Onboarding" },
    { href: "/report-bug", label: "Report bug" }
  ];

  return (
    <nav className="nav-list" aria-label="Primary">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={isActivePath(pathname, item.href) ? "page" : undefined}
          data-loading-label={`Opening ${item.label}`}
        >
          {item.label}
        </Link>
      ))}
      {isAdmin ? (
        <>
          <Link
            href="/admin"
            aria-current={pathname === "/admin" ? "page" : undefined}
            data-loading-label="Opening admin overview"
          >
            Admin
          </Link>
          <Link
            href="/admin/content"
            aria-current={isActivePath(pathname, "/admin/content") ? "page" : undefined}
            data-loading-label="Opening admin content"
          >
            Admin Content
          </Link>
        </>
      ) : null}
    </nav>
  );
}

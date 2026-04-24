import Link from "next/link";

export function AuthTabs({
  items
}: {
  items: Array<{
    href: string;
    label: string;
    active?: boolean;
  }>;
}) {
  return (
    <nav className="auth-tabs" aria-label="Auth pages">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`auth-tab${item.active ? " auth-tab--active" : ""}`}
          aria-current={item.active ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

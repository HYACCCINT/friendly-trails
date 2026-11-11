"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SiteNavProps {
  items: { href: string; label: string }[];
  /** v3 prefetches every page in full, so they still open offline. */
  prefetch?: boolean;
}

/** Main navigation. A client component only because it reads the current URL. */
export function SiteNav({ items, prefetch }: SiteNavProps) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="site-nav">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          prefetch={prefetch}
          className="site-nav__link"
          aria-current={pathname === item.href ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

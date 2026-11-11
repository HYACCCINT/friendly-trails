import type { AnchorHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router";

// Stands in for next/link when the shared components are built into the SPA (see vite.config.ts).
// Same props, but navigation is handled by React Router, entirely in the browser.
// `prefetch` means nothing here: there's no server page to fetch.
type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  prefetch?: boolean | null;
  children?: ReactNode;
};

export default function RouterLink({ href, prefetch: _prefetch, ...rest }: Props) {
  return <Link to={href} {...rest} />;
}

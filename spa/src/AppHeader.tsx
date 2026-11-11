import { Link, NavLink } from "react-router";
import { BrandMark } from "@/components/BrandMark";
import { useAuth } from "./auth";

const NAV = [
  { to: "/", label: "Explore" },
  { to: "/saved", label: "Saved" },
];

export function AppHeader() {
  const { user, ready, signIn, signOut } = useAuth();
  const name = user?.displayName ?? user?.email ?? "Hiker";

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="brand">
          <BrandMark />
          <span>Friendly Trails</span>
        </Link>
        <nav aria-label="Main" className="site-nav">
          {NAV.map((item) => (
            // NavLink sets aria-current="page" on the active link, which the shared styles use.
            <NavLink key={item.to} to={item.to} end className="site-nav__link">
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="auth">
          {!ready ? (
            <span className="auth__placeholder" aria-hidden="true" />
          ) : user ? (
            <>
              <span className="avatar" aria-hidden="true">
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="visually-hidden">Signed in as {name}.</span>
              <button type="button" className="button button--ghost" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <button type="button" className="button" onClick={signIn}>
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

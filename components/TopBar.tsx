import Link from 'next/link';
import type { SessionUser } from '@/lib/auth';
import { logoutAction } from '@/lib/actions';
import { StomachLogo } from '@/components/StomachLogo';

export function TopBar({ user }: { user: SessionUser | null }) {
  return (
    <header className="topbar print-hide">
      <div className="container">
        <Link href={user ? '/patients' : '/'} className="brand-mark">
          <StomachLogo variant="dark" className="logo-tile logo-tile-bar" />
          <span className="brand-divider" />
          <span className="brand-sub">Patient Registry</span>
        </Link>
        {user && (
          <nav className="nav">
            <span className="who">
              Signed in as <b>{user.name}</b>
            </span>
            <form action={logoutAction}>
              <button type="submit">Sign out</button>
            </form>
          </nav>
        )}
      </div>
    </header>
  );
}

import { Outlet } from 'react-router-dom';

/**
 * PublicLayout — used for /, /login, /auth/callback, and 404.
 * The landing page (/) manages its own LandingNav and light theme.
 * Other public pages are standalone.
 */
export default function PublicLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, width: '100%' }}>
        <Outlet />
      </main>
    </div>
  );
}

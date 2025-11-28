import { ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';

interface Props {
  children: ReactNode;
}

export const Layout = ({ children }: Props) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = (() => {
    if (!user) return [];
    if (user.role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/works', label: 'Works' },
      ];
    }
    if (user.role === 'MARKETING') {
      return [
        { to: '/marketing/dashboard', label: 'Dashboard' },
        { to: '/marketing/work/new', label: 'New Work' },
      ];
    }
    return [
      { to: '/writer/dashboard', label: 'Dashboard' },
    ];
  })();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-lg">Work Manager</span>
            <nav className="hidden md:flex gap-3">
              {navLinks.map((link) => (
                <Link key={link.to} to={link.to} className="text-sm text-gray-600 hover:text-gray-900">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-gray-700">
                {user.name} ({user.role})
              </span>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
              >
                Logout
              </button>
            )}
            {navLinks.length > 0 && (
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center rounded border px-2 py-1 text-sm"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <span className="sr-only">Toggle navigation</span>
                <span className="block w-4 border-t border-gray-700" />
                <span className="block w-4 border-t border-gray-700 mt-0.5" />
                <span className="block w-4 border-t border-gray-700 mt-0.5" />
              </button>
            )}
          </div>
        </div>
        {mobileOpen && navLinks.length > 0 && (
          <div className="md:hidden border-t">
            <nav className="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-gray-700 py-1"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-4">{children}</main>
    </div>
  );
};

import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  BellIcon,
  ChevronDownIcon,
  TrendingUpIcon,
  PencilIcon,
  ClipboardListIcon,
} from "../ui/Icons";
import logo from "../../assets/preproute-logo.jpg";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-bg-page">
      {/* Sidebar */}
      <aside className="w-[240px] shrink-0 border-r border-border-light flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border-light">
          <img src={logo} alt="PrepRoute" className="h-7 w-auto" />
        </div>
        <nav className="flex-1 py-4">
          <SidebarLink
            to="/dashboard"
            label="Dashboard"
            icon={<TrendingUpIcon />}
          />
          <SidebarLink
            to="/tests/new"
            label="Test Creation"
            icon={<PencilIcon />}
          />
          <SidebarLink
            to="/test-tracking"
            label="Test Tracking"
            icon={<ClipboardListIcon />}
          />
        </nav>
        <button
          onClick={handleLogout}
          className="m-4 text-sm text-left text-danger hover:underline"
        >
          Log out
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border-light flex items-center justify-end px-8 gap-4">
          <button
            aria-label="Notifications"
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-brand-semi-white hover:text-brand transition-colors"
          >
            <BellIcon />
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-success" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-brand-semi-white border border-border-light flex items-center justify-center text-brand font-semibold text-sm shrink-0">
              {(user?.name ?? "A").charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-text-primary leading-tight">
                {user?.name ?? "Admin"}
              </div>
              <div className="text-xs text-text-secondary leading-tight capitalize">
                {user?.role ?? ""}
              </div>
            </div>
            <ChevronDownIcon className="w-4 h-4 text-text-secondary" />
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-6 py-2.5 text-sm font-medium border-r-2 ${
          isActive
            ? "text-brand bg-brand-semi-white border-brand"
            : "text-text-secondary border-transparent hover:text-text-primary hover:bg-brand-semi-white/50"
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
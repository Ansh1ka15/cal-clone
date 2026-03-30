import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  ChevronDown,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutGrid, label: "Event types" },
  { to: "/bookings", icon: Calendar, label: "Bookings" },
  { to: "/availability", icon: Clock, label: "Availability" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col border-r border-[var(--panel-border)] bg-[var(--panel-bg)] px-4 py-6 text-[var(--text)]">
      <div className="mb-8 flex items-center gap-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-text)] text-sm font-semibold">
          A
        </button>
        <div>
          <p className="text-sm font-semibold">Admin</p>
          <p className="text-xs text-[var(--muted)]">Control panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-[var(--hover)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--text)]"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

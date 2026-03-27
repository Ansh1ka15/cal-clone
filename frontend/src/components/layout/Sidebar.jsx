import { NavLink } from "react-router-dom";
import { Home, Clock, BookOpen, Zap } from "lucide-react";

const navItems = [
  { to: "/", icon: Home, label: "Event Types" },
  { to: "/availability", icon: Clock, label: "Availability" },
  { to: "/bookings", icon: BookOpen, label: "Bookings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="bg-brand rounded-2xl p-2">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Cal Clone</p>
          <p className="text-xs text-gray-500">Admin dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-light text-brand"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-6 py-5 border-t border-gray-100">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-xs font-semibold text-gray-500">Signed in as</p>
          <p className="mt-2 text-sm font-medium text-gray-900">Default User</p>
          <p className="text-xs text-gray-500">user@example.com</p>
        </div>
      </div>
    </aside>
  );
}

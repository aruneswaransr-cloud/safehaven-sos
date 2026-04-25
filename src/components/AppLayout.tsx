import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Shield, Users, MapPin, History, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/trip", label: "Trip", icon: MapPin },
  { to: "/alerts", label: "Alerts", icon: History },
];

export default function AppLayout() {
  const loc = useLocation();
  const onTrip = loc.pathname.startsWith("/trip");
  return (
    <div className="min-h-screen bg-gradient-soft pb-24 md:pb-0 md:pt-20">
      <header className="hidden md:block fixed top-0 inset-x-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="w-6 h-6 text-primary" />
            Saheli
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-smooth",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className={cn("container py-6 md:py-10", onTrip && "max-w-2xl")}>
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="grid grid-cols-4">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-3 text-xs transition-smooth",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <n.icon className="w-5 h-5" />
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

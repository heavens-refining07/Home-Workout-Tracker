import { NavLink, useLocation } from 'react-router-dom';
import { useAuth, logout } from 'zitejs/auth';
import { useState } from 'react';
import {
  LayoutDashboard, Dumbbell, Play, ClipboardList, Calculator,
  TrendingUp, Ruler, Target, CalendarDays, History, Trophy,
  User, FileText, Bell, Shield, Menu, X, ChevronLeft, LogOut, Activity
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/exercises', icon: Dumbbell, label: 'Exercises' },
  { to: '/workout', icon: Play, label: 'Workout' },
  { to: '/plans', icon: ClipboardList, label: 'Plans' },
  { to: '/bmi', icon: Calculator, label: 'BMI' },
  { to: '/progress', icon: TrendingUp, label: 'Progress' },
  { to: '/measurements', icon: Ruler, label: 'Measurements' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/achievements', icon: Trophy, label: 'Achievements' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/notifications', icon: Bell, label: 'Reminders' },
  { to: '/admin', icon: Shield, label: 'Admin' },
];

const mobileNav = navItems.slice(0, 5);

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex shrink-0 flex-col border-r border-border bg-card transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        <div className="flex items-center gap-2 px-4 h-20 shrink-0 border-b border-border">
          <Activity className="w-6 h-6 text-primary shrink-0" />
          {!collapsed && <span className="font-bold text-xl tracking-tight truncate">FitTracker</span>}
          <button aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 hover:bg-muted rounded">
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {navItems.map(n => (
            <NavLink key={n.to} to={n.to} aria-label={n.label} title={n.label} className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
            }>
              <n.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{n.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-2">
          <button aria-label="Log out" onClick={() => logout()} className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground w-full">
            <LogOut className="w-4 h-4" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 shrink-0 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="font-bold text-sm">FitTracker</span>
              </div>
              <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
              {navItems.map(n => (
                <NavLink key={n.to} to={n.to} aria-label={n.label} title={n.label} onClick={() => setMobileOpen(false)} className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
                }>
                  <n.icon className="w-4 h-4" />
                  <span>{n.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-border p-3">
              <button aria-label="Log out" onClick={() => logout()} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground w-full">
                <LogOut className="w-4 h-4" /><span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar mobile */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-card">
          <button aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="p-1"><Menu className="w-5 h-5" /></button>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold text-sm">FitTracker</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-4">
          {children}
        </main>
        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around py-1.5 z-40">
          {mobileNav.map(n => {
            const active = location.pathname === n.to;
            return (
              <NavLink key={n.to} to={n.to} aria-label={n.label} title={n.label} className="flex flex-col items-center gap-0.5 px-2 py-1">
                <n.icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] ${active ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{n.label}</span>
              </NavLink>
            );
          })}
          <button aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="flex flex-col items-center gap-0.5 px-2 py-1">
            <Menu className="w-5 h-5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

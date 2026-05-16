'use client';

import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  Activity,
  DollarSign,
  Settings,
  Shield,
  ChevronLeft,
  Bell,
  LogOut,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/appStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Conversions', href: '/admin/conversions', icon: ArrowLeftRight },
  { label: 'Queue Monitor', href: '/admin/queue', icon: Activity },
  { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAppStore((s) => s.user);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  if (!user) return null;

  if (user.role !== 'ADMIN') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You do not have admin privileges.</p>
          <Button asChild>
            <Link href="/dashboard"><ChevronLeft className="mr-1 h-4 w-4" />Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_hsl(var(--background)))_0%,_hsl(var(--background)-darker)_100%)]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/50 bg-background/95 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/25">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">Admin</span>
              <span className="block text-[10px] font-medium text-muted-foreground leading-none">Panel</span>
            </div>
          </Link>
        </div>
        <Separator />
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-red-500/10 text-red-500'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="admin-nav-active"
                      className="absolute inset-0 rounded-lg bg-red-500/10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{item.label}</span>
                  {item.badge && (
                    <Badge variant="destructive" className="relative z-10 ml-auto h-5 px-1.5 text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">System Status</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex h-2 w-2 rounded-full bg-green-500" />
              All systems operational
            </div>
          </div>
        </ScrollArea>

        <Separator />
        <div className="p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {adminNav.find((n) => n.href === pathname)?.label || 'Admin'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-2 text-muted-foreground"
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  router.push('/login');
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Sign Out</span>
              </Button>
              <Avatar className="h-7 w-7">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="text-xs">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

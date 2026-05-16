'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Shield,
  Zap,
  Crown,
  LayoutDashboard,
  ArrowLeftRight,
  Files,
  Key,
  CreditCard,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppStore } from '@/store/appStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Convert', href: '/convert', icon: ArrowLeftRight },
  { label: 'My Files', href: '/files', icon: Files },
  { label: 'API Keys', href: '/api-keys', icon: Key },
  { label: 'Billing', href: '/billing', icon: CreditCard, badge: 'PRO' },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const user = useAppStore((s) => s.user);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">ConvertForge</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Separator className="bg-sidebar-border/50" />

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-sidebar-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{item.label}</span>
                {item.badge && (
                  <span className="relative z-10 ml-auto rounded-full bg-gradient-to-r from-primary to-purple-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <Separator className="my-4 bg-sidebar-border/50" />

        <div className="rounded-xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-semibold">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-sidebar-foreground/60 mb-3">
            Get unlimited conversions, larger file sizes, and priority support.
          </p>
          <Button variant="gradient" size="sm" className="w-full" asChild>
            <Link href="/billing">
              <Zap className="mr-1 h-3 w-3" />
              Upgrade Now
            </Link>
          </Button>
        </div>
      </ScrollArea>

      <Separator className="bg-sidebar-border/50" />

      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar className="h-8 w-8 ring-2 ring-sidebar-border">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className="text-xs bg-sidebar-accent text-sidebar-accent-foreground">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-sidebar-foreground/50 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-30">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

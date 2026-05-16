'use client';

import { ReactNode, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  CreditCard,
} from 'lucide-react';
import { Sidebar } from '@/components/layout/sidebar';
import { ModeToggle } from '@/components/layout/mode-toggle';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/store/appStore';
import { authApi } from '@/services/api';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token && !user) {
      authApi.getMe().then(setUser).catch(() => {
        localStorage.removeItem('auth_token');
      });
    }
  }, [user, setUser]);

  const pageTitle = (() => {
    if (pathname === '/dashboard') return 'Dashboard';
    if (pathname.startsWith('/convert')) return 'Convert Files';
    if (pathname.startsWith('/files')) return 'My Files';
    if (pathname.startsWith('/api-keys')) return 'API Keys';
    if (pathname.startsWith('/billing')) return 'Billing';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  })();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <motion.h1
                key={pageTitle}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-semibold"
              >
                {pageTitle}
              </motion.h1>
            </div>

            <div className="hidden sm:flex relative flex-1 max-w-md mx-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files, conversions..."
                className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>

            <div className="flex items-center gap-3">
              <ModeToggle />

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  3
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">{user?.name || 'User'}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.name || 'User'}</span>
                      <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/billing" className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Billing
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => {
                      localStorage.removeItem('auth_token');
                      window.location.href = '/login';
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

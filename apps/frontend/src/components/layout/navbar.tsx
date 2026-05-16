'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/layout/mode-toggle';
import { cn } from '@/lib/utils';
import { Menu, X, Zap } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-xl border-b border-border'
          : 'bg-transparent',
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold">ConvertForge</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="/#formats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Formats
          </Link>
          <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link href="/#api" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            API
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          <Link href="/login">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600">Get Started</Button>
          </Link>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl">
          <div className="container py-4 flex flex-col gap-3">
            <Link href="/#features" className="text-sm py-2">Features</Link>
            <Link href="/#formats" className="text-sm py-2">Formats</Link>
            <Link href="/pricing" className="text-sm py-2">Pricing</Link>
            <Link href="/login">
              <Button variant="outline" className="w-full">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="w-full bg-gradient-to-r from-primary to-purple-600">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

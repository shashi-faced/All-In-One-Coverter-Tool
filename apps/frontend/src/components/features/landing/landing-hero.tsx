'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Globe, Download, Upload, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const stats = [
  { icon: Globe, value: '100+', label: 'Formats Supported' },
  { icon: Zap, value: '1M+', label: 'Conversions Done' },
  { icon: Shield, value: '99.9%', label: 'Uptime' },
];

const floatingIcons = [
  { Icon: FileImage, x: '15%', y: '20%', delay: 0, duration: 6 },
  { Icon: Upload, x: '80%', y: '30%', delay: 1, duration: 7 },
  { Icon: Download, x: '25%', y: '70%', delay: 2, duration: 5 },
  { Icon: Globe, x: '75%', y: '65%', delay: 0.5, duration: 8 },
];

export default function LandingHero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[150px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating elements */}
      {floatingIcons.map(({ Icon, x, y, delay, duration }) => (
        <motion.div
          key={x}
          className="absolute hidden lg:block text-muted-foreground/20"
          style={{ left: x, top: y }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
        >
          <Icon size={48} />
        </motion.div>
      ))}

      <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="info" className="mb-6 px-4 py-1.5 text-sm">
            ⚡ Trusted by 50,000+ users worldwide
          </Badge>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl"
        >
          Convert{' '}
          <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Any File.
          </span>{' '}
          <br className="hidden sm:block" />
          Instantly.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl"
        >
          Upload, convert, and download files in seconds. No sign-up required.
          Powered by cutting-edge cloud technology for blazing fast conversions.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-4"
        >
          <Button variant="gradient" size="xl" asChild>
            <Link href="/">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="xl" asChild>
            <Link href="/api-docs">
              View API
            </Link>
          </Button>
        </motion.div>

        {/* Glass card - format conversion example */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 w-full max-w-lg"
        >
          <Card className="backdrop-blur-xl bg-background/60 border-border/50 shadow-2xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <FileImage className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">photo.png</p>
                    <p className="text-xs text-muted-foreground">2.4 MB &middot; PNG Image</p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <ArrowRight className="h-5 w-5 text-primary" />
                </motion.div>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-purple-500/10">
                    <FileImage className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">photo.jpg</p>
                    <p className="text-xs text-muted-foreground">0.8 MB &middot; JPEG</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-primary via-purple-500 to-pink-500"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2, delay: 0.8, ease: 'easeInOut' }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">Complete</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-20 w-full max-w-3xl mx-auto"
      >
        <div className="grid grid-cols-3 gap-8 px-4">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl sm:text-3xl font-bold">{value}</p>
              <p className="text-sm text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

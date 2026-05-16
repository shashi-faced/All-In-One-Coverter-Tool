'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  ArrowLeftRight,
  Upload,
  Key,
  TrendingUp,
  HardDrive,
  Activity,
  Clock,
  FileText,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/store/appStore';
import { conversionsApi, usageApi } from '@/services/api';
import { cn, formatBytes, formatDate } from '@/lib/utils';
import type { ConversionJob } from '@convertforge/shared-types';
import { ConversionStatus } from '@convertforge/shared-types';

interface DailyStat {
  date: string;
  conversions: number;
  storage: number;
}

const weeklyData: DailyStat[] = [
  { date: 'Mon', conversions: 24, storage: 150 },
  { date: 'Tue', conversions: 18, storage: 98 },
  { date: 'Wed', conversions: 32, storage: 210 },
  { date: 'Thu', conversions: 27, storage: 175 },
  { date: 'Fri', conversions: 45, storage: 320 },
  { date: 'Sat', conversions: 12, storage: 65 },
  { date: 'Sun', conversions: 8, storage: 40 },
];

const storageData = [
  { name: 'Images', value: 45, fill: '#6366f1' },
  { name: 'Documents', value: 25, fill: '#8b5cf6' },
  { name: 'Video', value: 18, fill: '#a855f7' },
  { name: 'Audio', value: 12, fill: '#d946ef' },
];

function StatCardSkeleton() {
  return (
    <Card className="backdrop-blur-xl bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>(weeklyData);
  const user = useAppStore((s) => s.user);
  const usage = useAppStore((s) => s.usage);
  const setUsage = useAppStore((s) => s.setUsage);
  const conversions = useAppStore((s) => s.conversions);
  const setConversions = useAppStore((s) => s.setConversions);

  useEffect(() => {
    async function load() {
      try {
        const [usageData, convData] = await Promise.all([
          usageApi.getUsage().catch(() => null),
          conversionsApi.getConversions({ limit: 5 }).catch(() => null),
        ]);
        if (usageData) setUsage(usageData);
        if (convData) setConversions(convData.items);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setUsage, setConversions]);

  const stats = [
    {
      title: 'Total Conversions',
      value: usage?.totalConversions ?? 0,
      icon: ArrowLeftRight,
      change: '+12%',
      color: 'from-primary/20 to-primary/5',
      iconColor: 'text-primary',
    },
    {
      title: 'Files Stored',
      value: usage?.storageUsed ? Math.round(usage.storageUsed / 1024 / 1024) : 0,
      suffix: 'MB',
      icon: HardDrive,
      change: '+5%',
      color: 'from-purple-500/20 to-purple-500/5',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Storage Used',
      value: usage ? Math.round((usage.storageUsed / usage.storageLimit) * 100) : 0,
      suffix: '%',
      icon: Activity,
      change: `${usage ? formatBytes(usage.storageLimit - usage.storageUsed) : '0 GB'} free`,
      color: 'from-pink-500/20 to-pink-500/5',
      iconColor: 'text-pink-500',
    },
    {
      title: 'Active Queue',
      value: conversions.filter((c) => c.status === ConversionStatus.PROCESSING).length,
      icon: Clock,
      change: `${conversions.filter((c) => c.status === ConversionStatus.QUEUED).length} queued`,
      color: 'from-amber-500/20 to-amber-500/5',
      iconColor: 'text-amber-500',
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="backdrop-blur-xl bg-card/50 border-border/50">
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-64 w-full" /></CardContent>
          </Card>
          <Card className="backdrop-blur-xl bg-card/50 border-border/50">
            <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
            <CardContent><Skeleton className="h-64 w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const hasConversions = conversions.length > 0;
  const isNewUser = !hasConversions && user?.createdAt && new Date(user.createdAt).getTime() > Date.now() - 86400000;

  return (
    <div className="space-y-6">
      {isNewUser && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 p-6"
        >
          <h2 className="text-lg font-semibold mb-1">
            Welcome to ConvertForge, {user?.name?.split(' ')[0] || 'there'}!
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Start by uploading your first file or exploring the dashboard.
          </p>
          <div className="flex gap-3">
            <Button variant="gradient" size="sm" asChild>
              <Link href="/convert"><Upload className="mr-1 h-4 w-4" />Upload File</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/api-keys"><Key className="mr-1 h-4 w-4" />Get API Key</Link>
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="backdrop-blur-xl bg-card/50 border-border/50 overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={cn('rounded-lg p-2 bg-gradient-to-br', stat.color)}>
                    <Icon className={cn('h-4 w-4', stat.iconColor)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    {stat.suffix && (
                      <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="backdrop-blur-xl bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Daily Conversions</CardTitle>
            <CardDescription>Conversion activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Bar
                    dataKey="conversions"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Storage Overview</CardTitle>
            <CardDescription>Storage usage by file category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={storageData}>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="backdrop-blur-xl bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Recent Conversions</CardTitle>
              <CardDescription>Your latest file conversions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/convert">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {!hasConversions ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm font-medium">No conversions yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start by converting your first file
                </p>
                <Button variant="gradient" size="sm" className="mt-4" asChild>
                  <Link href="/convert">Convert a File</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {conversions.slice(0, 5).map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <ArrowLeftRight className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conv.inputFormat} → {conv.outputFormat}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(conv.createdAt)} · {formatBytes(conv.fileSize)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        conv.status === ConversionStatus.COMPLETED
                          ? 'success'
                          : conv.status === ConversionStatus.FAILED
                            ? 'destructive'
                            : conv.status === ConversionStatus.PROCESSING
                              ? 'info'
                              : 'warning'
                      }
                      className="shrink-0"
                    >
                      {conv.status === ConversionStatus.PROCESSING && (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      {conv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
              <Link href="/convert">
                <div className="rounded-lg bg-primary/10 p-1.5">
                  <ArrowLeftRight className="h-4 w-4 text-primary" />
                </div>
                New Conversion
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
              <Link href="/files">
                <div className="rounded-lg bg-purple-500/10 p-1.5">
                  <Upload className="h-4 w-4 text-purple-500" />
                </div>
                Upload File
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3 h-12" asChild>
              <Link href="/api-keys">
                <div className="rounded-lg bg-amber-500/10 p-1.5">
                  <Key className="h-4 w-4 text-amber-500" />
                </div>
                View API Keys
              </Link>
            </Button>
            <Separator />
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-medium mb-1">Daily Limit</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>{usage?.conversionsToday ?? 0} / {usage?.dailyConversionLimit ?? 100} conversions</span>
                <span>{Math.round(((usage?.conversionsToday ?? 0) / (usage?.dailyConversionLimit ?? 100)) * 100)}%</span>
              </div>
              <Progress value={((usage?.conversionsToday ?? 0) / (usage?.dailyConversionLimit ?? 100)) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

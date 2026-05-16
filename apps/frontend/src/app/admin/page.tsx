'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, ArrowLeftRight, DollarSign, HardDrive,
  Activity, CheckCircle2, AlertTriangle, Clock, Server,
  Cpu, Wifi, Database, TrendingUp, TrendingDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn, formatDate } from '@/lib/utils';

const revenueData = [
  { month: 'Jan', revenue: 4200, subscriptions: 3800, payg: 400 },
  { month: 'Feb', revenue: 5100, subscriptions: 4200, payg: 900 },
  { month: 'Mar', revenue: 4800, subscriptions: 4100, payg: 700 },
  { month: 'Apr', revenue: 6300, subscriptions: 5200, payg: 1100 },
  { month: 'May', revenue: 7200, subscriptions: 5800, payg: 1400 },
  { month: 'Jun', revenue: 8100, subscriptions: 6400, payg: 1700 },
  { month: 'Jul', revenue: 7800, subscriptions: 6100, payg: 1700 },
  { month: 'Aug', revenue: 9400, subscriptions: 7200, payg: 2200 },
  { month: 'Sep', revenue: 10200, subscriptions: 8100, payg: 2100 },
  { month: 'Oct', revenue: 11500, subscriptions: 9200, payg: 2300 },
  { month: 'Nov', revenue: 12800, subscriptions: 10100, payg: 2700 },
  { month: 'Dec', revenue: 14300, subscriptions: 11200, payg: 3100 },
];

const conversionsData = [
  { day: 'Mon', conversions: 1245, success: 1190, failed: 55 },
  { day: 'Tue', conversions: 1380, success: 1320, failed: 60 },
  { day: 'Wed', conversions: 1520, success: 1470, failed: 50 },
  { day: 'Thu', conversions: 1410, success: 1350, failed: 60 },
  { day: 'Fri', conversions: 1680, success: 1610, failed: 70 },
  { day: 'Sat', conversions: 890, success: 850, failed: 40 },
  { day: 'Sun', conversions: 760, success: 730, failed: 30 },
];

const recentUsers = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', plan: 'Pro', status: 'active', conversions: 342, joined: '2025-11-12T10:00:00Z', avatar: '' },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', plan: 'Free', status: 'active', conversions: 28, joined: '2026-01-05T14:30:00Z', avatar: '' },
  { id: '3', name: 'Carol Williams', email: 'carol@example.com', plan: 'Enterprise', status: 'active', conversions: 1247, joined: '2025-03-20T09:15:00Z', avatar: '' },
  { id: '4', name: 'David Brown', email: 'david@example.com', plan: 'Pro', status: 'suspended', conversions: 89, joined: '2025-08-01T11:00:00Z', avatar: '' },
  { id: '5', name: 'Eve Davis', email: 'eve@example.com', plan: 'Free', status: 'active', conversions: 12, joined: '2026-02-18T16:45:00Z', avatar: '' },
  { id: '6', name: 'Frank Miller', email: 'frank@example.com', plan: 'Pro', status: 'active', conversions: 215, joined: '2025-06-10T08:00:00Z', avatar: '' },
];

const storageBreakdown = [
  { name: 'Images', value: 45, color: '#6366f1' },
  { name: 'Documents', value: 25, color: '#8b5cf6' },
  { name: 'Video', value: 18, color: '#a855f7' },
  { name: 'Audio', value: 12, color: '#d946ef' },
];

const systemHealth = [
  { label: 'API Latency', value: '42ms', status: 'healthy', icon: Activity },
  { label: 'Queue Backlog', value: '12 jobs', status: 'healthy', icon: Clock },
  { label: 'CPU Usage', value: '34%', status: 'healthy', icon: Cpu },
  { label: 'Memory', value: '2.1/8 GB', status: 'healthy', icon: Database },
  { label: 'Storage', value: '68%', status: 'warning', icon: HardDrive },
  { label: 'Uptime', value: '99.97%', status: 'healthy', icon: Wifi },
];

const statCards = [
  {
    title: 'Total Users',
    value: '24,589',
    change: '+12.5%',
    trend: 'up',
    icon: Users,
    color: 'from-blue-500/20 to-blue-500/5',
    iconColor: 'text-blue-500',
  },
  {
    title: 'Active Conversions',
    value: '1,284',
    change: '+8.3%',
    trend: 'up',
    icon: ArrowLeftRight,
    color: 'from-green-500/20 to-green-500/5',
    iconColor: 'text-green-500',
  },
  {
    title: 'Total Revenue',
    value: '$94,200',
    change: '+23.7%',
    trend: 'up',
    icon: DollarSign,
    color: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
  },
  {
    title: 'Storage Used',
    value: '3.4 TB',
    change: '+5.2%',
    trend: 'up',
    icon: HardDrive,
    color: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-500',
  },
];

const tooltipStyle = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  fontSize: '13px',
};

export default function AdminDashboardPage() {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '1y'>('1y');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-sm text-muted-foreground">System overview and key metrics</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-0.5">
          {(['7d', '30d', '1y'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                timeframe === t ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden border-border/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={cn('rounded-lg p-2 bg-gradient-to-br', stat.color)}>
                    <Icon className={cn('h-4 w-4', stat.iconColor)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className={cn(
                      'flex items-center gap-0.5 text-xs font-medium',
                      stat.trend === 'up' ? 'text-green-500' : 'text-red-500',
                    )}>
                      {stat.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stat.change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue Overview</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </div>
              <Badge variant="success" className="text-xs">+23.7%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Daily Conversions</CardTitle>
                <CardDescription>Conversion activity this week</CardDescription>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-primary" /> Success</span>
                <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-destructive" /> Failed</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionsData} barGap={4}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="success" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Bar dataKey="failed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="border-border/50 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentUsers.map((user, i) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={
                          user.plan === 'Enterprise' ? 'success' :
                          user.plan === 'Pro' ? 'info' : 'secondary'
                        } className="text-xs">
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            'flex h-2 w-2 rounded-full',
                            user.status === 'active' ? 'bg-green-500' : 'bg-red-500',
                          )} />
                          <span className="text-xs capitalize">{user.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm">{user.conversions.toLocaleString()}</td>
                      <td className="px-6 py-3 text-xs text-muted-foreground">{formatDate(user.joined)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">System Health</CardTitle>
            <CardDescription>Infrastructure status overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemHealth.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'rounded-lg p-1.5',
                      item.status === 'healthy' ? 'bg-green-500/10' : 'bg-amber-500/10',
                    )}>
                      <Icon className={cn(
                        'h-3.5 w-3.5',
                        item.status === 'healthy' ? 'text-green-500' : 'text-amber-500',
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.value}</p>
                    </div>
                  </div>
                  <span className={cn(
                    'flex h-2 w-2 rounded-full',
                    item.status === 'healthy' ? 'bg-green-500' : 'bg-amber-500',
                  )} />
                </div>
              );
            })}
          </CardContent>
          <Separator />
          <CardContent className="pt-4">
            <div className="rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">All Systems Operational</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last checked 30 seconds ago</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Storage Distribution</CardTitle>
          <CardDescription>Total: 3.4 TB across all users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-8">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={storageBreakdown} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {storageBreakdown.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {storageBreakdown.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                      {item.name}
                    </span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

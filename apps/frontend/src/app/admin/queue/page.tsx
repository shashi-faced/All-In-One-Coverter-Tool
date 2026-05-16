'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Clock, CheckCircle2, XCircle, AlertTriangle, RotateCcw,
  Play, Pause, Server, Cpu, HardDrive, Activity, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn, formatDate } from '@/lib/utils';

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

interface FailedJob {
  id: string;
  name: string;
  inputFormat: string;
  outputFormat: string;
  error: string;
  failedAt: string;
  retries: number;
  maxRetries: number;
  userId: string;
}

interface ActiveJob {
  id: string;
  name: string;
  inputFormat: string;
  outputFormat: string;
  progress: number;
  startedAt: string;
  estimatedRemaining: string;
  workerId: string;
}

interface WorkerInfo {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy';
  jobsProcessed: number;
  currentJob: string | null;
  cpu: number;
  memory: number;
  uptime: string;
}

const queueStats: QueueStats = {
  waiting: 23,
  active: 8,
  completed: 14582,
  failed: 47,
  delayed: 5,
  total: 14665,
};

const failedJobs: FailedJob[] = [
  { id: 'job-001', name: 'document-convert-001', inputFormat: 'docx', outputFormat: 'pdf', error: 'File size exceeds max limit (25MB)', failedAt: new Date(Date.now() - 300000).toISOString(), retries: 2, maxRetries: 3, userId: 'user-12' },
  { id: 'job-002', name: 'video-transcode-042', inputFormat: 'mp4', outputFormat: 'webm', error: 'Unsupported codec: hevc', failedAt: new Date(Date.now() - 900000).toISOString(), retries: 1, maxRetries: 3, userId: 'user-08' },
  { id: 'job-003', name: 'image-convert-123', inputFormat: 'tiff', outputFormat: 'jpg', error: 'Corrupt input file: missing header', failedAt: new Date(Date.now() - 1800000).toISOString(), retries: 3, maxRetries: 3, userId: 'user-45' },
  { id: 'job-004', name: 'audio-transcode-089', inputFormat: 'flac', outputFormat: 'mp3', error: 'Conversion timeout after 120s', failedAt: new Date(Date.now() - 3600000).toISOString(), retries: 0, maxRetries: 3, userId: 'user-23' },
  { id: 'job-005', name: 'archive-extract-056', inputFormat: 'zip', outputFormat: 'unpack', error: 'Password-protected archive', failedAt: new Date(Date.now() - 7200000).toISOString(), retries: 1, maxRetries: 2, userId: 'user-67' },
];

const activeJobs: ActiveJob[] = [
  { id: 'active-001', name: 'video-transcode-087', inputFormat: 'mov', outputFormat: 'mp4', progress: 62, startedAt: new Date(Date.now() - 240000).toISOString(), estimatedRemaining: '2 min', workerId: 'worker-01' },
  { id: 'active-002', name: 'pdf-convert-234', inputFormat: 'pdf', outputFormat: 'docx', progress: 88, startedAt: new Date(Date.now() - 180000).toISOString(), estimatedRemaining: '<1 min', workerId: 'worker-01' },
  { id: 'active-003', name: 'image-resize-567', inputFormat: 'png', outputFormat: 'webp', progress: 34, startedAt: new Date(Date.now() - 60000).toISOString(), estimatedRemaining: '30s', workerId: 'worker-02' },
  { id: 'active-004', name: 'audio-transcode-101', inputFormat: 'wav', outputFormat: 'aac', progress: 15, startedAt: new Date(Date.now() - 30000).toISOString(), estimatedRemaining: '1 min', workerId: 'worker-02' },
  { id: 'active-005', name: 'document-convert-345', inputFormat: 'pptx', outputFormat: 'pdf', progress: 45, startedAt: new Date(Date.now() - 120000).toISOString(), estimatedRemaining: '1.5 min', workerId: 'worker-03' },
];

const workers: WorkerInfo[] = [
  { id: 'worker-01', name: 'Converter Node 1', status: 'busy', jobsProcessed: 4521, currentJob: 'video-transcode-087', cpu: 78, memory: 65, uptime: '14d 6h' },
  { id: 'worker-02', name: 'Converter Node 2', status: 'busy', jobsProcessed: 3892, currentJob: 'image-resize-567', cpu: 52, memory: 44, uptime: '14d 6h' },
  { id: 'worker-03', name: 'Converter Node 3', status: 'online', jobsProcessed: 5234, currentJob: null, cpu: 12, memory: 31, uptime: '7d 2h' },
  { id: 'worker-04', name: 'Converter Node 4', status: 'offline', jobsProcessed: 935, currentJob: null, cpu: 0, memory: 0, uptime: '0d 0h' },
  { id: 'worker-05', name: 'Converter Node 5', status: 'online', jobsProcessed: 2100, currentJob: null, cpu: 8, memory: 22, uptime: '3d 18h' },
];

const rateHistory = [
  { time: '00:00', rate: 42 }, { time: '04:00', rate: 18 }, { time: '08:00', rate: 56 },
  { time: '10:00', rate: 82 }, { time: '12:00', rate: 74 }, { time: '14:00', rate: 91 },
  { time: '16:00', rate: 88 }, { time: '18:00', rate: 63 }, { time: '20:00', rate: 45 },
  { time: '22:00', rate: 38 },
];

export default function AdminQueuePage() {
  const [retrying, setRetrying] = useState<string | null>(null);

  const handleRetry = (jobId: string) => {
    setRetrying(jobId);
    setTimeout(() => setRetrying(null), 1500);
  };

  const statItems = [
    { label: 'Waiting', value: queueStats.waiting, icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active', value: queueStats.active, icon: Play, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Completed', value: queueStats.completed, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Failed', value: queueStats.failed, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
    { label: 'Delayed', value: queueStats.delayed, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Queue Monitor</h2>
          <p className="text-sm text-muted-foreground">Real-time conversion queue status</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {statItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    <div className={cn('rounded-lg p-1.5', item.bg)}>
                      <Icon className={cn('h-3.5 w-3.5', item.color)} />
                    </div>
                  </div>
                  <span className="text-xl font-bold">{item.value.toLocaleString()}</span>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Failed Jobs</CardTitle>
            <CardDescription>Recent conversion failures requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {failedJobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                      <span className="text-sm font-medium truncate">{job.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {job.inputFormat.toUpperCase()} → {job.outputFormat.toUpperCase()} · {formatDate(job.failedAt)}
                    </p>
                    <p className="text-xs text-red-500/80 font-mono bg-red-500/5 rounded px-1.5 py-0.5 inline-block">
                      {job.error}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">User: {job.userId}</span>
                      <span className="text-[10px] text-muted-foreground">Retries: {job.retries}/{job.maxRetries}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 h-7 gap-1 text-xs"
                    onClick={() => handleRetry(job.id)}
                    disabled={retrying === job.id}
                  >
                    {retrying === job.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3 w-3" />
                    )}
                    Retry
                  </Button>
                </div>
              </div>
            ))}
            {failedJobs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-sm text-muted-foreground">No failed jobs</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Active Jobs</CardTitle>
            <CardDescription>Currently processing conversions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-border/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-green-500/10">
                      <Activity className="h-3 w-3 text-green-500" />
                    </div>
                    <span className="text-sm font-medium truncate">{job.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0 ml-2">{job.estimatedRemaining}</span>
                </div>
                <div className="flex items-center gap-3 mb-1.5">
                  <Badge variant="outline" className="text-[10px] h-5">
                    {job.inputFormat.toUpperCase()} → {job.outputFormat.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">Worker: {job.workerId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={job.progress} className="flex-1 h-1.5" />
                  <span className="text-xs font-medium tabular-nums w-10 text-right">{job.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Worker Status</CardTitle>
            <CardDescription>Conversion node health and load</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {workers.map((w) => (
              <div key={w.id} className="rounded-lg border border-border/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'flex h-6 w-6 items-center justify-center rounded',
                      w.status === 'online' ? 'bg-green-500/10' :
                      w.status === 'busy' ? 'bg-amber-500/10' : 'bg-muted',
                    )}>
                      <Server className={cn(
                        'h-3 w-3',
                        w.status === 'online' ? 'text-green-500' :
                        w.status === 'busy' ? 'text-amber-500' : 'text-muted-foreground',
                      )} />
                    </div>
                    <div>
                      <span className="text-sm font-medium">{w.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={cn(
                          'flex h-1.5 w-1.5 rounded-full',
                          w.status === 'online' ? 'bg-green-500' :
                          w.status === 'busy' ? 'bg-amber-500' : 'bg-muted-foreground',
                        )} />
                        <span className="text-[10px] text-muted-foreground capitalize">{w.status}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{w.jobsProcessed.toLocaleString()} jobs</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Cpu className="h-3 w-3" /> CPU</span>
                      <span>{w.cpu}%</span>
                    </div>
                    <Progress value={w.cpu} className="h-1" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> Memory</span>
                      <span>{w.memory}%</span>
                    </div>
                    <Progress value={w.memory} className="h-1" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Processing Rate</CardTitle>
            <CardDescription>Conversions per hour (last 24h)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rateHistory}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={32}>
                    {rateHistory.map((entry, i) => (
                      <motion.rect
                        key={i}
                        initial={{ y: 0, height: 0 }}
                        animate={{ y: 0, height: 'auto' }}
                        transition={{ delay: i * 0.02 }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <Separator />
          <CardContent className="pt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <span className="font-medium">Throughput</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Avg</p>
                  <p className="font-medium tabular-nums">59.7/h</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Peak</p>
                  <p className="font-medium tabular-nums">91/h</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

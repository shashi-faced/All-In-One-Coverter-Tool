'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Key, Plus, Trash2, Copy, Check, Eye, EyeOff,
  Shield, RefreshCw, BarChart3, Zap, Terminal, CreditCard,
  BookOpen, ChevronRight, Info, CheckCircle2, AlertCircle,
  HelpCircle, ArrowRight, Loader2, BarChart2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/appStore';
import { apiKeysApi, billingApi, usageApi, conversionsApi } from '@/services/api';
import { cn, formatBytes } from '@/lib/utils';
import { PLANS } from '@convertforge/shared-types';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
}

export default function DeveloperPage() {
  const user = useAppStore((s) => s.user);
  const usage = useAppStore((s) => s.usage);
  const setUsage = useAppStore((s) => s.setUsage);
  const [activeTab, setActiveTab] = useState<'api-keys' | 'tokens' | 'subscription' | 'usage' | 'plans' | 'docs'>('api-keys');

  // Load latest usage statistics
  useEffect(() => {
    usageApi.getUsage()
      .then((res) => setUsage(res))
      .catch((err) => console.error('Failed to load usage statistics:', err));
  }, [setUsage]);

  const tabs = [
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'tokens', label: 'Access Tokens', icon: Terminal },
    { id: 'subscription', label: 'Developer Subscription', icon: Shield },
    { id: 'usage', label: 'API Usage', icon: BarChart3 },
    { id: 'plans', label: 'Pricing Plans', icon: CreditCard },
    { id: 'docs', label: 'API Documentation', icon: BookOpen },
  ] as const;

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">Developer Portal</h2>
        <p className="text-sm text-muted-foreground">Integrate file conversion programmatically into your own applications</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side Tab Navigation */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1 pb-2 lg:pb-0 bg-background/50 p-1 rounded-xl border border-border/40 backdrop-blur-sm h-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 text-left whitespace-nowrap lg:whitespace-normal flex-1 lg:flex-initial",
                  isActive
                    ? "bg-primary/10 text-primary border-l-2 border-primary pl-2.5"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right Side Tab Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === 'api-keys' && <ApiKeysTab />}
              {activeTab === 'tokens' && <TokensTab />}
              {activeTab === 'subscription' && <SubscriptionTab usage={usage} />}
              {activeTab === 'usage' && <UsageTab usage={usage} />}
              {activeTab === 'plans' && <PlansTab />}
              {activeTab === 'docs' && <DocsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// API KEYS TAB
// ----------------------------------------------------
function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await apiKeysApi.getApiKeys();
      setKeys(res as ApiKey[]);
    } catch (err) {
      console.error('Failed to fetch api keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      await apiKeysApi.createApiKey(newKeyName);
      setNewKeyName('');
      await fetchKeys();
    } catch (err: any) {
      alert(err.message || 'Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await apiKeysApi.revokeApiKey(id);
      await fetchKeys();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke API key');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) return;
    try {
      await apiKeysApi.deleteApiKey(id);
      await fetchKeys();
    } catch (err: any) {
      alert(err.message || 'Failed to delete API key');
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">API Keys</CardTitle>
        <CardDescription>Use these keys to authenticate your requests. Keep them secure.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Key name (e.g. Production, staging)..."
            className="max-w-sm"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Button size="sm" className="gap-1.5" onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
            {creating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Create Key
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-lg">
            <Key className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No API keys found</p>
            <p className="text-xs text-muted-foreground">Generate your first API key above to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((apiKey) => (
              <div
                key={apiKey.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border/40 p-4 hover:bg-muted/10 transition-colors"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{apiKey.name}</span>
                    <Badge variant={apiKey.isActive ? 'success' : 'destructive'} className="text-[10px] h-4">
                      {apiKey.isActive ? 'active' : 'revoked'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {visibleKeys[apiKey.id] ? apiKey.key : `${apiKey.key.slice(0, 12)}...${apiKey.key.slice(-4)}`}
                    </code>
                    <button
                      onClick={() => setVisibleKeys(prev => ({ ...prev, [apiKey.id]: !prev[apiKey.id] }))}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title={visibleKeys[apiKey.id] ? 'Hide Key' : 'Reveal Key'}
                    >
                      {visibleKeys[apiKey.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(apiKey.key)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Copy Key"
                    >
                      {copiedKey === apiKey.key ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex gap-3 flex-wrap">
                    <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                    {apiKey.lastUsedAt && (
                      <span>Last used: {new Date(apiKey.lastUsedAt).toLocaleString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {apiKey.isActive ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                      onClick={() => handleRevoke(apiKey.id)}
                    >
                      Revoke
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Revoked</Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(apiKey.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------
// ACCESS TOKENS TAB
// ----------------------------------------------------
function TokensTab() {
  const [copiedToken, setCopiedToken] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem('auth_token') || '');
    }
  }, []);

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Developer Access Token</CardTitle>
        <CardDescription>Your personal bearer token. Useful for testing APIs directly without managing key structures.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {token ? (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={token}
                readOnly
                className="w-full h-32 text-xs font-mono p-3 rounded-lg border bg-muted resize-none focus:outline-none pr-10"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleCopy}
              >
                {copiedToken ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 flex gap-3">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-primary">JSON Web Token (JWT)</p>
                <p className="text-xs text-muted-foreground">
                  Use this token in HTTP requests as a Bearer auth token:
                </p>
                <code className="text-xs block font-mono bg-muted p-1.5 rounded border mt-2">
                  Authorization: Bearer &lt;YOUR_TOKEN&gt;
                </code>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
            <p className="text-sm font-medium">Please sign in to view access token</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------
// DEVELOPER SUBSCRIPTION TAB
// ----------------------------------------------------
function SubscriptionTab({ usage }: { usage: any }) {
  const user = useAppStore((s) => s.user);
  const [subLoading, setSubLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    billingApi.getSubscription()
      .then((res) => setSubscription(res))
      .catch((err) => console.error('Failed to load subscription details:', err));
  }, []);

  const handlePortal = async () => {
    setSubLoading(true);
    try {
      const result = await billingApi.createPortalSession();
      if (result.url) window.location.href = result.url;
    } catch (err) {
      console.error('Failed to open billing portal:', err);
    } finally {
      setSubLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    if (tier === 'ENTERPRISE') return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    if (tier === 'PRO') return 'bg-primary/10 text-primary border-primary/20';
    return 'bg-muted text-muted-foreground border-border';
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Subscription Details</CardTitle>
        <CardDescription>View your developer limits, quota resets, and active billing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border/40 p-4 space-y-3 bg-muted/20">
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase">Current Plan</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold">{user?.tier || 'FREE'} Developer</span>
                <Badge className={cn('text-[10px]', getTierColor(user?.tier || 'FREE'))} variant="outline">
                  {user?.role === 'ADMIN' ? 'ADMIN' : subscription?.status || 'ACTIVE'}
                </Badge>
              </div>
            </div>
            {subscription?.currentPeriodEnd && (
              <div>
                <p className="text-xs text-muted-foreground font-medium">Billing Period End</p>
                <p className="text-sm font-semibold">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>
            )}
            <div className="pt-2">
              <Button size="sm" variant="outline" className="gap-1.5" onClick={handlePortal} disabled={subLoading || user?.tier === 'FREE'}>
                {subLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
                Manage Billing Portal
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 p-4 space-y-3 bg-muted/20">
            <p className="text-xs text-muted-foreground font-medium uppercase">API Limit Summary</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Daily Conversions</span>
                <span>{usage?.conversionsToday || 0} / {usage?.dailyConversionLimit === -1 ? 'Unlimited' : usage?.dailyConversionLimit || 10}</span>
              </div>
              <Progress
                value={usage?.dailyConversionLimit > 0 ? (usage.conversionsToday / usage.dailyConversionLimit) * 100 : 0}
                className="h-2"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Resets daily at midnight. Currently: {usage?.conversionsToday || 0} API request conversions completed.
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-border/50" />

        <div>
          <h4 className="text-sm font-semibold mb-3">Plan Allocations</h4>
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-3 border-border/40 hover:bg-muted/10 transition-colors">
              <p className="text-xs text-muted-foreground font-medium">Daily Limit</p>
              <p className="text-lg font-bold mt-1">
                {usage?.dailyConversionLimit === -1 ? 'Unlimited' : `${usage?.dailyConversionLimit || 10}`}
              </p>
              <p className="text-[10px] text-muted-foreground">Requests per calendar day</p>
            </Card>
            <Card className="p-3 border-border/40 hover:bg-muted/10 transition-colors">
              <p className="text-xs text-muted-foreground font-medium">Max Upload Size</p>
              <p className="text-lg font-bold mt-1">
                {formatBytes(usage?.maxFileSize || 100 * 1024 * 1024)}
              </p>
              <p className="text-[10px] text-muted-foreground">Maximum limit per file upload</p>
            </Card>
            <Card className="p-3 border-border/40 hover:bg-muted/10 transition-colors">
              <p className="text-xs text-muted-foreground font-medium">Monthly Storage</p>
              <p className="text-lg font-bold mt-1">
                {formatBytes(usage?.storageLimit || 500 * 1024 * 1024)}
              </p>
              <p className="text-[10px] text-muted-foreground">Maximum storage limit</p>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------
// API USAGE TAB
// ----------------------------------------------------
function UsageTab({ usage }: { usage: any }) {
  const [conversions, setConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    conversionsApi.getConversions({ page: 1, limit: 100 })
      .then((res: any) => {
        setConversions(res.items || []);
      })
      .catch((err) => console.error('Failed to load conversion list:', err))
      .finally(() => setLoading(false));
  }, []);

  // Compute stat lists
  const successCount = conversions.filter(c => c.status === 'COMPLETED').length;
  const failCount = conversions.filter(c => c.status === 'FAILED').length;
  const processingCount = conversions.filter(c => ['PENDING', 'QUEUED', 'PROCESSING'].includes(c.status)).length;
  
  // Create simple SVG chart based on dates of last 7 days
  const getChartData = () => {
    const dates: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates[d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })] = 0;
    }

    conversions.forEach(c => {
      const dateStr = new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (dates[dateStr] !== undefined) {
        dates[dateStr] += 1;
      }
    });

    return Object.entries(dates).map(([label, value]) => ({ label, value }));
  };

  const chartData = getChartData();
  const maxVal = Math.max(...chartData.map(d => d.value), 1);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">API Usage Statistics</CardTitle>
        <CardDescription>Track API execution volumes, trends, and success metrics.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid sm:grid-cols-3 gap-4">
          <Card className="p-4 bg-muted/20 border-border/40 text-center flex flex-col justify-center items-center">
            <span className="text-xs text-muted-foreground font-semibold">Total Requests</span>
            <span className="text-2xl font-black mt-2 text-primary">{conversions.length}</span>
          </Card>
          <Card className="p-4 bg-muted/20 border-border/40 text-center flex flex-col justify-center items-center">
            <span className="text-xs text-muted-foreground font-semibold">Successful Requests</span>
            <span className="text-2xl font-black mt-2 text-green-500">{successCount}</span>
          </Card>
          <Card className="p-4 bg-muted/20 border-border/40 text-center flex flex-col justify-center items-center">
            <span className="text-xs text-muted-foreground font-semibold">Failed Requests</span>
            <span className="text-2xl font-black mt-2 text-destructive">{failCount}</span>
          </Card>
        </div>

        {/* Beautiful Custom SVG Chart */}
        <div>
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-1.5">
            <BarChart2 className="h-4 w-4 text-primary" /> API Activity (Last 7 Days)
          </h4>
          <div className="rounded-xl border border-border/40 p-4 bg-muted/10">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {/* SVG Graph wrapper */}
                <div className="relative h-48 w-full">
                  <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="600" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                    {/* Gradient Area under line */}
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Generate path for lines and area */}
                    {(() => {
                      const points = chartData.map((d, i) => {
                        const x = (i / 6) * 600;
                        const y = 180 - (d.value / maxVal) * 150;
                        return { x, y };
                      });
                      
                      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const areaPath = `${linePath} L 600 180 L 0 180 Z`;

                      return (
                        <>
                          <path d={areaPath} fill="url(#chartGrad)" />
                          <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {/* Points */}
                          {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="5" className="fill-background stroke-primary stroke-[3px]" />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
                {/* Labels */}
                <div className="flex justify-between text-[11px] text-muted-foreground font-semibold px-1">
                  {chartData.map((d, i) => (
                    <div key={i} className="text-center w-12 truncate">
                      <span className="block font-bold text-foreground">{d.value}</span>
                      <span>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------
// PRICING PLANS TAB
// ----------------------------------------------------
function PlansTab() {
  const user = useAppStore((s) => s.user);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const result = await billingApi.createCheckoutSession(planId);
      if (result.url) window.location.href = result.url;
    } catch (err) {
      console.error('Failed to create checkout session', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Pricing Plans</CardTitle>
        <CardDescription>Upgrade your account to lift daily limitations and access advanced conversion formats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card key={plan.id} className={`relative flex flex-col h-full ${
              plan.tier === user?.tier ? 'border-primary/60 bg-primary/5 shadow-md shadow-primary/5' : 'border-border/40'
            }`}>
              {plan.tier === user?.tier && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="bg-primary text-[10px] uppercase font-bold">Current Plan</Badge>
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-md font-bold">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-black">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </span>
                  {plan.price > 0 && <span className="text-xs text-muted-foreground ml-1">/mo</span>}
                </div>
                <CardDescription className="text-xs mt-1">
                  {plan.price === 0 ? 'Basic integration' : plan.tier === 'PRO' ? 'High throughput' : 'Enterprise SLAs'}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-4">
                <Separator className="mb-4 bg-border/40" />
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  className="w-full text-xs"
                  variant={plan.tier === user?.tier ? 'outline' : plan.tier === 'PRO' ? 'gradient' : 'default'}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading !== null || plan.price === 0 || plan.tier === user?.tier}
                >
                  {loading === plan.id ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : null}
                  {plan.tier === user?.tier ? 'Active Tier' : 'Upgrade Plan'}
                  <ArrowRight className="h-3 w-3 ml-1.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------
// DOCUMENTATION TAB (API DETAILS)
// ----------------------------------------------------
function DocsTab() {
  const [lang, setLang] = useState<'js' | 'python'>('js');

  const pyCode = `import requests

# Set API authentication headers
headers = {
    "X-API-Key": "cf_live_your_key_here"
}

# Step 1: Initiate file upload
initiate_res = requests.post(
    "http://localhost:4000/api/v1/upload/initiate",
    json={
        "fileName": "report.pdf",
        "fileSize": 1048576,  # 1MB in bytes
        "mimeType": "application/pdf"
    },
    headers=headers
).json()

file_id = initiate_res["id"]
upload_url = initiate_res["uploadUrl"]

# Step 2: Upload file contents directly
with open("report.pdf", "rb") as f:
    requests.put(upload_url, data=f, headers={"Content-Type": "application/pdf"})

# Step 3: Trigger conversion task to HTML
convert_res = requests.post(
    "http://localhost:4000/api/v1/convert",
    json={
        "fileId": file_id,
        "outputFormat": "HTML"
    },
    headers=headers
).json()

job_id = convert_res["id"]

# Step 4: Poll job progress until COMPLETED
import time
while True:
    job = requests.get(f"http://localhost:4000/api/v1/convert/{job_id}", headers=headers).json()
    status = job["status"]
    print(f"Status: {status} | Progress: {job['progress']}%")
    
    if status == "COMPLETED":
        # Step 5: Download converted file
        output_path = job["outputPath"]
        download_url = f"http://localhost:4000/api/v1/storage/download/{output_path}"
        output_data = requests.get(download_url).content
        with open("converted.html", "wb") as f:
            f.write(output_data)
        print("Success! File downloaded to converted.html")
        break
    elif status == "FAILED":
        print("Conversion job failed:", job.get("error"))
        break
    time.sleep(2)
`;

  const jsCode = `// Install axios via: npm install axios
const axios = require('axios');
const fs = require('fs');

const API_KEY = 'cf_live_your_key_here';
const headers = { 'X-API-Key': API_KEY };

async function convertFile() {
  try {
    // Step 1: Initiate file upload
    const initiateRes = await axios.post('http://localhost:4000/api/v1/upload/initiate', {
      fileName: 'report.pdf',
      fileSize: fs.statSync('report.pdf').size,
      mimeType: 'application/pdf'
    }, { headers });
    
    const { id: fileId, uploadUrl } = initiateRes.data.data;

    // Step 2: Upload file contents
    const fileBuffer = fs.readFileSync('report.pdf');
    await axios.put(uploadUrl, fileBuffer, {
      headers: { 'Content-Type': 'application/pdf' }
    });

    // Step 3: Trigger conversion to HTML
    const convertRes = await axios.post('http://localhost:4000/api/v1/convert', {
      fileId,
      outputFormat: 'HTML'
    }, { headers });

    const jobId = convertRes.data.data.id;

    // Step 4: Poll job progress until completed
    console.log('Conversion started...');
    const interval = setInterval(async () => {
      const jobRes = await axios.get(\`http://localhost:4000/api/v1/convert/\${jobId}\`, { headers });
      const job = jobRes.data.data;
      console.log(\`Status: \${job.status} | Progress: \${job.progress}%\`);

      if (job.status === 'COMPLETED') {
        clearInterval(interval);
        // Step 5: Download converted file
        const downloadUrl = \`http://localhost:4000/api/v1/storage/download/\${encodeURIComponent(job.outputPath)}\`;
        const downloadRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync('converted.html', downloadRes.data);
        console.log('Success! Converted output saved.');
      } else if (job.status === 'FAILED') {
        clearInterval(interval);
        console.error('Job failed:', job.error);
      }
    }, 2000);

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

convertFile();
`;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Programmatic API Guide</CardTitle>
        <CardDescription>Integrate conversions in 5 simple steps. Authenticate requests using your generated API Key.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Authentication Header</h4>
          <p className="text-xs text-muted-foreground">
            Include the key in the request headers under `X-API-Key`.
          </p>
          <code className="text-xs font-mono block bg-muted p-2 rounded border">
            X-API-Key: cf_live_your_key_here
          </code>
        </div>

        <Separator className="bg-border/50" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Code className="h-4 w-4 text-primary" /> Implementation Sample
            </h4>
            <div className="flex bg-muted p-0.5 rounded-lg text-xs">
              <button
                className={cn('px-3 py-1 rounded-md transition-colors', lang === 'js' && 'bg-background font-semibold')}
                onClick={() => setLang('js')}
              >
                Node.js
              </button>
              <button
                className={cn('px-3 py-1 rounded-md transition-colors', lang === 'python' && 'bg-background font-semibold')}
                onClick={() => setLang('python')}
              >
                Python
              </button>
            </div>
          </div>

          <pre className="text-xs font-mono p-4 rounded-xl border bg-muted/70 overflow-x-auto max-h-96 leading-relaxed">
            <code>{lang === 'js' ? jsCode : pyCode}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

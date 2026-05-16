'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Key, Plus, Trash2, Copy, Check, Eye, EyeOff,
  Moon, Sun, Bell, BellOff, Shield, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  status: 'active' | 'revoked';
}

const mockApiKeys: ApiKey[] = [
  { id: 'key-1', name: 'Production', key: 'cf_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6', createdAt: '2026-01-15T10:00:00Z', lastUsed: '2026-05-15T22:30:00Z', expiresAt: null, status: 'active' },
  { id: 'key-2', name: 'Development', key: 'cf_dev_q1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6', createdAt: '2026-03-20T14:00:00Z', lastUsed: '2026-05-14T18:00:00Z', expiresAt: '2026-12-31T23:59:59Z', status: 'active' },
  { id: 'key-3', name: 'Staging', key: 'cf_stg_z1x2c3v4b5n6m7k8l9j0h1g2f3d4s5a6', createdAt: '2026-02-10T09:00:00Z', lastUsed: null, expiresAt: '2026-06-30T23:59:59Z', status: 'revoked' },
];

function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>(mockApiKeys);
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKey, setVisibleKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const genKey = `cf_${newKeyName.toLowerCase().slice(0, 3)}_${Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: genKey,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      expiresAt: null,
      status: 'active',
    };
    setTimeout(() => {
      setKeys([newKey, ...keys]);
      setNewKeyName('');
      setCreating(false);
    }, 600);
  };

  const handleRevoke = (id: string) => {
    setKeys(keys.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k)));
  };

  const handleDelete = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input
          placeholder="New API key name..."
          className="max-w-xs"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <Button size="sm" className="gap-1.5" onClick={handleCreate} disabled={creating || !newKeyName.trim()}>
          {creating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
          Create Key
        </Button>
      </div>

      <div className="space-y-2">
        {keys.map((apiKey) => (
          <div
            key={apiKey.id}
            className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className={cn(
                'rounded-lg p-1.5',
                apiKey.status === 'active' ? 'bg-primary/10' : 'bg-muted',
              )}>
                <Key className={cn('h-4 w-4', apiKey.status === 'active' ? 'text-primary' : 'text-muted-foreground')} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{apiKey.name}</span>
                  <Badge variant={apiKey.status === 'active' ? 'success' : 'destructive'} className="text-[10px] h-4">
                    {apiKey.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-xs font-mono text-muted-foreground">
                    {visibleKey === apiKey.id ? apiKey.key : `${apiKey.key.slice(0, 20)}...`}
                  </code>
                  <button
                    onClick={() => setVisibleKey(visibleKey === apiKey.id ? null : apiKey.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {visibleKey === apiKey.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </button>
                  <button
                    onClick={() => handleCopy(apiKey.key)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedKey === apiKey.key ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-3">
              {apiKey.status === 'active' ? (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-500 hover:text-amber-600" onClick={() => handleRevoke(apiKey.id)}>
                  Revoke
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => handleDelete(apiKey.id)}>
                  <Trash2 className="h-3 w-3 mr-1" />Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const user = useAppStore((s) => s.user);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [saved, setSaved] = useState(false);
  const [selectedTab, setSelectedTab] = useState('profile');

  const handleSaveProfile = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:flex gap-0.5 bg-muted/50 p-0.5 rounded-lg h-auto">
          <TabsTrigger value="profile" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background">
            <Key className="h-4 w-4" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background">
            <Sun className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-border">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground" /> Full Name
                  </label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                  </label>
                  <Input value={email} disabled className="opacity-60" />
                  <p className="text-[10px] text-muted-foreground">Email cannot be changed</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button size="sm" onClick={handleSaveProfile} className="gap-1.5">
                  {saved ? <Check className="h-3.5 w-3.5" /> : null}
                  {saved ? 'Saved' : 'Save Changes'}
                </Button>
                <Button variant="outline" size="sm">Cancel</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 mt-4">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                <div>
                  <p className="text-sm font-medium">Delete Account</p>
                  <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data</p>
                </div>
                <Button variant="destructive" size="sm">Delete Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-6 space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription>Manage keys for programmatic access</CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeysSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Theme Preference</CardTitle>
              <CardDescription>Choose your preferred appearance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                {(['dark', 'light'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      'relative flex items-center gap-3 rounded-xl border-2 p-4 transition-all flex-1 max-w-[200px]',
                      theme === t
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-border',
                    )}
                  >
                    {t === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                    <div className="text-left">
                      <p className="text-sm font-medium capitalize">{t}</p>
                      <p className="text-xs text-muted-foreground">{t === 'dark' ? 'Easy on the eyes' : 'Classic look'}</p>
                    </div>
                    {theme === t && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Conversion Complete', description: 'Get notified when a conversion finishes', enabled: true },
                { label: 'Conversion Failed', description: 'Get notified when a conversion fails', enabled: true },
                { label: 'Weekly Summary', description: 'Receive a weekly activity digest', enabled: false },
                { label: 'Product Updates', description: 'New features and improvements', enabled: true },
                { label: 'Billing Alerts', description: 'Payment confirmations and renewals', enabled: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border border-border/50 p-3">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className={cn(
                    'flex h-6 w-10 cursor-pointer rounded-full transition-colors',
                    item.enabled ? 'bg-primary' : 'bg-muted',
                  )}>
                    <div className={cn(
                      'h-5 w-5 rounded-full bg-background shadow-sm transition-transform mt-0.5',
                      item.enabled ? 'translate-x-[18px]' : 'translate-x-0.5',
                    )} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

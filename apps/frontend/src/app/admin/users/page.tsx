'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Ban,
  Unlock,
  Shuffle,
  Loader2,
  Filter,
  ArrowUpDown,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn, formatDate } from '@/lib/utils';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: 'Free' | 'Pro' | 'Enterprise';
  status: 'active' | 'suspended' | 'banned';
  conversions: number;
  storageUsed: number;
  joined: string;
  lastActive: string;
  role: 'user' | 'admin';
}

const allUsers: AdminUser[] = Array.from({ length: 48 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: [
    'Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eve Davis',
    'Frank Miller', 'Grace Lee', 'Henry Wilson', 'Ivy Chen', 'Jack Thompson',
    'Karen White', 'Leo Garcia', 'Maria Rodriguez', 'Nathan Patel', 'Olivia Kim',
    'Paul Anderson', 'Quinn Thomas', 'Rachel Martinez', 'Sam Taylor', 'Tina Jackson',
    'Uma Harris', 'Victor Lewis', 'Wendy Clark', 'Xavier Robinson', 'Yuki Tanaka',
    'Zack Moore', 'Amanda Scott', 'Brian Young', 'Catherine King', 'Daniel Wright',
  ][i % 30],
  email: `user${i + 1}@example.com`,
  avatarUrl: '',
  plan: (['Free', 'Pro', 'Enterprise'] as const)[i % 3],
  status: (['active', 'active', 'active', 'suspended', 'banned'] as const)[i % 5],
  conversions: Math.floor(Math.random() * 1500) + 5,
  storageUsed: Math.floor(Math.random() * 10000) + 100,
  joined: new Date(Date.now() - Math.random() * 365 * 86400000).toISOString(),
  lastActive: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
  role: i === 0 ? 'admin' : 'user',
}));

const ITEMS_PER_PAGE = 10;

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return allUsers.filter((u) => {
      const matchesSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchesPlan = planFilter === 'all' || u.plan === planFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesSearch && matchesPlan && matchesStatus;
    });
  }, [search, planFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleBanToggle = (id: string) => {
    setActionUserId(id);
    setTimeout(() => setActionUserId(null), 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Users</h2>
        <p className="text-sm text-muted-foreground">Manage platform users</p>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={planFilter} onValueChange={(v) => { setPlanFilter(v); setPage(1); }}>
                <SelectTrigger className="w-32 h-10">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  <SelectValue placeholder="Plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-36 h-10">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border/50 bg-muted/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Conversions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {paginated.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className={cn(
                            'text-xs',
                            user.role === 'admin' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/10 text-primary',
                          )}>
                            {user.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge variant={
                        user.plan === 'Enterprise' ? 'success' :
                        user.plan === 'Pro' ? 'info' : 'secondary'
                      } className="text-xs">
                        {user.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          'flex h-2 w-2 rounded-full',
                          user.status === 'active' ? 'bg-green-500' :
                          user.status === 'suspended' ? 'bg-amber-500' : 'bg-red-500',
                        )} />
                        <span className="text-xs capitalize">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-sm">{user.conversions.toLocaleString()}</td>
                    <td className="px-6 py-3.5">
                      {user.role === 'admin' ? (
                        <Badge variant="warning" className="text-xs">Admin</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">User</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{formatDate(user.joined)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View Details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn('h-8 w-8', user.status === 'banned' ? 'text-green-500 hover:text-green-600' : 'text-destructive hover:text-destructive')}
                          title={user.status === 'banned' ? 'Unban User' : 'Ban User'}
                          onClick={() => handleBanToggle(user.id)}
                          disabled={actionUserId === user.id}
                        >
                          {actionUserId === user.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : user.status === 'banned' ? (
                            <Unlock className="h-3.5 w-3.5" />
                          ) : (
                            <Ban className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Change Plan">
                          <Shuffle className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium">No users found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
        <Separator />
        <div className="flex items-center justify-between px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-medium">{(page - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
            <span className="font-medium">{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</span> of{' '}
            <span className="font-medium">{filtered.length}</span> users
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <Button
                  key={p}
                  variant={p === page ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8 text-xs"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

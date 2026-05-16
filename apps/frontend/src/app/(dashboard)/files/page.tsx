'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Search,
  Trash2,
  Grid3X3,
  List,
  File,
  Image,
  FileText,
  Music,
  Video,
  Archive,
  MoreVertical,
  Download,
  ArrowLeftRight,
  SlidersHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  X,
  FileX,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/appStore';
import { filesApi } from '@/services/api';
import { cn, formatBytes, formatDate, getFileIcon } from '@/lib/utils';
import type { FileMeta } from '@convertforge/shared-types';
import { FileStatus } from '@convertforge/shared-types';

function getFileTypeIcon(format: string, className?: string) {
  const upper = format.toUpperCase();
  const iconClass = cn('h-8 w-8', className);
  if (['PNG', 'JPG', 'JPEG', 'WEBP', 'AVIF', 'GIF', 'SVG', 'BMP', 'ICO', 'HEIC', 'PSD'].includes(upper))
    return <Image className={iconClass} />;
  if (['PDF', 'DOCX', 'DOC', 'TXT', 'HTML', 'MD', 'ODT', 'RTF'].includes(upper))
    return <FileText className={iconClass} />;
  if (['MP3', 'WAV', 'AAC', 'FLAC', 'OGG', 'M4A'].includes(upper))
    return <Music className={iconClass} />;
  if (['MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'FLV', 'WMV', 'M4V'].includes(upper))
    return <Video className={iconClass} />;
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(upper))
    return <Archive className={iconClass} />;
  return <File className={iconClass} />;
}

function getFileStatusBadge(status: FileStatus) {
  switch (status) {
    case FileStatus.READY: return 'success' as const;
    case FileStatus.ERROR: return 'destructive' as const;
    case FileStatus.UPLOADING: return 'info' as const;
    case FileStatus.PROCESSING: return 'warning' as const;
    default: return 'secondary' as const;
  }
}

export default function FilesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const files = useAppStore((s) => s.files);
  const setFiles = useAppStore((s) => s.setFiles);
  const removeFile = useAppStore((s) => s.removeFile);

  const limit = 12;
  const filteredFiles = files.filter((f) => {
    const matchesSearch = f.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = formatFilter === 'all' || f.format.toUpperCase() === formatFilter.toUpperCase();
    return matchesSearch && matchesFormat;
  });
  const totalPages = Math.ceil(filteredFiles.length / limit);
  const paginatedFiles = filteredFiles.slice((page - 1) * limit, page * limit);

  useEffect(() => {
    async function load() {
      try {
        const data = await filesApi.getFiles({ limit: 50 });
        setFiles(data.items);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [setFiles]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await filesApi.deleteFile(id);
      removeFile(id);
    } catch (err) {
      console.error('Failed to delete file:', err);
    } finally {
      setDeleting(null);
    }
  };

  const formatOptions = ['all', ...new Set(files.map((f) => f.format.toUpperCase()))];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="backdrop-blur-xl bg-card/50 border-border/50">
              <CardContent className="p-4">
                <Skeleton className="h-12 w-12 rounded-lg mb-3" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-20 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">My Files</h2>
          <p className="text-sm text-muted-foreground">
            {files.length} file{files.length !== 1 ? 's' : ''} stored
          </p>
        </div>
        <Button variant="gradient" size="default">
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      <Card className="backdrop-blur-xl bg-card/50 border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Tabs value={formatFilter} onValueChange={(v) => { setFormatFilter(v); setPage(1); }} className="flex-1 sm:flex-none">
                <TabsList className="h-9 overflow-x-auto">
                  {formatOptions.slice(0, 6).map((fmt) => (
                    <TabsTrigger key={fmt} value={fmt} className="text-xs px-3">
                      {fmt === 'all' ? 'All' : fmt}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <div className="flex rounded-lg border border-input">
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-9 w-9 rounded-none rounded-l-lg', viewMode === 'grid' && 'bg-accent')}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Separator orientation="vertical" className="h-9" />
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn('h-9 w-9 rounded-none rounded-r-lg', viewMode === 'list' && 'bg-accent')}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {files.length === 0 ? (
        <Card className="backdrop-blur-xl bg-card/50 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileX className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No files yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
              Upload your first file to get started with conversions
            </p>
            <Button variant="gradient">
              <Upload className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          </CardContent>
        </Card>
      ) : paginatedFiles.length === 0 ? (
        <Card className="backdrop-blur-xl bg-card/50 border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Search className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No results found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {paginatedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="backdrop-blur-xl bg-card/50 border-border/50 group hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 p-2.5">
                            {getFileTypeIcon(file.format)}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href="/convert" className="cursor-pointer">
                                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                                  Convert
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(file.id)}
                                disabled={deleting === file.id}
                              >
                                {deleting === file.id ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className="text-sm font-medium truncate">{file.originalName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            .{file.format.toLowerCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                          <span className="text-xs text-muted-foreground">{formatDate(file.createdAt)}</span>
                          <Badge variant={getFileStatusBadge(file.status)} className="text-[10px] px-1.5 py-0">
                            {file.status === FileStatus.UPLOADING || file.status === FileStatus.PROCESSING ? (
                              <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                            ) : file.status === FileStatus.ERROR ? (
                              <AlertCircle className="mr-1 h-2.5 w-2.5" />
                            ) : null}
                            {file.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <Card className="backdrop-blur-xl bg-card/50 border-border/50 overflow-hidden">
              <div className="divide-y divide-border/50">
                {paginatedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 p-4 hover:bg-muted/20 transition-colors group"
                  >
                    <div className="rounded-lg bg-gradient-to-br from-primary/10 to-purple-500/10 p-2 shrink-0">
                      {getFileTypeIcon(file.format, 'h-5 w-5')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.originalName}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span>{formatBytes(file.size)}</span>
                        <span>·</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          .{file.format.toLowerCase()}
                        </Badge>
                        <span>·</span>
                        <span>{formatDate(file.createdAt)}</span>
                      </div>
                    </div>
                    <Badge variant={getFileStatusBadge(file.status)} className="shrink-0">
                      {file.status}
                    </Badge>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href="/convert">
                          <ArrowLeftRight className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(file.id)}
                        disabled={deleting === file.id}
                      >
                        {deleting === file.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'default' : 'outline'}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
    />
  );
}

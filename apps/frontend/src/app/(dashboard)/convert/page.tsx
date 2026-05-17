'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  X,
  File,
  ArrowLeftRight,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Image,
  FileText,
  Music,
  Video,
  Archive,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/store/appStore';
import { conversionsApi, filesApi } from '@/services/api';
import { cn, formatBytes, formatDuration } from '@/lib/utils';
import { useSocket } from '@/hooks/useSocket';
import type { ConversionJob } from '@convertforge/shared-types';
import { ConversionStatus } from '@convertforge/shared-types';

interface FileWithPreview extends File {
  preview?: string;
  id?: string;
  uploadProgress?: number;
  status?: 'pending' | 'uploading' | 'uploaded' | 'error';
}

const inputFormats = [
  { value: 'PNG', label: 'PNG', category: 'Image' },
  { value: 'JPG', label: 'JPG', category: 'Image' },
  { value: 'WEBP', label: 'WebP', category: 'Image' },
  { value: 'GIF', label: 'GIF', category: 'Image' },
  { value: 'SVG', label: 'SVG', category: 'Image' },
  { value: 'PDF', label: 'PDF', category: 'Document' },
  { value: 'DOCX', label: 'DOCX', category: 'Document' },
  { value: 'MP4', label: 'MP4', category: 'Video' },
  { value: 'MOV', label: 'MOV', category: 'Video' },
  { value: 'MP3', label: 'MP3', category: 'Audio' },
  { value: 'WAV', label: 'WAV', category: 'Audio' },
  { value: 'ZIP', label: 'ZIP', category: 'Archive' },
];

const outputMap: Record<string, string[]> = {
  PNG: ['JPG', 'WEBP', 'AVIF', 'GIF', 'BMP', 'TIFF', 'SVG', 'ICO'],
  JPG: ['PNG', 'WEBP', 'AVIF', 'GIF', 'BMP', 'TIFF', 'ICO'],
  WEBP: ['PNG', 'JPG', 'AVIF', 'GIF', 'BMP', 'TIFF'],
  GIF: ['PNG', 'JPG', 'WEBP', 'AVIF', 'BMP'],
  SVG: ['PNG', 'JPG', 'WEBP', 'PDF'],
  PDF: ['DOCX', 'DOC', 'TXT', 'HTML', 'MD', 'EPUB', 'ODT', 'RTF', 'PNG', 'JPG'],
  DOCX: ['PDF', 'DOC', 'TXT', 'HTML', 'MD', 'ODT', 'RTF', 'EPUB'],
  MP4: ['MOV', 'AVI', 'MKV', 'WEBM', 'FLV', 'WMV', 'M4V', 'GIF', 'MP3'],
  MOV: ['MP4', 'AVI', 'MKV', 'WEBM', 'FLV', 'WMV'],
  MP3: ['WAV', 'AAC', 'FLAC', 'OGG', 'M4A'],
  WAV: ['MP3', 'AAC', 'FLAC', 'OGG', 'M4A'],
  ZIP: ['TAR', 'GZ', '7Z'],
};

function getFileCategoryIcon(format: string) {
  const upper = (format || '').toUpperCase();
  if (['PNG', 'JPG', 'JPEG', 'WEBP', 'AVIF', 'GIF', 'SVG', 'BMP'].includes(upper)) return Image;
  if (['PDF', 'DOCX', 'DOC', 'TXT', 'HTML', 'MD'].includes(upper)) return FileText;
  if (['MP3', 'WAV', 'AAC', 'FLAC', 'OGG', 'M4A'].includes(upper)) return Music;
  if (['MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'FLV', 'WMV'].includes(upper)) return Video;
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(upper)) return Archive;
  return File;
}

function getStatusBadgeVariant(status: ConversionStatus) {
  switch (status) {
    case ConversionStatus.COMPLETED: return 'success' as const;
    case ConversionStatus.FAILED: return 'destructive' as const;
    case ConversionStatus.PROCESSING: return 'info' as const;
    case ConversionStatus.QUEUED: return 'warning' as const;
    default: return 'secondary' as const;
  }
}

export default function ConvertPage() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [dropzoneActive, setDropzoneActive] = useState(false);

  const conversions = useAppStore((s) => s.conversions);
  const addConversion = useAppStore((s) => s.addConversion);
  const updateConversion = useAppStore((s) => s.updateConversion);
  useSocket();

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...accepted.map((f) => Object.assign(f, {
        preview: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
        status: 'pending' as const,
      })),
    ]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDropzoneActive(true),
    onDragLeave: () => setDropzoneActive(false),
    multiple: true,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const file = prev[index];
      if (file.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const availableOutputs = inputFormat ? outputMap[inputFormat] || [] : [];

  useEffect(() => {
    if (availableOutputs.length > 0 && !availableOutputs.includes(outputFormat)) {
      setOutputFormat(availableOutputs[0]);
    }
  }, [inputFormat, availableOutputs, outputFormat]);

  const startConversion = async () => {
    if (files.length === 0 || !inputFormat || !outputFormat) return;
    setIsConverting(true);

    try {
      for (const file of files) {
        const uploadRes = await filesApi.initiateUpload(
          file.name,
          file.size,
          file.type || 'application/octet-stream',
        );

        if (uploadRes.uploadUrl) {
          await filesApi.uploadToUrl(uploadRes.uploadUrl, file);
        }

        const job = await conversionsApi.createConversion(uploadRes.id, outputFormat, {});
        addConversion(job as any);
      }
      setFiles([]);
    } catch (err) {
      console.error('Conversion failed:', err);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3 space-y-6">
        <Card className="backdrop-blur-xl bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Upload Files</CardTitle>
            <CardDescription>Drag and drop files or click to browse</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              {...(getRootProps() as any)}
              animate={{
                borderColor: isDragActive
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--border))',
                backgroundColor: isDragActive
                  ? 'hsl(var(--primary) / 0.05)'
                  : 'transparent',
              }}
              className={cn(
                'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors',
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/30',
              )}
            >
              <input {...getInputProps()} />
              <motion.div
                animate={{ scale: isDragActive ? 1.1 : 1 }}
                className={cn(
                  'rounded-xl p-4 mb-4',
                  isDragActive ? 'bg-primary/10' : 'bg-muted',
                )}
              >
                <Upload className={cn(
                  'h-8 w-8',
                  isDragActive ? 'text-primary' : 'text-muted-foreground',
                )} />
              </motion.div>
              {isDragActive ? (
                <p className="text-sm font-medium text-primary">Drop files here</p>
              ) : (
                <>
                  <p className="text-sm font-medium">Drag & drop files here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse · Max 100MB per file
                  </p>
                </>
              )}
            </motion.div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, i) => (
                  <motion.div
                    key={`${file.name}-${i}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-3 rounded-lg border border-border/50 p-3"
                  >
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <File className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Conversion Settings</CardTitle>
            <CardDescription>Select input and output formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Input Format</label>
                <select
                  value={inputFormat}
                  onChange={(e) => setInputFormat(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select format...</option>
                  {inputFormats.map((fmt) => (
                    <option key={fmt.value} value={fmt.value}>
                      {fmt.label} ({fmt.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Output Format</label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  disabled={!inputFormat}
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50"
                >
                  {!inputFormat ? (
                    <option value="">Select input first...</option>
                  ) : availableOutputs.length === 0 ? (
                    <option value="">No compatible formats</option>
                  ) : (
                    availableOutputs.map((fmt) => (
                      <option key={fmt} value={fmt}>{fmt}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {inputFormat && outputFormat && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-primary/5 p-3 text-sm"
              >
                <span className="font-medium">{inputFormat}</span>
                <ArrowLeftRight className="h-4 w-4 text-primary" />
                <span className="font-medium">{outputFormat}</span>
              </motion.div>
            )}
          </CardContent>
          <CardFooter className="border-t border-border/50 pt-4">
            <Button
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={!inputFormat || !outputFormat || files.length === 0 || isConverting}
              onClick={startConversion}
            >
              {isConverting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {isConverting ? 'Starting...' : `Start Conversion${files.length > 1 ? ` (${files.length} files)` : ''}`}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="backdrop-blur-xl bg-card/50 border-border/50 h-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Conversion Queue</span>
              <Badge variant="secondary" className="text-xs">
                {conversions.length} total
              </Badge>
            </CardTitle>
            <CardDescription>Current and recent conversion jobs</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[520px]">
              {conversions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <ArrowLeftRight className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm font-medium">No conversions</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your conversion jobs will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversions.map((job, i) => {
                    const CategoryIcon = getFileCategoryIcon(job.inputFormat);
                    return (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="rounded-lg border border-border/40 p-3 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                            <CategoryIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium truncate">
                                {job.inputFormat} → {job.outputFormat}
                              </p>
                              <Badge variant={getStatusBadgeVariant(job.status)} className="shrink-0 ml-2">
                                {job.status === ConversionStatus.PROCESSING && (
                                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                )}
                                {job.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatBytes(job.fileSize)}
                            </p>
                            {job.status === ConversionStatus.PROCESSING && (
                              <div className="mt-2 space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Converting...</span>
                                  <span className="font-medium">{job.progress}%</span>
                                </div>
                                <Progress value={job.progress} className="h-1.5" />
                              </div>
                            )}
                            {job.status === ConversionStatus.COMPLETED && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-green-500">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Completed {job.completedAt ? formatDuration(
                                  (new Date(job.completedAt).getTime() - new Date(job.createdAt).getTime()) / 1000
                                ) : ''}</span>
                              </div>
                            )}
                            {job.status === ConversionStatus.FAILED && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-destructive">
                                <AlertCircle className="h-3 w-3" />
                                <span className="truncate">{job.error || 'Conversion failed'}</span>
                              </div>
                            )}
                            {job.status === ConversionStatus.QUEUED && (
                              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Waiting in queue...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

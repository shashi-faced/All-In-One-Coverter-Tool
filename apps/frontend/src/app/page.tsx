'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, X, File, ArrowLeftRight, Play, CheckCircle2,
  AlertCircle, Loader2, Clock, Image, FileText, Music, Video, Archive,
  Zap, ChevronDown, ChevronRight, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { conversionsApi, filesApi } from '@/services/api';
import { cn, formatBytes } from '@/lib/utils';
import type { ConversionStatus } from '@convertforge/shared-types';
import { Navbar } from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

interface ConversionJob {
  id: string;
  fileId: string;
  inputFormat: string;
  outputFormat: string;
  status: ConversionStatus;
  progress: number;
  createdAt: string;
  originalName?: string;
  outputPath?: string | null;
}

const CATEGORIES = [
  { value: 'IMAGE', label: 'Image', icon: Image, formats: ['PNG', 'JPG', 'WEBP', 'GIF', 'BMP', 'TIFF', 'SVG', 'ICO'] },
  { value: 'VIDEO', label: 'Video', icon: Video, formats: ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM', 'FLV', 'WMV'] },
  { value: 'AUDIO', label: 'Audio', icon: Music, formats: ['MP3', 'WAV', 'AAC', 'FLAC', 'OGG', 'M4A'] },
  { value: 'DOCUMENT', label: 'Document', icon: FileText, formats: ['PDF', 'DOCX', 'DOC', 'TXT', 'HTML', 'MD'] },
  { value: 'ARCHIVE', label: 'Archive', icon: Archive, formats: ['ZIP', 'RAR', '7Z', 'TAR', 'GZ'] },
];

export default function HomePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [supportedFormats, setSupportedFormats] = useState<Record<string, string[]>>({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    conversionsApi.getFormats().then((formats) => {
      const map: Record<string, string[]> = {};
      formats.forEach((f: any) => { map[f.input] = f.outputs; });
      setSupportedFormats(map);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const activeJobs = jobs.filter((j) => ['PENDING', 'QUEUED', 'PROCESSING'].includes(j.status));
    if (activeJobs.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const updatedJobs = await Promise.all(
          jobs.map(async (job) => {
            if (['PENDING', 'QUEUED', 'PROCESSING'].includes(job.status)) {
              try {
                const res = await conversionsApi.getConversion(job.id);
                return {
                  ...job,
                  status: res.status as any,
                  progress: res.progress,
                  outputPath: res.outputPath,
                };
              } catch (err) {
                console.error(`Failed to poll status for job ${job.id}:`, err);
                return job;
              }
            }
            return job;
          })
        );
        const hasChanged = JSON.stringify(updatedJobs.map(j => ({ id: j.id, status: j.status, progress: j.progress, outputPath: j.outputPath }))) !==
                          JSON.stringify(jobs.map(j => ({ id: j.id, status: j.status, progress: j.progress, outputPath: j.outputPath })));
        if (hasChanged) {
          setJobs(updatedJobs);
        }
      } catch (err) {
        console.error('Error polling jobs:', err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs]);

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted]);
    if (accepted.length > 0 && !inputFormat) {
      const ext = accepted[0].name.split('.').pop()?.toUpperCase() || '';
      if (['PNG','JPG','JPEG','WEBP','GIF','BMP','TIFF','SVG','ICO','HEIC','PSD','MP4','MOV','AVI','MKV','WEBM','FLV','WMV','M4V','MP3','WAV','AAC','FLAC','OGG','M4A','PDF','DOCX','DOC','PPTX','PPT','XLSX','XLS','TXT','HTML','MD','ZIP','RAR','7Z','TAR','GZ'].includes(ext)) {
        setInputFormat(ext === 'JPEG' ? 'JPG' : ext);
      }
    }
  }, [inputFormat]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: true });

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const startConversion = async () => {
    if (files.length === 0 || !outputFormat) return;
    setConverting(true);
    try {
      for (const file of files) {
        const uploadRes = await filesApi.initiateUpload(file.name, file.size, file.type || 'application/octet-stream');
        if (uploadRes.uploadUrl) await filesApi.uploadToUrl(uploadRes.uploadUrl, file);
        const job = await conversionsApi.createConversion(uploadRes.id, outputFormat, {});
        setJobs((prev) => [{
          id: job.id,
          fileId: uploadRes.id,
          inputFormat: inputFormat || file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
          outputFormat,
          status: job.status as ConversionStatus,
          progress: 0,
          createdAt: new Date().toISOString(),
          originalName: file.name,
        }, ...prev]);
      }
      setFiles([]);
    } catch (err: any) {
      alert(err.message || 'Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const outputs = supportedFormats[inputFormat] || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero / Conversion Section */}
      <section className="relative pt-24 pb-16 px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Convert Any File.{' '}
            <span className="text-gradient">Instantly.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Drop your files below and convert between 100+ formats. No signup required.
          </motion.p>
        </div>

        {/* Converter Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="border-border/50 shadow-xl shadow-primary/5">
            <CardHeader>
              <CardTitle>Convert Files</CardTitle>
              <CardDescription>Upload any file, choose your format, and convert</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drop Zone */}
              <div
                {...getRootProps() as any}
                className={cn(
                  'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-all',
                  isDragActive
                    ? 'border-primary bg-primary/5 scale-[1.02]'
                    : 'border-border hover:border-primary/50 hover:bg-muted/30',
                )}
              >
                <input {...getInputProps()} />
                <div className={cn('rounded-full p-4 bg-primary/10 mb-4 transition-transform', isDragActive && 'scale-110')}>
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <p className="text-lg font-medium mb-1">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </p>
                <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
                <p className="text-xs text-muted-foreground">Supports images, video, audio, documents & more — up to 5GB</p>
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{files.length} file(s) selected</p>
                  <ScrollArea className="max-h-32">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center justify-between py-1 px-3 rounded-lg bg-muted/50 text-sm">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[200px]">{f.name}</span>
                          <span className="text-xs text-muted-foreground">{formatBytes(f.size)}</span>
                        </div>
                        <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}

              {/* Format Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Input Format</label>
                  <Select value={inputFormat} onValueChange={(v) => { setInputFormat(v); setOutputFormat(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Detected from file (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(supportedFormats).map(([fmt]) => (
                        <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Output Format *</label>
                  <Select value={outputFormat} onValueChange={setOutputFormat} disabled={!inputFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder={inputFormat ? 'Select output format' : 'Select input first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {outputs.map((fmt: string) => (
                        <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Convert Button */}
              <Button
                className="w-full h-12 text-base"
                variant="gradient"
                size="xl"
                disabled={files.length === 0 || !outputFormat || converting}
                onClick={startConversion}
              >
                {converting ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Converting...</>
                ) : (
                  <><Play className="h-5 w-5 mr-2" /> Start Conversion</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Conversion Jobs */}
      {jobs.length > 0 && (
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Conversions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Supported Formats */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">All Supported Formats</h2>
          <p className="text-center text-muted-foreground mb-10">Convert between 100+ formats across 8 categories</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <Card key={cat.value} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <cat.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{cat.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cat.formats.map((fmt) => (
                      <Badge key={fmt} variant="secondary" className="text-xs">{fmt}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const getDownloadUrl = (outputPath: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
  const apiBase = baseUrl.endsWith('/v1') ? baseUrl : `${baseUrl.replace(/\/$/, '')}/v1`;
  return `${apiBase}/storage/download/${encodeURIComponent(outputPath)}`;
};

function JobCard({ job }: { job: ConversionJob }) {
  const getStatusBadge = (status: ConversionStatus) => {
    const map: Record<string, string> = {
      COMPLETED: 'success', FAILED: 'destructive', PROCESSING: 'info', QUEUED: 'warning', PENDING: 'secondary', CANCELLED: 'outline',
    };
    return map[status] || 'secondary';
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3 min-w-0">
        <File className="h-5 w-5 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{job.originalName || job.id.slice(0, 8)}</p>
          <p className="text-xs text-muted-foreground">
            {job.inputFormat} → {job.outputFormat}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {job.status === 'PROCESSING' && <Progress value={job.progress} className="w-20" />}
        <Badge variant={getStatusBadge(job.status) as any}>
          {job.status === 'PROCESSING' ? `${job.progress}%` : job.status}
        </Badge>
        {job.status === 'COMPLETED' && job.outputPath && (
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1.5 h-8 px-2.5 text-xs border-primary/30 hover:border-primary hover:bg-primary/5 text-primary"
            asChild
          >
            <a
              href={getDownloadUrl(job.outputPath)}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

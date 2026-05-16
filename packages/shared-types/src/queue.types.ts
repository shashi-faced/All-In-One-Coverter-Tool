export enum JobType {
  CONVERSION = 'CONVERSION',
  THUMBNAIL = 'THUMBNAIL',
  CLEANUP = 'CLEANUP',
  WATERMARK = 'WATERMARK',
  COMPRESSION = 'COMPRESSION',
  OCR = 'OCR',
  AI_ENHANCE = 'AI_ENHANCE',
}

export enum QueuePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  CRITICAL = 3,
}

export interface QueueJobData {
  jobId: string;
  type: JobType;
  userId: string;
  fileId: string;
  inputPath: string;
  outputPath: string;
  inputFormat: string;
  outputFormat: string;
  options: Record<string, unknown>;
  priority: QueuePriority;
  webhookUrl?: string;
  createdAt: string;
}

export interface JobProgress {
  jobId: string;
  status: string;
  progress: number;
  stage?: string;
  message?: string;
  eta?: number;
  error?: string;
}

export interface WorkerStatus {
  id: string;
  name: string;
  status: 'IDLE' | 'BUSY' | 'ERROR' | 'OFFLINE';
  currentJob?: string;
  jobsProcessed: number;
  jobsFailed: number;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

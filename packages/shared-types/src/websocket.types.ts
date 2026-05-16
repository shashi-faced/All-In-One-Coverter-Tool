export enum WsEvent {
  JOB_PROGRESS = 'job:progress',
  JOB_COMPLETED = 'job:completed',
  JOB_FAILED = 'job:failed',
  JOB_QUEUED = 'job:queued',
  CONVERSION_STATUS = 'conversion:status',
  FILE_PROCESSED = 'file:processed',
  UPLOAD_PROGRESS = 'upload:progress',
  QUEUE_STATUS = 'queue:status',
  WORKER_STATUS = 'worker:status',
}

export interface WsMessage<T = unknown> {
  event: WsEvent;
  data: T;
  timestamp: string;
}

export interface WsJobProgress {
  jobId: string;
  conversionId: string;
  progress: number;
  stage: string;
  message: string;
  eta?: number;
}

export interface WsJobCompleted {
  jobId: string;
  conversionId: string;
  outputFileId: string;
  outputSize: number;
  downloadUrl: string;
  thumbnailUrl?: string;
}

export interface WsJobFailed {
  jobId: string;
  conversionId: string;
  error: string;
  retryAllowed: boolean;
}

export interface WsUploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  speed: number;
  eta: number;
}

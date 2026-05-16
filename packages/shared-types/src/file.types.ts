export enum FileStatus {
  UPLOADING = 'UPLOADING',
  UPLOADED = 'UPLOADED',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR',
  DELETED = 'DELETED',
}

export interface FileMeta {
  id: string;
  userId: string;
  originalName: string;
  storagePath: string;
  mimeType: string;
  size: number;
  format: string;
  category: string;
  status: FileStatus;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  thumbnailUrl?: string;
  checksum?: string;
  width?: number;
  height?: number;
  duration?: number;
  pages?: number;
}

export interface ChunkUpload {
  uploadId: string;
  fileName: string;
  fileSize: number;
  chunkSize: number;
  totalChunks: number;
  completedChunks: number[];
  status: 'INITIATED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  expiresAt: string;
}

export interface FileUploadRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: string;
}

export interface FileUploadResponse {
  id: string;
  uploadUrl: string;
  uploadMethod: 'PUT' | 'POST';
  requiredHeaders?: Record<string, string>;
  chunkUpload?: {
    uploadId: string;
    chunkSize: number;
    totalChunks: number;
    uploadUrls: string[];
  };
}

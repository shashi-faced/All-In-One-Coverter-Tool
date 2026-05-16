import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function getFileIcon(format: string): string {
  const iconMap: Record<string, string> = {
    pdf: 'file-text', png: 'image', jpg: 'image', jpeg: 'image',
    mp4: 'video', mov: 'video', mp3: 'music', wav: 'music',
    zip: 'archive', rar: 'archive', docx: 'file-text', xlsx: 'table',
  };
  return iconMap[format.toLowerCase()] || 'file';
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    COMPLETED: 'text-green-500',
    FAILED: 'text-red-500',
    PROCESSING: 'text-blue-500',
    QUEUED: 'text-yellow-500',
    PENDING: 'text-gray-500',
    CANCELLED: 'text-gray-400',
  };
  return colors[status] || 'text-gray-500';
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncate(str: string, length = 30): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

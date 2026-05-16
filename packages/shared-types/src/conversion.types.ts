export enum FileCategory {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  ARCHIVE = 'ARCHIVE',
  EBOOK = 'EBOOK',
  FONT = 'FONT',
  CAD = 'CAD',
  PRESENTATION = 'PRESENTATION',
  SPREADSHEET = 'SPREADSHEET',
}

export enum ConversionStatus {
  PENDING = 'PENDING',
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface ConversionOption {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'range';
  label: string;
  description?: string;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
}

export interface ConversionFormat {
  input: string;
  output: string;
  category: FileCategory;
  options: ConversionOption[];
}

export interface ConversionJob {
  id: string;
  userId: string;
  fileId: string;
  inputFormat: string;
  outputFormat: string;
  status: ConversionStatus;
  options: Record<string, unknown>;
  progress: number;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  fileSize: number;
  outputSize?: number;
}

export interface ConversionTemplate {
  id: string;
  name: string;
  inputFormat: string;
  outputFormat: string;
  options: Record<string, unknown>;
}

export const SUPPORTED_CONVERSIONS: Record<string, string[]> = {
  // Images
  PNG: ['JPG', 'WEBP', 'AVIF', 'GIF', 'BMP', 'TIFF', 'SVG', 'ICO'],
  JPG: ['PNG', 'WEBP', 'AVIF', 'GIF', 'BMP', 'TIFF', 'ICO'],
  JPEG: ['PNG', 'WEBP', 'AVIF', 'GIF', 'BMP', 'TIFF', 'ICO'],
  WEBP: ['PNG', 'JPG', 'AVIF', 'GIF', 'BMP', 'TIFF'],
  AVIF: ['PNG', 'JPG', 'WEBP', 'GIF'],
  GIF: ['PNG', 'JPG', 'WEBP', 'AVIF', 'BMP'],
  BMP: ['PNG', 'JPG', 'WEBP', 'GIF', 'TIFF'],
  TIFF: ['PNG', 'JPG', 'WEBP', 'BMP', 'PDF'],
  SVG: ['PNG', 'JPG', 'WEBP', 'PDF'],
  ICO: ['PNG', 'JPG', 'BMP'],
  HEIC: ['JPG', 'PNG', 'WEBP'],
  PSD: ['PNG', 'JPG', 'WEBP', 'PDF', 'TIFF'],

  // Video
  MP4: ['MOV', 'AVI', 'MKV', 'WEBM', 'FLV', 'WMV', 'M4V', 'GIF', 'MP3'],
  MOV: ['MP4', 'AVI', 'MKV', 'WEBM', 'FLV', 'WMV'],
  AVI: ['MP4', 'MOV', 'MKV', 'WEBM', 'WMV'],
  MKV: ['MP4', 'MOV', 'AVI', 'WEBM'],
  WEBM: ['MP4', 'MOV', 'AVI', 'MKV'],
  FLV: ['MP4', 'AVI', 'MKV', 'WEBM'],
  WMV: ['MP4', 'MOV', 'AVI', 'MKV'],
  M4V: ['MP4', 'MOV', 'AVI', 'MKV', 'WEBM'],

  // Audio
  MP3: ['WAV', 'AAC', 'FLAC', 'OGG', 'M4A'],
  WAV: ['MP3', 'AAC', 'FLAC', 'OGG', 'M4A'],
  AAC: ['MP3', 'WAV', 'FLAC', 'OGG', 'M4A'],
  FLAC: ['MP3', 'WAV', 'AAC', 'OGG', 'M4A'],
  OGG: ['MP3', 'WAV', 'AAC', 'FLAC', 'M4A'],
  M4A: ['MP3', 'WAV', 'AAC', 'FLAC', 'OGG'],

  // Documents
  PDF: ['DOCX', 'DOC', 'TXT', 'HTML', 'MD', 'EPUB', 'ODT', 'RTF', 'PNG', 'JPG'],
  DOCX: ['PDF', 'DOC', 'TXT', 'HTML', 'MD', 'ODT', 'RTF', 'EPUB'],
  DOC: ['PDF', 'DOCX', 'TXT', 'HTML', 'MD', 'ODT', 'RTF'],
  PPTX: ['PDF', 'PPT', 'PNG', 'JPG'],
  PPT: ['PDF', 'PPTX', 'PNG', 'JPG'],
  XLSX: ['PDF', 'XLS', 'CSV'],
  XLS: ['PDF', 'XLSX', 'CSV'],
  TXT: ['PDF', 'DOCX', 'HTML', 'MD', 'RTF'],
  HTML: ['PDF', 'DOCX', 'TXT', 'MD', 'EPUB'],
  MD: ['PDF', 'DOCX', 'HTML', 'TXT', 'EPUB'],
  ODT: ['PDF', 'DOCX', 'TXT', 'HTML', 'RTF'],
  RTF: ['PDF', 'DOCX', 'TXT', 'HTML', 'ODT'],

  // Archives
  ZIP: ['TAR', 'GZ', '7Z'],
  RAR: ['ZIP', 'TAR', 'GZ', '7Z'],
  '7Z': ['ZIP', 'TAR', 'GZ'],
  TAR: ['ZIP', 'GZ', '7Z'],
  GZ: ['ZIP', 'TAR', '7Z'],

  // eBooks
  EPUB: ['PDF', 'MOBI', 'AZW3', 'DOCX', 'TXT'],
  MOBI: ['EPUB', 'PDF', 'AZW3', 'TXT'],
  AZW3: ['EPUB', 'PDF', 'MOBI', 'TXT'],

  // Fonts
  TTF: ['OTF', 'WOFF', 'WOFF2'],
  OTF: ['TTF', 'WOFF', 'WOFF2'],
  WOFF: ['TTF', 'OTF', 'WOFF2'],
  WOFF2: ['TTF', 'OTF', 'WOFF'],

  // CAD
  DXF: ['PDF', 'SVG', 'PNG', 'JPG'],
  DWG: ['PDF', 'DXF', 'SVG', 'PNG', 'JPG'],
  STL: ['OBJ', 'PLY', '3MF'],
};

export const FORMAT_META: Record<string, { label: string; category: FileCategory; mime: string; extensions: string[] }> = {
  PNG: { label: 'PNG', category: FileCategory.IMAGE, mime: 'image/png', extensions: ['.png'] },
  JPG: { label: 'JPG', category: FileCategory.IMAGE, mime: 'image/jpeg', extensions: ['.jpg', '.jpeg'] },
  JPEG: { label: 'JPEG', category: FileCategory.IMAGE, mime: 'image/jpeg', extensions: ['.jpeg', '.jpg'] },
  WEBP: { label: 'WebP', category: FileCategory.IMAGE, mime: 'image/webp', extensions: ['.webp'] },
  AVIF: { label: 'AVIF', category: FileCategory.IMAGE, mime: 'image/avif', extensions: ['.avif'] },
  GIF: { label: 'GIF', category: FileCategory.IMAGE, mime: 'image/gif', extensions: ['.gif'] },
  BMP: { label: 'BMP', category: FileCategory.IMAGE, mime: 'image/bmp', extensions: ['.bmp'] },
  TIFF: { label: 'TIFF', category: FileCategory.IMAGE, mime: 'image/tiff', extensions: ['.tiff', '.tif'] },
  SVG: { label: 'SVG', category: FileCategory.IMAGE, mime: 'image/svg+xml', extensions: ['.svg'] },
  ICO: { label: 'ICO', category: FileCategory.IMAGE, mime: 'image/x-icon', extensions: ['.ico'] },
  HEIC: { label: 'HEIC', category: FileCategory.IMAGE, mime: 'image/heic', extensions: ['.heic'] },
  PSD: { label: 'PSD', category: FileCategory.IMAGE, mime: 'image/vnd.adobe.photoshop', extensions: ['.psd'] },
  MP4: { label: 'MP4', category: FileCategory.VIDEO, mime: 'video/mp4', extensions: ['.mp4'] },
  MOV: { label: 'MOV', category: FileCategory.VIDEO, mime: 'video/quicktime', extensions: ['.mov'] },
  AVI: { label: 'AVI', category: FileCategory.VIDEO, mime: 'video/x-msvideo', extensions: ['.avi'] },
  MKV: { label: 'MKV', category: FileCategory.VIDEO, mime: 'video/x-matroska', extensions: ['.mkv'] },
  WEBM: { label: 'WebM', category: FileCategory.VIDEO, mime: 'video/webm', extensions: ['.webm'] },
  FLV: { label: 'FLV', category: FileCategory.VIDEO, mime: 'video/x-flv', extensions: ['.flv'] },
  WMV: { label: 'WMV', category: FileCategory.VIDEO, mime: 'video/x-ms-wmv', extensions: ['.wmv'] },
  M4V: { label: 'M4V', category: FileCategory.VIDEO, mime: 'video/x-m4v', extensions: ['.m4v'] },
  MP3: { label: 'MP3', category: FileCategory.AUDIO, mime: 'audio/mpeg', extensions: ['.mp3'] },
  WAV: { label: 'WAV', category: FileCategory.AUDIO, mime: 'audio/wav', extensions: ['.wav'] },
  AAC: { label: 'AAC', category: FileCategory.AUDIO, mime: 'audio/aac', extensions: ['.aac'] },
  FLAC: { label: 'FLAC', category: FileCategory.AUDIO, mime: 'audio/flac', extensions: ['.flac'] },
  OGG: { label: 'OGG', category: FileCategory.AUDIO, mime: 'audio/ogg', extensions: ['.ogg'] },
  M4A: { label: 'M4A', category: FileCategory.AUDIO, mime: 'audio/mp4', extensions: ['.m4a'] },
  PDF: { label: 'PDF', category: FileCategory.DOCUMENT, mime: 'application/pdf', extensions: ['.pdf'] },
  DOCX: { label: 'DOCX', category: FileCategory.DOCUMENT, mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', extensions: ['.docx'] },
  DOC: { label: 'DOC', category: FileCategory.DOCUMENT, mime: 'application/msword', extensions: ['.doc'] },
  PPTX: { label: 'PPTX', category: FileCategory.PRESENTATION, mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', extensions: ['.pptx'] },
  PPT: { label: 'PPT', category: FileCategory.PRESENTATION, mime: 'application/vnd.ms-powerpoint', extensions: ['.ppt'] },
  XLSX: { label: 'XLSX', category: FileCategory.SPREADSHEET, mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', extensions: ['.xlsx'] },
  XLS: { label: 'XLS', category: FileCategory.SPREADSHEET, mime: 'application/vnd.ms-excel', extensions: ['.xls'] },
  TXT: { label: 'TXT', category: FileCategory.DOCUMENT, mime: 'text/plain', extensions: ['.txt'] },
  HTML: { label: 'HTML', category: FileCategory.DOCUMENT, mime: 'text/html', extensions: ['.html', '.htm'] },
  MD: { label: 'Markdown', category: FileCategory.DOCUMENT, mime: 'text/markdown', extensions: ['.md'] },
  EPUB: { label: 'EPUB', category: FileCategory.EBOOK, mime: 'application/epub+zip', extensions: ['.epub'] },
  ODT: { label: 'ODT', category: FileCategory.DOCUMENT, mime: 'application/vnd.oasis.opendocument.text', extensions: ['.odt'] },
  RTF: { label: 'RTF', category: FileCategory.DOCUMENT, mime: 'application/rtf', extensions: ['.rtf'] },
  ZIP: { label: 'ZIP', category: FileCategory.ARCHIVE, mime: 'application/zip', extensions: ['.zip'] },
  RAR: { label: 'RAR', category: FileCategory.ARCHIVE, mime: 'application/vnd.rar', extensions: ['.rar'] },
  '7Z': { label: '7Z', category: FileCategory.ARCHIVE, mime: 'application/x-7z-compressed', extensions: ['.7z'] },
  TAR: { label: 'TAR', category: FileCategory.ARCHIVE, mime: 'application/x-tar', extensions: ['.tar'] },
  GZ: { label: 'GZ', category: FileCategory.ARCHIVE, mime: 'application/gzip', extensions: ['.gz'] },
  MOBI: { label: 'MOBI', category: FileCategory.EBOOK, mime: 'application/x-mobipocket-ebook', extensions: ['.mobi'] },
  AZW3: { label: 'AZW3', category: FileCategory.EBOOK, mime: 'application/vnd.amazon.mobi8-ebook', extensions: ['.azw3'] },
  TTF: { label: 'TTF', category: FileCategory.FONT, mime: 'font/ttf', extensions: ['.ttf'] },
  OTF: { label: 'OTF', category: FileCategory.FONT, mime: 'font/otf', extensions: ['.otf'] },
  WOFF: { label: 'WOFF', category: FileCategory.FONT, mime: 'font/woff', extensions: ['.woff'] },
  WOFF2: { label: 'WOFF2', category: FileCategory.FONT, mime: 'font/woff2', extensions: ['.woff2'] },
  DXF: { label: 'DXF', category: FileCategory.CAD, mime: 'image/vnd.dxf', extensions: ['.dxf'] },
  DWG: { label: 'DWG', category: FileCategory.CAD, mime: 'image/vnd.dwg', extensions: ['.dwg'] },
  STL: { label: 'STL', category: FileCategory.CAD, mime: 'model/stl', extensions: ['.stl'] },
};

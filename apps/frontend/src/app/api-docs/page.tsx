'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal, Copy, Check, ChevronRight, ExternalLink,
  Shield, Key, Upload, Download, ArrowLeftRight, Bell,
  Clock, BookOpen, Code, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const BASE_URL = 'https://api.convertforge.com/v1';

interface CodeBlockProps {
  code: string;
  lang?: string;
}

function CodeBlock({ code, lang = 'bash' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-lg overflow-hidden bg-[#0d1117] border border-[#30363d]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffd93d]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#6bcf7f]" />
          </div>
          <span className="text-[11px] text-[#8b949e] font-mono">{lang === 'bash' ? 'Terminal' : lang === 'javascript' ? 'JavaScript' : lang === 'python' ? 'Python' : lang}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed text-[#c9d1d9] whitespace-pre-wrap break-all">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}

interface EndpointSectionProps {
  method: string;
  path: string;
  description: string;
  color: string;
  children: React.ReactNode;
}

function EndpointSection({ method, path, description, color, children }: EndpointSectionProps) {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <div className="flex items-center gap-3 bg-muted/30 px-4 py-3 border-b border-border/50">
        <span className={cn(
          'inline-flex items-center justify-center rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white',
          color,
        )}>
          {method}
        </span>
        <code className="text-sm font-mono text-foreground">{path}</code>
        <span className="text-xs text-muted-foreground hidden sm:inline">{description}</span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

const sections = [
  { id: 'authentication', label: 'Authentication', icon: Shield },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'convert', label: 'Convert', icon: ArrowLeftRight },
  { id: 'download', label: 'Download', icon: Download },
  { id: 'webhooks', label: 'Webhooks', icon: Bell },
] as const;

export default function ApiDocsPage() {
  const [activeSection, setActiveSection] = useState('authentication');

  const curlAuth = `curl -X POST ${BASE_URL}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com", "password": "your_password"}'`;

  const jsAuth = `const response = await fetch('${BASE_URL}/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'your_password',
  }),
});
const data = await response.json();
// { token: "eyJhbGciOiJIUzI1NiIs..." }`;

  const pyAuth = `import requests

response = requests.post('${BASE_URL}/auth/login', json={
    'email': 'user@example.com',
    'password': 'your_password',
})
data = response.json()
# { 'token': 'eyJhbGciOiJIUzI1NiIs...' }`;

  const curlUpload = `curl -X POST ${BASE_URL}/files/upload \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"fileName": "document.pdf", "fileSize": 1024000, "mimeType": "application/pdf", "category": "document"}'`;

  const jsUpload = `// Step 1: Get upload URL
const { uploadUrl } = await fetch('${BASE_URL}/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileName: 'document.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    category: 'document',
  }),
}).then(r => r.json());

// Step 2: Upload file to presigned URL
await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/pdf' },
  body: fileBlob,
});`;

  const pyUpload = `import requests

# Step 1: Get upload URL
response = requests.post('${BASE_URL}/files/upload',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'fileName': 'document.pdf',
        'fileSize': 1024000,
        'mimeType': 'application/pdf',
        'category': 'document',
    },
)
upload_url = response.json()['uploadUrl']

# Step 2: Upload file
with open('document.pdf', 'rb') as f:
    requests.put(upload_url, data=f, headers={'Content-Type': 'application/pdf'})`;

  const curlConvert = `curl -X POST ${BASE_URL}/conversions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"fileId": "file_abc123", "inputFormat": "pdf", "outputFormat": "docx"}'`;

  const jsConvert = `const conversion = await fetch('${BASE_URL}/conversions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileId: 'file_abc123',
    inputFormat: 'pdf',
    outputFormat: 'docx',
    options: { pageRange: '1-10' },
  }),
}).then(r => r.json());

// Poll for completion
const poll = setInterval(async () => {
  const status = await fetch(\`\${BASE_URL}/conversions/\${conversion.id}\`, {
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  }).then(r => r.json());
  if (status.status === 'COMPLETED') clearInterval(poll);
}, 2000);`;

  const pyConvert = `import requests
import time

# Start conversion
conversion = requests.post('${BASE_URL}/conversions',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'fileId': 'file_abc123',
        'inputFormat': 'pdf',
        'outputFormat': 'docx',
    },
).json()

# Poll for completion
while True:
    status = requests.get(
        f'{BASE_URL}/conversions/{conversion["id"]}',
        headers={'Authorization': 'Bearer YOUR_API_KEY'},
    ).json()
    if status['status'] in ('COMPLETED', 'FAILED'):
        break
    time.sleep(2)`;

  const curlDownload = `curl -X GET "${BASE_URL}/conversions/{conversionId}/download" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -o output.docx`;

  const jsDownload = `// Download converted file
const response = await fetch(\`\${BASE_URL}/conversions/\${conversionId}/download\`, {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
});
const blob = await response.blob();
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'output.docx';
a.click();`;

  const pyDownload = `import requests

response = requests.get(
    f'{BASE_URL}/conversions/{conversionId}/download',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    stream=True,
)
with open('output.docx', 'wb') as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(chunk)`;

  const curlWebhook = `curl -X POST ${BASE_URL}/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://your-app.com/webhook", "events": ["conversion.completed", "conversion.failed"]}'`;

  const jsWebhook = `// Register webhook
await fetch('${BASE_URL}/webhooks', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://your-app.com/webhook',
    events: ['conversion.completed', 'conversion.failed'],
    secret: 'your_webhook_secret',
  }),
});`;

  const pyWebhook = `import requests

requests.post('${BASE_URL}/webhooks',
    headers={'Authorization': 'Bearer YOUR_API_KEY'},
    json={
        'url': 'https://your-app.com/webhook',
        'events': ['conversion.completed', 'conversion.failed'],
        'secret': 'your_webhook_secret',
    },
)`;

  const contentMap: Record<string, React.ReactNode> = {
    authentication: (
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-base font-semibold">How Authentication Works</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ConvertForge uses <strong className="text-foreground">Bearer Token</strong> authentication.
            Include your API key in the <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">Authorization</code> header of every request.
          </p>
        </div>

        <EndpointSection method="POST" path="/auth/login" description="Authenticate and receive a token" color="bg-green-600">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Request Body</h4>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-28 text-primary">email</code>
                <span className="text-xs text-muted-foreground flex-1">User email address</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-28 text-primary">password</code>
                <span className="text-xs text-muted-foreground flex-1">User password</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
            </div>
          </div>
        </EndpointSection>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Using API Keys</h4>
          <p className="text-sm text-muted-foreground">For server-to-server integration, use a permanent API key instead of JWT tokens.</p>
          <CodeBlock code={`curl ${BASE_URL}/conversions \\\n  -H "Authorization: Bearer cf_live_your_api_key_here" \\\n  -H "Content-Type: application/json"`} lang="bash" />
        </div>
      </div>
    ),
    upload: (
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Uploading Files</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Files are uploaded in two steps: first request a presigned upload URL, then upload the file directly to cloud storage.
          </p>
        </div>

        <EndpointSection method="POST" path="/files/upload" description="Get a presigned upload URL" color="bg-blue-600">
          <div className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-24 text-primary">fileName</code>
                <span className="text-xs text-muted-foreground flex-1">Original file name with extension</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-24 text-primary">fileSize</code>
                <span className="text-xs text-muted-foreground flex-1">File size in bytes</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-24 text-primary">mimeType</code>
                <span className="text-xs text-muted-foreground flex-1">MIME type of the file</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
              <div className="flex items-center gap-4">
                <code className="text-xs font-mono w-24 text-primary">category</code>
                <span className="text-xs text-muted-foreground flex-1">File category (document, image, video, audio)</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
            </div>
          </div>
        </EndpointSection>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">File Size Limits</h4>
          <div className="grid gap-2 text-sm">
            {[
              { plan: 'Free', limit: '25 MB', retry: '1 retry' },
              { plan: 'Pro', limit: '100 MB', retry: '3 retries' },
              { plan: 'Enterprise', limit: '1 GB', retry: '10 retries' },
            ].map((tier) => (
              <div key={tier.plan} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <Badge variant={tier.plan === 'Enterprise' ? 'success' : tier.plan === 'Pro' ? 'info' : 'secondary'}>{tier.plan}</Badge>
                <span className="text-sm">Up to <strong>{tier.limit}</strong></span>
                <span className="text-xs text-muted-foreground">· {tier.retry}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    convert: (
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Converting Files</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Create a conversion job by providing a file ID, input format, and desired output format.
            Jobs are processed asynchronously — poll the job status endpoint to know when it's done.
          </p>
        </div>

        <EndpointSection method="POST" path="/conversions" description="Create a new conversion job" color="bg-purple-600">
          <div className="space-y-4">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-28 text-primary">fileId</code>
                <span className="text-xs text-muted-foreground flex-1">ID of the uploaded file</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-28 text-primary">inputFormat</code>
                <span className="text-xs text-muted-foreground flex-1">Source format extension</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-28 text-primary">outputFormat</code>
                <span className="text-xs text-muted-foreground flex-1">Target format extension</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
              <div className="flex items-center gap-4">
                <code className="text-xs font-mono w-28 text-primary">options</code>
                <span className="text-xs text-muted-foreground flex-1">Optional conversion parameters (quality, resolution, etc.)</span>
                <Badge variant="secondary" className="text-[10px] h-4">Optional</Badge>
              </div>
            </div>
          </div>
        </EndpointSection>

        <EndpointSection method="GET" path="/conversions/{id}" description="Get conversion status" color="bg-blue-600">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Response — Job Status</h4>
            <div className="flex flex-wrap gap-2">
              {['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'].map((s) => (
                <Badge key={s} variant={
                  s === 'COMPLETED' ? 'success' : s === 'FAILED' ? 'destructive' :
                  s === 'PROCESSING' ? 'info' : 'warning'
                } className="text-[10px]">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        </EndpointSection>
      </div>
    ),
    download: (
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Downloading Results</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Once a conversion completes, download the output file using the download endpoint.
            Files are available for <strong className="text-foreground">72 hours</strong> after conversion.
          </p>
        </div>

        <EndpointSection method="GET" path="/conversions/{id}/download" description="Download converted file" color="bg-green-600">
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Query Parameters</h4>
            <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
              <code className="text-xs font-mono w-28 text-primary">conversionId</code>
              <span className="text-xs text-muted-foreground flex-1">The conversion job ID</span>
              <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
            </div>
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 mt-3">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-500">Download Expiry</p>
                  <p className="text-xs text-muted-foreground">Download links expire 72 hours after conversion completes. Store the output if you need it longer.</p>
                </div>
              </div>
            </div>
          </div>
        </EndpointSection>
      </div>
    ),
    webhooks: (
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-base font-semibold">Webhooks</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Instead of polling, register a webhook URL to receive real-time notifications when conversion events occur.
            We'll send a POST request to your endpoint with the event payload.
          </p>
        </div>

        <EndpointSection method="POST" path="/webhooks" description="Register a webhook endpoint" color="bg-indigo-600">
          <div className="space-y-3">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-20 text-primary">url</code>
                <span className="text-xs text-muted-foreground flex-1">Your HTTPS endpoint</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
              <div className="flex items-center gap-4 border-b border-border/30 pb-1.5">
                <code className="text-xs font-mono w-20 text-primary">events</code>
                <span className="text-xs text-muted-foreground flex-1">Array of event types to listen for</span>
                <Badge variant="destructive" className="text-[10px] h-4">Required</Badge>
              </div>
              <div className="flex items-center gap-4">
                <code className="text-xs font-mono w-20 text-primary">secret</code>
                <span className="text-xs text-muted-foreground flex-1">Secret for HMAC signature verification</span>
                <Badge variant="secondary" className="text-[10px] h-4">Optional</Badge>
              </div>
            </div>
          </div>
        </EndpointSection>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Webhook Events</h4>
          <div className="grid gap-2">
            {[
              { event: 'conversion.completed', description: 'Conversion job finished successfully' },
              { event: 'conversion.failed', description: 'Conversion job failed' },
              { event: 'conversion.progress', description: 'Conversion progress update (every 10%)' },
              { event: 'file.uploaded', description: 'File upload completed' },
            ].map((evt) => (
              <div key={evt.event} className="flex items-center gap-3 rounded-lg border border-border/50 p-3">
                <Badge variant="outline" className="font-mono text-[10px]">{evt.event}</Badge>
                <span className="text-xs text-muted-foreground">{evt.description}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-medium">Payload Signature Verification</h4>
          <p className="text-sm text-muted-foreground">Verify webhook payloads using the HMAC-SHA256 signature in the <code className="text-xs font-mono bg-muted px-1 py-0.5 rounded">X-ConvertForge-Signature</code> header.</p>
          <CodeBlock code={`// Verify webhook signature (Node.js)
const crypto = require('crypto');
const secret = 'your_webhook_secret';
const signature = req.headers['x-convertforge-signature'];
const payload = JSON.stringify(req.body);
const expected = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');
if (signature !== expected) {
  throw new Error('Invalid signature');
}`} lang="javascript" />
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/25">
            <Code className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API Reference</h1>
            <p className="text-sm text-muted-foreground">Build with the ConvertForge API</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-sm">
            <code className="text-xs font-mono text-primary">{BASE_URL}</code>
            <span className="text-xs text-muted-foreground">Base URL</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" asChild>
            <a href="https://api.convertforge.com/swagger" target="_blank" rel="noopener noreferrer">
              <BookOpen className="h-3.5 w-3.5" /> Swagger UI <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Endpoints</p>
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left',
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {section.label}
                  </button>
                );
              })}
              <Separator className="my-3" />
              <div className="px-3 py-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Rate Limits</p>
                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Free</span>
                    <span className="font-medium text-foreground">100/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pro</span>
                    <span className="font-medium text-foreground">5,000/h</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Enterprise</span>
                    <span className="font-medium text-foreground">50,000/h</span>
                  </div>
                </div>
              </div>
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="lg:hidden mb-6">
              <div className="flex gap-1 overflow-x-auto pb-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                        activeSection === section.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {section.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {contentMap[activeSection]}

              <Separator className="my-8" />

              <div className="grid gap-4 sm:grid-cols-2">
                {sections
                  .filter((s) => s.id !== activeSection)
                  .slice(0, 2)
                  .map((next) => {
                    const Icon = next.icon;
                    return (
                      <button
                        key={next.id}
                        onClick={() => setActiveSection(next.id)}
                        className="flex items-center gap-3 rounded-lg border border-border/50 p-4 hover:bg-muted/30 transition-colors text-left"
                      >
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{next.label}</p>
                          <p className="text-xs text-muted-foreground">View {next.label.toLowerCase()} documentation</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </button>
                    );
                  })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

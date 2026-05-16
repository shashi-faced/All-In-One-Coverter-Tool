'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Code2, Webhook, Key, Gauge, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const apiFeatures = [
  { icon: Code2, title: 'RESTful endpoints', description: 'Simple, predictable REST APIs with consistent resource-oriented URLs.' },
  { icon: Webhook, title: 'WebSocket support', description: 'Real-time streaming for live conversion progress updates.' },
  { icon: Key, title: 'API keys', description: 'Secure authentication with scoped API keys and usage metrics.' },
  { icon: Gauge, title: 'Rate limiting', description: 'Fair usage with configurable rate limits per API key tier.' },
  { icon: Package, title: 'SDK support', description: 'First-party SDKs for Node.js, Python, Go, and more.' },
];

const codeExample = `// Convert a file in 3 lines
const response = await fetch(
  'https://api.convertforge.io/v1/convert',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: {
        url: 'https://example.com/file.pdf',
        format: 'docx'
      },
      output: {
        format: 'pdf',
        quality: 'high'
      }
    })
  }
);

`;

export default function ApiSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="info" className="mb-4 px-4 py-1.5 text-sm">
            For Developers
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Developer-friendly{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              API
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Integrate file conversion into your app with our powerful, well-documented API.
          </p>
        </motion.div>

        {/* Split layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              {apiFeatures.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 h-fit">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="gradient" size="lg" asChild>
              <Link href="/api-docs">
                Explore API docs
                <Code2 className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Right: Code block */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="rounded-xl border border-border/50 bg-[#0d1117] shadow-2xl overflow-hidden">
              {/* Window header */}
              <div className="flex items-center gap-1.5 px-4 py-3 bg-[#161b22] border-b border-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs text-gray-400">api-example.js</span>
              </div>
              {/* Code */}
              <pre className="p-5 overflow-x-auto">
                <code className="text-sm leading-relaxed text-gray-300 font-mono whitespace-pre">
                  <span className="text-gray-500">// Convert a file in 3 lines</span>
                  {'\n'}
                  <span className="text-pink-400">const</span> response = <span className="text-keyword">await</span>{' '}
                  <span className="text-function">fetch</span>(
                  {'\n'}
                  {'  '}<span className="text-string">'https://api.convertforge.io/v1/convert'</span>,
                  {'\n'}
                  {'  '}{'{'}
                  {'\n'}
                  {'    '}<span className="text-variable">method</span>: <span className="text-string">'POST'</span>,
                  {'\n'}
                  {'    '}<span className="text-variable">headers</span>: {'{'}
                  {'\n'}
                  {'      '}<span className="text-string">'Authorization'</span>: <span className="text-string">'Bearer YOUR_API_KEY'</span>,
                  {'\n'}
                  {'      '}<span className="text-string">'Content-Type'</span>: <span className="text-string">'application/json'</span>,
                  {'\n'}
                  {'    '}{'}'},
                  {'\n'}
                  {'    '}<span className="text-variable">body</span>: <span className="text-function">JSON</span>.
                  <span className="text-function">stringify</span>({'{'}
                  {'\n'}
                  {'      '}<span className="text-variable">input</span>: {'{'}
                  {'\n'}
                  {'        '}<span className="text-variable">url</span>: <span className="text-string">'https://example.com/file.pdf'</span>,
                  {'\n'}
                  {'        '}<span className="text-variable">format</span>: <span className="text-string">'docx'</span>,
                  {'\n'}
                  {'      '}{'}'},
                  {'\n'}
                  {'      '}<span className="text-variable">output</span>: {'{'}
                  {'\n'}
                  {'        '}<span className="text-variable">format</span>: <span className="text-string">'pdf'</span>,
                  {'\n'}
                  {'        '}<span className="text-variable">quality</span>: <span className="text-string">'high'</span>,
                  {'\n'}
                  {'      '}{'}'},
                  {'\n'}
                  {'    '}{'}'})
                  {'\n'}
                  {'  '}{'}'});
                  {'\n'}
                  {'\n'}
                  <span className="text-pink-400">const</span> {'{'} downloadUrl {'}'} = <span className="text-keyword">await</span>{' '}
                  response.<span className="text-function">json</span>();
                  {'\n'}
                  <span className="text-builtin">console</span>.<span className="text-function">log</span>(
                  <span className="text-string">{'`Download: ${downloadUrl}`'}</span>);
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What are the file size limits?',
    answer: 'Free users can upload files up to 25 MB. Pro users get up to 500 MB per file, and Enterprise users can upload files up to 2 GB. There are no limits on the number of files you can convert per day on paid plans.',
  },
  {
    question: 'What file formats are supported?',
    answer: 'We support over 100 formats across images (PNG, JPG, WEBP, SVG, etc.), video (MP4, MOV, AVI, etc.), audio (MP3, WAV, FLAC, etc.), documents (PDF, DOCX, XLSX, etc.), archives (ZIP, RAR, 7Z), eBooks (EPUB, MOBI), fonts (TTF, OTF, WOFF), and CAD files (DWG, DXF).',
  },
  {
    question: 'How secure are my files?',
    answer: 'All files are encrypted using AES-256 in transit and at rest. We automatically delete your files from our servers within 1 hour of conversion. Enterprise plans include options for private cloud deployment and data residency controls.',
  },
  {
    question: 'Can I use the API for my application?',
    answer: 'Absolutely! Our REST API and WebSocket support make it easy to integrate file conversion into your application. We provide SDKs for Node.js, Python, Go, and Ruby. The API is rate-limited per key, with Pro plans offering 5,000 requests/month and Enterprise offering unlimited access.',
  },
  {
    question: 'How does pricing work?',
    answer: 'We offer three tiers: Free (10 conversions/day, 25 MB limit), Pro ($19/month, unlimited conversions, 500 MB limit), and Enterprise ($99/month, everything unlimited plus priority support). Yearly plans save you 15%. No credit card required to start.',
  },
  {
    question: 'What about privacy?',
    answer: 'Your privacy is our priority. We never share, sell, or distribute your files. Files are automatically purged after processing. We are GDPR and SOC 2 compliant. Enterprise plans include a signed DPA and dedicated compliance documentation.',
  },
];

function FAQAccordion({ item, index }: { item: FAQItem; index: number }) {
  const [open, setOpen] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={cn(
        'border border-border/50 rounded-xl overflow-hidden backdrop-blur-xl bg-background/40 transition-all duration-300',
        open && 'border-primary/30 shadow-md shadow-primary/5'
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <span className="font-medium text-sm sm:text-base pr-4">{item.question}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            FAQ
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently asked{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about ConvertForge.
          </p>
        </motion.div>

        {/* FAQ list */}
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <FAQAccordion key={item.question} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

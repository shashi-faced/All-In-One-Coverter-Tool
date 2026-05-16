'use client';

import { motion } from 'framer-motion';
import {
  Upload,
  Layers,
  RefreshCw,
  Sparkles,
  Cloud,
  Code2,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Upload,
    title: 'Drag & Drop Upload',
    description: 'Simply drag and drop files from your computer. Supports batch uploads of up to 50 files at once.',
  },
  {
    icon: Layers,
    title: 'Batch Conversion',
    description: 'Convert multiple files simultaneously. Save time with parallel processing that handles large volumes.',
  },
  {
    icon: RefreshCw,
    title: 'Real-time Progress',
    description: 'Watch your conversions happen in real-time with live progress bars and detailed status updates.',
  },
  {
    icon: Sparkles,
    title: 'High-quality Output',
    description: 'Maintain original quality with advanced encoding. AI-powered optimization ensures the best results.',
  },
  {
    icon: Cloud,
    title: 'Cloud Storage',
    description: 'Integrate with Google Drive, Dropbox, and OneDrive. Access and save files directly from the cloud.',
  },
  {
    icon: Code2,
    title: 'API Access',
    description: 'Integrate file conversion into your workflow with our powerful REST API and SDKs.',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    description: 'Files are encrypted in transit and at rest. Automatic deletion after conversion ensures privacy.',
  },
  {
    icon: Zap,
    title: 'Priority Queue',
    description: 'Pro users get priority processing. Your files jump to the front of the queue for faster results.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FeaturesSection() {
  return (
    <section className="relative py-24 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Everything you need for{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              file conversion
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed for developers, creators, and businesses who need reliable file conversion.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map(({ icon: Icon, title, description }) => (
            <motion.div key={title} variants={itemVariants}>
              <Card className="backdrop-blur-xl bg-background/60 border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full group">
                <CardHeader>
                  <div className="p-2.5 rounded-lg bg-primary/10 w-fit mb-3 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

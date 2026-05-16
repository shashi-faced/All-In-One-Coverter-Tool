'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Image, Video, Music, FileText, Archive, BookOpen, Type, Box, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FormatCategory {
  icon: React.ElementType;
  name: string;
  count: number;
  color: string;
}

const categories: FormatCategory[] = [
  { icon: Image, name: 'Images', count: 24, color: 'text-blue-500 bg-blue-500/10' },
  { icon: Video, name: 'Video', count: 18, color: 'text-red-500 bg-red-500/10' },
  { icon: Music, name: 'Audio', count: 15, color: 'text-green-500 bg-green-500/10' },
  { icon: FileText, name: 'Documents', count: 22, color: 'text-yellow-500 bg-yellow-500/10' },
  { icon: Archive, name: 'Archives', count: 8, color: 'text-purple-500 bg-purple-500/10' },
  { icon: BookOpen, name: 'eBooks', count: 6, color: 'text-orange-500 bg-orange-500/10' },
  { icon: Type, name: 'Fonts', count: 10, color: 'text-pink-500 bg-pink-500/10' },
  { icon: Box, name: 'CAD', count: 5, color: 'text-cyan-500 bg-cyan-500/10' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function FormatGrid() {
  return (
    <section className="relative py-24 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            Supported Formats
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Convert between{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              100+ formats
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From images to documents, audio to archives — we support virtually every file type.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {categories.map(({ icon: Icon, name, count, color }) => (
            <motion.div key={name} variants={itemVariants}>
              <Link href={`/formats#${name.toLowerCase()}`} className="block group">
                <Card className="backdrop-blur-xl bg-background/60 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                    <div className={cn('p-3 rounded-xl', color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">{name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{count} formats</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View all link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <Link
            href="/formats"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all formats
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

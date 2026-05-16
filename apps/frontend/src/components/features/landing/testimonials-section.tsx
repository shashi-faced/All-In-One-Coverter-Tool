'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Testimonial {
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Chen',
    role: 'Lead Developer',
    company: 'TechFlow Inc.',
    avatar: '/avatars/sarah.jpg',
    quote: 'ConvertForge has become an essential part of our pipeline. The API is rock-solid and the batch processing saves us hours every week.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Product Designer',
    company: 'DesignLab',
    avatar: '/avatars/marcus.jpg',
    quote: 'The image conversion quality is outstanding. I can finally batch convert all my design assets without losing a single pixel of quality.',
    rating: 5,
  },
  {
    name: 'Elena Rodriguez',
    role: 'CTO',
    company: 'DataSync',
    avatar: '/avatars/elena.jpg',
    quote: 'We process over 10,000 documents daily through their API. Zero downtime in 6 months. The enterprise support is phenomenal.',
    rating: 5,
  },
  {
    name: 'Alex Kim',
    role: 'Freelancer',
    company: 'AK Media',
    avatar: '/avatars/alex.jpg',
    quote: 'As a freelancer, the free tier is incredibly generous. When I needed more, the Pro plan was worth every penny. Game changer.',
    rating: 4,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < rating ? 'fill-yellow-500 text-yellow-500' : 'fill-muted text-muted'
          )}
        />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
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
            Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Loved by{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              50,000+ users
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            See what developers, designers, and businesses say about ConvertForge.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid sm:grid-cols-2 gap-6"
        >
          {testimonials.map(({ name, role, company, avatar, quote, rating }) => (
            <motion.div key={name} variants={itemVariants}>
              <Card className="backdrop-blur-xl bg-background/60 border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
                <CardContent className="p-6 flex flex-col gap-4">
                  {/* Quote */}
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    &ldquo;{quote}&rdquo;
                  </p>

                  {/* Rating */}
                  <StarRating rating={rating} />

                  {/* Author */}
                  <div className="flex items-center gap-3 mt-auto pt-2">
                    <Avatar>
                      <AvatarImage src={avatar} alt={name} />
                      <AvatarFallback>
                        {name.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {role}, {company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

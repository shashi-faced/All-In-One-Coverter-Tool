'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: { name: string; included: boolean }[];
  cta: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    description: 'Perfect for getting started with basic conversions.',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { name: '10 conversions per day', included: true },
      { name: 'Files up to 25 MB', included: true },
      { name: 'Basic format support', included: true },
      { name: 'File processing queue', included: false },
      { name: 'Priority support', included: false },
      { name: 'API access', included: false },
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    description: 'For professionals and small teams who need more power.',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      { name: 'Unlimited conversions', included: true },
      { name: 'Files up to 500 MB', included: true },
      { name: 'All format support', included: true },
      { name: 'Batch processing queue', included: true },
      { name: 'Priority email support', included: true },
      { name: 'API access (5k req/mo)', included: true },
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For organizations with advanced security and scale needs.',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      { name: 'Unlimited conversions', included: true },
      { name: 'Files up to 2 GB', included: true },
      { name: 'All format support + custom', included: true },
      { name: 'Priority queue', included: true },
      { name: '24/7 phone & email support', included: true },
      { name: 'Full API access (unlimited)', included: true },
    ],
    cta: 'Contact Sales',
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

export default function PricingSection() {
  const [yearly, setYearly] = React.useState(false);

  return (
    <section className="relative py-24 px-4">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No surprises. Start free, upgrade when you need more.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={cn('text-sm', !yearly && 'font-semibold text-foreground')}>Monthly</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={cn('text-sm', yearly && 'font-semibold text-foreground')}>
              Yearly
              <Badge variant="success" className="ml-2 text-xs">Save 15%</Badge>
            </span>
          </div>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid md:grid-cols-3 gap-8 items-start"
        >
          {tiers.map((tier) => (
            <motion.div key={tier.name} variants={itemVariants} className="relative">
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge variant="default" className="px-4 py-1 text-xs font-semibold bg-gradient-to-r from-primary to-purple-500">
                    Most Popular
                  </Badge>
                </div>
              )}
              <Card
                className={cn(
                  'backdrop-blur-xl bg-background/60 border-border/50 h-full',
                  tier.popular && 'border-primary/50 shadow-xl shadow-primary/10 scale-[1.02] md:scale-105'
                )}
              >
                <CardHeader className={cn('p-6 pb-0', tier.popular && 'pt-8')}>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription className="mt-1">{tier.description}</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      ${yearly ? tier.yearlyPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /{yearly ? 'year' : 'month'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-6">
                  <ul className="space-y-3 mb-8">
                    {tier.features.map(({ name, included }) => (
                      <li key={name} className="flex items-center gap-3 text-sm">
                        {included ? (
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                        )}
                        <span className={cn(!included && 'text-muted-foreground/50')}>{name}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={tier.popular ? 'gradient' : 'outline'}
                    className="w-full"
                    size="lg"
                    asChild
                  >
                    <Link href="/pricing">{tier.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

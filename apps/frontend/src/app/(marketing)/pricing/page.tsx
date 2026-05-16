'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, X, HelpCircle, ArrowRight, Zap } from 'lucide-react';
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
  ctaHref: string;
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
      { name: 'Batch processing', included: false },
      { name: 'Priority support', included: false },
      { name: 'API access', included: false },
      { name: 'Custom integrations', included: false },
    ],
    cta: 'Get Started Free',
    ctaHref: '/register',
  },
  {
    name: 'Pro',
    description: 'For professionals who need more power and flexibility.',
    monthlyPrice: 9.99,
    yearlyPrice: 95.90,
    features: [
      { name: 'Unlimited conversions', included: true },
      { name: 'Files up to 500 MB', included: true },
      { name: 'All format support', included: true },
      { name: 'Batch processing', included: true },
      { name: 'Priority email support', included: true },
      { name: 'API access (5k req/mo)', included: true },
      { name: 'Custom integrations', included: false },
    ],
    cta: 'Start Pro Trial',
    ctaHref: '/register?plan=pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For organizations with advanced security and scale needs.',
    monthlyPrice: 49.99,
    yearlyPrice: 479.90,
    features: [
      { name: 'Unlimited conversions', included: true },
      { name: 'Files up to 2 GB', included: true },
      { name: 'All format support + custom', included: true },
      { name: 'Priority queue', included: true },
      { name: '24/7 phone & email support', included: true },
      { name: 'Full API access (unlimited)', included: true },
      { name: 'Custom integrations', included: true },
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
  },
];

const allFeatures = [
  { name: 'Conversions', free: '10/day', pro: 'Unlimited', enterprise: 'Unlimited' },
  { name: 'Max file size', free: '25 MB', pro: '500 MB', enterprise: '2 GB' },
  { name: 'Format support', free: 'Basic', pro: 'All formats', enterprise: 'All + custom' },
  { name: 'Batch processing', free: <X className="h-4 w-4 text-muted-foreground/50" />, pro: <Check className="h-4 w-4 text-green-500" />, enterprise: <Check className="h-4 w-4 text-green-500" /> },
  { name: 'Priority queue', free: <X className="h-4 w-4 text-muted-foreground/50" />, pro: <X className="h-4 w-4 text-muted-foreground/50" />, enterprise: <Check className="h-4 w-4 text-green-500" /> },
  { name: 'Support', free: 'Community', pro: 'Email (4h)', enterprise: '24/7 phone & email' },
  { name: 'API access', free: '—', pro: '5k req/mo', enterprise: 'Unlimited' },
  { name: 'Custom integrations', free: <X className="h-4 w-4 text-muted-foreground/50" />, pro: <X className="h-4 w-4 text-muted-foreground/50" />, enterprise: <Check className="h-4 w-4 text-green-500" /> },
  { name: 'SLA', free: 'None', pro: '99.9%', enterprise: '99.99%' },
];

const faqs = [
  { q: 'Can I switch plans at any time?', a: 'Yes, you can upgrade or downgrade at any time. Changes take effect immediately.' },
  { q: 'Is there a free trial for paid plans?', a: 'Pro comes with a 14-day free trial, no credit card required.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, PayPal, and wire transfers for Enterprise.' },
  { q: 'Can I get a refund?', a: 'Yes, we offer a 30-day money-back guarantee on all paid plans.' },
  { q: 'Do you offer discounts for nonprofits?', a: 'Yes, we offer special pricing for educational and nonprofit organizations.' },
  { q: 'How does yearly billing work?', a: 'Yearly billing gives you a ~20% discount compared to monthly billing, charged once annually.' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function PricingPage() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Nav Spacer */}
      <div className="h-16" />

      {/* Header */}
      <section className="relative pt-20 pb-12 px-4 text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
            Pricing
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              pricing
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. No surprises. Start free, upgrade when you need more.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={cn('text-sm transition-colors', !yearly && 'font-semibold text-foreground')}>
              Monthly
            </span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={cn('text-sm transition-colors', yearly && 'font-semibold text-foreground')}>
              Yearly
              <Badge variant="success" className="ml-2 text-xs">Save ~20%</Badge>
            </span>
          </div>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-start"
        >
          {tiers.map((tier) => (
            <motion.div key={tier.name} variants={itemVariants} className="relative">
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <Badge className="px-4 py-1 text-xs font-semibold bg-gradient-to-r from-primary to-purple-500">
                    Most Popular
                  </Badge>
                </div>
              )}
              <div className={cn(
                'relative rounded-xl',
                tier.popular && 'bg-gradient-to-b from-primary/30 via-purple-500/20 to-transparent p-[1px]',
              )}>
                <Card
                  className={cn(
                    'backdrop-blur-xl bg-background/60 border-border/50 h-full',
                    tier.popular && 'border-transparent rounded-[11px]',
                    !tier.popular && 'hover:border-primary/30 transition-colors',
                  )}
                >
                  <CardHeader className={cn('p-6 pb-0', tier.popular && 'pt-8')}>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <CardDescription className="mt-1">{tier.description}</CardDescription>
                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">
                        ${yearly ? tier.yearlyPrice.toFixed(2) : tier.monthlyPrice.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        /{yearly ? 'year' : 'month'}
                      </span>
                    </div>
                    {yearly && tier.monthlyPrice > 0 && (
                      <p className="text-xs text-green-500 mt-1">
                        ${(tier.yearlyPrice / 12).toFixed(2)}/mo billed annually
                      </p>
                    )}
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
                      <Link href={tier.ctaHref}>
                        {tier.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Comparison Table */}
      <section className="relative px-4 pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-purple-500/5 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-2">
            Compare plans in detail
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Everything you need to know before choosing
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-4 font-medium text-muted-foreground">Feature</th>
                  <th className="py-4 px-4 font-semibold text-center w-[140px]">Free</th>
                  <th className="py-4 px-4 font-semibold text-center w-[140px]">
                    <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                      Pro
                    </span>
                  </th>
                  <th className="py-4 px-4 font-semibold text-center w-[140px]">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {allFeatures.map((feat, i) => (
                  <tr key={feat.name} className={cn('border-b border-border/50', i % 2 === 0 && 'bg-muted/20')}>
                    <td className="py-3.5 pr-4 flex items-center gap-2">
                      {feat.name}
                    </td>
                    <td className="py-3.5 px-4 text-center text-muted-foreground">{feat.free}</td>
                    <td className="py-3.5 px-4 text-center">{feat.pro}</td>
                    <td className="py-3.5 px-4 text-center">{feat.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {/* FAQ */}
      <section className="relative px-4 pb-24">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center mb-2">
            Frequently asked questions
          </h2>
          <p className="text-muted-foreground text-center mb-10">
            Everything you need to know
          </p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <details className="group">
                  <summary className="flex items-center justify-between py-4 px-5 rounded-lg bg-card/50 border border-border/50 cursor-pointer hover:bg-muted/30 transition-colors [&::-webkit-details-marker]:hidden">
                    <span className="font-medium">{faq.q}</span>
                    <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pt-3 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 p-10 sm:p-14 text-center"
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-purple-500/10 blur-[80px]" />

          <div className="relative">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-600 shadow-xl">
                <Zap className="h-7 w-7 text-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Ready to get started?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Join thousands of happy users. Start converting your files in seconds, no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="gradient" size="xl" asChild>
                <Link href="/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/contact">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

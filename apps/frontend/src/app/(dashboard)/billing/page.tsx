'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PLANS } from '@convertforge/shared-types';

export default function BillingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const { billingApi } = await import('@/services/api');
      const result = await (billingApi as any).createCheckoutSession(planId);
      if (result.url) window.location.href = result.url;
    } catch (err) {
      console.error('Failed to create checkout session', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      <div className="flex items-center gap-3">
        <Label>Monthly</Label>
        <Switch checked={isYearly} onCheckedChange={setIsYearly} />
        <Label className="flex items-center gap-2">
          Yearly
          <Badge variant="success" className="text-xs">Save 20%</Badge>
        </Label>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`relative h-full flex flex-col ${
              plan.tier === 'PRO' ? 'border-primary/50 shadow-lg shadow-primary/10' : ''
            }`}>
              {plan.tier === 'PRO' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="bg-primary text-xs">Most Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? 'Free' : `$${isYearly ? (plan.price * 0.8 * 12).toFixed(0) : plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground ml-1">/{isYearly ? 'yr' : 'mo'}</span>
                  )}
                </div>
                <CardDescription>{plan.price === 0 ? 'For getting started' : plan.tier === 'PRO' ? 'For professionals' : 'For teams & enterprises'}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-500 mt-1 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.tier === 'PRO' ? 'gradient' : plan.tier === 'FREE' ? 'outline' : 'default'}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading !== null}
                >
                  {loading === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {plan.price === 0 ? 'Get Started' : 'Subscribe'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

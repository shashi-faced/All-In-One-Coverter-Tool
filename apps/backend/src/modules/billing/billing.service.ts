import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PLANS } from '@convertforge/shared-types';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: any;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    if (this.config.get<string>('stripe.secretKey')) {
      try {
        this.stripe = require('stripe')(this.config.get<string>('stripe.secretKey'));
      } catch {
        this.logger.warn('Stripe SDK not available');
      }
    }
  }

  async getPlans() {
    return PLANS;
  }

  async getSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
    return subscription;
  }

  async createCheckoutSession(userId: string, planId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const plan = PLANS.find((p) => p.id === planId);
    if (!plan || plan.price === 0) {
      throw new BadRequestException('Invalid plan');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    let stripeCustomerId = (await this.prisma.subscription.findUnique({ where: { userId } }))?.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${this.config.get<string>('corsOrigin')}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get<string>('corsOrigin')}/pricing`,
      metadata: { userId, planId },
    });

    return { url: session.url, sessionId: session.id };
  }

  async handleWebhook(rawBody: Buffer, signature: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const webhookSecret = this.config.get<string>('stripe.webhookSecret');
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException('Invalid webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await this.activateSubscription(session.metadata.userId, session.metadata.planId, session);
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        await this.syncSubscription(subscription);
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object;
        await this.recordInvoice(invoice);
        break;
      }
    }

    return { received: true };
  }

  private async activateSubscription(userId: string, planId: string, session: any) {
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return;

    await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        planId,
        tier: plan.tier as any,
        status: 'ACTIVE',
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        dailyConversionLimit: plan.dailyConversionLimit,
        maxFileSize: BigInt(plan.maxFileSize),
        storageLimit: BigInt(plan.storageLimit),
        priority: plan.priority,
        apiAccess: plan.apiAccess,
      },
      create: {
        userId,
        planId,
        tier: plan.tier as any,
        stripeSubscriptionId: session.subscription,
        stripeCustomerId: session.customer,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        dailyConversionLimit: plan.dailyConversionLimit,
        maxFileSize: BigInt(plan.maxFileSize),
        storageLimit: BigInt(plan.storageLimit),
        priority: plan.priority,
        apiAccess: plan.apiAccess,
      },
    });

    this.logger.log(`Subscription activated for user ${userId}: ${planId}`);
  }

  private async syncSubscription(stripeSubscription: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeSubscription.id },
    });

    if (!subscription) return;

    const statusMap: Record<string, any> = {
      active: 'ACTIVE',
      past_due: 'PAST_DUE',
      canceled: 'CANCELLED',
      unpaid: 'INACTIVE',
      incomplete: 'INACTIVE',
      incomplete_expired: 'EXPIRED',
      trialing: 'ACTIVE',
    };

    const shouldCancel = stripeSubscription.cancel_at_period_end || stripeSubscription.status === 'canceled';

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: statusMap[stripeSubscription.status] || 'INACTIVE',
        cancelAtPeriodEnd: shouldCancel,
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      },
    });
  }

  private async recordInvoice(stripeInvoice: any) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { stripeSubscriptionId: stripeInvoice.subscription },
    });

    if (!subscription) return;

    await this.prisma.invoice.create({
      data: {
        userId: subscription.userId,
        subscriptionId: subscription.id,
        amount: stripeInvoice.total,
        currency: stripeInvoice.currency,
        status: 'PAID',
        stripeInvoiceId: stripeInvoice.id,
        stripeInvoiceUrl: stripeInvoice.hosted_invoice_url,
        periodStart: new Date(stripeInvoice.period_start * 1000),
        periodEnd: new Date(stripeInvoice.period_end * 1000),
        paidAt: new Date(),
      },
    });
  }

  async createBillingPortal(userId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!subscription?.stripeCustomerId) {
      throw new BadRequestException('No active subscription');
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${this.config.get<string>('corsOrigin')}/billing`,
    });

    return { url: session.url };
  }
}

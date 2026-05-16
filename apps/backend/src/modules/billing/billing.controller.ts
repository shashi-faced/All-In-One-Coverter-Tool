import { Controller, Get, Post, Body, Req, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BillingService } from './billing.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private billingService: BillingService) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'Get subscription plans' })
  async getPlans() {
    return this.billingService.getPlans();
  }

  @Get('subscription')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription' })
  async getSubscription(@CurrentUser() user: any) {
    return this.billingService.getSubscription(user.id);
  }

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  async createCheckoutSession(
    @CurrentUser() user: any,
    @Body('planId') planId: string,
  ) {
    return this.billingService.createCheckoutSession(user.id, planId);
  }

  @Post('portal')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe billing portal session' })
  async createPortal(@CurrentUser() user: any) {
    return this.billingService.createBillingPortal(user.id);
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.billingService.handleWebhook(req.body, signature);
  }
}

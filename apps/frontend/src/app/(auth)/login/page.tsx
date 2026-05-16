'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Mail, Lock, ArrowRight, Loader2, ChromeIcon, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const otpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

type LoginForm = z.infer<typeof loginSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type VerifyOtpForm = z.infer<typeof verifyOtpSchema>;

type Step = 'login' | 'otp-init' | 'otp-verify';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });
  const verifyOtpForm = useForm<VerifyOtpForm>({ resolver: zodResolver(verifyOtpSchema) });

  const onLogin = (data: LoginForm) => {
    startTransition(async () => {
      try {
        await axios.post('/api/auth/login', data);
        router.push('/dashboard');
      } catch {
        loginForm.setError('root', { message: 'Invalid email or password.' });
      }
    });
  };

  const onRequestOtp = (data: OtpForm) => {
    setEmail(data.email);
    startTransition(async () => {
      try {
        await axios.post('/api/auth/otp/request', { email: data.email });
        setStep('otp-verify');
        verifyOtpForm.setValue('email', data.email);
      } catch {
        otpForm.setError('root', { message: 'Failed to send OTP.' });
      }
    });
  };

  const onVerifyOtp = (data: VerifyOtpForm) => {
    startTransition(async () => {
      try {
        await axios.post('/api/auth/otp/verify', data);
        router.push('/dashboard');
      } catch {
        verifyOtpForm.setError('root', { message: 'Invalid or expired OTP.' });
      }
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="backdrop-blur-xl bg-background/60 border-border/50 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </Link>
            <CardTitle className="text-2xl">
              {step === 'login' && 'Welcome back'}
              {step === 'otp-init' && 'Sign in with OTP'}
              {step === 'otp-verify' && 'Check your email'}
            </CardTitle>
            <CardDescription>
              {step === 'login' && 'Sign in to your account to continue'}
              {step === 'otp-init' && 'Enter your email to receive a one-time code'}
              {step === 'otp-verify' && `We sent a 6-digit code to ${email}`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {step === 'login' && (
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                {loginForm.formState.errors.root && (
                  <p className="text-sm text-destructive text-center">
                    {loginForm.formState.errors.root.message}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    {...loginForm.register('email')}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    {...loginForm.register('password')}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Sign In
                </Button>

                <div className="relative">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    or continue with
                  </span>
                </div>

                <Button type="button" variant="outline" className="w-full" size="lg" asChild>
                  <Link href="/api/auth/google">
                    <ChromeIcon className="h-4 w-4" />
                    Google
                  </Link>
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('otp-init')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign in with OTP instead
                  </button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <Link href="/register" className="font-medium text-primary hover:underline">
                    Create one
                  </Link>
                </p>
              </form>
            )}

            {step === 'otp-init' && (
              <form onSubmit={otpForm.handleSubmit(onRequestOtp)} className="space-y-4">
                {otpForm.formState.errors.root && (
                  <p className="text-sm text-destructive text-center">
                    {otpForm.formState.errors.root.message}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp-email">Email</Label>
                  <Input
                    id="otp-email"
                    type="email"
                    placeholder="you@example.com"
                    {...otpForm.register('email')}
                  />
                  {otpForm.formState.errors.email && (
                    <p className="text-xs text-destructive">{otpForm.formState.errors.email.message}</p>
                  )}
                </div>

                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  Send OTP
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to password sign in
                  </button>
                </div>
              </form>
            )}

            {step === 'otp-verify' && (
              <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
                {verifyOtpForm.formState.errors.root && (
                  <p className="text-sm text-destructive text-center">
                    {verifyOtpForm.formState.errors.root.message}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="otp-code">One-time code</Label>
                  <Input
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                    {...verifyOtpForm.register('otp')}
                  />
                  {verifyOtpForm.formState.errors.otp && (
                    <p className="text-xs text-destructive">{verifyOtpForm.formState.errors.otp.message}</p>
                  )}
                </div>

                <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Verify & Sign In
                </Button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={() => { setStep('otp-init'); otpForm.setValue('email', email); }}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
                  >
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('login')}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors block w-full"
                  >
                    Back to sign in
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

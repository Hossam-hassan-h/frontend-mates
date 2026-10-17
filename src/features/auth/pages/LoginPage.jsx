import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';

import { loginSchema } from '../schemas/authSchemas.js';
import { useAuth } from '../hooks/useAuth.js';
import { FieldError } from '@/components/feedback/FieldError.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';

export function LoginPage() {
  const { login, isLoggingIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <div className="space-y-6" dir="ltr">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Sign In</h2>
        <p className="text-xs text-muted-foreground">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            {...register('email')}
          />
          <FieldError error={errors.email} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
          />
          <FieldError error={errors.password} />
        </div>

        <Button type="submit" className="w-full" disabled={isLoggingIn}>
          {isLoggingIn ? (
            'Signing in...'
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              Sign In
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/50">
        Don&apos;t have an account?{' '}
        <Link to={ROUTE_PATHS.AUTH.REGISTER} className="text-primary font-bold hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;

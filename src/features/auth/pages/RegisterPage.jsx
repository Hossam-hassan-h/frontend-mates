import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

import { registerSchema } from '../schemas/authSchemas.js';
import { useAuth } from '../hooks/useAuth.js';
import { FieldError } from '@/components/feedback/FieldError.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { Label } from '@/components/ui/label.jsx';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';

export function RegisterPage() {
  const { register: signup, isRegistering } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirm: '',
    },
  });

  const onSubmit = (data) => {
    signup(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold tracking-tight text-foreground">Create New Account</h2>
        <p className="text-xs text-muted-foreground">Join Mates Store and enjoy a distinctive shopping experience</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" placeholder="John Doe" {...register('name')} />
          <FieldError error={errors.name} />
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="name@example.com" {...register('email')} />
          <FieldError error={errors.email} />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          <FieldError error={errors.password} />
        </div>

        <div>
          <Label htmlFor="passwordConfirm">Confirm Password</Label>
          <Input id="passwordConfirm" type="password" placeholder="••••••••" {...register('passwordConfirm')} />
          <FieldError error={errors.passwordConfirm} />
        </div>

        <Button type="submit" className="w-full" disabled={isRegistering}>
          {isRegistering ? (
            'Creating account...'
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Create Account
            </span>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/50">
        Already have an account?{' '}
        <Link to={ROUTE_PATHS.AUTH.LOGIN} className="text-primary font-bold hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const isPassword = type === 'password';

  const input = (
    <input
      type={isPassword && isPasswordVisible ? 'text' : type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
        isPassword && 'pl-11',
        className
      )}
      ref={ref}
      {...props}
    />
  );

  if (!isPassword) return input;

  return (
    <div className="relative">
      {input}
      <button
        type="button"
        className="absolute inset-y-0 left-0 flex w-11 items-center justify-center rounded-l-xl text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => setIsPasswordVisible((visible) => !visible)}
        disabled={props.disabled}
        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
        aria-pressed={isPasswordVisible}
      >
        {isPasswordVisible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
});
Input.displayName = 'Input';

export { Input };

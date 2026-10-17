import { AlertCircle } from 'lucide-react';

export function FieldError({ error }) {
  if (!error) return null;

  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className="flex items-center gap-1.5 text-xs text-destructive mt-1 font-medium animate-fade-in">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export default FieldError;

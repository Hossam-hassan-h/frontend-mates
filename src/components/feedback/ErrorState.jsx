import { AlertTriangle, RefreshCw } from 'lucide-react';

export function ErrorState({
  title = 'An Unexpected Error Occurred',
  message = 'Unable to load the requested data. Please try again.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-destructive/5 rounded-xl border border-destructive/20 my-4 gap-3">
      <div className="p-3 bg-destructive/10 text-destructive rounded-full">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-destructive rounded-lg hover:bg-destructive/90 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;

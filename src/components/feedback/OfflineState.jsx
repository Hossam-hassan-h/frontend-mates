import { WifiOff } from 'lucide-react';

export function OfflineState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-muted/40 rounded-xl border border-border my-4 gap-3">
      <div className="p-3 bg-muted rounded-full text-muted-foreground">
        <WifiOff className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">انقطع الاتصال بالإنترنت</h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        يرجى التحقق من اتصالك بالشبكة وإعادة المحاولة.
      </p>
    </div>
  );
}

export default OfflineState;

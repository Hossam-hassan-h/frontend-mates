import { PackageOpen } from 'lucide-react';

export function EmptyState({
  title = 'لا توجد بيانات',
  description = 'لم نجد أي عناصر لعرضها في الوقت الحالي.',
  action,
  icon: Icon = PackageOpen,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-border/50 my-4 gap-3">
      <div className="p-3 bg-secondary/50 rounded-full text-muted-foreground">
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export default EmptyState;

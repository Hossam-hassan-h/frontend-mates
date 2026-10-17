import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils.js';

export function DateRangeFilter({ selectedRange, onSelectRange, isFetching }) {
  const options = [
    { label: 'اليوم', value: 'today' },
    { label: 'الأمس', value: 'yesterday' },
    { label: 'آخر 7 أيام', value: 'last7Days' },
    { label: 'آخر 30 يوماً', value: 'last30Days' },
    { label: 'هذا الشهر', value: 'thisMonth' },
    { label: 'هذا العام', value: 'thisYear' },
    { label: 'الكل', value: 'allTime' },
  ];

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-2xl border border-border/60 bg-card p-1.5 shadow-sm lg:flex-none">
      <div className="hidden shrink-0 items-center gap-1.5 border-e border-border/60 px-3 text-xs font-bold text-muted-foreground sm:flex">
        <Calendar className="w-4 h-4 text-primary" />
        <span>الفترة الزمنية:</span>
      </div>
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const isSelected = selectedRange === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onSelectRange(option.value)}
              disabled={isFetching}
              className={cn(
                'shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DateRangeFilter;

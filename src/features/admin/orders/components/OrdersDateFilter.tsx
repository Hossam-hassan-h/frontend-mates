import React, { useState, useEffect } from 'react';

interface OrdersDateFilterProps {
  dateFrom: string | null;
  dateTo: string | null;
  onChange: (from: string | null, to: string | null) => void;
  className?: string;
}

/**
 * Date range filter component matching the clean layout in AdminUsersPage.
 * Parameters correspond to backend 'from' and 'to' filters on createdAt.
 */
export const OrdersDateFilter: React.FC<OrdersDateFilterProps> = ({
  dateFrom,
  dateTo,
  onChange,
  className = '',
}) => {
  const [from, setFrom] = useState<string>(dateFrom || '');
  const [to, setTo] = useState<string>(dateTo || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFrom(dateFrom || '');
    setTo(dateTo || '');
  }, [dateFrom, dateTo]);

  const handleFromChange = (newFrom: string) => {
    setFrom(newFrom);
    if (to && newFrom && new Date(to) < new Date(newFrom)) {
      setError('End date cannot be earlier than start date');
      return;
    }
    setError(null);
    onChange(newFrom || null, to || null);
  };

  const handleToChange = (newTo: string) => {
    setTo(newTo);
    if (from && newTo && new Date(newTo) < new Date(from)) {
      setError('End date cannot be earlier than start date');
      return;
    }
    setError(null);
    onChange(from || null, newTo || null);
  };

  return (
    <div
      className={`relative flex items-center gap-1.5 ${className}`}
      dir="ltr"
    >
      <span className="text-xs font-bold text-muted-foreground shrink-0">Date:</span>
      <div className="flex items-center gap-1">
        <input
          type="date"
          value={from}
          onChange={(e) => handleFromChange(e.target.value)}
          className="h-9 rounded-xl border border-input bg-background text-foreground px-2.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          title="From date"
          aria-label="From date"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => handleToChange(e.target.value)}
          className="h-9 rounded-xl border border-input bg-background text-foreground px-2.5 text-xs focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          title="To date"
          aria-label="To date"
        />
      </div>

      {error && (
        <span className="text-[11px] font-bold text-rose-600 absolute -bottom-5 right-0 whitespace-nowrap">
          {error}
        </span>
      )}
    </div>
  );
};

export default OrdersDateFilter;

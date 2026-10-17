import React from 'react';
import { Search, X } from 'lucide-react';

interface OrdersSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * Search input UI component matching AdminUsersPage design.
 * Full width, clean typography, right-aligned search icon, left-aligned clear button.
 */
export const OrdersSearchBar: React.FC<OrdersSearchBarProps> = ({
  value,
  onChange,
  className = '',
}) => {
  return (
    <div className={`relative w-full ${className}`} dir="ltr">
      <label htmlFor="order-search" className="sr-only">
        Search by order number, customer name, or phone
      </label>
      <Search
        aria-hidden="true"
        className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7464]"
      />
      <input
        id="order-search"
        type="search"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by order number, customer name, or phone..."
        className="h-11 w-full rounded-xl border border-input bg-background/60 py-2 pr-11 pl-10 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          aria-label="Clear search input"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default OrdersSearchBar;

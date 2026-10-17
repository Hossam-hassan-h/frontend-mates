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
    <div className={`relative w-full ${className}`} dir="rtl">
      <label htmlFor="order-search" className="sr-only">
        ابحث برقم الطلب أو اسم العميل أو الهاتف
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
        placeholder="ابحث برقم الطلب أو اسم العميل أو الهاتف..."
        className="h-11 w-full rounded-xl border border-[#E2E6DC] bg-[#F8FAF6]/50 py-2 pr-11 pl-10 text-sm text-[#1A1F16] placeholder:text-[#6B7464]/60 focus:border-[#1D6B36] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D6B36]/30 transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-[#6B7464] hover:bg-gray-100 hover:text-[#1A1F16] transition-colors cursor-pointer"
          aria-label="مسح نص البحث"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default OrdersSearchBar;

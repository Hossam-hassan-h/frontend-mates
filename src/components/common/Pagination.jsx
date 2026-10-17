import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button.jsx';

/**
 * Shadcn UI-compatible Pagination Primitives
 */
const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1.5', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('list-none', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

const PaginationLink = ({
  className,
  isActive,
  size = 'icon',
  as: Component,
  onClick,
  href,
  disabled,
  ...props
}) => {
  // If no href is provided or explicitly disabled/button-like, render as a real button to prevent link anchor jumps
  const Tag = Component || (href ? 'a' : 'button');

  return (
    <Tag
      aria-current={isActive ? 'page' : undefined}
      href={href}
      disabled={disabled}
      type={Tag === 'button' ? 'button' : undefined}
      onClick={disabled ? (e) => e.preventDefault() : onClick}
      className={cn(
        buttonVariants({
          variant: isActive ? 'default' : 'outline',
          size,
        }),
        'h-9 min-w-9 rounded-xl text-xs font-extrabold transition-all cursor-pointer select-none',
        isActive
          ? 'bg-[#1D6B36] text-white border-[#1D6B36] shadow-sm hover:bg-[#155227]'
          : 'border-[#E2E6DC] bg-white text-[#6B7464] hover:border-[#1D6B36]/40 hover:text-[#1D6B36]',
        disabled && 'pointer-events-none opacity-40 cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
};
PaginationLink.displayName = 'PaginationLink';

const PaginationPrevious = ({
  className,
  text = 'السابق',
  dir = 'rtl',
  disabled,
  ...props
}) => {
  const isRtl = dir === 'rtl';
  return (
    <PaginationLink
      aria-label="الانتقال إلى الصفحة السابقة"
      size="default"
      disabled={disabled}
      className={cn('gap-1.5 px-3', className)}
      {...props}
    >
      {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      {text && <span className="font-bold">{text}</span>}
    </PaginationLink>
  );
};
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  text = 'التالي',
  dir = 'rtl',
  disabled,
  ...props
}) => {
  const isRtl = dir === 'rtl';
  return (
    <PaginationLink
      aria-label="الانتقال إلى الصفحة التالية"
      size="default"
      disabled={disabled}
      className={cn('gap-1.5 px-3', className)}
      {...props}
    >
      {text && <span className="font-bold">{text}</span>}
      {isRtl ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
    </PaginationLink>
  );
};
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center text-[#6B7464]', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">صفحات إضافية</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

/**
 * Calculates visible pages array with ellipsis
 */
function calculateVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, 'ellipsis-end', totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      'ellipsis-start',
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    'ellipsis-start',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-end',
    totalPages,
  ];
}

/**
 * High-level ready-to-use Pagination bar for tables, grids, and catalogs
 */
export function AppPagination({
  currentPage = 1,
  totalPages: propTotalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  itemLabel = 'عنصر',
  showSummary = true,
  className = '',
  dir = 'rtl',
}) {
  // If totalPages is not given directly, calculate from totalItems and pageSize
  const calculatedTotalPages =
    propTotalPages !== undefined
      ? propTotalPages
      : typeof totalItems === 'number'
      ? Math.max(1, Math.ceil(totalItems / pageSize))
      : 1;

  const totalPages = Math.max(1, calculatedTotalPages);
  const activePage = Math.min(Math.max(currentPage, 1), totalPages);

  // If there's only 1 page and no totalItems to summarize, keep it minimal or hidden
  if (totalPages <= 1 && (!totalItems || totalItems <= pageSize)) {
    if (!showSummary || !totalItems) return null;
  }

  const startItem = totalItems !== undefined ? (totalItems > 0 ? (activePage - 1) * pageSize + 1 : 0) : null;
  const endItem = totalItems !== undefined ? Math.min(activePage * pageSize, totalItems) : null;
  const visiblePages = calculateVisiblePages(activePage, totalPages);

  const handlePageClick = (page) => {
    if (page === activePage || page < 1 || page > totalPages) return;
    if (onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-3 border-t border-[#E2E6DC] bg-[#F8FAF6]/60 px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-4 font-[\'Cairo\']',
        className
      )}
      dir={dir}
    >
      {/* Summary info if totalItems is provided */}
      {showSummary && totalItems !== undefined && (
        <p className="text-center text-xs font-bold text-[#6B7464] sm:text-start">
          عرض <span className="text-[#1A1F16]">{startItem}</span>–
          <span className="text-[#1A1F16]">{endItem}</span> من أصل{' '}
          <span className="text-[#1A1F16]">{totalItems}</span> {itemLabel}
        </p>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Pagination className="mx-0 w-auto justify-center sm:justify-end">
          <PaginationContent className="overflow-x-auto pb-1 max-w-full">
            {/* Previous Page Button */}
            <PaginationItem>
              <PaginationPrevious
                dir={dir}
                disabled={activePage <= 1}
                onClick={() => handlePageClick(activePage - 1)}
              />
            </PaginationItem>

            {/* Numeric and Ellipsis Pages */}
            {visiblePages.map((page, index) => {
              if (typeof page === 'number') {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === activePage}
                      onClick={() => handlePageClick(page)}
                      aria-label={`الصفحة ${page}`}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            })}

            {/* Next Page Button */}
            <PaginationItem>
              <PaginationNext
                dir={dir}
                disabled={activePage >= totalPages}
                onClick={() => handlePageClick(activePage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};

export default AppPagination;


/**
 * BrandLogo - Temporary placeholder text wordmark in serif font.
 * Used across the header and footer until the owner provides an official logo file.
 */
export function BrandLogo({ className = '' }) {
  return (
    <span className={`font-serif text-xl sm:text-2xl font-bold tracking-tight text-foreground select-none inline-block ${className}`}>
      Mates Store
    </span>
  );
}

export default BrandLogo;

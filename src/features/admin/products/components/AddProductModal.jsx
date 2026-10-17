import { useEffect } from 'react';
import { X } from 'lucide-react';
import AddProductForm from './AddProductForm.jsx';

export function AddProductModal({ isOpen, onClose, product }) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
    return undefined;
  }, [isOpen]);

  // Handle Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditMode = Boolean(product);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 backdrop-blur-xs animate-fade-in sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-modal-title"
    >
      <div
        className="h-[100dvh] w-full max-w-2xl overflow-y-auto border border-[#E2E6DC] bg-white p-4 text-[#1A1F16] shadow-xl sm:h-auto sm:max-h-[90vh] sm:rounded-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b border-[#E2E6DC] bg-white pb-4 pt-1">
          <h2 id="add-product-modal-title" className="text-lg font-bold text-[#1A1F16] sm:text-xl">
            {isEditMode ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق النافذة"
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#6B7464] hover:bg-[#F0F2ED] hover:text-[#1A1F16] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <AddProductForm onClose={onClose} product={product} />
      </div>
    </div>
  );
}

export default AddProductModal;

import { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getText } from '@/utils/getText.js';

export function ArchiveCategoryModal({ isOpen, onClose, category, onConfirm, isDeleting }) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isDeleting) onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDeleting, isOpen, onClose]);

  if (!isOpen || !category) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 animate-fade-in sm:p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-4 shadow-2xl font-['Cairo'] text-start sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E2E6DC]/60 pb-4">
          <h2 className="text-lg font-black text-[#1A1F16]">تأكيد حذف التصنيف</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="إغلاق"
            className="rounded-lg p-1 text-[#6B7464] hover:bg-[#F0F2ED] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <p className="text-xs font-bold leading-relaxed text-red-800">
              سيتم حذف تصنيف «{getText(category.name)}» نهائياً من قاعدة البيانات. لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-2 min-[380px]:grid-cols-2">
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700 sm:text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span>{isDeleting ? 'جاري الحذف...' : 'حذف نهائياً'}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="h-11 rounded-xl border-[#1D6B36] text-xs font-bold text-[#1D6B36] hover:bg-[#1D6B36]/10 sm:text-sm"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArchiveCategoryModal;

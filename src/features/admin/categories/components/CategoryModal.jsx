import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { getText } from '@/utils/getText.js';

export function CategoryModal({ isOpen, onClose, category, onSave, isSaving }) {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);

  useEffect(() => {
    setName(getText(category?.name) || '');
    setImage(null);
  }, [category, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleEscape = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || isSaving) return;
    onSave({ name: trimmedName, image });
  };

  const isEditing = Boolean(category);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 animate-fade-in sm:p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative h-[100dvh] w-full max-w-md overflow-y-auto bg-white p-4 shadow-2xl font-['Cairo'] text-start sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#E2E6DC]/60 pb-4 pt-1">
          <h2 className="text-base font-black text-[#1A1F16] sm:text-lg">
            {isEditing ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="إغلاق"
            className="rounded-lg p-1 text-[#6B7464] transition-colors hover:bg-[#F0F2ED] hover:text-[#1A1F16] disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="cat-name" className="mb-1.5 block text-xs font-bold text-[#1A1F16]">
              اسم التصنيف <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              required
              minLength={3}
              maxLength={32}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="مثال: خضروات"
              className="h-11 w-full rounded-xl border border-[#E2E6DC] bg-white px-3.5 text-sm font-semibold text-[#1A1F16] transition-all focus:border-[#1D6B36] focus:outline-none focus:ring-2 focus:ring-[#1D6B36]/20"
            />
          </div>

          <div>
            <label htmlFor="cat-image" className="mb-1.5 block text-xs font-bold text-[#1A1F16]">
              صورة التصنيف {isEditing && <span className="font-medium text-[#6B7464]">(اختياري)</span>}
            </label>
            <label
              htmlFor="cat-image"
              className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#B8C0B2] bg-[#F7F8F5] p-4 text-center text-xs font-bold text-[#6B7464] hover:border-[#1D6B36] hover:text-[#1D6B36]"
            >
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
              <span>{image?.name || (category?.image ? 'اختر صورة جديدة لتغيير الصورة الحالية' : 'اختر صورة من جهازك')}</span>
            </label>
            <input
              id="cat-image"
              type="file"
              accept="image/*"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
              className="sr-only"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 border-t border-[#E2E6DC]/60 pt-3 min-[380px]:grid-cols-2">
            <Button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="h-11 rounded-xl bg-[#1D6B36] text-sm font-bold text-white shadow-xs hover:bg-[#175A2D]"
            >
              {isSaving ? 'جاري الحفظ...' : isEditing ? 'حفظ التصنيف' : 'إضافة التصنيف'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-11 rounded-xl border-[#1D6B36] text-sm font-bold text-[#1D6B36] hover:bg-[#1D6B36]/10"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;

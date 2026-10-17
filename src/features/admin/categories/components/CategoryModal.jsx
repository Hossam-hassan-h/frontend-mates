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
      dir="ltr"
      onClick={onClose}
    >
      <div
        className="relative h-[100dvh] w-full max-w-md overflow-y-auto bg-card border border-border/80 p-4 shadow-2xl font-sans text-start sm:h-auto sm:max-h-[90vh] sm:rounded-3xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-4 pt-1">
          <h2 className="text-base font-black text-foreground sm:text-lg">
            {isEditing ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            aria-label="Close"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="cat-name" className="mb-1.5 block text-xs font-bold text-foreground">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              id="cat-name"
              type="text"
              required
              minLength={3}
              maxLength={32}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Hoodies & Sweatshirts"
              className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm font-semibold text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="cat-image" className="mb-1.5 block text-xs font-bold text-foreground">
              Category Image {isEditing && <span className="font-medium text-muted-foreground">(Optional)</span>}
            </label>
            <label
              htmlFor="cat-image"
              className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/80 bg-secondary/20 p-4 text-center text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary"
            >
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
              <span>{image?.name || (category?.image ? 'Choose new image to change current image' : 'Choose image from your device')}</span>
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
              {isSaving ? 'Saving...' : isEditing ? 'Save Category' : 'Add Category'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="h-11 rounded-xl border-[#1D6B36] text-sm font-bold text-[#1D6B36] hover:bg-[#1D6B36]/10"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;

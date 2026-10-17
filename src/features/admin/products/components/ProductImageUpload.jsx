import { useRef, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { FieldError } from '@/components/feedback/FieldError.jsx';
import { Label } from '@/components/ui/label.jsx';

export function ProductImageUpload({ value, onChange, error }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewUrl = typeof value === 'string'
    ? value
    : value instanceof File
    ? URL.createObjectURL(value)
    : null;

  const handleFileChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      onChange(file);
    }
  };

  const onFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemove = (event) => {
    event.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="product-image-upload">
        Product Image <span className="text-red-500">*</span>
      </Label>

      <input
        ref={fileInputRef}
        id="product-image-upload"
        type="file"
        accept="image/*"
        onChange={onFileInputChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative flex min-w-0 items-center gap-3 rounded-2xl border border-border/80 bg-secondary/30 p-3 transition-colors sm:gap-4">
          <img
            src={previewUrl}
            alt="Product image preview"
            className="h-14 w-14 shrink-0 rounded-xl border border-border/80 bg-card object-cover shadow-sm sm:h-16 sm:w-16"
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {value?.name || 'Selected product image'}
            </p>
            {value?.size && (
              <p className="text-xs text-muted-foreground">
                {(value.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove image"
            title="Remove image"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed py-6 px-4 text-center transition-all ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border/80 bg-secondary/20 hover:border-primary/50 hover:bg-secondary/30'
          }`}
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            {isDragging ? <Upload className="h-5 w-5 animate-bounce" /> : <ImagePlus className="h-5 w-5" />}
          </div>
          <p className="text-sm font-semibold text-foreground">
            Click to choose an image or drag & drop here
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG, WEBP up to 5 MB
          </p>
        </div>
      )}

      <FieldError error={error} />
    </div>
  );
}

export default ProductImageUpload;

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
        صورة المنتج <span className="text-red-500">*</span>
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
        <div className="relative flex min-w-0 items-center gap-3 rounded-2xl border border-[#E2E6DC] bg-[#FAFAFA] p-3 transition-colors sm:gap-4">
          <img
            src={previewUrl}
            alt="معاينة صورة المنتج"
            className="h-14 w-14 shrink-0 rounded-xl border border-[#E2E6DC] bg-white object-cover shadow-sm sm:h-16 sm:w-16"
          />
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-[#1A1F16]">
              {value?.name || 'صورة المنتج المختارة'}
            </p>
            {value?.size && (
              <p className="text-xs text-[#6B7464]">
                {(value.size / (1024 * 1024)).toFixed(2)} ميغابايت
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="إزالة الصورة"
            title="إزالة الصورة"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-red-600 hover:bg-red-50 transition-colors"
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
              ? 'border-[#1D6B36] bg-[#1D6B36]/5 scale-[0.99]'
              : 'border-[#D1D5DB] bg-[#FAFAFA] hover:border-[#1D6B36] hover:bg-[#F4F7F2]'
          }`}
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8F0EA] text-[#1D6B36]">
            {isDragging ? <Upload className="h-5 w-5 animate-bounce" /> : <ImagePlus className="h-5 w-5" />}
          </div>
          <p className="text-sm font-semibold text-[#1A1F16]">
            اضغط لاختيار صورة أو اسحبها هنا
          </p>
          <p className="mt-1 text-xs text-[#6B7464]">
            PNG, JPG, WEBP حتى 5 ميغابايت
          </p>
        </div>
      )}

      <FieldError error={error} />
    </div>
  );
}

export default ProductImageUpload;

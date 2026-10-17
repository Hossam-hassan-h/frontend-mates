import { useState, useRef } from 'react';
import { Image as ImageIcon, Upload, Trash2, Check, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useBanners, useCreateBanner, useDeleteBanner } from '@/features/banners/hooks/useBanners.js';
import { Loader } from '@/components/feedback/Loader.jsx';
import { ErrorState } from '@/components/feedback/ErrorState.jsx';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog.jsx';
import { Card } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { toast } from 'sonner';

const DEFAULT_HERO_IMAGE = '/Minimalist Mates Fashion Hero.png';

export function AdminBannersPage() {
  const { data: bannersData, isLoading, isError, refetch } = useBanners();
  const createBannerMutation = useCreateBanner();
  const deleteBannerMutation = useDeleteBanner();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const fileInputRef = useRef(null);

  const heroBanner =
    bannersData?.heroBanner ||
    (Array.isArray(bannersData?.data) ? bannersData.data[0] : bannersData?.data) ||
    bannersData?.banners?.[0] ||
    null;

  const hasCustomBanner = Boolean(heroBanner && heroBanner.image);
  const currentHeroImage = hasCustomBanner ? heroBanner.image : DEFAULT_HERO_IMAGE;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة صالح (JPEG, PNG, WebP)');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleClearSelected = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.warning('يرجى اختيار صورة الهيرو أولاً');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('isActive', true);
    formData.append('order', 1);

    createBannerMutation.mutate(formData, {
      onSuccess: () => {
        handleClearSelected();
      },
    });
  };

  const handleConfirmReset = () => {
    if (!heroBanner?._id) return;
    deleteBannerMutation.mutate(heroBanner._id, {
      onSuccess: () => {
        setIsResetConfirmOpen(false);
      },
      onSettled: () => {
        setIsResetConfirmOpen(false);
      },
    });
  };

  if (isLoading) {
    return <Loader text="جاري تحميل إعدادات صورة الهيرو..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="فشل تحميل بيانات الهيرو"
        message="حدث خطأ أثناء الاتصال بالخادم لجلب صورة الهيرو."
        onRetry={refetch}
      />
    );
  }

  const isSaving = createBannerMutation.isPending || deleteBannerMutation.isPending;

  return (
    <div className="space-y-6 dir-rtl text-start font-['Cairo']">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-[#1D6B36]" />
            <span>صورة الهيرو بالصفحة الرئيسية</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            التحكم في الصورة المعروضة في قسم الهيرو (Hero Section) أعلى الصفحة الرئيسية للمتجر.
          </p>
        </div>

        {hasCustomBanner && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsResetConfirmOpen(true)}
            disabled={isSaving}
            className="gap-2 rounded-xl text-xs font-bold border-destructive/40 text-destructive hover:bg-destructive/10 self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>استعادة الصورة الافتراضية</span>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Active Image Preview Card */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-sm flex flex-col justify-between">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1D6B36]" />
                <span className="text-xs sm:text-sm font-bold text-foreground">الصورة الحالية في الموقع</span>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs ${
                  hasCustomBanner
                    ? 'bg-[#1D6B36] text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{hasCustomBanner ? 'صورة مخصصة مفعلة' : 'الصورة الافتراضية للمتجر'}</span>
              </span>
            </div>

            {/* Preview Box */}
            <div className="relative aspect-[16/9] w-full bg-secondary/30 overflow-hidden">
              <img
                src={currentHeroImage}
                alt="Mates Store Hero Preview"
                className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-[1.01]"
              />

              {/* Simulated Hero Overlay hint */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-6 text-center text-white pointer-events-none">
                <div className="space-y-1">
                  <p className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F1E8]">
                    Mates Store
                  </p>
                  <p className="text-xs text-[#F5F1E8]/80 max-w-sm">
                    معاينة حية لطريقة ظهور النص فوق صورة الهيرو في الصفحة الرئيسية
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-secondary/15 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>نسبة العرض الموصى بها: 16:9 أو 21:9 بدقة عالية</span>
              {hasCustomBanner && (
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  disabled={isSaving}
                  className="text-destructive hover:underline font-bold inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف واسترجاع الافتراضي</span>
                </button>
              )}
            </div>
          </Card>
        </div>

        {/* Upload New Hero Image Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 sm:p-6 rounded-3xl border border-border/80 bg-card shadow-sm space-y-5">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#1D6B36]" />
                <span>{hasCustomBanner ? 'استبدال صورة الهيرو' : 'رفع صورة هيرو جديدة'}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                عند رفع صورة جديدة سيتم استبدال الصورة الحالية فوراً وتحديث واجهة المتجر.
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* File Drop / Preview Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center p-6 text-center overflow-hidden ${
                  previewUrl
                    ? 'border-[#1D6B36]/60 bg-[#1D6B36]/5'
                    : 'border-border/80 hover:border-[#1D6B36]/50 bg-secondary/10 hover:bg-secondary/20'
                }`}
              >
                {previewUrl ? (
                  <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-inner">
                    <img
                      src={previewUrl}
                      alt="معاينة الصورة الجديدة"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2 backdrop-blur-xs">
                      <Upload className="w-4 h-4" />
                      <span>اختيار صورة أخرى</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-full bg-[#1D6B36]/10 text-[#1D6B36] flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      اضغط هنا لاختيار صورة من جهازك
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      يدعم ملفات JPG, PNG, WebP حتى 10 ميجابايت.
                    </p>
                  </div>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                {previewUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClearSelected}
                    disabled={isSaving}
                    className="rounded-xl text-xs font-bold px-4 h-10"
                  >
                    إلغاء التحديد
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={isSaving || !selectedFile}
                  className="rounded-xl text-xs font-bold px-5 h-10 bg-[#1D6B36] text-white hover:bg-[#175A2D] gap-2 shadow-sm w-full sm:w-auto"
                >
                  {createBannerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الرفع والحفظ...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تعيين كصورة رئيسية</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        variant="danger"
        title="استعادة صورة الهيرو الافتراضية"
        description="هل أنت متأكد من حذف الصورة المخصصة والرجوع إلى الصورة الافتراضية المعتمدة للمتجر؟"
        confirmText="استعادة الافتراضي"
        cancelText="إلغاء"
        isLoading={deleteBannerMutation.isPending}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}

export default AdminBannersPage;

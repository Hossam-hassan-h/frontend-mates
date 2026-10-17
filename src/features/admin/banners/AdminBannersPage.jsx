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
        toast.error('Please select a valid image file (JPEG, PNG, WebP)');
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
      toast.warning('Please select a hero image first');
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
    return <Loader text="Loading hero banner settings..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load hero banner"
        message="An error occurred while connecting to the server to fetch hero banner."
        onRetry={refetch}
      />
    );
  }

  const isSaving = createBannerMutation.isPending || deleteBannerMutation.isPending;

  return (
    <div className="space-y-6 text-start font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-[#1D6B36]" />
            <span>Homepage Hero Banner</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Manage the image displayed in the hero section at the top of the storefront homepage.
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
            <span>Restore Default Banner</span>
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
                <span className="text-xs sm:text-sm font-bold text-foreground">Current Website Banner</span>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full shadow-xs ${
                  hasCustomBanner
                    ? 'bg-[#1D6B36] text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>{hasCustomBanner ? 'Custom banner active' : 'Default store banner'}</span>
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
                    Live preview of text overlay on the hero banner on the homepage
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-secondary/15 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Recommended aspect ratio: 16:9 or 21:9 in high resolution</span>
              {hasCustomBanner && (
                <button
                  type="button"
                  onClick={() => setIsResetConfirmOpen(true)}
                  disabled={isSaving}
                  className="text-destructive hover:underline font-bold inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete & Restore Default</span>
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
                <span>{hasCustomBanner ? 'Replace Hero Banner' : 'Upload New Hero Banner'}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Uploading a new image will immediately replace the current banner and update the storefront.
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
                      alt="New banner preview"
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-2 backdrop-blur-xs">
                      <Upload className="w-4 h-4" />
                      <span>Choose another image</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <div className="w-12 h-12 rounded-full bg-[#1D6B36]/10 text-[#1D6B36] flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-foreground">
                      Click here to choose an image from your device
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                      Supports JPG, PNG, WebP files up to 10 MB.
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
                    Deselect
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
                      <span>Uploading and saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Set as Hero Banner</span>
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
        title="Restore Default Hero Banner"
        description="Are you sure you want to remove the custom banner and restore the store's default banner?"
        confirmText="Restore Default"
        cancelText="Cancel"
        isLoading={deleteBannerMutation.isPending}
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}

export default AdminBannersPage;

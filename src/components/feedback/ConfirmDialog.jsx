import { useEffect, useCallback } from 'react';
import { Trash2, AlertTriangle, CheckCircle, Info, Archive, Loader2 } from 'lucide-react';

const VARIANT_STYLES = {
  danger: {
    iconBg: 'bg-rose-500/10 text-rose-600',
    icon: Trash2,
    confirmBtn: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25 text-white',
    defaultConfirmText: 'Delete',
  },
  warning: {
    iconBg: 'bg-amber-500/10 text-amber-600',
    icon: AlertTriangle,
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/25 text-white',
    defaultConfirmText: 'Confirm',
  },
  archive: {
    iconBg: 'bg-indigo-500/10 text-indigo-600',
    icon: Archive,
    confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25 text-white',
    defaultConfirmText: 'Archive',
  },
  success: {
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    icon: CheckCircle,
    confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25 text-white',
    defaultConfirmText: 'Continue',
  },
  info: {
    iconBg: 'bg-blue-500/10 text-blue-600',
    icon: Info,
    confirmBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 text-white',
    defaultConfirmText: 'OK',
  },
};

export function ConfirmDialog({
  isOpen,
  open,
  variant = 'danger',
  isDestructive,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText,
  confirmLabel,
  cancelText,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  onOpenChange,
  isLoading = false,
}) {
  const dialogOpen = open !== undefined ? open : isOpen;
  const effectiveVariant = isDestructive ? 'danger' : variant;
  const currentVariant = VARIANT_STYLES[effectiveVariant] || VARIANT_STYLES.danger;
  const IconComponent = currentVariant.icon;
  const activeConfirmText = confirmLabel || confirmText || currentVariant.defaultConfirmText;
  const activeCancelText = cancelLabel || cancelText || 'Cancel';

  const handleClose = useCallback(() => {
    if (isLoading) return;
    if (onOpenChange) onOpenChange(false);
    if (onCancel) onCancel();
  }, [isLoading, onOpenChange, onCancel]);

  useEffect(() => {
    if (!dialogOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [dialogOpen, isLoading, handleClose]);

  if (!dialogOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) handleClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card w-full max-w-[420px] rounded-3xl p-6 shadow-2xl border border-border/80 space-y-5 text-start animate-in fade-in zoom-in-95 duration-200">
        {/* Header Icon + Title */}
        <div className="flex items-start gap-3.5">
          <div className={`p-3 ${currentVariant.iconBg} rounded-2xl shrink-0 mt-0.5`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-base font-extrabold text-foreground leading-snug">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="px-5 py-2 text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary/80 hover:bg-secondary rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {activeCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2 text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${currentVariant.confirmBtn}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              activeConfirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;

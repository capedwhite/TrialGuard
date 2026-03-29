import { X } from "lucide-react";

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold text-lg">{title}</h2>
          <button
            onClick={onCancel}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Message */}
        <p className="text-zinc-300 text-sm mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-40 font-medium text-sm border border-zinc-700"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 border ${
              isDangerous
                ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border-rose-500/30 hover:border-rose-500/50"
                : "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/30 hover:border-emerald-500/50"
            }`}
          >
            {isLoading ? "..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

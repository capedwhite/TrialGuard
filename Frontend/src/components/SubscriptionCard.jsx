import { useState } from "react";
import {
  useDeleteSubscription,
  useUpdateSubscription,
} from "../hooks/useSubscription";
import { formatDate, getDaysRemaining } from "../utils/dateUtils";
import { toast } from "react-toastify";
import {
  ChevronRight,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  X,
  Star,
  Clock,
} from "lucide-react";
import ConfirmationModal from "./ConfirmationModal";

// ── Status badge config ───────────────────────────────────────────
const STATUS_STYLES = {
  active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
  expired: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

// ── Star Rating Component ─────────────────────────────────────────
const StarRating = ({ rating, onRating, disabled = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => !disabled && onRating(star)}
            onMouseEnter={() => !disabled && setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={disabled}
            className={`transition-all ${
              (hoverRating || rating) >= star
                ? "text-amber-400 scale-110"
                : "text-zinc-600 scale-100"
            } ${disabled ? "cursor-not-allowed" : "cursor-pointer hover:scale-125"}`}
          >
            <Star
              size={18}
              fill={(hoverRating || rating) >= star ? "currentColor" : "none"}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <span className="text-sm text-zinc-400 font-medium">{rating}★</span>
      )}
    </div>
  );
};

export default function SubscriptionCard({ subscription, onEdit }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [usage, setUsage] = useState(subscription.usage || 0);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { mutate: deleteSubscription, isPending: isDeleting } =
    useDeleteSubscription();
  const { mutate: updateSubscription, isPending: isCancelling } =
    useUpdateSubscription();

  const daysRemaining = getDaysRemaining(subscription.trial_end);
  const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    updateSubscription(
      { id: subscription.id, status: "cancelled" },
      {
        onSuccess: () => {
          setShowCancelConfirm(false);
          toast.info("Trial marked as cancelled", {
            autoClose: 2500,
            className: "bg-zinc-900 border border-zinc-800 text-blue-400",
            progressClassName: "bg-blue-500",
          });
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to cancel trial", {
            autoClose: 2500,
            className: "bg-zinc-900 border border-zinc-800 text-red-400",
            progressClassName: "bg-red-500",
          });
        },
      },
    );
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteSubscription(subscription.id, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
        toast.success("Trial deleted successfully", {
          autoClose: 2500,
          className: "bg-zinc-900 border border-zinc-800 text-emerald-400",
          progressClassName: "bg-emerald-500",
        });
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to delete trial", {
          autoClose: 2500,
          className: "bg-zinc-900 border border-zinc-800 text-red-400",
          progressClassName: "bg-red-500",
        });
      },
    });
  };

  return (
    <>
      <div
        className={`border rounded-xl transition-all duration-300 overflow-hidden ${
          isExpiringSoon
            ? "border-rose-500/50 bg-gradient-to-r from-rose-500/10 to-zinc-900/50 hover:from-rose-500/20 hover:to-zinc-900/60"
            : "border-zinc-700/50 bg-gradient-to-r from-zinc-900/80 to-zinc-900/50 hover:from-zinc-900 hover:to-zinc-800"
        } hover:shadow-lg hover:shadow-zinc-900/50 cursor-pointer`}
      >
      {/* Main Row — Always Visible */}
      <div className="flex items-center justify-between px-5 py-3.5 gap-4">
        {/* Expand Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-white transition-colors flex-shrink-0 p-1 hover:bg-zinc-800 rounded-lg"
        >
          <ChevronRight
            size={20}
            className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
          />
        </button>

        {/* Service Name */}
        <div className="flex-shrink-0 min-w-[140px]">
          <h3 className="text-white font-bold text-sm tracking-tight">
            {subscription.service_name}
          </h3>
        </div>

        {/* Trial Dates */}
        <div className="flex-shrink-0 min-w-[240px] flex items-center gap-2 text-zinc-400 text-xs">
          <Calendar size={14} className="text-zinc-500" />
          <span className="font-medium">
            {formatDate(subscription.trial_start)}
          </span>
          <span className="text-zinc-600">→</span>
          <span className="font-medium text-zinc-300">
            {formatDate(subscription.trial_end)}
          </span>
        </div>

        {/* Days Remaining */}
        {!isExpired && subscription.status === "active" && (
          <div
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 ${
              isExpiringSoon
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
            }`}
          >
            <Clock size={14} />
            {daysRemaining} days
          </div>
        )}

        {/* Price */}
        <div className="flex-shrink-0 min-w-[90px] text-right flex items-center justify-end gap-1">
          <DollarSign size={14} className="text-zinc-500" />
          {subscription.price_after_trial ? (
            <>
              <span className="text-white font-bold text-sm">
                {parseFloat(subscription.price_after_trial).toFixed(2)}
              </span>
              <span className="text-zinc-500 text-xs">/mo</span>
            </>
          ) : (
            <span className="text-zinc-500 text-xs font-medium">Free</span>
          )}
        </div>

        {/* Status Badge */}
        <span
          className={`flex-shrink-0 text-xs border rounded-full px-3 py-1 font-medium ${
            STATUS_STYLES[subscription.status]
          }`}
        >
          {subscription.status}
        </span>

        {/* Action Buttons */}
        {subscription.status === "active" && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => onEdit(subscription)}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 border border-zinc-700 hover:border-red-500/30 rounded-lg transition-all"
              title="Edit subscription"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 border border-zinc-700 hover:border-amber-500/30 rounded-lg transition-all disabled:opacity-40"
              title="Mark as cancelled"
            >
              <X size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-zinc-700 hover:border-rose-500/30 rounded-lg transition-all disabled:opacity-40"
              title="Delete subscription"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Expanded Section — Usage Rating */}
      {isExpanded && (
        <div className="px-5 py-4 border-t border-zinc-800/50 bg-zinc-900/40 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300 mb-3 font-medium">
                How much do you use it?
              </p>
              <StarRating
                rating={usage}
                onRating={(rating) => setUsage(rating)}
                disabled={subscription.status !== "active"}
              />
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Confirmation Modals */}
    <ConfirmationModal
      isOpen={showCancelConfirm}
      title="Mark as Cancelled"
      message={`Are you sure you want to mark "${subscription.service_name}" as cancelled? This action can be undone by editing the subscription.`}
      confirmText="Yes, Cancel"
      cancelText="No, Keep It"
      isDangerous={false}
      isLoading={isCancelling}
      onConfirm={confirmCancel}
      onCancel={() => setShowCancelConfirm(false)}
    />

    <ConfirmationModal
      isOpen={showDeleteConfirm}
      title="Delete Trial"
      message={`Are you sure you want to permanently delete "${subscription.service_name}"? This cannot be undone.`}
      confirmText="Yes, Delete"
      cancelText="No, Keep It"
      isDangerous={true}
      isLoading={isDeleting}
      onConfirm={confirmDelete}
      onCancel={() => setShowDeleteConfirm(false)}
    />
  </>
  );
}

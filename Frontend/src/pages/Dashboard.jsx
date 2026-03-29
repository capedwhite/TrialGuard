import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Bell, Plus, X } from "lucide-react";
import Navbar from "../components/navbar";
import StatsCard from "../components/StatsCard";
import SubscriptionCard from "../components/SubscriptionCard";
import {
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
} from "../hooks/useSubscription";
import { createSubscriptionSchema } from "../schema/subscriptionSchema";
import { getDaysRemaining } from "../utils/dateUtils";
import EditSubscriptionModal from "../components/EditSubscriptionModal";
import NotificationsPanel from "../components/notificationPanel";

// ── Add Subscription Modal ────────────────────────────────────────
function AddSubscriptionModal({ onClose }) {
  const {
    mutate: createSubscription,
    isPending,
    error: serverError,
  } = useCreateSubscription();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(createSubscriptionSchema) });

  const onSubmit = (data) => {
    createSubscription(data, {
      onSuccess: () => {
        toast.success("Trial added! Reminders are scheduled.", {
          autoClose: 3000,
          className: "bg-zinc-900 border border-zinc-800 text-green-400",
          progressClassName: "bg-green-500",
        });
        onClose();
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to add trial", {
          autoClose: 3000,
          className: "bg-zinc-900 border border-zinc-800 text-red-400",
          progressClassName: "bg-red-500",
        });
      },
    });
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center 
                    justify-center z-50 px-4"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Add Free Trial</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {serverError && (
          <div
            className="bg-red-500/10 border border-red-500/20 text-red-400
                          rounded-lg px-4 py-3 mb-6 text-sm"
          >
            {serverError.response?.data?.message || "Something went wrong"}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
              Service Name
            </label>
            <input
              {...register("service_name")}
              placeholder="Netflix, Spotify, Adobe..."
              className="w-full bg-zinc-800 border border-zinc-700 text-white 
                         rounded-lg px-4 py-3 text-sm placeholder-zinc-600
                         focus:outline-none focus:border-red-500/50 focus:ring-1 
                         focus:ring-red-500/20 transition-all"
            />
            {errors.service_name && (
              <p className="text-red-400 text-xs mt-1.5">
                {errors.service_name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                Trial Start
              </label>
              <input
                {...register("trial_start")}
                type="date"
                className="w-full bg-zinc-800 border border-zinc-700 text-white 
                           rounded-lg px-4 py-3 text-sm
                           focus:outline-none focus:border-red-500/50 focus:ring-1 
                           focus:ring-red-500/20 transition-all"
              />
              {errors.trial_start && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.trial_start.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
                Trial End
              </label>
              <input
                {...register("trial_end")}
                type="date"
                className="w-full bg-zinc-800 border border-zinc-700 text-white 
                           rounded-lg px-4 py-3 text-sm
                           focus:outline-none focus:border-red-500/50 focus:ring-1 
                           focus:ring-red-500/20 transition-all"
              />
              {errors.trial_end && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.trial_end.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wider">
              Price After Trial (optional)
            </label>
            <input
              {...register("price_after_trial")}
              type="number"
              step="0.01"
              placeholder="9.99"
              className="w-full bg-zinc-800 border border-zinc-700 text-white 
                         rounded-lg px-4 py-3 text-sm placeholder-zinc-600
                         focus:outline-none focus:border-red-500/50 focus:ring-1 
                         focus:ring-red-500/20 transition-all"
            />
            {errors.price_after_trial && (
              <p className="text-red-400 text-xs mt-1.5">
                {errors.price_after_trial.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm text-zinc-400 hover:text-white border border-zinc-700 
                         hover:border-zinc-500 rounded-lg py-3 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-40
                         disabled:cursor-not-allowed text-white font-medium rounded-lg 
                         py-3 text-sm transition-colors"
            >
              {isPending ? "Adding..." : "Add Trial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────
export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [showNotificationsPanel, setShowNotificationsPanel] = useState(false);
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useSubscriptions(page);
  const { mutate: updateSubscription, isPending: isUpdating } =
    useUpdateSubscription();

  // ── Derived stats ─────────────────────────────────────────────
  // Computed from subscription data — never stored separately in state
  const subscriptions = data?.subscriptions || [];
  console.log(subscriptions);
  // ── Group subscriptions by urgency ────────────────────────────────
  // Computed once from the same data — no extra API calls needed

  const critical = subscriptions.filter(
    (s) => s.status === "active" && getDaysRemaining(s.trial_end) <= 3,
  );

  const upcoming = subscriptions.filter(
    (s) =>
      s.status === "active" &&
      getDaysRemaining(s.trial_end) > 3 &&
      getDaysRemaining(s.trial_end) <= 7,
  );

  const active = subscriptions.filter(
    (s) => s.status === "active" && getDaysRemaining(s.trial_end) > 7,
  );

  const inactive = subscriptions.filter(
    (s) => s.status === "cancelled" || s.status === "expired",
  );

  // ── Compute stats for display ─────────────────────────────────────
  const totalActive = subscriptions.filter((s) => s.status === "active").length;

  const monthlyCost = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + parseFloat(s.price_after_trial || 0), 0);

  const weeklyCost = (monthlyCost / 4).toFixed(2);
  const yearlyCost = (monthlyCost * 12).toFixed(2);

  const criticalCost = critical
    .reduce((sum, s) => sum + parseFloat(s.price_after_trial || 0), 0)
    .toFixed(2);

  // ── Edit handlers ──────────────────────────────────────────────────
  const handleEditClick = (subscription) => {
    setEditingSubscription(subscription);
  };

  const handleEditSubmit = (formData) => {
    updateSubscription(
      { id: editingSubscription.id, ...formData },
      {
        onSuccess: () => {
          toast.success("Trial updated! Reminders recalculated.", {
            autoClose: 3000,
            className: "bg-zinc-900 border border-zinc-800 text-green-400",
            progressClassName: "bg-green-500",
          });
          setEditingSubscription(null);
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Failed to update trial", {
            autoClose: 3000,
            className: "bg-zinc-900 border border-zinc-800 text-red-400",
            progressClassName: "bg-red-500",
          });
        },
      },
    );
  };

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400">
          Failed to load dashboard. Please refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="flex">
        {/* Left Sidebar — Notifications Panel */}
        <div
          className={`fixed left-0 top-[73px] h-[calc(100vh-73px)] bg-black border-r border-zinc-800 
                      transition-all duration-300 ease-in-out z-40 overflow-y-auto
                      ${showNotificationsPanel ? "w-80" : "w-0"}`}
        >
          {showNotificationsPanel && (
            <div className="p-6">
              <NotificationsPanel />
            </div>
          )}
        </div>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${showNotificationsPanel ? "ml-80" : "ml-0"}`}
        >
          <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h1 className="text-2xl font-bold text-white">Your Trials</h1>
                <p className="text-zinc-500 text-sm mt-1">
                  Track and manage your free trials
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setShowNotificationsPanel(!showNotificationsPanel)
                  }
                  className="flex items-center gap-2 text-white text-sm font-medium border border-zinc-700 
                             hover:border-zinc-500 bg-zinc-800/50 hover:bg-zinc-800
                             rounded-lg px-4 py-2.5 transition-all"
                >
                  <Bell size={18} />
                  {showNotificationsPanel ? "Hide" : "Reminders"}
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-medium 
                             rounded-lg px-5 py-2.5 transition-colors"
                >
                  <Plus size={18} />
                  Add Trial
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <StatsCard
                label="Active Trials"
                value={totalActive}
                subtext="Currently tracking"
              />
              <StatsCard
                label="At Risk Now"
                value={`$${criticalCost}`}
                subtext={`${critical.length} trial${critical.length !== 1 ? "s" : ""} expiring in 3 days`}
                accent={critical.length > 0}
              />
              <StatsCard
                label="Monthly Exposure"
                value={`$${monthlyCost.toFixed(2)}`}
                subtext="If no trials cancelled"
                accent={monthlyCost > 0}
              />
              <StatsCard
                label="Yearly Exposure"
                value={`$${yearlyCost}`}
                subtext="If no trials cancelled"
                accent={parseFloat(yearlyCost) > 0}
              />
            </div>

            {/* Subscription list */}
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 
                                      animate-pulse h-12"
                  />
                ))}
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-zinc-600 text-lg mb-2">No trials yet</p>
                <p className="text-zinc-700 text-sm mb-6">
                  Add your first free trial to start tracking
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium 
                 rounded-lg px-5 py-2.5 transition-colors"
                >
                  + Add Trial
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Critical — expiring in 3 days */}
                {critical.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <h2 className="text-red-400 text-sm font-medium uppercase tracking-wider">
                        Expiring Within 3 Days
                      </h2>
                      <span
                        className="text-red-500/50 text-xs border border-red-500/20 
                           bg-red-500/10 rounded-full px-2 py-0.5"
                      >
                        {critical.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {critical.map((s) => (
                        <SubscriptionCard
                          key={s.id}
                          subscription={s}
                          onEdit={handleEditClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Upcoming — expiring in 4-7 days */}
                {upcoming.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <h2 className="text-yellow-400/80 text-sm font-medium uppercase tracking-wider">
                        Expiring This Week
                      </h2>
                      <span
                        className="text-yellow-500/50 text-xs border border-yellow-500/20 
                           bg-yellow-500/10 rounded-full px-2 py-0.5"
                      >
                        {upcoming.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {upcoming.map((s) => (
                        <SubscriptionCard
                          key={s.id}
                          subscription={s}
                          onEdit={handleEditClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Active — safe */}
                {active.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-wider">
                        Active Trials
                      </h2>
                      <span
                        className="text-zinc-500 text-xs border border-zinc-700 
                           bg-zinc-800 rounded-full px-2 py-0.5"
                      >
                        {active.length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {active.map((s) => (
                        <SubscriptionCard
                          key={s.id}
                          subscription={s}
                          onEdit={handleEditClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Cancelled / Expired */}
                {inactive.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-zinc-600" />
                      <h2 className="text-zinc-600 text-sm font-medium uppercase tracking-wider">
                        Cancelled / Expired
                      </h2>
                      <span
                        className="text-zinc-600 text-xs border border-zinc-800 
                           bg-zinc-900 rounded-full px-2 py-0.5"
                      >
                        {inactive.length}
                      </span>
                    </div>
                    <div className="space-y-2 opacity-50">
                      {inactive.map((s) => (
                        <SubscriptionCard
                          key={s.id}
                          subscription={s}
                          onEdit={handleEditClick}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Pagination */}
                {data?.pagination?.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="text-sm text-zinc-400 hover:text-white border border-zinc-800 
                     hover:border-zinc-600 rounded-lg px-4 py-2 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-zinc-600 text-sm">
                      {page} of {data.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page === data.pagination.totalPages}
                      className="text-sm text-zinc-400 hover:text-white border border-zinc-800 
                     hover:border-zinc-600 rounded-lg px-4 py-2 transition-all
                     disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      {/* Modal */}
      {showModal && (
        <AddSubscriptionModal onClose={() => setShowModal(false)} />
      )}

      {/* Edit Modal */}
      {editingSubscription && (
        <EditSubscriptionModal
          subscription={editingSubscription}
          onClose={() => setEditingSubscription(null)}
          onSubmit={handleEditSubmit}
          isPending={isUpdating}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

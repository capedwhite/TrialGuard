import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDateForInput } from "../utils/dateUtils";
import { X } from "lucide-react";

const editSubscriptionSchema = z.object({
  service_name: z.string().min(1, { message: "Service name is required" }),
  trial_start: z.string().min(1, { message: "Trial start date is required" }),
  trial_end: z.string().min(1, { message: "Trial end date is required" }),
  price_after_trial: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .nonnegative({ message: "Price cannot be negative" })
    .optional(),
});

export default function EditSubscriptionModal({
  subscription,
  onClose,
  onSubmit,
  isPending,
}) {
  const [notificationPreferences, setNotificationPreferences] = useState({
    1: true,
    3: true,
    7: true,
    14: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(editSubscriptionSchema),
    defaultValues: {
      service_name: subscription.service_name,
      trial_start: formatDateForInput(subscription.trial_start),
      trial_end: formatDateForInput(subscription.trial_end),
      price_after_trial: subscription.price_after_trial || "",
    },
  });

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      notificationPreferences,
    });
  };

  const toggleNotification = (days) => {
    setNotificationPreferences((prev) => ({
      ...prev,
      [days]: !prev[days],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Edit Trial</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          {/* Service Name */}
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

          {/* Trial Start Date */}
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

          {/* Trial End Date */}
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

          {/* Price After Trial */}
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

          {/* Notification Preferences Section */}
          <div className="pt-4 border-t border-zinc-800 mt-6">
            <label className="block text-xs font-medium text-zinc-400 mb-4 uppercase tracking-wider">
              Remind me before trial ends
            </label>

            <div className="space-y-3">
              {[1, 3, 7, 14].map((days) => (
                <div key={days} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`reminder-${days}`}
                    checked={notificationPreferences[days]}
                    onChange={() => toggleNotification(days)}
                    className="w-4 h-4 rounded bg-zinc-800 border border-zinc-700 
                             text-red-600 focus:ring-red-500/20 cursor-pointer"
                  />
                  <label
                    htmlFor={`reminder-${days}`}
                    className="ml-3 text-sm text-zinc-300 cursor-pointer hover:text-white transition-colors"
                  >
                    {days === 1 ? "1 day before" : `${days} days before`}
                  </label>
                </div>
              ))}
            </div>

            <p className="text-xs text-zinc-500 mt-3 leading-relaxed">
              Adjust reminders to fit your needs. New reminders will be
              scheduled when you save.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-zinc-800">
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
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

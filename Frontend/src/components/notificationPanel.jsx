import { useNotifications } from '../hooks/useNotification';
import { formatDate } from '../utils/dateUtils';

// ── Status config ─────────────────────────────────────────────────
const getNotificationStatus = (notification) => {
  if (notification.sent_status) {
    return {
      label: 'Sent',
      style: 'bg-green-500/10 text-green-400 border-green-500/20',
      dot: 'bg-green-500',
    };
  }
  if (notification.subscription_status !== 'active') {
    return {
      label: 'Cancelled',
      style: 'bg-zinc-500/10 text-zinc-500 border-zinc-700',
      dot: 'bg-zinc-600',
    };
  }
  return {
    label: 'Scheduled',
    style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    dot: 'bg-yellow-500',
  };
};

export default function NotificationsPanel() {
  const { data, isLoading } = useNotifications();
  const notifications = data?.data || [];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-semibold">Reminders</h2>
          <p className="text-zinc-600 text-xs mt-0.5">
            Email notifications for your trials
          </p>
        </div>
        {notifications.length > 0 && (
          <span className="text-zinc-500 text-xs border border-zinc-800 
                           bg-zinc-800 rounded-full px-2 py-0.5">
            {notifications.length} total
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-zinc-800 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && notifications.length === 0 && (
        <div className="text-center py-8">
          <p className="text-zinc-600 text-sm">No reminders scheduled yet</p>
          <p className="text-zinc-700 text-xs mt-1">
            Add a trial to automatically schedule reminders
          </p>
        </div>
      )}

      {/* Notification list */}
      {!isLoading && notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map(notification => {
            const status = getNotificationStatus(notification);

            return (
              <div
                key={notification.id}
                className="flex items-center justify-between bg-zinc-800/50 
                           border border-zinc-800 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status.dot}`} />

                  <div>
                    <p className="text-white text-sm font-medium">
                      {notification.service_name}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {notification.sent_status
                        ? `Sent ${formatDate(notification.sent_at)}`
                        : `Scheduled for ${formatDate(notification.reminder_date)}`}
                    </p>
                  </div>
                </div>

                {/* Status badge */}
                <span className={`text-xs border rounded-full px-2.5 py-1 flex-shrink-0
                  ${status.style}`}>
                  {status.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
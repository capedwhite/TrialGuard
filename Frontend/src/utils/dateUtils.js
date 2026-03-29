// Centralised date utilities — used across dashboard and subscription cards.
// Single source of truth so days remaining logic never drifts between components.

export const getDaysRemaining = (trialEnd) =>
  Math.ceil((new Date(trialEnd) - new Date()) / (1000 * 60 * 60 * 24));

export const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Format date to YYYY-MM-DD for HTML date input
export const formatDateForInput = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

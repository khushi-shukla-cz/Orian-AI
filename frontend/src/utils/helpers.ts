import { format, formatDistanceToNow } from "date-fns";
import type { TaskStatus, WorkflowStatus, TaskType } from "@/types";

export const formatDate = (date: string | Date): string => {
  return format(new Date(date), "MMM dd, yyyy HH:mm:ss");
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m`;
};

export const getStatusColor = (status: TaskStatus | WorkflowStatus): string => {
  const colors: Record<string, string> = {
    pending: "text-gray-500",
    planning: "text-blue-500",
    running: "text-yellow-600",
    executing: "text-yellow-600",
    completed: "text-green-600",
    failed: "text-red-600",
    retrying: "text-orange-500",
    skipped: "text-gray-400",
    cancelled: "text-gray-500",
  };

  return colors[status] || "text-gray-500";
};

export const getStatusBadgeClass = (
  status: TaskStatus | WorkflowStatus,
): string => {
  const classes: Record<string, string> = {
    pending: "badge bg-gray-100 text-gray-700",
    planning: "badge bg-blue-100 text-blue-700",
    running: "badge badge-warning",
    executing: "badge badge-warning",
    completed: "badge badge-success",
    failed: "badge badge-error",
    retrying: "badge bg-orange-100 text-orange-700",
    skipped: "badge bg-gray-100 text-gray-500",
    cancelled: "badge bg-gray-100 text-gray-600",
  };

  return classes[status] || "badge";
};

export const getTaskTypeLabel = (type: TaskType): string => {
  const labels: Record<TaskType, string> = {
    email_send: "Email",
    calendar_create: "Calendar",
    slack_notify: "Slack",
    notion_create: "Notion",
    summarize_text: "Summarize",
  };

  return labels[type] || type;
};

export const getTaskTypeIcon = (type: TaskType): string => {
  const icons: Record<TaskType, string> = {
    email_send: "📧",
    calendar_create: "📅",
    slack_notify: "💬",
    notion_create: "📝",
    summarize_text: "📄",
  };

  return icons[type] || "⚙️";
};

export const getTaskTypeColor = (type: TaskType): string => {
  const colors: Record<TaskType, string> = {
    email_send: "bg-accent-pink/20 border-accent-pink",
    calendar_create: "bg-accent-sky/20 border-accent-sky",
    slack_notify: "bg-accent-lavender/20 border-accent-lavender",
    notion_create: "bg-accent-mint/20 border-accent-mint",
    summarize_text: "bg-accent-yellow/20 border-accent-yellow",
  };

  return colors[type] || "bg-gray-100 border-gray-300";
};

export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

export const downloadJSON = (data: any, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(isoString?: string): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getPreviousMonthRange(): { start: string; end: string; label: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const prevMonthDate = new Date(year, month - 1, 1);
  const start = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
  const end = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0);

  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const label = start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return { start: startStr, end: endStr, label };
}

export function getCurrentMonthRange(): { start: string; end: string; label: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startStr = start.toISOString().slice(0, 10);
  const endStr = end.toISOString().slice(0, 10);
  const label = start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  return { start: startStr, end: endStr, label };
}

export function getLast30DaysRange(): { start: string; end: string } {
  const now = new Date();
  const past = new Date();
  past.setDate(now.getDate() - 29);
  return {
    start: past.toISOString().slice(0, 10),
    end: now.toISOString().slice(0, 10),
  };
}

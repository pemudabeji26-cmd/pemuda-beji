/**
 * Format currency to Indonesian Rupiah
 * e.g., formatRupiah(1250000) => "Rp 1.250.000"
 */
export function formatRupiah(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'Rp 0';
  }
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  // Replace default non-breaking space or standard "Rp"
  return formatted.replace(/\u00A0/, ' ');
}

/**
 * Format date string (YYYY-MM-DD or ISO) into Indonesian Date
 * e.g. "2026-09-28" => "28 September 2026"
 */
export function formatDateIndo(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // Fallback if already plain date
      return dateString;
    }
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

/**
 * Format date string with time
 * e.g. "28 September 2026, 14:30"
 */
export function formatDateTimeIndo(dateTimeString: string | undefined | null): string {
  if (!dateTimeString) return '-';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    const datePart = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
    const timePart = date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).replace('.', ':');
    return `${datePart}, ${timePart} WIB`;
  } catch {
    return dateTimeString;
  }
}

/**
 * Helper to generate next member number: PB-001, PB-002, etc.
 */
export function generateNextMemberNumber(existingNumbers: string[]): string {
  let maxNum = 0;
  for (const num of existingNumbers) {
    if (!num) continue;
    const match = num.match(/PB-(\d+)/i);
    if (match && match[1]) {
      const parsed = parseInt(match[1], 10);
      if (parsed > maxNum) maxNum = parsed;
    }
  }
  const next = maxNum + 1;
  return `PB-${String(next).padStart(3, '0')}`;
}

/**
 * Generate a unique transaction ID
 */
export function generateTransactionId(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TRX-${dateStr}-${rand}`;
}

/**
 * Export table data to CSV file and trigger download
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const sanitizeCell = (cell: string | number) => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(sanitizeCell).join(','),
    ...rows.map(row => row.map(sanitizeCell).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

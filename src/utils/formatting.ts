/**
 * Formatting Utilities
 * Format data for display and security
 */

/**
 * Mask CUNY ID for security (show only last 4 digits)
 * Example: 23456789 -> ****6789
 */
export const maskCunyId = (cunyId: string): string => {
  if (!cunyId || cunyId.length < 4) return '****';
  return '****' + cunyId.slice(-4);
};

/**
 * Format date to locale string
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format date to short date string
 */
export const formatShortDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Format phone number for display
 */
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

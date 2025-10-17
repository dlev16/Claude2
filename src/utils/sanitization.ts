/**
 * Sanitization Utilities
 * Prevent XSS and injection attacks by sanitizing user inputs
 */

export const sanitizers = {
  // Sanitize text input - remove HTML tags and dangerous characters
  text: (input: string): string => {
    if (!input) return '';
    // Remove HTML tags and encode special characters
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML.trim();
  },

  // Sanitize email - lowercase and trim
  email: (email: string): string => {
    if (!email) return '';
    return email.toLowerCase().trim();
  },

  // Sanitize CUNY ID - only keep digits
  cunyId: (id: string): string => {
    if (!id) return '';
    return id.replace(/\D/g, '').slice(0, 8);
  },

  // Sanitize phone - remove all non-digit, space, dash, parentheses
  phone: (phone: string): string => {
    if (!phone) return '';
    return phone.replace(/[^\\d\\s\\-\\(\\)]/g, '').trim();
  },

  // Sanitize name - trim and remove extra spaces
  name: (name: string): string => {
    if (!name) return '';
    return name.trim().replace(/\s+/g, ' ');
  },

  // Sanitize URL - encode and validate
  url: (url: string): string => {
    if (!url) return '';
    try {
      const parsedUrl = new URL(url.trim());
      return parsedUrl.href;
    } catch {
      return '';
    }
  },

  // Sanitize notes/textarea - prevent script injection
  notes: (notes: string): string => {
    if (!notes) return '';
    // Remove script tags and event handlers
    return notes
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .trim();
  },
};

/**
 * Encode HTML entities to prevent XSS
 */
export const encodeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Decode HTML entities
 */
export const decodeHTML = (str: string): string => {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent || '';
};

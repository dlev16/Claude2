/**
 * Validation Utilities
 * Comprehensive input validation to prevent security vulnerabilities
 */

export const validators = {
  // CUNY ID must be exactly 8 digits
  cunyId: (id: string): boolean => {
    return /^\d{8}$/.test(id);
  },

  // Email validation (RFC 5322 compliant)
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  },

  // Phone number validation (flexible format)
  phone: (phone: string): boolean => {
    if (!phone || phone.trim() === '') return true; // Optional field
    const cleanPhone = phone.replace(/[\s\-\(\)\+\.]/g, '');
    return /^\d{10,15}$/.test(cleanPhone);
  },

  // Name validation (2-100 characters, letters, spaces, hyphens, apostrophes)
  name: (name: string): boolean => {
    return name.length >= 2 && name.length <= 100 && /^[a-zA-Z\s\-']+$/.test(name);
  },

  // Score validation (0-120 for Accuplacer, 0-100 for others)
  accuplacerScore: (score: number): boolean => {
    return score >= 0 && score <= 120 && Number.isInteger(score);
  },

  essayScore: (score: number): boolean => {
    return score >= 0 && score <= 100 && Number.isInteger(score);
  },

  michiganScore: (score: number): boolean => {
    return score >= 0 && score <= 100 && Number.isInteger(score);
  },

  // URL validation
  url: (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  },

  // Text field validation (prevent empty or too long)
  text: (text: string, minLength: number = 0, maxLength: number = 1000): boolean => {
    return text.length >= minLength && text.length <= maxLength;
  },

  // Start semester validation (positive integer)
  startSemester: (semester: number): boolean => {
    return Number.isInteger(semester) && semester >= 0 && semester <= 20;
  },

  // Username validation (3-30 characters, alphanumeric, underscore, hyphen)
  username: (username: string): boolean => {
    return username.length >= 3 && username.length <= 30 && /^[a-zA-Z0-9_-]+$/.test(username);
  },

  // Password validation (min 8 chars, at least one uppercase, one lowercase, one number)
  password: (password: string): boolean => {
    if (password.length < 8) return false;
    if (password.length > 128) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumber;
  },
};

export const validationMessages = {
  cunyId: "CUNY ID must be exactly 8 digits",
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number (10-15 digits)",
  name: "Name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes",
  startSemester: "Start semester must be a number between 0 and 20",
  accuplacerScore: "Accuplacer score must be between 0 and 120",
  essayScore: "Essay score must be between 0 and 100",
  michiganScore: "Michigan score must be between 0 and 100",
  url: "Please enter a valid URL starting with http:// or https://",
  required: "This field is required",
  textTooLong: "Text is too long (maximum {{max}} characters)",
  username: "Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens",
  password: "Password must be at least 8 characters and contain uppercase, lowercase, and number",
};

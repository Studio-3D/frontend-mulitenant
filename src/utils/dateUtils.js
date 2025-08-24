import { format, parseISO, isValid } from 'date-fns';

/**
 * Standard date format: dd-mm-yyyy
 */
export const DATE_FORMAT = 'dd-MM-yyyy';
export const DATETIME_FORMAT = 'dd-MM-yyyy HH:mm';

/**
 * Format a date to dd-mm-yyyy format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string or empty string if invalid
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  try {
    let dateObj;
    
    if (typeof date === 'string') {
      // Try parsing as ISO string first
      dateObj = parseISO(date);
      
      // If that fails, try direct Date constructor
      if (!isValid(dateObj)) {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    
    if (isValid(dateObj)) {
      return format(dateObj, DATE_FORMAT);
    } else {
      console.warn('Invalid date received:', date);
      return '';
    }
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return '';
  }
};

/**
 * Format a date to dd-mm-yyyy HH:mm format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted datetime string or empty string if invalid
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  
  try {
    let dateObj;
    
    if (typeof date === 'string') {
      // Try parsing as ISO string first
      dateObj = parseISO(date);
      
      // If that fails, try direct Date constructor
      if (!isValid(dateObj)) {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    
    if (isValid(dateObj)) {
      return format(dateObj, DATETIME_FORMAT);
    } else {
      console.warn('Invalid date received:', date);
      return '';
    }
  } catch (error) {
    console.error('Error formatting datetime:', date, error);
    return '';
  }
};

/**
 * Format a date for display in tables and lists
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string or 'N/A' if invalid
 */
export const formatDateForTable = (date) => {
  const formatted = formatDate(date);
  return formatted || 'N/A';
};

/**
 * Format a date for display with fallback text
 * @param {Date|string} date - Date object or date string
 * @param {string} fallback - Fallback text if date is invalid (default: 'Non renseigné')
 * @returns {string} Formatted date string or fallback text
 */
export const formatDateWithFallback = (date, fallback = 'Non renseigné') => {
  const formatted = formatDate(date);
  return formatted || fallback;
};

/**
 * Format a date for input fields (yyyy-MM-dd format for HTML date inputs)
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string in yyyy-MM-dd format or empty string if invalid
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    let dateObj;
    
    if (typeof date === 'string') {
      dateObj = parseISO(date);
      if (!isValid(dateObj)) {
        dateObj = new Date(date);
      }
    } else {
      dateObj = new Date(date);
    }
    
    if (isValid(dateObj)) {
      return format(dateObj, 'yyyy-MM-dd');
    } else {
      return '';
    }
  } catch (error) {
    console.error('Error formatting date for input:', date, error);
    return '';
  }
};

/**
 * Format a date range for display
 * @param {Date|string} startDate - Start date
 * @param {Date|string} endDate - End date
 * @param {string} separator - Separator between dates (default: ' - ')
 * @returns {string} Formatted date range string
 */
export const formatDateRange = (startDate, endDate, separator = ' - ') => {
  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);
  
  if (formattedStart && formattedEnd) {
    return `${formattedStart}${separator}${formattedEnd}`;
  } else if (formattedStart) {
    return formattedStart;
  } else if (formattedEnd) {
    return formattedEnd;
  } else {
    return '';
  }
};

/**
 * Legacy function for backward compatibility with moment.js format
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string in dd-mm-yyyy format
 * @deprecated Use formatDate instead
 */
export const formatDateLegacy = (dateString) => {
  return dateString ? formatDate(dateString) : '';
};

/**
 * Utility for wrapping event handlers with debug information
 */

export const withDebugLog = (func, name) => {
  if (process.env.NODE_ENV !== 'production') {
    return (...args) => {
      console.log(`Event handler called: ${name || 'unnamed'}`);
      console.log('Arguments:', args);
      return func(...args);
    };
  }
  return func;
};

export const createEventDebugger = (prefix = '') => ({
  wrap: (func, name) => withDebugLog(func, `${prefix}${name || ''}`),
  log: (message, ...data) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${prefix}] ${message}`, ...data);
    }
  }
});

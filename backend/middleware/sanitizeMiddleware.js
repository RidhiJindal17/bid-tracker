/**
 * Express 5 compatible NoSQL Injection Sanitizer Middleware.
 * Recursively removes keys starting with '$' or containing '.' to prevent NoSQL injection.
 */
const sanitizeObject = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key in obj) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  }
};

export const mongoSanitizeExpress5 = (req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.params) sanitizeObject(req.params);
  if (req.query) sanitizeObject(req.query);
  next();
};

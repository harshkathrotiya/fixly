/**
 * Wraps async route handlers and forwards errors to middleware
 * Avoids repetitive try/catch in controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(`[ASYNC ERROR] ${err.message}`);
    next(err);
  });
};

module.exports = asyncHandler;
// server/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  // Ensure name/message exist
  const name = err.name || "Error";
  const message = err.message || "Something went wrong";

  // Development logging
  console.error(`[ERROR] ${name}: ${message}`);

  // Handle specific Mongoose errors
  if (name === "CastError") {
    error = { message: ["Resource not found"], statusCode: 404 };
  } else if (err.code === 11000) {
    error = { message: ["Duplicate field value entered"], statusCode: 400 };
  } else if (name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map((val) => val.message);
    error = { message: messages.length ? messages : [message], statusCode: 400 };
  } else {
    // General errors
    error = { message: [message], statusCode: error.statusCode || 500 };
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message,
  });
};

module.exports = errorHandler;
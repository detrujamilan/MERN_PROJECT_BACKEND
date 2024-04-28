function errorHandler(err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ message: "Unauthorized request" });
  }
  if (err.name === "ValidationError") {
    return res.status(400).json({ message: "Validation error" });
  }
  return res.status(500).json({ message: err.message });
}

module.exports = errorHandler;

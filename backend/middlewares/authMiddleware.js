// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

module.exports = (req, res, next) => {
  try {
    // Check if Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided or invalid format.' });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    // Verify the token and decode its payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded payload (e.g., user id) to req.user for further use
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error in authMiddleware:', error);

    // Differentiate between expired token and other issues
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' });
    }

    return res.status(401).json({ message: 'Invalid token.' });
  }
};

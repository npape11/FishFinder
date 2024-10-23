// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {

    const token = req.headers['authorization']?.split(' ')[1]; // Extract token using optional chaining

    // Check if a token exists
    if (!token) return res.status(401).json({ message: 'No token provided' });

    // Verify the token using the secret key
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next(); // Proceed to the next middleware or route handler
    });
};

// Middleware to check user role
function checkRole(role) {
    return (req, res, next) => {
        if (req.user.role !== role) { // Check if user's role matches the required role
            return res.status(403).json({ message: 'Forbidden: Insufficient role' }); // Respond with 403 if not authorized
        }
        next(); // Proceed to the next middleware or route handler
    };
}

module.exports = authenticateToken;

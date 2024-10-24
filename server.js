const express = require('express');
const dotenv = require('dotenv');
const userRoutes = require('./src/routes/userRoutes');
const authenticateToken = require('./src/middleware/authenticateToken');
const PORT = process.env.PORT || 3000;

dotenv.config();
const app = express();
app.use(express.json());

// Base Route
app.get('/', (req, res) => {
    res.send('Welcome to FishFinder API');
});

// Define routes with prefix

app.use('/users', userRoutes); // Ensure you have this line in your server.js

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'You have access to this protected route!', user: req.user });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

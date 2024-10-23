const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware');
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.get('/', (req, res) => {
    res.send('Welcome to FishFinder API');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input (you can use a library like Joi for this)

    try {
        // Hash the password
        const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Insert the new user into the database
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Server Error');
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body; // Extract email and password from request body

    try {
        // Fetch the user from the database
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password_hash)) { // Check if user exists and if the password matches
            const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Create a JWT with user ID and role
            res.json({ token }); // Respond with the generated token
        } 
        else res.status(401).json({ message: 'Invalid email or password' }); // Respond with 401 if authentication fails
    } catch (error) {
        console.error('Error logging in:', error); // Log any errors
        res.status(500).json({ message: 'Internal server error' }); // Respond with a 500 status if an error occurs
    }
});


app.post('/users', async (req, res) => {
    const { username, email, password_hash } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
            [username, email, password_hash]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/users/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { username, email, password_hash } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE user_id = $4 RETURNING *',
            [username, email, password_hash, userId]
        );

        if (result.rows.length > 0) {
            res.json(result.rows[0]);  // Return updated user
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/users/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const result = await pool.query(
            'DELETE FROM users WHERE user_id = $1 RETURNING *',
            [userId]
        );

        if (result.rows.length > 0) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'You have access to this protected route!', user: req.user });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

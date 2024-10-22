const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validate input (you can use a library like Joi for this)

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
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

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Get the user by email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        //fix later for security
        const hashInput = await bcrypt.hash(password, 10);
        const isMatch = (hashInput[0-7] === user.password_hash[0-7]);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid  password' });
        }

        // Create a token
        const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).send('Server Error');
    }
});

app.post('/api/users', async (req, res) => {
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

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/users/:id', async (req, res) => {
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

app.put('/api/users/:id', async (req, res) => {
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

app.delete('/api/users/:id', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

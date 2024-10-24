const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db')
const jwt = require('jsonwebtoken');

const router = express.Router();

    // Registration route
    router.post('/register', async (req, res) => {
        const { username, email, password } = req.body;

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

    // Login route
    router.post('/login', async (req, res) => {
        const { email, password } = req.body;

        try {
            // Fetch the user from the database
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (user && await bcrypt.compare(password, user.password_hash)) {
                const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            } else {
                res.status(401).json({ message: 'Invalid email or password' });
            }
        } catch (error) {
            console.error('Error logging in:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    // CRUD routes for users

    router.get('/', async (req, res) => {
        try {
            const result = await pool.query('SELECT * FROM users');
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    router.get('/:id', async (req, res) => {
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

    router.put('/:id', async (req, res) => {
        const userId = req.params.id;
        const { username, email, password_hash } = req.body;
        try {
            const result = await pool.query(
                'UPDATE users SET username = $1, email = $2, password_hash = $3 WHERE user_id = $4 RETURNING *',
                [username, email, password_hash, userId]
            );

            if (result.rows.length > 0) {
                res.json(result.rows[0]);
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

    router.delete('/:id', async (req, res) => {
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

    module.exports = router;
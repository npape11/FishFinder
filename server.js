const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

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

app.get('/api/users', (req, res) => {
    // Here you would typically fetch users from your database
    // For now, let's return a mock response
    res.json([{ id: 1, username: 'test_user', email: 'test@example.com' }]);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
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


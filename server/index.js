const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/connectDB');
const router = require('./routes/index');
const cookiesParser = require('cookie-parser');
const { insertMessage, fetchMessages, decryptMessage } = require('./db');
const { ObjectId } = require('mongodb');
const { app, server } = require('./socket/index');


// Middleware and configurations
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookiesParser());

// Define the port
const PORT = process.env.PORT || 8080;

// Base route
app.get('/', (request, response) => {
    response.json({
        message: "Server running at " + PORT
    });
});

// API endpoints
app.use('/api', router);

// Message routes
app.post('/messages', async (req, res) => {
    const message = req.body.message;
    try {
        await insertMessage(message);
        res.status(200).send('Message inserted');
    } catch (error) {
        console.error('Error inserting message:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/messages', async (req, res) => {
    try {
        const decryptedMessages = await fetchMessages();
        res.status(200).json(decryptedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to decrypt a message by ID
// Endpoint to decrypt a message by ID
app.get('/decrypt/:id', async (req, res) => {
    const messageId = req.params.id;
    console.log('Received message ID:', messageId); // Log the received message ID
    if (!/^[0-9a-fA-F]{24}$/.test(messageId)) { // Validate ObjectId format
        console.log('Invalid ID Format'); // Log the error
        return res.status(400).send('Invalid ID Format');
    }
    try {
        const message = await decryptMessage(messageId);
        res.status(200).json(message);
    } catch (error) {
        console.error('Error decrypting message:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Register route
app.post('/api/register', async (req, res) => {
    const { name, email, password, profile_pic } = req.body;
    try {
        // Replace this with actual user creation logic
        const user = { name, email, password, profile_pic };
        console.log('User registered:', user);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Connect to the database and start the server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log("Server running at " + PORT);
    });
});

// Endpoint to decrypt a message by ID
// Endpoint to decrypt a message by ID
app.get('/decrypt/:id', async (req, res) => {
    const messageId = req.params.id;
    console.log('Received message ID:', messageId); // Log the received message ID
    if (!messageId.match(/^[0-9a-fA-F]{24}$/)) { // Validate ObjectId format
        console.log('Invalid message ID format'); // Log the error
        return res.status(400).send('Invalid message ID format');
    }
    try {
        const message = await decryptMessage(messageId);
        res.status(200).json(message);
    } catch (error) {
        console.error('Error decrypting message:', error);
        res.status(500).send('Internal Server Error');
    }
});




module.exports = app;

const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('Missing MONGODB_URI in environment variables');
}

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const algorithm = 'aes-256-cbc';
const key = Buffer.from('12345678901234567890123456789012', 'utf-8'); // Exactly 32 bytes

function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}

function decrypt(encryptedMessage) {
    const iv = Buffer.from(encryptedMessage.iv, 'hex');
    const encryptedText = Buffer.from(encryptedMessage.encryptedData, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

async function insertMessage(message) {
    try {
        await client.connect();
        const database = client.db('your-db-name');
        const collection = database.collection('messages');
        const encryptedMessage = encrypt(message);
        await collection.insertOne(encryptedMessage);
        console.log('Message inserted:', encryptedMessage);
    } finally {
        await client.close();
    }
}

async function fetchMessages() {
    try {
        await client.connect();
        const database = client.db('your-db-name');
        const collection = database.collection('messages');
        const messages = await collection.find({}).toArray();
        return messages.map(msg => ({
            original: msg,
            decrypted: decrypt(msg)
        }));
    } finally {
        await client.close();
    }
}

async function decryptMessage(id) {
    try {
        await client.connect();
        const database = client.db('your-db-name');
        const collection = database.collection('messages');
        const messageId = new ObjectId(id); // Convert the ID to ObjectId
        const message = await collection.findOne({ _id: messageId });
        if (!message) {
            throw new Error('Message not found');
        }
        return {
            original: message,
            decrypted: decrypt(message)
        };
    } finally {
        await client.close();
    }
}

module.exports = { insertMessage, fetchMessages, decryptMessage };

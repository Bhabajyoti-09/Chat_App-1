const { encrypt, decrypt } = require('../utils/encryption');
const Message = require('../models/messageModel');

exports.sendMessage = async (req, res) => {
    try {
        const { sender, content, conversation } = req.body;
        const encryptedContent = encrypt(content);
        console.log('Original content:', content);  // Log original content
        console.log('Encrypted content:', encryptedContent);  // Log encrypted content
        const message = new Message({ sender, content: encryptedContent, conversation });
        await message.save();
        res.status(201).json({ success: true, message: 'Message sent', data: message });
    } catch (error) {
        console.error('Error sending message:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.find({});
        const decryptedMessages = messages.map(msg => {
            const decryptedContent = decrypt(msg.content);
            console.log(`Decrypted content for message ${msg._id}:`, decryptedContent);  // Log decrypted content
            return {
                ...msg._doc,
                content: decryptedContent
            };
        });
        res.status(200).json({ success: true, data: decryptedMessages });
    } catch (error) {
        console.error('Error fetching messages:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

require("dotenv").config(); // Load environment variables

const { encrypt, decrypt } = require("../utils/encryption"); // Adjust this path if needed

const testMessage = "Hlw everyone";

// Encrypt the message
const encryptedMessage = encrypt(testMessage);
console.log("Encrypted Message:", encryptedMessage);

// Decrypt the message
const decryptedMessage = decrypt(encryptedMessage);
console.log("Decrypted Message:", decryptedMessage);

// Check if the original and decrypted messages are the same
if (testMessage === decryptedMessage) {
  console.log("Encryption and Decryption works correctly!");
} else {
  console.log("There is an issue with the Encryption/Decryption functions.");
}

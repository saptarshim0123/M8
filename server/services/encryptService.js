const crypto = require('crypto');

if (!process.env.ENCRYPTION_KEY) {
    throw new Error("ENCRYPTION_KEY is missing in the environment variables.");
}

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY = crypto.scryptSync(process.env.ENCRYPTION_KEY, 'salt', 32);

exports.encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

exports.decrypt = (hash) => {
    const [ivHex, authTagHex, encryptedText] = hash.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
};
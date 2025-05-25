const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // TTL index to automatically remove expired tokens
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for token field
tokenBlacklistSchema.index({ token: 1 });

const TokenBlacklist = mongoose.model('TokenBlacklist', tokenBlacklistSchema);

module.exports = TokenBlacklist; 
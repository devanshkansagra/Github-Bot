const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    accessToken: {
        type: String,
        required: true
    },
    guildId: {
        type: String,
        required: true,
    },
})

const TokenDoc = mongoose.model('tokenDoc', tokenSchema);
module.exports = TokenDoc
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true,
    },
    repoUrl: {
        type: String,
        required: true
    },
    repoName: {
        type: String,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    }
})

const User = mongoose.model('user', userSchema);
module.exports = User;
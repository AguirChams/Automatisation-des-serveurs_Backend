const mongoose = require('mongoose');

const fail2banSchema = new mongoose.Schema({
    fail2ban_local_src: String,
    fail2ban_directory: String,
    jail_local_src: String
});

const Fail2ban = mongoose.model('Fail2ban', fail2banSchema);

module.exports = Fail2ban;
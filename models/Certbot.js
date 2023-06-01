const mongoose = require('mongoose');

const certbotSchema = new mongoose.Schema({
  time: String,
  letsencrypt_email: String,
  domain_name: String,
});

const Certbot = mongoose.model('Bash', certbotSchema);

module.exports = Certbot;
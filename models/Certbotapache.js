const mongoose = require('mongoose');

const certbotapacheSchema = new mongoose.Schema({
    acme_directory: String,
    acme_email: String,
    domain_name: String,
});

const CertbotApache = mongoose.model('Bash', certbotapacheSchema);

module.exports = CertbotApache;
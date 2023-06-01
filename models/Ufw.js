const mongoose = require('mongoose');

const ufwSchema = new mongoose.Schema({
    ufw_default_src: String
});

const Ufw = mongoose.model('Ufw', ufwSchema);

module.exports = Ufw;
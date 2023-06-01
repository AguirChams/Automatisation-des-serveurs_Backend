const mongoose = require('mongoose');

const jenkinsSchema = new mongoose.Schema({
    key: String,
});

const Jenkins= mongoose.model('Jenkins', jenkinsSchema);

module.exports = Jenkins;
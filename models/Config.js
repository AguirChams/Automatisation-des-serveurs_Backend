const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  admin_username: {
    type: String,
    required: true
  },
  admin_password: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }

});

module.exports = mongoose.model('Config', configSchema);

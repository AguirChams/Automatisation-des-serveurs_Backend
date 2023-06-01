const mongoose = require('mongoose');

const configUserSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const ConfigUser = mongoose.model('ConfigUser', configUserSchema);

module.exports = ConfigUser;


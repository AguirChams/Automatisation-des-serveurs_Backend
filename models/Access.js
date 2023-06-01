const mongoose = require('mongoose');

const accessSchema = new mongoose.Schema({
  root: {
    type: String,
    required: true
  },
  server_ip: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Access', accessSchema);
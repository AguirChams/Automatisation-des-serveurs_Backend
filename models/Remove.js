const mongoose = require('mongoose');

const scriptConfigSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  server_ip: {
    type: String,
    required: true
  },
  root: {
    type: String,
    required: true
  }
});

const ScriptConfig = mongoose.model('ScriptConfig', scriptConfigSchema);

module.exports = ScriptConfig;
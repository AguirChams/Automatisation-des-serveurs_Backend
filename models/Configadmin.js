const mongoose = require('mongoose');

const configAdminSchema = new mongoose.Schema({
  grafana_admin_user: {
    type: String,
    required: true
  },
  grafana_admin_password: {
    type: String,
    required: true
  }
});

const ConfigAdmin = mongoose.model('ConfigAdmin', configAdminSchema);

module.exports = ConfigAdmin;
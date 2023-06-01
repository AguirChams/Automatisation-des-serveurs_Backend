const mongoose = require('mongoose');

const PostgresInstallSchema = new mongoose.Schema({
    db_user: {
        type: String,
        required: true
      },
    db_pass: {
        type: String,
        required: true
      },
    db_name: {
        type: String,
        required: true
      },
    postgresql_version: {
        type: String,
        required: true
    }  
});

const PostgresInstall= mongoose.model('PostgresInstall', PostgresInstallSchema);

module.exports = PostgresInstall;
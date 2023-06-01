const mongoose = require('mongoose');

const backup_postgresSchema = new mongoose.Schema({
    backup_dir: String,
    db_name : String,
    path : String
});

const Backup_Postgres = mongoose.model('Backup_Postgres', backup_postgresSchema);

module.exports = Backup_Postgres;
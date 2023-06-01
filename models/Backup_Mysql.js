const mongoose = require('mongoose');

const backup_mysqlSchema = new mongoose.Schema({
    db_username: String,
    db_password: String,
    backup_dir : String,
    db_name : String,
    path : String
});

const Backup_Mysql = mongoose.model('Backup_Mysql', backup_mysqlSchema);

module.exports = Backup_Mysql;
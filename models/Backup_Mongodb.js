const mongoose = require('mongoose');

const mongodbSchema = new mongoose.Schema({
    login_database: String,
    login_user: String,
    login_password: String,
    backup_dir : String,
    db_name : String,
    path : String
});

const Mongodb = mongoose.model('Mongodb', mongodbSchema);

module.exports = Mongodb;
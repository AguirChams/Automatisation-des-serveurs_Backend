const mongoose = require('mongoose');

const backup_projectSchema = new mongoose.Schema({
    backup_user : String,
    backup_group  : String, 
    backup_src  : String,
    backup_frequency_minutes : String,
    backup_dest  : String,
    path: String     
});

const Backup_Project = mongoose.model('Backup_Project', backup_projectSchema);

module.exports = Backup_Project;
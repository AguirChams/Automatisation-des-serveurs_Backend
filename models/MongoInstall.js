const mongoose = require('mongoose');

const Mongo_InstallSchema = new mongoose.Schema({
    database: {
        type: String,
        required: true
      },
    name: {
        type: String,
        required: true
      },
    password: {
        type: String,
        required: true
    } 
});

const Mongo_Install = mongoose.model('Mongo_Install', Mongo_InstallSchema);

module.exports = Mongo_Install;
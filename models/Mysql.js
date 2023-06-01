const mongoose = require('mongoose');

const MysqlSchema = new mongoose.Schema({
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
      }
});

const Mysql= mongoose.model('Mysql', MysqlSchema);

module.exports = Mysql;
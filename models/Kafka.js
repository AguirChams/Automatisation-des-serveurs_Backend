const mongoose = require('mongoose');

const kafkaSchema = new mongoose.Schema({
    kafka_user: String,
    kafka_group: String
});

const Kafka= mongoose.model('Kafka', kafkaSchema);

module.exports = Kafka;
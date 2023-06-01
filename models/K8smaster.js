const mongoose = require('mongoose');

const k8smasterSchema = new mongoose.Schema({
    kubernetes_directory: String,
    admin: String
});

const K8smaster = mongoose.model('K8smaster', k8smasterSchema);

module.exports = K8smaster;
const mongoose = require('mongoose');

const k8sworkerSchema = new mongoose.Schema({
    kubernetes_directory: String,
    kubernetes_node_directory: String
});

const K8sworker = mongoose.model('K8sworker', k8sworkerSchema);

module.exports = K8sworker;
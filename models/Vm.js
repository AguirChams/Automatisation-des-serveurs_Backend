const mongoose = require('mongoose');

const vmSchema = new mongoose.Schema({
    vcenter_hostname: String,
    vcenter_datacenter: String,
    vcenter_username: String,
    vcenter_password: String,
    vm_name: String,
    vm_guestid: String,
    vm_disk_gb: String,
    vm_disk_type: String,
    vm_disk_datastore: String,
    vm_hw_ram_mb: String,
    vm_hw_cpu_n: String,
    vm_hw_scsi: String,
    vm_net_name: String,
    vm_net_type: String,
    vcenter_destination_folder: String,
    vm_state: String, 
});

const Vm = mongoose.model('Vm', vmSchema);

module.exports = Vm;
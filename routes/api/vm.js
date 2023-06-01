const express = require('express');
const router = express.Router();
const Vm = require('../../models/Vm');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const Ansible = require('node-ansible');
const amqp = require('amqplib/callback_api');
const app = express();


// Route to execute the ufw script
router.post('/executeVm', async (req, res) => {
  try {
    const { vcenter_hostname: vcenter_hostname,vcenter_datacenter: vcenter_datacenter, vcenter_username: vcenter_username, vcenter_password: vcenter_password, vm_name: vm_name,vm_guestid: vm_guestid,vm_disk_gb: vm_disk_gb,vm_disk_type: vm_disk_type, vm_disk_datastore: vm_disk_datastore, vm_hw_ram_mb: vm_hw_ram_mb,vm_hw_cpu_n: vm_hw_cpu_n,vm_hw_scsi: vm_hw_scsi,vm_net_name: vm_net_name,vm_net_type: vm_net_type,vcenter_destination_folder: vcenter_destination_folder,vm_state: vm_state } = req.body;
    const vmFilePath = '/home/aguirchams/ansible/ansible-roles/vmware/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +

`read -p "Enter vcenter_hostname : " vcenter_hostname\n`+
`read -p "Enter datacenter:" datacenter\n`+
`read -p "Enter vcenter_username:" vcenter_username\n`+
`read -p "Enter vcenter_password:" vcenter_password\n`+
`read -p "Enter vm_name:" vm_name\n`+
`read -p "Enter vm_guestid:" vm_guestid\n`+
`read -p "Enter vm_disk_gb:" vm_disk_gb\n`+
`read -p "Enter vm_disk_type:" vm_disk_type\n`+
`read -p "Enter vm_disk_datastore:" vm_disk_datastore\n`+
`read -p "Enter vm_hw_ram_mb:" vm_hw_ram_mb\n`+ 
`read -p "Enter vm_hw_cpu_n:" vm_hw_cpu_n\n`+
`read -p "Enter vm_hw_scsi:" vm_hw_scsi\n`+
`read -p "Enter vm_net_name:" vm_net_name\n`+
`read -p "Enter vm_net_type:" vm_net_type\n`+
`read -p "Enter vcenter_destination_folder:" vcenter_destination_folder\n`+
`read -p "Enter vm_state:" vm_state\n`+

`cat <<EOF > vars.yml\n`+

`vcenter_hostname: ${vcenter_hostname}\n`+
`vcenter_datacenter : ${vcenter_datacenter}\n`+ 
`vcenter_username: ${vcenter_username}\n`+ 
`vcenter_password: ${vcenter_password}\n`+
`vm_name: ${vm_name}\n`+
`vm_guestid: ${vm_guestid}\n`+ 
`vm_disk_gb: ${vm_disk_gb}\n`+
`vm_disk_type: ${vm_disk_type}\n`+ 
`vm_disk_datastore: ${vm_disk_datastore}\n`+ 
`vm_hw_ram_mb: ${vm_hw_ram_mb}\n`+ 
`vm_hw_cpu_n: ${vm_hw_cpu_n}\n`+ 
`vm_hw_scsi: ${vm_hw_scsi}\n`+ 
`vm_net_name: ${vm_net_name}\n`+ 
`vm_net_type: ${vm_net_type}\n`+ 
`vcenter_destination_folder: ${vcenter_destination_folder}\n`+ 
`vm_state: ${vm_state}\n`+ 
`EOF`;
fs.writeFileSync(vmFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${vmFilePath}`);
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
    res.status(200).send({ message: 'Script executed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
// Consumer function to execute the received message
const consumeMessage = async (message) => {
  try {
    const command = message.content.toString();
    console.log(`Received message: ${command}`);

    // Execute the command from the directory where the script is located
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(command, { cwd: '/home/aguirchams/ansible' });
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
  } catch (err) {
    console.error(err);
  }
};


// Route to submit a command for execution
router.post('/executeCommand', async (req, res) => {
  try {
    amqp.connect('amqp://localhost', (err, conn) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }
      conn.createChannel((err, ch) => {
        if (err) {
          console.error(err);
          res.status(500).send('Server error');
          return;
        }
        const queueName = 'command_queue';
        ch.assertQueue(queueName, { durable: false });
        const message = './vm.sh';
        ch.sendToQueue(queueName, Buffer.from(message));
        console.log(`Sent message: ${message}`);
        ch.consume(queueName, consumeMessage, { noAck: true });
      });
    });

    res.status(200).send({ message: 'Command submitted for execution' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});


module.exports = router;

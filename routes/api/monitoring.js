const amqp = require('amqplib/callback_api'); 
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const util = require('util');
const shell = require('shelljs');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
// Route to execute User Script 
router.post('/executeconfiguser', async (req, res) => {
  try {
    const { user, password } = req.body;
    const userConfigFilePath = '/home/aguirchams/ansible/ansible-roles/configuration/monitoring/grafana/defaults/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter user name : " user\n` +
      `read -p "Enter password :" password\n` +
      `cat <<EOF > main.yml\n` +
      `user: ${user}\n` +
      `password: ${password}\n` +
      `EOF\n`;
    fs.writeFileSync(userConfigFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${userConfigFilePath}`);
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
    res.status(200).send({ message: 'Script executed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
// Route to exceute Script
router.post('/executeconfigadmin', async (req, res) => {
    try {
      const { grafana_admin_user, grafana_admin_password } = req.body;
      const adminConfigFilePath = `/home/aguirchams/ansible/ansible-roles/configuration/monitoring/grafana/tasks/script.sh`;
      const updatedScriptContent = `#!/bin/bash\n` +
        `read -p "Enter grafana_admin_user : " grafana_admin_user\n` +
        `read -p "Enter grafana_admin_password :" grafana_admin_password\n` +
        `cat <<EOF > vars.yml\n` +
        `grafana_admin_user: ${grafana_admin_user}\n` +
        `grafana_admin_password: ${grafana_admin_password}\n` +
        `EOF\n`;
      fs.writeFileSync(adminConfigFilePath, updatedScriptContent);
      const execAsync = util.promisify(exec);
      const { stdout, stderr } = await execAsync(`bash ${adminConfigFilePath}`);
      console.log('stdout:', stdout);
      console.error('stderr:', stderr);
      res.status(200).send({ message: 'Script executed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

const consumeMessage = async (message) => {
  try {
    const command = message.content.toString();
    console.log(`Received message: ${command}`);
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(command, { cwd: `/home/aguirchams/ansible` });
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);
  } catch (error) {
    console.error(error);
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
        const message = './monitoring.sh';
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

// Route to open Grafana urls
     router.post('/openUrl', async (req, res) => {
      try {
        function extractAnsibleHost() {
          const inventoryPath = '/home/aguirchams/ansible/inventory.ini';
          const inventoryContent = fs.readFileSync(inventoryPath, 'utf8');
          const lines = inventoryContent.split('\n');
          let ansibleHosts = [];
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            if (line.startsWith('node')) {
              const parts = line.split(' ');
              const ansibleHost = parts[1].split('=')[1];
              ansibleHosts.push(ansibleHost);
            }
          }
          
          return ansibleHosts;
        }
        
        const ansible_hosts = extractAnsibleHost();
        
        for (let i = 0; i < ansible_hosts.length; i++) {
          const ansible_host = ansible_hosts[i];
          console.log(ansible_host);
          const url = `http://${ansible_host}:3000`;
          shell.exec(`open ${url}`);
        }
        
        console.log(ansible_hosts);
      } catch (error) {
        console.error(error);
      }
    });

// Route to get output file
/*router.get('/download',
  async (req, res) => {
    try {
      const fileName = 'output_monitoring.txt'
      const fileURL = '/home/aguirchams/ansible/output_monitoring.txt'
      const stream = fs.createReadStream(fileURL);
      res.set({
        'Content-Disposition': `attachment; filename='${fileName}'`,
        'Content-Type': 'application/pdf',
      });
      stream.pipe(res);
    } catch (e) {
      console.error(e)
      res.status(500).end();
    }
  });*/

  /*router.post('/download', (req, res) => {
    const filePath = '/home/aguirchams/ansible/output_monitoring.txt'; 
    res.download(filePath, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
        res.status(500).send('Error downloading file');
      }
    });
  });*/
  


module.exports = router;
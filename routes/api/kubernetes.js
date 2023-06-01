const express = require('express');
const router = express.Router();
const K8sworker = require('../../models/K8sworker');
const K8smaster = require('../../models/K8smaster');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');
// Route to update a script
router.post('/addKubernetesworker', async (req, res) => {
    const { kubernetes_directory,kubernetes_node_directory } = req.body;
    try {
      // Create a new Bash script
    const workersK8s = new K8sworker({
      kubernetes_directory,
      kubernetes_node_directory 
      });
      const savedworkerK8s = await workersK8s.save();
      res.json(savedworkerK8s);
    } catch (error) {
      console.error(err);
      res.status(400).send(error);
    }
  });

  router.post('/executeKubernetesworker', async (req, res) => {
    try {
      const { kubernetes_directory,kubernetes_node_directory } = req.body;
      const k8sworkerFilePath = '/home/aguirchams/ansible/ansible-roles/applications/k8s/roles/workers/tasks/script.sh';
      const updatedScriptContent = `#!/bin/bash\n` +
        `read -p "Enter kubernetes directory: " kubernetes_directory\n`+
        `read -p "Enter kubernetes node directory: "  kubernetes node directory\n`+
        `cat <<EOF > vars.yml\n`+
        `kubernetes_directory: ${kubernetes_directory}\n`+
        `kubernetes node directory: ${kubernetes_node_directory}\n`+
        `EOF`;
      fs.writeFileSync(k8sworkerFilePath, updatedScriptContent);
  
      // Execute the script file
      const execAsync = util.promisify(exec);
      const { stdout, stderr } = await execAsync(`bash ${k8sworkerFilePath}`);
      console.log('stdout:', stdout);
      console.error('stderr:', stderr);
      res.status(200).send({ message: 'Script executed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });
  // Route to add a script
router.post('/addmasterK8s', async (req, res) => {
    const { kubernetes_directory,admin } = req.body;
    try {
    const masterK8s = new K8smaster({
      kubernetes_directory,
      admin
      });
      const savedmasterK8s = await masterK8s.save();
      res.json(savedmasterK8s);
    } catch (error) {
      console.error(err);
      res.status(400).send(error);
    }
  });
  
  router.post('/executemasterK8s', async (req, res) => {
    try {
      const { kubernetes_directory,admin } = req.body;
      const k8smasterFilePath = '/home/aguirchams/ansible/ansible-roles/applications/k8s/roles/master/tasks/script.sh';
      const updatedScriptContent = `#!/bin/bash\n` +
        `read -p "Enter kubernetes directory: " kubernetes_directory\n`+
        `read -p "Enter admin name: " admin\n`+
        `cat <<EOF > vars.yml\n`+
        `kubernetes_directory: ${kubernetes_directory}\n`+
        `admin: ${admin}\n`+
        `EOF`;
      fs.writeFileSync(k8smasterFilePath, updatedScriptContent);
  
      // Execute the script file
      const execAsync = util.promisify(exec);
      const { stdout, stderr } = await execAsync(`bash ${k8smasterFilePath}`);
      console.log('stdout:', stdout);
      console.error('stderr:', stderr);
      res.status(200).send({ message: 'Script executed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  });

  const consumeMessage = async (message) => {
    try {
      const command = message.content.toString();
      console.log(`Received message: ${command}`);
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
   // res.send('hello world ')
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
        const message = './k8s.sh';
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
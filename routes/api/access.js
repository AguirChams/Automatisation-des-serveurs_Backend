const express = require('express');
const router = express.Router();
const Script = require('../../models/Access');
const Profile = require('../../models/Profile');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');


// Route to update a script
router.post('/executeScript', async (req, res) => {
  try {
    const { root, server_ip, user } = req.body;
    const profile = await Profile.findOne({ server_ip: server_ip });
    const accessFilePath = '/home/aguirchams/ansible/ansible-roles/standardiser_acces/access/tasks/script.sh';

    if (!profile) {
      res.status(404).send('Profile not found');
      return;
    }

    const key = profile.key;
    const updatedScriptContent = 
    `#!/bin/bash\n` +
    `read -p "Enter root name: "  root\n`+
    `read -p "Enter server ip address: "  server_ip\n`+
    `read -p "Enter public key: "  key\n`+ 
    `read -p "Enter target node ( root name) : "user\n`+
    `cat <<EOF > vars.yml\n`+
    `root: ${root}\n`+
    `server_ip: ${server_ip}\n`+ 
    `key : ${key} \n`+
    `user : ${user}\n`+
    `EOF`; 
     fs.writeFileSync(accessFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${accessFilePath}`);
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
        const message = './access.sh';
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

// Route to fetch user profiles
router.get('/userProfiles', async (req, res) => {
  try {
    const { server_ip } = req.query;
    let profiles;

    if (server_ip) {
      profiles = await Profile.find({ server_ip });
    } else {
      profiles = await Profile.find();
    }

    console.log('Profiles:', profiles);

    res.json(profiles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const Script = require('../../models/Remove');
const Profile = require('../../models/Profile');
const { exec } = require('child_process');
var Ansible = require('node-ansible');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');


router.post('/executeScript', async (req, res) => {
  try {
    const { root, server_ip, user } = req.body;
    const profile = await Profile.findOne({ server_ip: server_ip });
    const removeFilePath = '/home/aguirchams/ansible/ansible-roles/standardiser_acces/remove/tasks/script.sh';

    if (!profile) {
      res.status(404).send('Profile not found');
      return;
    }

    const key = profile.key;
    const updatedScriptContent = `#!/bin/bash\n\nroot=${root}\nserver_ip=${server_ip}\nkey=${key}\nuser=${user}\n\n# Rest of the script goes here...`;
    fs.writeFileSync(removeFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${removeFilePath}`);
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
        const message = './remove.sh';
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

router.get('/removerGuarantees', async (req, res) => {
  try {
    const removeGuarantees = await Remove.find().populate({
      path: 'user',
      model: 'Profile',
      select: 'key username',
    });
    res.json(removeGuarantees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
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


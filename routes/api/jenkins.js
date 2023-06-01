const express = require('express');
const router = express.Router();
const Jenkins = require('../../models/Jenkins');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');
// Route to update a script
router.post('/addJenkins', async (req, res) => {
  const { key } = req.body;
  try {
    // Create a new Bash script
  const jenkins = new Jenkins({
    key
    });
    const savedjenkins = await jenkins.save();
    res.json(savedjenkins);
  } catch (error) {
    console.error(err);
    res.status(400).send(error);
  }
});

router.post('/executeJenkins', async (req, res) => {
  try {
    const { key } = req.body;
    const jenkinsFilePath = '/home/aguirchams/ansible/ansible-roles/applications/jenkins/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter jenkins repository key: " key\n`+
      `cat <<EOF > vars.yml\n`+
      `key: ${key}\n`+
      `EOF`;
    fs.writeFileSync(jenkinsFilePath, updatedScriptContent);
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${jenkinsFilePath}`);
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
        const message = './jenkins.sh';
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

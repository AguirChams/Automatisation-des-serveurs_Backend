const express = require('express');
const router = express.Router();
const Ufw = require('../../models/Ufw');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const Ansible = require('node-ansible');
const amqp = require('amqplib/callback_api');
const app = express();

// Route to add a new ufw record
router.post('/addUfw', async (req, res) => {
  const { ufw_default_src } = req.body;
  try {
    const ufw = new Ufw({
      ufw_default_src,
    });
    const savedUfw = await ufw.save();
    res.json(savedUfw);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
});
router.post('/executeUfw', async (req, res) => {
  try {
    const { ufw_default_src } = req.body;
    const ufwFilePath = '/home/aguirchams/ansible/ansible-roles/security/ufw/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter the path to the ufw default src directory: " ufw_default_src\n`+
      `cat <<EOF > vars.yml\n`+
      `ufw_default_src: ${ufw_default_src}\n`+
      `EOF`;
    fs.writeFileSync(ufwFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${ufwFilePath}`);
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
        const message = './run.sh';
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

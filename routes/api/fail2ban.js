const express = require('express');
const router = express.Router();
const Fail2ban = require('../../models/Fail2ban');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');

// Route to update a script
router.post('/addFail2ban', async (req, res) => {
  const { fail2ban_local_src, fail2ban_directory, jail_local_src } = req.body;
  try {
    // Create a new Bash script
  const fail2ban = new Fail2ban({
      fail2ban_local_src,
      fail2ban_directory,
      jail_local_src,
    });
    const savedfail2ban = await fail2ban.save();
    res.json(savedfail2ban);
  } catch (error) {
    console.error(err);
    res.status(400).send(error);
  }
});

router.post('/executeFail2ban', async (req, res) => {
  try {
    const { fail2ban_local_src, fail2ban_directory, jail_local_src } = req.body;
    const fail2banFilePath = '/home/aguirchams/ansible/ansible-roles/security/fail2ban/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter path to fail2ban directory: " fail2ban_directory\n`+
      `read -p "Enter path to fail2ban.local.j2: " fail2ban_local_src\n`+
      `read -p "Enter path to jail.local.j2: " jail_local_src\n` +
      `cat <<EOF > vars.yml\n`+
      `fail2ban_directory: ${fail2ban_directory}\n`+
      `fail2ban_local_src: ${fail2ban_local_src}\n`+
      `jail_local_src: ${jail_local_src}\n`+
      `EOF`;
    fs.writeFileSync(fail2banFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${fail2banFilePath}`);
    console.log('stdout:', stdout);
    console.error('stderr:', stderr);

    res.status(200).send({ message: 'Script executed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
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
        const message = './fail2ban.sh';
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

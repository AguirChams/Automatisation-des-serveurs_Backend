const express = require('express');
const router = express.Router();
const Bash = require('../../models/Certbot');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const Ansible = require('node-ansible');
const amqp = require('amqplib/callback_api');
const app = express();
// Route to create a new Bash script
router.post('/addCertbot', async (req, res) => {
  const { time, letsencrypt_email, domain_name } = req.body;

  try {
    const newScript = new Bash({
      time,
      letsencrypt_email,
      domain_name,
    });
    const savedScript = await newScript.save();

    res.json(savedScript);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});
//Route to execute the certbot Script
router.post('/executeCertbot', async (req, res) => {
  try {
    const { time, letsencrypt_email, domain_name } = req.body;
    const certbotFilePath = '/home/aguirchams/ansible/ansible-roles/security/certbot/nginx/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
    `read -p "Enter time : " time\n`+
    `read -p "Enter letsencrypt_email : " letsencrypt_email\n`+
    `read -p "Enter domain_name : " domain_name\n`+
    `cat <<EOF > vars.yml\n`+
    `time:${time}\n`+
    `letsencrypt_email:${letsencrypt_email}\n`+
    `domain_name:${domain_name}\n`+
  `EOF`;
  fs.writeFileSync(certbotFilePath, updatedScriptContent);
    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${certbotFilePath}`);
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
    // Connect to RabbitMQ server
    amqp.connect('amqp://localhost', (err, conn) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
        return;
      }

      // Create a channel
      conn.createChannel((err, ch) => {
        if (err) {
          console.error(err);
          res.status(500).send('Server error');
          return;
        }

        // Define the queue name
        const queueName = 'command_queue';

        // Assert the queue
        ch.assertQueue(queueName, { durable: false });

        // Send a message to the queue
        const message = './certbotnginx.sh';
        ch.sendToQueue(queueName, Buffer.from(message));
        console.log(`Sent message: ${message}`);

        // Consume messages from the queue
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
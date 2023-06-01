const express = require('express');
const router = express.Router();
const Kafka = require('../../models/Kafka');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');
// Route to update a script
router.post('/addKafka', async (req, res) => {
  const { kafka_user, kafka_group } = req.body;
  try {
    // Create a new Bash script
  const kafka = new Kafka({
    kafka_user,
    kafka_group
    });
    const savedkafka = await kafka.save();
    res.json(savedkafka);
  } catch (error) {
    console.error(err);
    res.status(400).send(error);
  }
});

router.post('/executeKafka', async (req, res) => {
  try {
    const { kafka_user, kafka_group } = req.body;
    const kafkaFilePath = '/home/aguirchams/ansible/ansible-roles/applications/kafka/defaults/main/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter kafka username: " kafka_user\n`+
      `read -p "Enter kafka group name: " kafka_group\n`+
      `cat <<EOF > vars.yml\n`+
      `kafka_user: ${kafka_user}\n`+
      `kafka_group: ${kafka_group}\n`+
      `EOF`;
    fs.writeFileSync(kafkaFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${kafkaFilePath}`);
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
        const message = './kafka.sh';
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

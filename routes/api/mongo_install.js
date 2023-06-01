const express = require('express');
const router = express.Router();
const Mongo_Install = require('../../models/MongoInstall');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');

// Route to update a script
router.post('/addMongodb', async (req, res) => {
  const { database, name, password } = req.body;
  try {
  const mongodb = new Mongo_Install({
    database,
    name,
    password 
    });
    const savedmongodb = await mongodb.save();
    res.json(savedmongodb);
  } catch (error) {
    console.error(err);
    res.status(400).send(error);
  }
});

router.post('/executeMongodb', async (req, res) => {
  try {
    const { database, name, password } = req.body;
    const mongodbFilePath = '/home/aguirchams/ansible/ansible-roles/applications/database_server/mongo/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter db name: " database\n`+
      `read -p "Enter db user: " name\n`+
      `read -p "Enter db pass: " password\n`+
      `cat <<EOF > vars.yml\n`+
      `database: ${database}\n`+
      `name: ${name}\n`+ 
      `password: ${password}\n`+
      `EOF`;
    fs.writeFileSync(mongodbFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${mongodbFilePath}`);
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
        const message = './mongodb.sh';
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

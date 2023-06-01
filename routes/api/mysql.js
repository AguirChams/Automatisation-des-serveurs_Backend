const express = require('express');
const router = express.Router();
const Mysql = require('../../models/Mysql');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');
// Route to update a script
router.post('/addMysql', async (req, res) => {
  const { db_user, db_pass, db_name } = req.body;
  try {
  const mysql = new Mysql({
    db_user,
    db_pass,
    db_name
    });
    const savedmysql = await mysql.save();
    res.json(savedmysql);
  } catch (error) {
    console.error(err);
    res.status(400).send(error);
  }
});

router.post('/executeMysql', async (req, res) => {
  try {
    const { db_user, db_pass, db_name } = req.body;
    const mysqlFilePath = '/home/aguirchams/ansible/ansible-roles/applications/database_server/mysql/ansible-role-mysql/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter db user: " db_user\n`+
      `read -p "Enter db pass: " db_pass\n`+
      `read -p "Enter db name: " db_name\n`+
      `cat <<EOF > vars.yml\n`+
      `db_user: ${db_user}\n`+
      `db_pass: ${db_pass}\n`+ 
      `db_name: ${db_name}\n`+
      `EOF`;
    fs.writeFileSync(mysqlFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${mysqlFilePath}`);
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
        const message = './mysql.sh';
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

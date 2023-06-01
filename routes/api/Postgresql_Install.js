const express = require('express');
const router = express.Router();
const PostgresInstall = require('../../models/PostgresInstall');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');

// Route to update a script
router.post('/addPostgres', async (req, res) => {
  const { db_user, db_pass, db_name, postgresql_version } = req.body;
  try {
  const postgres = new PostgresInstall({
    db_user,
    db_pass,
    db_name,
    postgresql_version 
    });
    const savedpostgres = await postgres.save();
    res.json(savedpostgres);
  } catch (error) {
    console.error(err);
    res.status(400).send(error);
  }
});

router.post('/executePostgres', async (req, res) => {
  try {
    const { db_user, db_pass, db_name, postgresql_version } = req.body;
    const postgresFilePath = '/home/aguirchams/ansible/ansible-roles/applications/database_server/postgres/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter db user: " db_user\n`+
      `read -p "Enter db pass: " db_pass\n`+
      `read -p "Enter db name: " db_name\n`+
      `read -p "Enter postgresql_version: " postgresql_version\n`+
      `cat <<EOF > vars.yml\n`+
      `db_user: ${db_user}\n`+
      `db_pass: ${db_pass}\n`+ 
      `db_name: ${db_name}\n`+
      `postgresql_version: ${postgresql_version}\n`+
      `EOF`;
    fs.writeFileSync(postgresFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${postgresFilePath}`);
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
        const message = './postgreSQL.sh';
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

const express = require('express');
const router = express.Router();
const Backup_Mysql = require('../../models/Backup_Mysql');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');
// Route to update a script
router.post('/addMysql', async (req, res) => {
  const { db_username,
    db_password,
    backup_dir,
    db_name,
    path } = req.body;
  try {
    // Create a new Bash script
  const mysql = new Backup_Mysql({
    db_username,
    db_password,
    backup_dir,
    db_name,
    path 
    });
    const savedmysql = await Backup_Mysql.save();
    res.json(savedmysql);
  } catch (error) {
    console.error(err);
    res.status(400).send(error);
  }
});

router.post('/executeMysql', async (req, res) => {
  try {
    const { db_username,
        db_password,
        backup_dir,
        db_name,
        path } = req.body;
    const mysqlFilePath = '/home/aguirchams/ansible/ansible-roles/backup_database/mysql/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter database username: "  db_username\n`+
      `read -p "Enter database password: "  db_password\n`+
      `read -p "Enter the directory to store database: "  backup_dir\n`+ 
      `read -p "Enter the name of database : " db_name\n`+
      `read -p "Enter the path to store database backup file: " path\n`+
      `cat <<EOF > vars.yml\n`+
      `db_username: ${db_username}\n`+
      `db_password: ${db_password}\n`+ 
      `backup_dir : ${backup_dir} \n`+
      `db_name : ${db_name}\n`+
      `path : ${path}\n`+
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
        const message = './backupMysql.sh';
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

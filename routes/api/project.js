const express = require('express');
const router = express.Router();
const Backup_Project = require('../../models/Backup_Project');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const amqp = require('amqplib/callback_api');
// Route to update a script
router.post('/addProject', async (req, res) => {
  const { backup_user,
    backup_group, 
    backup_src,
    backup_frequency_minutes,
    backup_dest,
    path } = req.body;
  try {
    // Create a new Bash script
  const project = new Backup_Project({
    backup_user,
    backup_group, 
    backup_src,
    backup_frequency_minutes,
    backup_dest,
    path
    });
    const savedproject = await Backup_Project.save();
    res.json(savedproject);
  } catch (error) {
    console.error(err);
    res.status(400).send(error);
  }
});

router.post('/executeProject', async (req, res) => {
  try {
    const {  
        backup_user,
        backup_group, 
        backup_src,
        backup_frequency_minutes,
        backup_dest,
        path } = req.body;
    const projectFilePath = '/home/aguirchams/ansible/ansible-roles/backup_projects/tasks/script.sh';
    const updatedScriptContent = `#!/bin/bash\n` +
      `read -p "Enter backup user : " backup_user\n`+
      `read -p "Enter backup_group : " backup_group\n`+
      `read -p "Enter backup_src : " backup_src\n`+
      `read -p "Enter backup_frequency_minutes : " backup_frequency_minutes\n`+
      `read -p "Enter backup_destination : " backup_dest\n`+ 
      `read -p "Enter path : " path\n`+
      `cat <<EOF > vars.yml\n`+
      `backup_user : ${backup_user}\n`+
      `backup_group  : ${backup_group} \n`+ 
      `backup_src  : ${backup_src} \n`+
      `backup_frequency_minutes : ${backup_frequency_minutes}\n`+
      `backup_dest  : ${backup_dest}\n`+
      `path : ${path}\n`+
      `# The rsync filter of files/directories to include/exclude\n`+
      `backup_filter: |\n`+
        `!\n`+
        `# Include everything\n`+
        `+ /*\n`+
      
      `# Directory for backup scripts\n`+
      `backup_script_dir: '~/.backup'\n`+
      
      `# The name to use for cron\n`+
      `backup_cron_name: backup\n`+
      
      `# The name to use for systemd service\n`+
      `backup_service_name: backup\n`+
      `EOF`;
    fs.writeFileSync(projectFilePath, updatedScriptContent);

    // Execute the script file
    const execAsync = util.promisify(exec);
    const { stdout, stderr } = await execAsync(`bash ${projectFilePath}`);
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
        const message = './project.sh';
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

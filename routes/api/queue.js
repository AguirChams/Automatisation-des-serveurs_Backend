const amqp = require('amqplib/callback_api');
const queueName = 'ansible_queue';

amqp.connect('amqp://localhost', (err, conn) => {
  if (err) {
    console.error(err);
    return;
  }
  conn.createChannel((err, ch) => {
    if (err) {
      console.error(err);
      return;
    }
    ch.assertQueue(queueName, { durable: true });
    console.log(`[*] Waiting for messages in ${queueName}. To exit press CTRL+C`);

    ch.consume(queueName, async (msg) => {
      const { playbook, parameters } = JSON.parse(msg.content.toString());
      console.log(`[x] Received ${playbook} with parameters: ${JSON.stringify(parameters)}`);

      try {
        // Execute Ansible playbook
        const playbookExec = new Ansible.Playbook().playbook(`/home/aguirchams/ansible/${playbook}.yml`);
        playbookExec.on('stdout', function(data) { console.log(data.toString()); });
        playbookExec.on('stderr', function(data) { console.error(data.toString()); });
        await playbookExec.exec();
        console.log('Received request to execute the playbook');
        const result = { stdout: '', stderr: '' };
        ch.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(result)), {
          correlationId: msg.properties.correlationId
        });
        ch.ack(msg);
      } catch (err) {
        console.error(err);
        const result = { stdout: '', stderr: err.message };
        ch.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(result)), {
          correlationId: msg.properties.correlationId
        });
        ch.ack(msg);
      }
    });
    
    // Enqueue a message to execute the ufw playbook
    ch.sendToQueue(queueName, Buffer.from(JSON.stringify({ playbook: 'ufw' })));
  });
});
